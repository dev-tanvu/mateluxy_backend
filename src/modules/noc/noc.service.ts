import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { FileManagerService } from '../file-manager/file-manager.service';
import { CreateNocDto } from './dto/create-noc.dto';
import PDFDocument from 'pdfkit';
import axios from 'axios';

@Injectable()
export class NocService {
    private readonly logger = new Logger(NocService.name);

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
        private fileManagerService: FileManagerService,
    ) { }

    private safeDate(dateStr: string | null | undefined): Date | null {
        if (!dateStr || dateStr.trim() === '') return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    }

    async create(
        createNocDto: CreateNocDto,
        files: Array<Express.Multer.File> = [],
    ) {
        this.logger.log('Creating NOC with data:', JSON.stringify(createNocDto, null, 2));
        this.logger.log('Location field:', createNocDto.location);

        // Prepare owners data with signature uploads
        const ownersData: any[] = [];

        // Assuming createNocDto.owners is an array
        const owners = createNocDto.owners || [];

        for (let i = 0; i < owners.length; i++) {
            const ownerDto = owners[i];
            let signatureUrl: string | null = null;

            // Find matching signature file
            // Expected fieldname format from frontend: "signatures_<index>"
            const signatureFile = files.find(f => f.fieldname === `signatures_${i}`);

            if (signatureFile) {
                signatureUrl = await this.uploadService.uploadFile(signatureFile);
            }

            ownersData.push({
                name: ownerDto.name,
                emiratesId: ownerDto.emiratesId,
                issueDate: this.safeDate(ownerDto.issueDate),
                expiryDate: this.safeDate(ownerDto.expiryDate),
                countryCode: ownerDto.countryCode,
                phone: ownerDto.phone,
                signatureUrl: signatureUrl,
                signatureDate: this.safeDate(ownerDto.signatureDate),
            });
        }

        // Create the NOC record with nested owners
        const noc = await this.prisma.noc.create({
            data: {
                // Owners
                owners: {
                    create: ownersData,
                } as any,

                // Property Details
                propertyType: createNocDto.propertyType,
                buildingProjectName: createNocDto.buildingProjectName,
                community: Array.isArray(createNocDto.community)
                    ? createNocDto.community.filter(Boolean).join(', ')
                    : createNocDto.community,
                streetName: createNocDto.streetName,
                buildUpArea: createNocDto.buildUpArea,
                plotArea: createNocDto.plotArea,
                bedrooms: createNocDto.bedrooms,
                bathrooms: createNocDto.bathrooms,
                rentalAmount: createNocDto.rentalAmount,
                saleAmount: createNocDto.saleAmount,
                parking: createNocDto.parking,

                // Terms
                agreementType: createNocDto.agreementType,
                periodMonths: createNocDto.periodMonths,
                agreementDate: this.safeDate(createNocDto.agreementDate),

                // Contact & Location
                clientPhone: createNocDto.clientPhone,
                location: createNocDto.location,
                latitude: createNocDto.latitude,
                longitude: createNocDto.longitude,
            },
            include: {
                owners: true,
            },
        }).catch(error => {
            if (error.code === 'P2002' && error.meta?.target?.includes('clientPhone')) {
                throw new ConflictException('An NOC with this phone number already exists.');
            }
            throw error;
        });

        // Generate PDF and upload to S3
        const pdfUrl = await this.generateAndUploadPdf(noc);

        // Update the NOC with the PDF URL
        const updatedNoc = await this.prisma.noc.update({
            where: { id: noc.id },
            data: { pdfUrl },
            include: { owners: true },
        });

        // Register in File Manager
        this.fileManagerService.createNocFolder(updatedNoc, pdfUrl || undefined).catch(e => {
            this.logger.error('Failed to register NOC in file manager', e);
        });

        return updatedNoc;
    }

    async findAll() {
        return this.prisma.noc.findMany({
            orderBy: { createdAt: 'desc' },
            include: { owners: true },
        });
    }

    async findOne(id: string) {
        const noc = await this.prisma.noc.findUnique({
            where: { id },
            include: { owners: true },
        });

        if (!noc) {
            throw new NotFoundException(`NOC with ID ${id} not found`);
        }

        return noc;
    }

    async generateAndUploadPdf(noc: any): Promise<string | null> {
        try {
            const pdfBuffer = await this.generatePdfBuffer(noc);

            // Create a fake file object for the upload service
            const pdfFile = {
                buffer: pdfBuffer,
                originalname: `noc-${noc.id}.pdf`,
                mimetype: 'application/pdf',
            } as Express.Multer.File;

            const pdfUrl = await this.uploadService.uploadFile(pdfFile);
            return pdfUrl;
        } catch (error) {
            this.logger.error('Failed to generate and upload PDF:', error);
            return null;
        }
    }

    private async generatePdfBuffer(noc: any): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const MARGIN_LEFT = 40;
            const PAGE_WIDTH = 595.28; // A4 width at 72 PPI
            const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_LEFT * 2);

            // Colors
            const COLOR_ORANGE = '#FF7F50'; // Approximate orange from image
            const COLOR_BLACK = '#000000';
            const COLOR_BLUE_HANDWRITTEN = '#1e3a8a'; // Dark blue for user input
            const COLOR_GREY_LINE = '#d1d5db';

            // Helper to draw text
            const drawText = (text: string, x: number, y: number, font: string = 'Helvetica', size: number = 10, color: string = 'black', align: string = 'left', width?: number) => {
                doc.font(font).fontSize(size).fillColor(color);
                doc.text(text, x, y, { width: width, align: align as any });
            };

            // Helper for user input text (Handwritten style simulation)
            const drawInputValues = (text: string, x: number, y: number, width?: number) => {
                if (!text) return;
                doc.font('Courier-Bold').fontSize(11).fillColor(COLOR_BLUE_HANDWRITTEN); // Courier simulates typewriter/handwritten feel
                doc.text(text, x, y - 2, { width: width, lineBreak: false, ellipsis: true });
            };

            // Helper for section headers
            const drawSectionHeader = (y: number, title: string) => {
                doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 20).fill(COLOR_ORANGE);
                doc.font('Helvetica-Bold').fontSize(10).fillColor('white');
                doc.text(title, MARGIN_LEFT + 10, y + 5);
                return y + 25;
            };

            // Helper for lines
            const drawLine = (y: number) => {
                doc.moveTo(MARGIN_LEFT, y).lineTo(PAGE_WIDTH - MARGIN_LEFT, y).strokeColor(COLOR_BLACK).lineWidth(0.5).stroke();
            };

            // Helper for checkbox circle
            const drawCheckbox = (x: number, y: number, label: string, isChecked: boolean) => {
                doc.circle(x, y, 6).lineWidth(1).strokeColor(COLOR_BLACK).stroke();
                if (isChecked) {
                    // Draw tick
                    doc.lineWidth(1.5).strokeColor(COLOR_BLUE_HANDWRITTEN);
                    doc.moveTo(x - 3, y).lineTo(x - 1, y + 3).lineTo(x + 4, y - 3).stroke();
                }
                doc.font('Helvetica').fontSize(10).fillColor(COLOR_BLACK);
                doc.text(label, x + 15, y - 4);
            };

            // Helper to check page break
            const checkPageBreak = (currentY: number, neededSpace: number) => {
                if (currentY + neededSpace > doc.page.height - 50) {
                    doc.addPage();
                    return 50; // New Y
                }
                return currentY;
            };


            // --- HEADER ---
            let y = 40;
            // Logo
            try {
                const logoPath = '../frontend/public/Logo.png';
                doc.image(logoPath, PAGE_WIDTH - MARGIN_LEFT - 80, y, { width: 80 });
            } catch (e) {
                doc.circle(PAGE_WIDTH - MARGIN_LEFT - 40, y + 40, 30).fillColor('#eee').fill();
            }

            doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR_BLACK).text('Mateluxy Real Estate Broker L.L.C', MARGIN_LEFT, y);
            y += 20;
            doc.fontSize(9).font('Helvetica');
            doc.text('Tel: +971 4 572 5420 Add: 601 Bay Square 13, Business Bay, Dubai, UAE.', MARGIN_LEFT, y);
            y += 12;
            doc.text('PO. Box: 453467 Email: info@mateluxy.com', MARGIN_LEFT, y);
            y += 12;
            doc.text('Website: www.mateluxy.com', MARGIN_LEFT, y);

            y += 25;
            doc.fontSize(12).font('Helvetica-Bold').text('NOC / LISTING AGREEMENT/ AGREEMENT BETWEEN OWNER & BROKER', MARGIN_LEFT, y);

            y += 25;

            // --- LANDLORD / OWNER DETAILS ---
            y = drawSectionHeader(y, 'LANDLORD / OWNER DETAILS');
            y += 5;

            // DYNAMIC OWNER LIST
            // Logic: Iterate all owners. Create a block for each.
            if (noc.owners && noc.owners.length > 0) {
                noc.owners.forEach((owner: any, index: number) => {
                    y = checkPageBreak(y, 80); // Check if enough space for one owner block

                    // Owner N Name
                    drawText(`${index + 1}${getOrdinal(index + 1)} Owner Name:`, MARGIN_LEFT, y + 5, 'Helvetica-Bold');
                    doc.moveTo(MARGIN_LEFT + 100, y + 15).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 15).stroke();
                    drawInputValues(owner.name, MARGIN_LEFT + 110, y + 2);
                    y += 20;

                    // ID/Passport and Mobile
                    drawText('ID/Passport:', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
                    doc.moveTo(MARGIN_LEFT + 80, y + 15).lineTo(MARGIN_LEFT + 250, y + 15).stroke();
                    drawInputValues(owner.emiratesId, MARGIN_LEFT + 90, y + 2);

                    drawText('Mobile:', MARGIN_LEFT + 260, y + 5, 'Helvetica-Bold');
                    doc.moveTo(MARGIN_LEFT + 310, y + 15).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 15).stroke();
                    const phone = owner.phone ? `${owner.countryCode || ''} ${owner.phone}` : '';
                    drawInputValues(phone, MARGIN_LEFT + 320, y + 2);
                    y += 20;

                    // Dates
                    drawText('Issue Date:', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
                    doc.moveTo(MARGIN_LEFT + 80, y + 15).lineTo(MARGIN_LEFT + 250, y + 15).stroke();
                    if (owner.issueDate) {
                        const idate = new Date(owner.issueDate);
                        drawInputValues(`${idate.getDate()}/${idate.getMonth() + 1}/${idate.getFullYear()}`, MARGIN_LEFT + 90, y + 2);
                    }

                    drawText('Expiry Date:', MARGIN_LEFT + 260, y + 5, 'Helvetica-Bold');
                    doc.moveTo(MARGIN_LEFT + 330, y + 15).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 15).stroke();
                    if (owner.expiryDate) {
                        const edate = new Date(owner.expiryDate);
                        drawInputValues(`${edate.getDate()}/${edate.getMonth() + 1}/${edate.getFullYear()}`, MARGIN_LEFT + 340, y + 2);
                    }
                    y += 25;
                });
            } else {
                drawText('No owners details provided.', MARGIN_LEFT, y + 5);
                y += 20;
            }


            // --- PROPERTY DETAILS ---
            y = checkPageBreak(y, 250);
            y = drawSectionHeader(y, 'PROPERTY DETAILS');
            y += 15;

            // Checkboxes Row 1
            const pType = noc.propertyType || '';
            drawCheckbox(MARGIN_LEFT + 40, y, 'Villa', pType.toLowerCase() === 'villa');
            drawCheckbox(MARGIN_LEFT + 150, y, 'Apartment', pType.toLowerCase() === 'apartment');
            drawCheckbox(MARGIN_LEFT + 260, y, 'Office', pType.toLowerCase() === 'office');
            drawCheckbox(MARGIN_LEFT + 370, y, 'Townhouse', pType.toLowerCase() === 'townhouse');
            y += 20;

            // Checkboxes Row 2
            drawCheckbox(MARGIN_LEFT + 40, y, 'Vacant', false);
            drawCheckbox(MARGIN_LEFT + 150, y, 'Tenanted', false);
            drawCheckbox(MARGIN_LEFT + 260, y, 'Furnished', false);
            drawCheckbox(MARGIN_LEFT + 370, y, 'Unfurnished', false);
            y += 20;

            // Vacating Date
            drawText('Vacating Date:', MARGIN_LEFT + 30, y + 5);
            doc.moveTo(MARGIN_LEFT + 110, y + 15).lineTo(MARGIN_LEFT + 300, y + 15).strokeColor(COLOR_BLACK).stroke();
            y += 25;

            // Building / Project name
            drawText('Building / Project name :', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawLine(y + 15);
            drawInputValues(noc.buildingProjectName, MARGIN_LEFT + 130, y + 2);
            y += 25;

            // Property Number
            drawText('Property Number', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            drawLine(y + 15);
            // Property Number left blank as per schema limitation, but label present.
            y += 25;

            // Location (Added as requested)
            drawText('Location', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            drawLine(y + 15);
            drawInputValues(noc.location, MARGIN_LEFT + 110, y + 2);
            y += 25;

            // Community
            drawText('Community', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            drawLine(y + 15);
            drawInputValues(noc.community, MARGIN_LEFT + 110, y + 2);
            y += 25;

            // Street Name
            drawText('Street Name', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            drawLine(y + 15);
            drawInputValues(noc.streetName, MARGIN_LEFT + 110, y + 2);
            y += 25;

            // Grid: BUA | Plot
            drawText('BUA (SQFT)', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            doc.moveTo(MARGIN_LEFT + 110, y + 15).lineTo(MARGIN_LEFT + 250, y + 15).stroke();
            drawInputValues(noc.buildUpArea, MARGIN_LEFT + 120, y + 2);

            drawText('Plot (SQFT)', MARGIN_LEFT + 260, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 330, y + 5, 'Helvetica-Bold');
            doc.moveTo(MARGIN_LEFT + 340, y + 15).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 15).stroke();
            drawInputValues(noc.plotArea, MARGIN_LEFT + 350, y + 2);
            y += 25;

            // Grid: Bedrooms | Bathrooms
            drawText('Bedrooms', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            doc.moveTo(MARGIN_LEFT + 110, y + 15).lineTo(MARGIN_LEFT + 250, y + 15).stroke();
            drawInputValues(noc.bedrooms, MARGIN_LEFT + 120, y + 2);

            drawText('Bathrooms', MARGIN_LEFT + 260, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 330, y + 5, 'Helvetica-Bold');
            doc.moveTo(MARGIN_LEFT + 340, y + 15).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 15).stroke();
            drawInputValues(noc.bathrooms, MARGIN_LEFT + 350, y + 2);
            y += 25;

            // Grid: Rental Amount | Parking
            drawText('Rental Amount', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            doc.moveTo(MARGIN_LEFT + 110, y + 15).lineTo(MARGIN_LEFT + 250, y + 15).stroke();
            drawInputValues(noc.rentalAmount, MARGIN_LEFT + 120, y + 2);

            drawText('Parking', MARGIN_LEFT + 260, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 330, y + 5, 'Helvetica-Bold');
            doc.moveTo(MARGIN_LEFT + 340, y + 15).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 15).stroke();
            drawInputValues(noc.parking, MARGIN_LEFT + 350, y + 2);
            y += 25;

            // Sale Amount
            drawText('Sale Amount', MARGIN_LEFT, y + 5, 'Helvetica-Bold');
            drawText(':', MARGIN_LEFT + 100, y + 5, 'Helvetica-Bold');
            doc.moveTo(MARGIN_LEFT + 110, y + 15).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 15).stroke();
            drawInputValues(noc.saleAmount, MARGIN_LEFT + 120, y + 2);
            y += 35;


            // --- TERMS AND CONDITIONS ---
            y = checkPageBreak(y, 150);
            y = drawSectionHeader(y, 'TERMS AND CONDITIONS');
            y += 10;

            // Text
            drawText('The landlord / legal representative has agreed to appoint', MARGIN_LEFT, y, 'Helvetica-Bold', 9);
            drawText('Mateluxy Real Estate Broker L.L.C', PAGE_WIDTH - MARGIN_LEFT - 180, y, 'Helvetica', 10);

            y += 15;
            drawCheckbox(MARGIN_LEFT + 40, y, 'EXCLUSIVE', noc.agreementType === 'exclusive');
            drawCheckbox(MARGIN_LEFT + 150, y, 'NON-EXCLUSIVE', noc.agreementType === 'non-exclusive');
            y += 25;

            drawText('Broker to list and advertise the above property for a period till', MARGIN_LEFT, y, 'Helvetica-Bold', 9);
            // Date lines
            doc.moveTo(MARGIN_LEFT + 350, y + 10).lineTo(MARGIN_LEFT + 400, y + 10).stroke();
            doc.text('/', MARGIN_LEFT + 405, y);
            doc.moveTo(MARGIN_LEFT + 410, y + 10).lineTo(MARGIN_LEFT + 460, y + 10).stroke();
            doc.text('/', MARGIN_LEFT + 465, y);
            doc.moveTo(MARGIN_LEFT + 470, y + 10).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 10).stroke();

            if (noc.agreementDate) {
                const ad = new Date(noc.agreementDate);
                drawInputValues(ad.getDate().toString(), MARGIN_LEFT + 360, y + 2);
                drawInputValues((ad.getMonth() + 1).toString(), MARGIN_LEFT + 420, y + 2);
                drawInputValues(ad.getFullYear().toString(), MARGIN_LEFT + 480, y + 2);
            }

            y += 20;

            // Period Checkboxes
            const pm = noc.periodMonths;
            drawCheckbox(MARGIN_LEFT + 40, y, '1 MONTH', pm == 1);
            drawCheckbox(MARGIN_LEFT + 150, y, '2 MONTH', pm == 2);
            drawCheckbox(MARGIN_LEFT + 230, y, '3 MONTH', pm == 3);
            drawCheckbox(MARGIN_LEFT + 320, y, '6 MONTH', pm == 6);
            y += 30;

            // Disclaimer text
            // Ensure disclaimer text doesn't break awkwardly?
            y = checkPageBreak(y, 80);
            doc.font('Helvetica').fontSize(9).text(
                "I the undersigned confirm that I am the owner of the above property and / or have the legal authority to sign on behalf of the named owner(s).",
                MARGIN_LEFT, y, { width: CONTENT_WIDTH, align: 'justify' }
            );
            y += 25;
            doc.text(
                "Should this property be subject to an offer I/we will notify the brokerage of this. This Agreement may be terminated by either party at any time upon seven (7) days written notice to the other party",
                MARGIN_LEFT, y, { width: CONTENT_WIDTH, align: 'justify' }
            );
            y += 40;

            // --- SIGNATURES ---
            y = checkPageBreak(y, 80); // Ensure at least enough space for Header
            drawText('SIGNATURES', MARGIN_LEFT, y, 'Helvetica-Bold', 12);
            y += 20;

            if (noc.owners && noc.owners.length > 0) {
                for (let i = 0; i < noc.owners.length; i++) {
                    // Check page break for EACH signature block
                    y = checkPageBreak(y, 60);

                    const owner = noc.owners[i];
                    drawText(`${i + 1}${getOrdinal(i + 1)} Owner Name:`, MARGIN_LEFT, y, 'Helvetica-Bold', 9);

                    // Name
                    doc.moveTo(MARGIN_LEFT + 100, y + 10).lineTo(MARGIN_LEFT + 220, y + 10).stroke();
                    drawInputValues(owner.name, MARGIN_LEFT + 110, y - 2);

                    drawText('Signature:', MARGIN_LEFT + 230, y, 'Helvetica-Bold', 9);
                    // Signature Line
                    doc.moveTo(MARGIN_LEFT + 280, y + 10).lineTo(MARGIN_LEFT + 400, y + 10).stroke();

                    // Signature Image
                    if (owner.signatureUrl) {
                        try {
                            const response = await axios.get(owner.signatureUrl, { responseType: 'arraybuffer' });
                            const imageBuffer = Buffer.from(response.data);
                            // Draw image slightly higher to sit on line
                            doc.image(imageBuffer, MARGIN_LEFT + 290, y - 25, { height: 35, width: 80, fit: [80, 35] as any });
                        } catch (e) { console.error('Sig load error', e); }
                    }

                    drawText('Date:', MARGIN_LEFT + 410, y, 'Helvetica-Bold', 9);
                    // Date Line
                    doc.moveTo(MARGIN_LEFT + 440, y + 10).lineTo(PAGE_WIDTH - MARGIN_LEFT, y + 10).stroke();
                    if (owner.signatureDate) {
                        const sd = new Date(owner.signatureDate);
                        drawInputValues(`${sd.getDate()}/${sd.getMonth() + 1}/${sd.getFullYear()}`, MARGIN_LEFT + 450, y - 2);
                    }

                    y += 50; // Spacing for next signature
                }
            }


            doc.end();
        });
    }
    async downloadPdf(id: string) {
        const noc = await this.findOne(id);

        if (!noc.pdfUrl) {
            // Regenerate PDF if not available
            const pdfUrl = await this.generateAndUploadPdf(noc);
            if (pdfUrl) {
                await this.prisma.noc.update({
                    where: { id },
                    data: { pdfUrl },
                    include: { owners: true },
                });
                return { url: pdfUrl };
            }
            throw new NotFoundException('PDF not available');
        }

        return { url: noc.pdfUrl };
    }
}

function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
