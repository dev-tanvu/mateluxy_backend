import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateTenancyContractDto } from './dto/create-tenancy-contract.dto';
import { FileManagerService } from '../file-manager/file-manager.service';
import PDFDocument from 'pdfkit';
import * as path from 'path';

@Injectable()
export class TenancyContractService {
    private readonly logger = new Logger(TenancyContractService.name);

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
        private fileManagerService: FileManagerService,
    ) { }

    async create(createDto: CreateTenancyContractDto) {
        // Verify property exists
        if (createDto.propertyId) {
            const propertyExists = await this.prisma.property.findUnique({
                where: { id: createDto.propertyId }
            });
            if (!propertyExists) {
                throw new NotFoundException(`Property with ID ${createDto.propertyId} not found or is an off-plan property.`);
            }
        }

        // Create DB Record
        const contract = await this.prisma.tenancyContract.create({
            data: {
                propertyId: createDto.propertyId,
                ownerName: createDto.ownerName,
                ownerPhone: createDto.ownerPhone,
                ownerEmail: createDto.ownerEmail,
                tenantName: createDto.tenantName,
                tenantPhone: createDto.tenantPhone,
                tenantEmail: createDto.tenantEmail,
                propertyUsage: createDto.propertyUsage,
                buildingName: createDto.buildingName,
                location: createDto.location,
                propertySize: createDto.propertySize,
                propertyType: createDto.propertyType,
                propertyNumber: createDto.propertyNumber,
                plotNumber: createDto.plotNumber,
                premisesNumber: createDto.premisesNumber,
                contractStartDate: createDto.contractStartDate ? new Date(createDto.contractStartDate) : null,
                contractEndDate: createDto.contractEndDate ? new Date(createDto.contractEndDate) : null,
                annualRent: createDto.annualRent,
                contractValue: createDto.contractValue,
                securityDeposit: createDto.securityDeposit,
                modeOfPayment: createDto.modeOfPayment,
                additionalTerms: createDto.additionalTerms || [],
            },
        });

        // Generate PDF
        const pdfUrl = await this.generateAndUploadPdf(contract);

        // Update with PDF URL
        const updatedContract = await this.prisma.tenancyContract.update({
            where: { id: contract.id },
            data: { pdfUrl },
        });

        // Create Folder Structure in File Manager
        if (pdfUrl) {
            try {
                await this.fileManagerService.createTenancyContractStructure(updatedContract, pdfUrl);
            } catch (error) {
                this.logger.error(`Failed to create file manager structure for contract ${contract.id}`, error);
            }
        }

        return updatedContract;
    }

    async generateAndUploadPdf(contract: any): Promise<string | null> {
        try {
            const pdfBuffer = await this.generatePdfBuffer(contract);
            const pdfFile = {
                buffer: pdfBuffer,
                originalname: `tenancy-contract-${contract.id}.pdf`,
                mimetype: 'application/pdf',
            } as Express.Multer.File;

            return await this.uploadService.uploadFile(pdfFile);
        } catch (error) {
            this.logger.error('Failed to generate PDF', error);
            return null;
        }
    }

    // ─── Constants ──────────────────────────────────────────────────────────
    private readonly NAVY = '#1B3A5C';
    private readonly LIGHT_BG = '#E8EEF5';
    private readonly GREY_LINE = '#CCCCCC';
    private readonly WHITE = '#FFFFFF';

    // ─── Asset paths ────────────────────────────────────────────────────────
    private get govLogo(): string {
        return path.join(__dirname, 'assets', 'gov_dubai_logo.png');
    }
    private get landDeptLogo(): string {
        return path.join(__dirname, 'assets', 'land_dept_logo.png');
    }

    // ─── Main PDF ───────────────────────────────────────────────────────────
    private async generatePdfBuffer(contract: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 30, bottom: 30, left: 35, right: 35 },
            });
            const chunks: Buffer[] = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const LM = doc.page.margins.left;

            // ═══════════════════════════════════════════════════════════════
            // PAGE 1
            // ═══════════════════════════════════════════════════════════════
            this.drawPage1(doc, contract, W, LM);

            // ═══════════════════════════════════════════════════════════════
            // PAGE 2
            // ═══════════════════════════════════════════════════════════════
            doc.addPage();
            this.drawPage2(doc, contract, W, LM);

            doc.end();
        });
    }

    // ─── PAGE 1 ─────────────────────────────────────────────────────────────
    private drawPage1(doc: typeof PDFDocument, contract: any, W: number, LM: number) {
        const startDate = contract.contractStartDate
            ? new Date(contract.contractStartDate).toLocaleDateString('en-GB')
            : '';
        const endDate = contract.contractEndDate
            ? new Date(contract.contractEndDate).toLocaleDateString('en-GB')
            : '';

        // ── Header with logos ─────────────────────────────────────────
        let y = doc.y;
        try {
            doc.image(this.govLogo, LM, y, { width: 80 });
        } catch { /* logo missing */ }
        try {
            doc.image(this.landDeptLogo, LM + W - 100, y, { width: 100 });
        } catch { /* logo missing */ }

        y += 12;
        // Date / No box
        doc.fontSize(7).font('Helvetica')
            .text(`Date: ____/____/____`, LM + 5, y + 35, { width: 120 })
            .text(`No. ________________`, LM + 5, y + 48, { width: 120 });

        // Title
        y += 30;
        doc.fontSize(14).font('Helvetica-Bold')
            .fillColor(this.NAVY)
            .text('TENANCY CONTRACT', LM, y + 20, { align: 'center', width: W });

        y += 50;

        // ── Property Usage row ────────────────────────────────────────
        this.drawSectionHeader(doc, LM, y, W);
        y += 3;

        const usage = (contract.propertyUsage || '').toLowerCase();
        const resChecked = usage.includes('resident') || usage.includes('rent');
        const comChecked = usage.includes('commercial');
        const indChecked = usage.includes('industrial');

        doc.fontSize(7).font('Helvetica').fillColor('#333333');
        doc.text('Property Usage', LM + 5, y, { width: 80 });

        // Checkboxes
        const cbY = y - 1;
        this.drawCheckbox(doc, LM + 200, cbY, resChecked);
        doc.text('Residential', LM + 213, y);
        this.drawCheckbox(doc, LM + 290, cbY, comChecked);
        doc.text('Commercial', LM + 303, y);
        this.drawCheckbox(doc, LM + 380, cbY, indChecked);
        doc.text('Industrial', LM + 393, y);

        y += 18;

        // ── Form fields ───────────────────────────────────────────────
        const fields = [
            { label: 'Owner Name', value: contract.ownerName },
            { label: 'Landlord Name', value: contract.ownerName },
            { label: 'Tenant Name', value: contract.tenantName },
            { label: 'Tenant Email', value: contract.tenantEmail, label2: 'Landlord Email', value2: contract.ownerEmail },
            { label: 'Tenant Phone', value: contract.tenantPhone, label2: 'Landlord Phone', value2: contract.ownerPhone },
            { label: 'Building Name', value: contract.buildingName, label2: 'Location', value2: contract.location },
            {
                label: 'Property Size (S.M.)',
                value: contract.propertySize ? `${contract.propertySize} sqft` : '',
                label2: 'Property Type',
                value2: contract.propertyType,
                label3: 'Property No.',
                value3: contract.propertyNumber,
            },
            {
                label: 'Premises No (DEWA)',
                value: contract.premisesNumber,
                label2: 'Plot No',
                value2: contract.plotNumber,
            },
            {
                label: 'Contract Period',
                value: startDate,
                label2: 'To',
                value2: endDate,
                label3: 'From',
                value3: startDate,
            },
            { label: 'Annual Rent', value: contract.annualRent ? `AED ${Number(contract.annualRent).toLocaleString()}` : '' },
            { label: 'Contract Value', value: contract.contractValue ? `AED ${Number(contract.contractValue).toLocaleString()}` : '' },
            {
                label: 'Security Deposit Amount',
                value: contract.securityDeposit ? `AED ${Number(contract.securityDeposit).toLocaleString()}` : '',
                label2: 'Mode of Payment',
                value2: contract.modeOfPayment,
            },
        ];

        for (const f of fields) {
            if (f.label3) {
                // Three-column row
                const colW = W / 3;
                this.drawFieldRow(doc, LM, y, colW - 10, f.label, f.value || '');
                this.drawFieldRow(doc, LM + colW, y, colW - 10, f.label2 || '', f.value2 || '');
                this.drawFieldRow(doc, LM + colW * 2, y, colW - 10, f.label3, f.value3 || '');
            } else if (f.label2) {
                // Two-column row
                const half = W / 2;
                this.drawFieldRow(doc, LM, y, half - 10, f.label, f.value || '');
                this.drawFieldRow(doc, LM + half, y, half - 10, f.label2, f.value2 || '');
            } else {
                // Full-width row
                this.drawFieldRow(doc, LM, y, W, f.label, f.value || '');
            }
            y += 18;
        }

        y += 5;

        // ── Terms & Conditions Header ─────────────────────────────────
        this.drawSectionBanner(doc, LM, y, W, 'Terms & Conditions:');
        y += 22;

        // ── T&C Items 1-9 ─────────────────────────────────────────────
        const terms = this.getTermsAndConditions();
        for (let i = 0; i < Math.min(9, terms.length); i++) {
            y = this.drawTermItem(doc, LM, y, W, i + 1, terms[i]);
            if (y > 740) break; // Page safety
        }

        // ── Signature area (Page 1) ───────────────────────────────────
        if (y < 700) {
            y = 710;
        }
        this.drawSignatureArea(doc, LM, y, W);
    }

    // ─── PAGE 2 ─────────────────────────────────────────────────────────────
    private drawPage2(doc: typeof PDFDocument, contract: any, W: number, LM: number) {
        let y = doc.y;

        // ── T&C Items 10-14 ───────────────────────────────────────────
        const terms = this.getTermsAndConditions();
        for (let i = 9; i < terms.length; i++) {
            y = this.drawTermItem(doc, LM, y, W, i + 1, terms[i]);
        }

        y += 10;

        // ── Know your rights ──────────────────────────────────────────
        this.drawSectionBanner(doc, LM, y, W, 'Know your rights:');
        y += 22;

        const rights = [
            'You may visit Rental Dispute Center website www.rdc.gov.ae and use Smart Judge service in case of any rental dispute between parties.',
            'Law No 26 of 2007 regulating relationship between landlords and tenants.',
            'Law No 33 of 2008 amending law 26 of year 2007.',
            'Law No 43 of 2013 determining rent increases for properties.',
        ];

        for (const r of rights) {
            doc.fontSize(6.5).font('Helvetica').fillColor('#333333')
                .text(`• ${r}`, LM + 10, y, { width: W - 20 });
            y = doc.y + 4;
        }

        y += 8;

        // ── Attachments for EJARI registration ────────────────────────
        this.drawSectionBanner(doc, LM, y, W, 'Attachments for EJARI registration:');
        y += 22;

        const attachments = [
            'Original unified tenancy contract.',
            'Copy of Emirates ID or passport for tenant (individuals) Or trade license for tenant (companies).',
            'Original Emirates ID of applicant or representative card by DNRD.',
        ];

        for (let i = 0; i < attachments.length; i++) {
            doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#333333')
                .text(`${i + 1}`, LM + 5, y);
            doc.font('Helvetica')
                .text(attachments[i], LM + 20, y, { width: W - 30 });
            y = doc.y + 4;
        }

        y += 10;

        // ── Additional Terms ──────────────────────────────────────────
        this.drawSectionBanner(doc, LM, y, W, 'Additional Terms:');
        y += 22;

        const additionalTerms: string[] = contract.additionalTerms && Array.isArray(contract.additionalTerms)
            ? contract.additionalTerms
            : [];

        for (let i = 0; i < 8; i++) {
            const text = additionalTerms[i] || '';
            doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
                .text(`${i + 1}`, LM + 5, y);
            if (text) {
                doc.font('Helvetica').text(text, LM + 20, y, { width: W - 30 });
            }
            // Draw underline
            doc.moveTo(LM + 20, y + 10).lineTo(LM + W - 10, y + 10)
                .strokeColor(this.GREY_LINE).lineWidth(0.5).stroke();
            y += 18;
        }

        y += 5;

        // Note
        doc.fontSize(6).font('Helvetica-Oblique').fillColor('#666666')
            .text(
                'Note: You may add an addendum to this tenancy contract in case you have additional terms while it needs to be signed by all parties.',
                LM + 5, y, { width: W - 10 },
            );
        y = doc.y + 15;

        // ── Signature area (Page 2) ───────────────────────────────────
        this.drawSignatureArea(doc, LM, y, W);

        // ── Footer ────────────────────────────────────────────────────
        const footerY = doc.page.height - 30;
        doc.fontSize(5.5).font('Helvetica').fillColor(this.NAVY)
            .text(
                'Tel: 8004488  Fax: +971 4 222 2251  P.O.Box 1166, Dubai, U.A.E.  |  Website: www.dubailand.gov.ae  |  E-mail: info@dubailand.gov.ae',
                LM, footerY, { align: 'center', width: W },
            );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════

    /** Thin coloured band above a section */
    private drawSectionHeader(doc: typeof PDFDocument, x: number, y: number, w: number) {
        doc.rect(x, y, w, 2).fill(this.NAVY);
    }

    /** Navy banner with white text */
    private drawSectionBanner(doc: typeof PDFDocument, x: number, y: number, w: number, title: string) {
        doc.rect(x, y, w, 18).fill(this.NAVY);
        doc.fontSize(9).font('Helvetica-Bold').fillColor(this.WHITE)
            .text(title, x + 8, y + 4, { width: w - 16 });
    }

    /** Single form-field row: label + underlined value */
    private drawFieldRow(doc: typeof PDFDocument, x: number, y: number, w: number, label: string, value: string) {
        const labelW = Math.min(120, w * 0.4);
        doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
            .text(label, x, y, { width: labelW });

        const valX = x + labelW + 5;
        const valW = w - labelW - 10;
        doc.fontSize(7).font('Helvetica').fillColor('#111111')
            .text(value || '', valX, y, { width: valW });

        // Underline
        doc.moveTo(valX, y + 10).lineTo(valX + valW, y + 10)
            .strokeColor(this.GREY_LINE).lineWidth(0.5).stroke();
    }

    /** Checkbox (filled or empty) */
    private drawCheckbox(doc: typeof PDFDocument, x: number, y: number, checked: boolean) {
        doc.rect(x, y, 8, 8).strokeColor('#333333').lineWidth(0.5).stroke();
        if (checked) {
            doc.fontSize(7).font('Helvetica-Bold').fillColor(this.NAVY)
                .text('✓', x + 1, y, { width: 8 });
        }
    }

    /** Numbered term item */
    private drawTermItem(doc: typeof PDFDocument, x: number, y: number, w: number, num: number, text: string): number {
        // Number circle
        doc.fontSize(7).font('Helvetica-Bold').fillColor(this.NAVY)
            .text(`${num}`, x + 5, y, { width: 15 });

        // Term text
        doc.fontSize(6).font('Helvetica').fillColor('#333333')
            .text(text, x + 22, y, { width: w - 30 });

        return doc.y + 5;
    }

    /** Signature blocks */
    private drawSignatureArea(doc: typeof PDFDocument, x: number, y: number, w: number) {
        const half = w / 2 - 15;

        // Left: Tenant
        doc.fontSize(8).font('Helvetica-Bold').fillColor(this.NAVY)
            .text('Tenant Signature', x, y);
        doc.rect(x, y + 12, half, 50).fillAndStroke(this.LIGHT_BG, this.GREY_LINE);
        doc.fontSize(7).font('Helvetica').fillColor('#333333')
            .text('Date: _______________', x, y + 68);

        // Right: Landlord
        doc.fontSize(8).font('Helvetica-Bold').fillColor(this.NAVY)
            .text('Landlord Signature', x + half + 30, y);
        doc.rect(x + half + 30, y + 12, half, 50).fillAndStroke(this.LIGHT_BG, this.GREY_LINE);
        doc.fontSize(7).font('Helvetica').fillColor('#333333')
            .text('Date: _______________', x + half + 30, y + 68);
    }

    // ─── Official Terms & Conditions ────────────────────────────────────────
    private getTermsAndConditions(): string[] {
        return [
            'The tenant has inspected the premises and agreed to lease the unit in its current condition.',
            'Tenant undertakes to use the premises for designated purpose; tenant has no rights to transfer or relinquish the tenancy contract either with or without counterpart to any without landlord written approval. Also tenant is not allowed to sublease the premises or any part thereof to third party in whole or in part unless it is legally permitted.',
            'The tenant undertakes not to make any amendments, modifications or addendums to the premises subject of the contract without obtaining the landlord written approval, tenant shall be liable for any damages or failure due to that.',
            'The tenant shall be responsible for payment of all electricity, water, cooling and gas charges resulting of occupying leased unit unless other condition agreed in written.',
            'The tenant must pay the rent amount in the manner and dates agreed with the landlord.',
            'The Tenant fully undertakes to comply with all the regulations and instructions related to the management of the property and the use of the premises and of common areas such (parking, swimming pools, gymnasium, etc...).',
            'Tenancy contract parties declare all mentioned emails addresses and phone numbers are correct, all formal and legal notifications will be sent to those addresses in case of dispute between parties.',
            'The Landlord undertakes to enable the tenant of the full use of the premises including its facilities (Swimming pool, gym, parking lot, etc) and do the regular maintenance as intended unless other condition agreed in written, and not to do any act that would detract from the premises benefit.',
            'By signing this agreement from the first party, the "Landlord" hereby confirms and undertakes that he is the current owner of the property or his legal representative under legal power of attorney duly entitled by the competent authorities.',
            'Any disagreement or dispute may arise from execution or interpretation of this contract shall be settled by the Rental Dispute Center.',
            'This Contract is subject to all provisions of Law No (26) of 2007 regulating the relation between landlords and tenants in the Emirate of Dubai as amended, and as it will be changed or amended from time to time, as long with any related legislations and regulations applied in the Emirate of Dubai.',
            'Any additional condition will not be considered in case it conflicts with law.',
            'In case of discrepancy occurs between Arabic and non Arabic texts with regards to the interpretation of this agreement or the scope of its application, the Arabic text shall prevail.',
            'The Landlord undertakes to register this tenancy contract on EJARI affiliated to Dubai Land Department and provide with all required documents.',
        ];
    }
}
