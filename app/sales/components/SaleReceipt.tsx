"use client";

import { SaleTransaction, Party } from "@/types";

interface SaleReceiptProps {
  sale: SaleTransaction;
  party?: Party;
}

export function SaleReceipt({ sale, party }: SaleReceiptProps) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg print:shadow-none">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-6 mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">SHREESHAI ENTERPRISE</h1>
          <p className="text-sm text-gray-600 mt-2">
            GST: 29XXXXX1234X1ZX | Phone: +91 XXXXXXXXXX
          </p>
          <p className="text-sm text-gray-600">
            Address Line 1, City, State - 560001
          </p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h2>
          <p className="text-gray-800 font-medium">{party?.name || sale.partyName}</p>
          <p className="text-sm text-gray-600">{party?.phone || sale.partyPhone}</p>
          {party?.address && <p className="text-sm text-gray-600">{party.address}</p>}
          {party?.gstin && <p className="text-sm text-gray-600">GST: {party.gstin}</p>}
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="text-sm text-gray-600">Invoice No:</span>
            <p className="text-lg font-bold text-gray-900">{sale.voucherNo}</p>
          </div>
          <div className="mb-2">
            <span className="text-sm text-gray-600">Date:</span>
            <p className="text-gray-800">{new Date(sale.saleDate).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Payment Mode:</span>
            <p className="text-gray-800">{sale.paymentMode}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="text-left py-3 text-sm font-semibold text-gray-900">S.No</th>
            <th className="text-left py-3 text-sm font-semibold text-gray-900">Item Description</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900">Qty</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900">Rate</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items?.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-3 text-gray-800">{index + 1}</td>
              <td className="py-3 text-gray-800">
                <div className="font-medium">{item.productName}</div>
                <div className="text-sm text-gray-600">SKU: {item.sku}</div>
              </td>
              <td className="text-right py-3 text-gray-800">
                {item.quantity} {item.unit}
              </td>
              <td className="text-right py-3 text-gray-800">
                ₹{item.rate.toFixed(2)}
              </td>
              <td className="text-right py-3 text-gray-800 font-medium">
                ₹{item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t-2 border-gray-900 pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-800">
              <span>Subtotal:</span>
              <span>₹{sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>CGST (9%):</span>
              <span>₹{sale.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>SGST (9%):</span>
              <span>₹{sale.sgst.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Discount:</span>
                <span>-₹{sale.discount.toFixed(2)}</span>
              </div>
            )}
            {sale.roundOff !== 0 && (
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Round Off:</span>
                <span>₹{sale.roundOff.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-900 pt-2">
              <span>Grand Total:</span>
              <span>₹{sale.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Payment Status:</span>
            <p className="font-semibold text-gray-900">{sale.paymentStatus}</p>
          </div>
          <div>
            <span className="text-gray-600">Paid Amount:</span>
            <p className="font-semibold text-gray-900">₹{sale.paidAmount.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-600">Balance:</span>
            <p className="font-semibold text-gray-900">₹{sale.balanceAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.narration && (
        <div className="mt-6">
          <p className="text-sm text-gray-600">Notes:</p>
          <p className="text-gray-800">{sale.narration}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-300">
        <div className="flex justify-between items-end">
          <div className="text-sm text-gray-600">
            <p>Thank you for your business!</p>
            <p className="mt-1">For any queries, contact: support@shreeshai.com</p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-900 w-48 pt-2">
              <p className="text-sm text-gray-600">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Info */}
      <div className="mt-6 text-center text-xs text-gray-500 print:hidden">
        <p>This is a computer-generated invoice</p>
      </div>
    </div>
  );
}
