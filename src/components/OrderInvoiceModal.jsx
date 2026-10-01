import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Building, 
  User, 
  CheckCircle2 
} from 'lucide-react';
import { printOrderInvoice, downloadInvoiceDocument } from '../utils/invoiceGenerator';

export default function OrderInvoiceModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const orderNumber = order.orderNumber || order.id || 'ORD-9842';
  const invoiceNumber = `INV-${orderNumber}`;
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : (order.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));

  const rawSubtotal = Number(order.subtotal?.toString().replace(/[^0-9.]/g, '') || order.totalAmount || 0);
  const discountAmount = Number(order.discountAmount?.toString().replace(/[^0-9.]/g, '') || order.discount?.toString().replace(/[^0-9.]/g, '') || 0);
  const shippingFee = Number(order.shippingFee ?? (order.shipping === 'FREE' ? 0 : 0));
  const grandTotal = Number(order.totalAmount?.toString().replace(/[^0-9.]/g, '') || (rawSubtotal - discountAmount + shippingFee));

  const taxableBase = Math.round((rawSubtotal - discountAmount) / 1.05);
  const totalGst = (rawSubtotal - discountAmount) - taxableBase;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  const items = order.items || [];
  const addressObj = typeof order.shippingAddress === 'object' ? order.shippingAddress : { addressLine: order.shippingAddress || '' };
  const fullAddress = [
    addressObj.apartment,
    addressObj.addressLine,
    addressObj.city,
    addressObj.state,
    addressObj.pincode,
  ].filter(Boolean).join(', ');

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white border border-neutral-200 shadow-2xl my-6 rounded-none flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Actions Bar */}
        <div className="bg-neutral-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">
                Tax Invoice • {invoiceNumber}
              </h3>
              <p className="text-[10px] text-neutral-400">
                Issued on {invoiceDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printOrderInvoice(order)}
              className="inline-flex items-center gap-1.5 bg-white text-neutral-950 px-3 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => downloadInvoiceDocument(order)}
              className="inline-flex items-center gap-1.5 bg-neutral-800 text-neutral-200 px-3 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Download HTML/PDF file"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save File</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Clean Invoice Paper */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-xs text-neutral-800 font-sans selection:bg-neutral-900 selection:text-white">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-neutral-900 pb-5">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-neutral-950 font-sans">
                XAVONIC GYMWEAR
              </h1>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider mt-0.5">
                Engineered Performance & Aesthetic Apparel
              </p>
              <div className="mt-2 text-[10px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 inline-block border border-neutral-200">
                GSTIN: 06AAECX9821L1Z4 • PAN: AAECX9821L
              </div>
            </div>

            <div className="sm:text-right font-mono text-xs">
              <div className="font-bold text-sm text-neutral-950 font-mono">{invoiceNumber}</div>
              <div className="text-neutral-500 text-[11px] mt-1">Date: {invoiceDate}</div>
              <div className="text-neutral-500 text-[11px]">Order: #{orderNumber}</div>
              <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tax Invoice / Paid
              </span>
            </div>
          </div>

          {/* Seller & Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller */}
            <div className="border border-neutral-200 bg-neutral-50/70 p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                <span>Sold By (Seller)</span>
                <span className="text-emerald-700 font-medium">● Verified Supplier</span>
              </div>
              <div className="font-bold text-neutral-900 text-xs pt-1">
                Xavonic Athletics (Guidelya Sports Pvt Ltd)
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Plot 42, DLF Phase 4, Gurugram, Haryana - 122002<br />
                State: Haryana (Code 06) • CIN: U17120HR2023PTC109842<br />
                Support: support@guidelya.com
              </p>
            </div>

            {/* Buyer */}
            <div className="border border-neutral-200 bg-neutral-50/70 p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                <span>Billed & Shipped To</span>
                <span className="font-mono text-neutral-700">{order.customerId || 'CUSTOMER'}</span>
              </div>
              <div className="font-bold text-neutral-900 text-xs pt-1">
                {order.customerName || order.customer_name || 'Valued Athlete'}
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                📱 +{order.customerPhone || order.customer_phone || 'N/A'}<br />
                {(order.customerEmail || order.customer_email) && (
                  <span>✉️ {order.customerEmail || order.customer_email}<br /></span>
                )}
                📍 {fullAddress || 'Saved Customer Delivery Address'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-neutral-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-950 text-white text-[10px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Item & Variant</th>
                  <th className="py-2.5 px-3 text-center w-20">HSN</th>
                  <th className="py-2.5 px-3 text-right w-20">Rate</th>
                  <th className="py-2.5 px-3 text-center w-12">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Taxable</th>
                  <th className="py-2.5 px-3 text-center w-14">GST</th>
                  <th className="py-2.5 px-3 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((it, idx) => {
                  const qty = Number(it.quantity || 1);
                  const price = Number(it.price || 0);
                  const lineTotal = price * qty;
                  const itemTaxable = Math.round(lineTotal / 1.05);

                  return (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-neutral-50/50' : 'bg-white'}>
                      <td className="py-2.5 px-3 text-center text-neutral-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-neutral-900 text-xs">{it.title}</div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          Size: <strong>{it.size || it.selectedSize || 'M'}</strong> • Color: <strong>{it.color || it.selectedColor || 'Standard'}</strong>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-600 text-[11px]">
                        61091000
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                        ₹{price.toLocaleString('en-IN')}.00
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-[11px]">
                        {qty}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-700 text-[11px]">
                        ₹{itemTaxable.toLocaleString('en-IN')}.00
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-600 text-[11px]">
                        5%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-950 text-xs">
                        ₹{lineTotal.toLocaleString('en-IN')}.00
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Breakdown & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr] gap-4 items-start">
            <div className="border border-neutral-200 p-3.5 bg-neutral-50/50 space-y-1.5 text-[11px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Logistics & Payment Notes
              </div>
              <div className="text-neutral-700">
                Courier: <strong>{order.courierPartner || order.courier_partner || 'Bluedart Express'}</strong>
              </div>
              <div className="text-neutral-700 font-mono text-[10px]">
                AWB / Tracking: <strong>{order.trackingNumber || order.tracking_number || 'XAV-TRACKING'}</strong>
              </div>
              <div className="text-neutral-700 pt-1">
                Payment: <strong>{order.paymentMethod || order.payment_method || 'Prepaid'}</strong> ({order.paymentStatus || 'Verified'})
              </div>
              <div className="text-[10px] text-neutral-500 pt-1 leading-normal">
                7-Day hassle-free return and size exchange on unwashed items with tags attached.
              </div>
            </div>

            <div className="border border-neutral-200 bg-neutral-50 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal:</span>
                <span>₹{rawSubtotal.toLocaleString('en-IN')}.00</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Savings ({order.couponCode || 'PROMO'}):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}.00</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 text-[11px]">
                <span>CGST (2.5%):</span>
                <span>₹{cgst.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-[11px]">
                <span>SGST (2.5%):</span>
                <span>₹{sgst.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping:</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}.00`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-950 pt-2 border-t border-neutral-300">
                <span>Total Amount:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
          </div>

          {/* Footer & Digital Verification */}
          <div className="border-t border-neutral-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-neutral-500">
            <div>
              <p>Issued under Section 31 of CGST Act 2017. All athletic wear certified 4-way performance stretch.</p>
              <p className="mt-0.5">This is a computer-generated tax invoice verified by Xavonic Logistics System.</p>
            </div>
            <div className="border border-neutral-300 px-3 py-1.5 text-center bg-neutral-50 shrink-0">
              <span className="block font-bold text-[9px] uppercase tracking-wider text-neutral-800">
                Digitally Verified
              </span>
              <span className="text-[9px] text-neutral-400">Authorised Signatory</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-neutral-500 font-mono">
            Support: support@guidelya.com
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-neutral-300 bg-white text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
