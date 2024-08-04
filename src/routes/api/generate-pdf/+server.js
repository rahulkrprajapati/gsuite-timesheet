import { json } from '@sveltejs/kit';
import puppeteer from 'puppeteer';

export async function POST({ request }) {
	const invoiceData = await request.json();

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Nunito Sans', sans-serif;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1 {
                    text-align: center;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .invoice-to {
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border-bottom: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    font-weight: bold;
                }
                .amount {
                    text-align: right;
                }
                .total {
                    font-weight: bold;
                }
                .invoice-note {
					margin-top: 20px;
				}
				.invoice-note p {
					margin: 5px 0;
				}
				.label {
					font-weight: bold;
					display: inline-block;
					width: 100px;
				}
            </style>
        </head>
        <body>
            <h1>Invoice</h1>
            <div class="invoice-header">
                <div>
                    <h2>From</h2>
                    <p>${invoiceData.from.name}</p>
                    <p>${invoiceData.from.address.replace(/\n/g, '<br>')}</p>
                </div>
                <div>
                    <p><span class="label">Invoice No:</span> ${invoiceData.invoiceNumber}</p>
                    <p><span class="label">Date:</span> ${invoiceData.date}</p>
                </div>
            </div>
            <div class="invoice-to">
                <h2>To</h2>
                <p>${invoiceData.to.name}</p>
                <p>${invoiceData.to.address.replace(/\n/g, '<br>')}</p>
                <p><span class="label">Tax ID:</span> ${invoiceData.to.taxId}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items
											.map(
												(item) => `
                        <tr>
                            <td>${item.description}</td>
                            <td class="amount">INR ${item.amount.toLocaleString()}</td>
                        </tr>
                    `
											)
											.join('')}
                    <tr class="total">
                        <td>Total</td>
                        <td class="amount">INR ${invoiceData.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            <h2>Invoice Note</h2>
            <div class="invoice-note">
                <p><span class="label">Name:</span> ${invoiceData.bankDetails.name}</p>
                <p><span class="label">Account No:</span> ${invoiceData.bankDetails.accountNo}</p>
                <p><span class="label">Bank:</span> ${invoiceData.bankDetails.bank}</p>
                <p><span class="label">Branch:</span> ${invoiceData.bankDetails.branch}</p>
                <p><span class="label">IFSC:</span> ${invoiceData.bankDetails.ifsc}</p>
                <p><span class="label">PAN no:</span> ${invoiceData.bankDetails.pan}</p>
                <p><span class="label">Email:</span> ${invoiceData.bankDetails.email}</p>
            </div>
        </body>
        </html>
    `;

	await page.setContent(htmlContent);
	const pdf = await page.pdf({
		format: 'A4',
		printBackground: true,
		margin: {
			top: '20px',
			right: '20px',
			bottom: '20px',
			left: '20px'
		}
	});

	await browser.close();

	return new Response(pdf, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="invoice_${invoiceData.invoiceNumber}.pdf"`
		}
	});
}
