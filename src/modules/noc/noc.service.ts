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
                propertyNumber: createNocDto.propertyNumber,

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
        this.fileManagerService.createNocFolder(updatedNoc, pdfUrl || '').catch(e => {
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
        this.logger.log(`FULL NOC DATA: ${JSON.stringify(noc, null, 2)}`); // Debug: Print full object
        this.logger.log(`Generating PDF for NOC ${noc.id}, Property Number value: "${noc.propertyNumber}"`); // Debug: Specific field check
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

            const MARGIN = 35; // Reduced margin
            const PAGE_WIDTH = 595.28;
            const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
            let y = MARGIN;

            // Styles
            const COLORS = {
                PRIMARY: '#000000',
                SECONDARY: '#6B7280', // Gray-500
                ACCENT: '#EF4444', // Red-500 (Mateluxy brand approx)
                BORDER: '#E5E7EB', // Gray-200
            };

            // Fonts
            doc.font('Helvetica');

            // --- HELPER FUNCTIONS ---
            const drawLabelValue = (label: string, value: string | number | null | undefined, x: number, y: number, width: number) => {
                doc.font('Helvetica').fontSize(8).fillColor(COLORS.SECONDARY).text(label.toUpperCase(), x, y);
                const valStr = value ? String(value) : '-';
                doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.PRIMARY).text(valStr, x, y + 12, { width: width, ellipsis: true });
            };

            const drawSectionTitle = (title: string, topY: number) => {
                doc.rect(MARGIN, topY, 3, 16).fill(COLORS.ACCENT);
                doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.PRIMARY).text(title, MARGIN + 10, topY + 2);
                return topY + 30;
            };

            const drawDivider = (topY: number) => {
                doc.moveTo(MARGIN, topY).lineTo(PAGE_WIDTH - MARGIN, topY).strokeColor(COLORS.BORDER).lineWidth(1).stroke();
                return topY + 20;
            };

            const checkPageBreak = (currentY: number, needed: number) => {
                if (currentY + needed > doc.page.height - MARGIN) {
                    doc.addPage();
                    return MARGIN;
                }
                return currentY;
            };

            // --- HEADER ---
            // Logo (Placeholder if missing)
            try {
                const logoPath = '../frontend/public/Logo.png';
                doc.image(logoPath, MARGIN, y, { width: 100 });
            } catch (e) {
                doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.PRIMARY).text('MATELUXY', MARGIN, y);
            }

            // Company Info (Right aligned)
            doc.fontSize(8).font('Helvetica').fillColor(COLORS.SECONDARY);
            const infoY = y;
            doc.text('Mateluxy Real Estate Broker L.L.C', MARGIN, infoY, { align: 'right' });
            doc.text('601 Bay Square 13, Business Bay, Dubai', MARGIN, infoY + 12, { align: 'right' });
            doc.text('+971 4 572 5420 | info@mateluxy.com', MARGIN, infoY + 24, { align: 'right' });

            y += 45; // Reduced from 60
            y = drawDivider(y);

            // Document Title
            doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.PRIMARY).text('NOC / LISTING AGREEMENT', MARGIN, y, { align: 'center' }); // Reduced font size
            y += 25; // Reduced from 40

            // --- PROPERTY DETAILS ---
            y = drawSectionTitle('PROPERTY DETAILS', y);

            // Grid Layout for Property Details
            // Row 1
            drawLabelValue('Property Type', noc.propertyType, MARGIN, y, 150);
            drawLabelValue('Building / Project', noc.buildingProjectName, MARGIN + 160, y, 150);
            drawLabelValue('Reference / Prop No.', noc.propertyNumber, MARGIN + 320, y, 150);
            y += 30; // Reduced from 40

            // Row 2
            drawLabelValue('Community', noc.community, MARGIN, y, 150);
            drawLabelValue('Street Name', noc.streetName, MARGIN + 160, y, 150);
            drawLabelValue('Location (Map)', noc.location, MARGIN + 320, y, 150);
            y += 50; // Increased to handle multi-line location addresses

            // Row 3 (Metrics)
            drawLabelValue('Built-up Area (Sq.ft)', noc.buildUpArea, MARGIN, y, 100);
            drawLabelValue('Plot Area (Sq.ft)', noc.plotArea, MARGIN + 120, y, 100);
            drawLabelValue('Bedrooms', noc.bedrooms, MARGIN + 240, y, 80);
            drawLabelValue('Bathrooms', noc.bathrooms, MARGIN + 330, y, 80);
            y += 30; // Reduced from 40

            // Row 4 (Financials)
            drawLabelValue('Rental Amount', noc.rentalAmount ? `AED ${noc.rentalAmount}` : null, MARGIN, y, 120);
            drawLabelValue('Sale Amount', noc.saleAmount ? `AED ${noc.saleAmount}` : null, MARGIN + 140, y, 120);
            drawLabelValue('Parking', noc.parking, MARGIN + 280, y, 200);
            y += 35; // Reduced from 50


            // --- OWNERS DETAILS ---
            y = checkPageBreak(y, 150);
            y = drawSectionTitle('OWNERS DETAILS', y);

            if (noc.owners && noc.owners.length > 0) {
                noc.owners.forEach((owner: any, index: number) => {
                    y = checkPageBreak(y, 80);

                    // Owner Card Style
                    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 70, 4).fillColor('#F9FAFB').fill(); // Light gray bg

                    // Owner Name & Valid ID
                    doc.fillColor(COLORS.PRIMARY);
                    drawLabelValue('Owner Name', owner.name, MARGIN + 15, y + 10, 200); // Reduced y+15 to y+10
                    drawLabelValue('Emirates ID / Passport', owner.emiratesId, MARGIN + 230, y + 10, 150);

                    // Contact
                    const phone = owner.phone ? `${owner.countryCode || ''} ${owner.phone}` : '-';
                    drawLabelValue('Contact Number', phone, MARGIN + 15, y + 35, 200); // Reduced y+45 to y+35

                    // Dates
                    const iDate = owner.issueDate ? new Date(owner.issueDate).toLocaleDateString() : '-';
                    const eDate = owner.expiryDate ? new Date(owner.expiryDate).toLocaleDateString() : '-';
                    drawLabelValue('ID Issue Date', iDate, MARGIN + 230, y + 35, 100);
                    drawLabelValue('ID Expiry Date', eDate, MARGIN + 340, y + 35, 100);

                    y += 70; // Reduced margin from 85 -> 70
                });
            } else {
                doc.font('Helvetica-Oblique').fontSize(10).fillColor(COLORS.SECONDARY).text('No owner details provided.', MARGIN, y);
                y += 30;
            }
            y += 10;

            // --- AGREEMENT TERMS ---
            y = checkPageBreak(y, 200);
            y = drawSectionTitle('TERMS & CONDITIONS', y);

            // Row 1
            const agreementType = (noc.agreementType || 'non-exclusive').toUpperCase();
            drawLabelValue('Agreement Type', agreementType, MARGIN, y, 150);

            const duration = noc.periodMonths ? `${noc.periodMonths} Month(s)` : '-';
            drawLabelValue('Duration', duration, MARGIN + 160, y, 150);

            const aDate = noc.agreementDate ? new Date(noc.agreementDate).toLocaleDateString() : '-';
            drawLabelValue('Agreement Date', aDate, MARGIN + 320, y, 150);
            y += 30;

            // Disclaimer
            doc.rect(MARGIN, y, CONTENT_WIDTH, 60).strokeColor(COLORS.BORDER).stroke();
            doc.font('Helvetica').fontSize(8).fillColor(COLORS.SECONDARY)
                .text("I/We confirm that I am/we are the owner(s) of the above property and have the legal authority to sign. Should this property be subject to an offer, I/we will notify the brokerage. This agreement may be terminated by either party with seven (7) days written notice.",
                    MARGIN + 10, y + 10, { width: CONTENT_WIDTH - 20, align: 'justify', lineGap: 2 });
            y += 75;

            // --- SIGNATURES ---
            y = checkPageBreak(y, 150);
            y = drawSectionTitle('AUTHORIZATION & SIGNATURES', y);

            if (noc.owners && noc.owners.length > 0) {
                // Layout signatures in a grid (2 per row)
                let xOffset = MARGIN;

                for (let i = 0; i < noc.owners.length; i++) {
                    const owner = noc.owners[i];

                    if (y + 120 > doc.page.height - MARGIN) {
                        doc.addPage();
                        y = MARGIN;
                    }

                    // Signature Box
                    doc.rect(xOffset, y, 240, 100).strokeColor(COLORS.BORDER).stroke();

                    // Name Header
                    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.PRIMARY).text(owner.name || 'Owner', xOffset + 10, y + 10);

                    // Image
                    if (owner.signatureUrl) {
                        try {
                            const response = await axios.get(owner.signatureUrl, { responseType: 'arraybuffer' });
                            const imageBuffer = Buffer.from(response.data);
                            // Draw image centered in box
                            doc.image(imageBuffer, xOffset + 70, y + 30, { height: 40, width: 100, fit: [100, 40] as any });
                        } catch (e) {
                            console.error('Sig load error', e);
                            doc.fontSize(8).text('(Signature Error)', xOffset + 10, y + 50);
                        }
                    } else {
                        doc.fontSize(8).fillColor('#E5E7EB').text('(No Signature)', xOffset + 100, y + 50);
                    }

                    // Date
                    const sDate = owner.signatureDate ? new Date(owner.signatureDate).toLocaleDateString() : 'Date: __________';
                    doc.font('Helvetica').fontSize(8).fillColor(COLORS.SECONDARY).text(sDate, xOffset + 10, y + 80);

                    // Calculations for grid
                    if ((i + 1) % 2 === 0) {
                        xOffset = MARGIN;
                        y += 110;
                    } else {
                        xOffset = MARGIN + 260;
                    }
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
