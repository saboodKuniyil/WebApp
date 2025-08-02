
'use client';

import * as React from 'react';
import type { Quotation } from "./quotations-list";
import type { CompanyProfile } from '@/lib/db';
import type { Currency } from '../settings/currency-management';
import Image from 'next/image';

interface QuotationPrintLayoutProps {
    quotation: Quotation;
    companyProfile: CompanyProfile | null;
    currency: Currency | null;
}

export function QuotationPrintLayout({ quotation, companyProfile, currency }: QuotationPrintLayoutProps) {
    const totalCost = quotation.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const formatCurrency = (amount: number) => {
        if (!currency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(amount);
    };

    return (
        <html>
            <head>
                <title>{`Quotation - ${quotation.id}`}</title>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        font-family: 'PT Sans', sans-serif;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page {
                        width: 210mm;
                        height: 297mm;
                        padding: 20mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #EEE;
                    }
                    .company-logo {
                        max-width: 150px;
                        max-height: 75px;
                        object-fit: contain;
                    }
                    .header h1 {
                        font-size: 2.5em;
                        margin: 0;
                        color: #222;
                    }
                    .details-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                        margin-top: 20px;
                        font-size: 0.9em;
                        color: #555;
                    }
                    .details-grid h3 {
                        font-size: 1em;
                        margin-bottom: 5px;
                        color: #333;
                    }
                     .details-grid .text-right {
                        text-align: right;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 0.9em;
                    }
                    th, td {
                        border-bottom: 1px solid #EEE;
                        padding: 10px;
                        text-align: left;
                    }
                    thead th {
                        background-color: #F9F9F9;
                        font-weight: bold;
                        color: #333;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .total-section {
                        margin-top: auto;
                        padding-top: 20px;
                        display: flex;
                        justify-content: flex-end;
                    }
                    .total-box {
                        width: 40%;
                        border-top: 2px solid #EEE;
                        padding-top: 10px;
                    }
                     .total-box div {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }
                    .grand-total {
                        font-weight: bold;
                        font-size: 1.2em;
                        color: #000;
                    }
                    .terms {
                        font-size: 0.8em;
                        color: #666;
                        margin-top: 20px;
                        border-top: 1px solid #EEE;
                        padding-top: 10px;
                    }
                `}</style>
            </head>
            <body onLoad={() => setTimeout(() => window.print(), 500)}>
                <div className="page">
                    <div className="header">
                        {companyProfile?.logoUrl && (
                             <img src={companyProfile.logoUrl} alt={companyProfile.companyName} className="company-logo" />
                        )}
                        <div>
                            <h1>QUOTATION</h1>
                            <p style={{textAlign: 'right', margin: 0}}>#{quotation.id}</p>
                        </div>
                    </div>
                    
                    <div className="details-grid">
                        <div>
                            <h3>Billed To:</h3>
                            <p><strong>{quotation.customer}</strong></p>
                            <p>123 Customer Lane</p>
                            <p>City, State, 12345</p>
                        </div>
                        <div className="text-right">
                             <h3>From:</h3>
                            <p><strong>{companyProfile?.companyName}</strong></p>
                            <p>{companyProfile?.address}</p>
                             <p>TRN: {companyProfile?.trnNumber}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style={{width: '50%'}}>Item</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Rate</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.title}</strong>
                                        <p style={{fontSize: '0.9em', color: '#666', whiteSpace: 'pre-wrap'}}>{item.description}</p>
                                    </td>
                                    <td className="text-right">{item.quantity}</td>
                                    <td className="text-right">{formatCurrency(item.rate)}</td>
                                    <td className="text-right">{formatCurrency(item.quantity * item.rate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="total-section">
                        <div className="total-box">
                             <div className="grand-total">
                                <span>Grand Total</span>
                                <span>{formatCurrency(totalCost)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="terms">
                        <h3>Terms & Conditions</h3>
                        <p>1. Payment to be made within 30 days of the invoice date.</p>
                        <p>2. Any additional work not mentioned in this quotation will be charged separately.</p>
                        <p>3. This quotation is valid for 15 days from the date of issue.</p>
                    </div>
                </div>
            </body>
        </html>
    );
}
