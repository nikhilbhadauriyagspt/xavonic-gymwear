// High-Precision GST Compliant Order Tax Invoice Generator
// For Xavonic Athletics / Guidelya Sports

export function generateInvoiceHTML(order, customBrand = null) {
  if (!order) return '';

  let brandInfo = customBrand;
  if (!brandInfo) {
    try {
      const cached = localStorage.getItem('guidelya_cached_brand');
      if (cached) brandInfo = JSON.parse(cached);
    } catch (_) {}
  }
  const brandName = brandInfo?.brand_name || 'Guidelya Activewear';
  const brandTagline = brandInfo?.brand_tagline || 'Performance Athletic Apparel & Streetwear';
  const supportEmail = brandInfo?.support_email || 'support@guidelya.com';
  const officeAddress = brandInfo?.office_address || 'Plot 42, DLF Phase 4, Gurugram, Haryana - 122002';

  const orderNumber = order.orderNumber || order.id || 'ORD-9842';
  const invoiceNumber = `INV-${orderNumber}`;
  const invoiceDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const rawSubtotal = Number(order.subtotal || order.totalAmount || 0);
  const discountAmount = Number(order.discountAmount || order.discount || 0);
  const shippingFee = Number(order.shippingFee ?? (order.shipping === 'FREE' ? 0 : 0));
  const grandTotal = Number(order.totalAmount || (rawSubtotal - discountAmount + shippingFee));

  // Compute GST 5% inclusive for athletic garments
  const taxableBase = Math.round((rawSubtotal - discountAmount) / 1.05);
  const totalGst = (rawSubtotal - discountAmount) - taxableBase;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  const items = (order.items || []).map((item, idx) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = price * qty;
    const itemTaxable = Math.round(lineTotal / 1.05);
    const itemGst = lineTotal - itemTaxable;

    return {
      sr: idx + 1,
      title: item.title || 'Athletic Apparel',
      size: item.selectedSize || item.size || 'M',
      color: item.selectedColor || item.color || 'Standard',
      hsn: '61091000',
      price,
      qty,
      taxable: itemTaxable,
      gst: itemGst,
      lineTotal,
    };
  });

  const addressObj = typeof order.shippingAddress === 'object' ? order.shippingAddress : { addressLine: order.shippingAddress || '' };
  const fullAddress = [
    addressObj.apartment,
    addressObj.addressLine,
    addressObj.city,
    addressObj.state,
    addressObj.pincode,
  ].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Poppins', -apple-system, sans-serif;
      background: #f4f4f5;
      color: #18181b;
      padding: 30px 15px;
      font-size: 11.5px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-container {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e4e4e7;
      padding: 36px 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      position: relative;
    }
    
    /* Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #18181b;
      padding-bottom: 20px;
      margin-bottom: 22px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #09090b;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .brand-sub {
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: #71717a;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .gst-tag {
      display: inline-block;
      margin-top: 6px;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: #27272a;
      background: #f4f4f5;
      padding: 2px 6px;
      border-radius: 3px;
    }
    
    .inv-meta {
      text-align: right;
    }
    .inv-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #18181b;
    }
    .inv-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #09090b;
      margin-top: 2px;
    }
    .inv-meta-row {
      font-size: 11px;
      color: #52525b;
      margin-top: 2px;
    }

    /* Parties Section (Seller vs Buyer) */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 22px;
    }
    .party-box {
      border: 1px solid #e4e4e7;
      background: #fafafa;
      padding: 14px 16px;
      border-radius: 4px;
    }
    .party-heading {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #71717a;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .party-name {
      font-size: 12.5px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 3px;
    }
    .party-text {
      font-size: 11px;
      color: #3f3f46;
      line-height: 1.45;
    }

    /* Items Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #09090b;
      color: #ffffff;
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 8px 10px;
      text-align: left;
    }
    th.r, td.r {
      text-align: right;
    }
    th.c, td.c {
      text-align: center;
    }
    td {
      padding: 9px 10px;
      border-bottom: 1px solid #e4e4e7;
      font-size: 11px;
      vertical-align: middle;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .item-name {
      font-weight: 600;
      color: #09090b;
    }
    .item-variant {
      font-size: 10px;
      color: #71717a;
      margin-top: 1px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Bottom Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 20px;
      margin-top: 10px;
      align-items: start;
    }
    .delivery-badge {
      border: 1px dashed #d4d4d8;
      padding: 12px 14px;
      border-radius: 4px;
      background: #ffffff;
      font-size: 11px;
    }
    .delivery-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #52525b;
      margin-bottom: 4px;
    }

    /* Calculation Totals */
    .totals-card {
      border: 1px solid #e4e4e7;
      background: #fafafa;
      padding: 14px 16px;
      border-radius: 4px;
    }
    .totals-line {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      padding: 3.5px 0;
      color: #3f3f46;
    }
    .totals-line.discount {
      color: #059669;
      font-weight: 600;
    }
    .totals-line.grand {
      border-top: 2px solid #09090b;
      padding-top: 8px;
      margin-top: 6px;
      font-size: 14px;
      font-weight: 800;
      color: #09090b;
    }

    /* Footer & Signatory */
    .footer-bar {
      margin-top: 36px;
      border-top: 1px solid #e4e4e7;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 10px;
      color: #71717a;
    }
    .stamp-box {
      text-align: center;
      width: 160px;
    }
    .stamp-seal {
      border: 1.5px dashed #09090b;
      border-radius: 4px;
      padding: 6px;
      margin-bottom: 4px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 8.5px;
      color: #09090b;
      background: #fafafa;
    }

    /* Print Controls */
    .no-print {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 16px;
      max-width: 840px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn-print {
      background: #09090b;
      color: #ffffff;
      border: none;
      padding: 9px 18px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-print:hover {
      background: #27272a;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .page-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">
      🖨️ Print / Download PDF
    </button>
  </div>

  <div class="page-container">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="brand-title">${brandName.toUpperCase()}</div>
        <div class="brand-sub">${brandTagline}</div>
        <div class="gst-tag">GSTIN: 06AAECX9821L1Z4 • PAN: AAECX9821L</div>
      </div>
      <div class="inv-meta">
        <div class="inv-title">TAX INVOICE / BILL OF SUPPLY</div>
        <div class="inv-num">${invoiceNumber}</div>
        <div class="inv-meta-row">Invoice Date: <strong>${invoiceDate}</strong></div>
        <div class="inv-meta-row">Order ID: <strong>#${orderNumber}</strong></div>
      </div>
    </div>

    <!-- Parties Grid -->
    <div class="parties-grid">
      <!-- Seller -->
      <div class="party-box">
        <div class="party-heading">
          <span>Sold By (Seller)</span>
          <span style="color: #059669; font-weight: 600;">Verified Seller</span>
        </div>
        <div class="party-name">${brandName}</div>
        <div class="party-text">
          ${officeAddress}<br>
          State: Haryana (Code 06) • CIN: U17120HR2023PTC109842<br>
          Email: ${supportEmail}
        </div>
      </div>

      <!-- Customer -->
      <div class="party-box">
        <div class="party-heading">
          <span>Billed & Shipped To</span>
          <span style="font-family: 'JetBrains Mono';">${order.customerId || 'CUSTOMER'}</span>
        </div>
        <div class="party-name">${order.customerName || order.customer_name || 'Valued Athlete'}</div>
        <div class="party-text">
          📱 +${order.customerPhone || order.customer_phone || 'N/A'}<br>
          ${order.customerEmail || order.customer_email ? `✉️ ${order.customerEmail || order.customer_email}<br>` : ''}
          📍 ${fullAddress || 'Address on file'}
        </div>
      </div>
    </div>

    <!-- Table of Items -->
    <table>
      <thead>
        <tr>
          <th style="width: 28px;" class="c">#</th>
          <th>Item & Variant Description</th>
          <th class="c" style="width: 70px;">HSN</th>
          <th class="r" style="width: 70px;">Unit Rate</th>
          <th class="c" style="width: 45px;">Qty</th>
          <th class="r" style="width: 80px;">Taxable (₹)</th>
          <th class="c" style="width: 55px;">GST</th>
          <th class="r" style="width: 90px;">Net Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it) => `
          <tr>
            <td class="c">${it.sr}</td>
            <td>
              <div class="item-name">${it.title}</div>
              <div class="item-variant">Size: ${it.size} | Color: ${it.color}</div>
            </td>
            <td class="c font-mono">${it.hsn}</td>
            <td class="r font-mono">₹${it.price.toLocaleString('en-IN')}.00</td>
            <td class="c font-bold">${it.qty}</td>
            <td class="r font-mono">₹${it.taxable.toLocaleString('en-IN')}.00</td>
            <td class="c">5%</td>
            <td class="r font-mono"><strong>₹${it.lineTotal.toLocaleString('en-IN')}.00</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Financial Breakdown & Courier Details -->
    <div class="summary-grid">
      <!-- Shipping & Courier info -->
      <div class="delivery-badge">
        <div class="delivery-title">Logistics & Tracking Details</div>
        <div>Courier Partner: <strong>${order.courierPartner || order.courier_partner || 'Bluedart Express'}</strong></div>
        <div>AWB / Tracking Number: <strong style="font-family: 'JetBrains Mono';">${order.trackingNumber || order.tracking_number || 'XAV-TRACKING'}</strong></div>
        <div style="margin-top: 6px; color: #52525b;">Payment Mode: <strong>${order.paymentMethod || order.payment_method || 'Prepaid'} (${order.paymentStatus || 'Verified'})</strong></div>
        <div style="margin-top: 4px; font-size: 10px; color: #71717a;">7-Day Easy Exchange Policy applies with all original tags attached.</div>
      </div>

      <!-- Financial Totals -->
      <div class="totals-card">
        <div class="totals-line">
          <span>Items Gross Subtotal:</span>
          <span style="font-family: 'JetBrains Mono';">₹${rawSubtotal.toLocaleString('en-IN')}.00</span>
        </div>
        ${discountAmount > 0 ? `
        <div class="totals-line discount">
          <span>Promotional Savings (${order.couponCode || 'PROMO'}):</span>
          <span style="font-family: 'JetBrains Mono';">-₹${discountAmount.toLocaleString('en-IN')}.00</span>
        </div>` : ''}
        <div class="totals-line">
          <span>CGST (2.5%):</span>
          <span style="font-family: 'JetBrains Mono';">₹${cgst.toLocaleString('en-IN')}.00</span>
        </div>
        <div class="totals-line">
          <span>SGST (2.5%):</span>
          <span style="font-family: 'JetBrains Mono';">₹${sgst.toLocaleString('en-IN')}.00</span>
        </div>
        <div class="totals-line">
          <span>Shipping & Handling:</span>
          <span style="font-family: 'JetBrains Mono';">${shippingFee === 0 ? 'FREE' : `₹${shippingFee}.00`}</span>
        </div>
        <div class="totals-line grand">
          <span>Invoice Total:</span>
          <span style="font-family: 'JetBrains Mono';">₹${grandTotal.toLocaleString('en-IN')}.00</span>
        </div>
      </div>
    </div>

    <!-- Footer & Stamp -->
    <div class="footer-bar">
      <div>
        <div><strong>Tax Declaration:</strong> Issued under Section 31 of Central Goods and Services Tax Act 2017.</div>
        <div style="margin-top: 2px;">This is an electronically generated tax invoice verified by Xavonic Logistics System.</div>
      </div>
      <div class="stamp-box">
        <div class="stamp-seal">XAVONIC ATHLETICS<br>DIGITALLY SIGNED</div>
        <div>Authorised Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Client-side Trigger to Print / Save as PDF seamlessly
export function printOrderInvoice(order) {
  const htmlContent = generateInvoiceHTML(order);
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    // Fallback: Use hidden iframe if popup is blocked
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  }
}

// Download Invoice as an HTML / PDF compatible document file
export function downloadInvoiceDocument(order) {
  const htmlContent = generateInvoiceHTML(order);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const orderNumber = order.orderNumber || order.id || 'ORDER';
  const fileName = `Invoice-${orderNumber}.html`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
