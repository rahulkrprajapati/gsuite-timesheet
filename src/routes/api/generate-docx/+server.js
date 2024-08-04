import { json } from '@sveltejs/kit';
import {
	Document,
	Packer,
	Paragraph,
	TextRun,
	Table,
	TableRow,
	TableCell,
	WidthType,
	AlignmentType,
	BorderStyle
} from 'docx';

export async function POST({ request }) {
	const invoiceData = await request.json();

	const doc = new Document({
		sections: [
			{
				properties: {},
				children: [
					new Paragraph({
						children: [new TextRun({ text: 'Invoice', bold: true, size: 36 })],
						alignment: AlignmentType.CENTER
					}),
					new Paragraph({
						children: [
							new TextRun({ text: `Invoice Number: ${invoiceData.invoiceNumber}`, size: 24 })
						],
						spacing: { before: 400 }
					}),
					new Paragraph({
						children: [new TextRun({ text: `Date: ${invoiceData.date}`, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: 'From:', bold: true, size: 24 })],
						spacing: { before: 400 }
					}),
					new Paragraph({
						children: [new TextRun({ text: invoiceData.from.name, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: invoiceData.from.address, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: 'To:', bold: true, size: 24 })],
						spacing: { before: 400 }
					}),
					new Paragraph({
						children: [new TextRun({ text: invoiceData.to.name, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: invoiceData.to.address, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: `Tax ID: ${invoiceData.to.taxId}`, size: 24 })]
					}),
					new Table({
						width: { size: 100, type: WidthType.PERCENTAGE },
						rows: [
							new TableRow({
								children: [
									new TableCell({
										children: [new Paragraph('Description')],
										width: { size: 70, type: WidthType.PERCENTAGE }
									}),
									new TableCell({
										children: [new Paragraph('Amount')],
										width: { size: 30, type: WidthType.PERCENTAGE }
									})
								]
							}),
							...invoiceData.items.map(
								(item) =>
									new TableRow({
										children: [
											new TableCell({
												children: [new Paragraph(item.description)],
												width: { size: 70, type: WidthType.PERCENTAGE }
											}),
											new TableCell({
												children: [new Paragraph(item.amount.toString())],
												width: { size: 30, type: WidthType.PERCENTAGE }
											})
										]
									})
							)
						]
					}),
					new Paragraph({
						children: [
							new TextRun({
								text: `Total: INR ${invoiceData.items.reduce((sum, item) => sum + item.amount, 0)}`,
								bold: true,
								size: 24
							})
						],
						spacing: { before: 400 }
					}),
					new Paragraph({
						children: [new TextRun({ text: 'Invoice Note', bold: true, size: 24 })],
						spacing: { before: 400 }
					}),
					new Paragraph({
						children: [new TextRun({ text: `Name: ${invoiceData.bankDetails.name}`, size: 24 })]
					}),
					new Paragraph({
						children: [
							new TextRun({ text: `Account No: ${invoiceData.bankDetails.accountNo}`, size: 24 })
						]
					}),
					new Paragraph({
						children: [new TextRun({ text: `Bank: ${invoiceData.bankDetails.bank}`, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: `Branch: ${invoiceData.bankDetails.branch}`, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: `IFSC: ${invoiceData.bankDetails.ifsc}`, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: `PAN no: ${invoiceData.bankDetails.pan}`, size: 24 })]
					}),
					new Paragraph({
						children: [new TextRun({ text: `Email: ${invoiceData.bankDetails.email}`, size: 24 })]
					})
				]
			}
		]
	});

	const buffer = await Packer.toBuffer(doc);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'Content-Disposition': `attachment; filename="invoice_${invoiceData.invoiceNumber}.docx"`
		}
	});
}
