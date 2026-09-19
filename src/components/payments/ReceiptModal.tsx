import React from 'react';
import { Printer, Download, CheckCircle, Building2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Payment } from '../../types';
import { useGym } from '../../context/GymContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  const { getMember, gymProfile, receiptSettings, getPlan, memberships, formatCurrency } = useGym();

  if (!payment) return null;

  const member = getMember(payment.memberId);
  const membership = memberships.find((ms) => ms.id === payment.membershipId);
  const plan = membership ? getPlan(membership.planId) : undefined;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="print:p-0">
        {/* Receipt Printable Container */}
        <div id="printable-receipt" className="bg-white p-6 rounded-lg border border-slate-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{gymProfile.gymName}</h2>
                <p className="text-xs text-slate-500">{gymProfile.address}</p>
                <p className="text-xs text-slate-500">Tel: {gymProfile.phone} • {gymProfile.email}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                PAYMENT CONFIRMED
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">Receipt #{payment.receiptNumber}</p>
              <p className="text-xs text-slate-400">Date: {payment.date}</p>
            </div>
          </div>

          {/* Member & Payment details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-slate-100 text-xs">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To:
              </span>
              <p className="text-sm font-bold text-slate-900">{member?.fullName || 'Valued Member'}</p>
              <p className="text-slate-600">Member ID: {payment.memberId}</p>
              <p className="text-slate-600">{member?.phone}</p>
              <p className="text-slate-600">{member?.email}</p>
            </div>
            <div className="sm:text-right">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Info:
              </span>
              <p className="text-slate-700 font-medium">Method: {payment.paymentMethod}</p>
              <p className="text-slate-500">Status: {payment.status}</p>
              <p className="text-slate-500">Tax ID: {receiptSettings.taxNumber}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3">
                    <p className="font-medium text-slate-900">{plan ? plan.name : 'Gym Membership Access'}</p>
                    <p className="text-[11px] text-slate-400">
                      {membership ? `Valid: ${membership.startDate} to ${membership.endDate}` : 'Membership Installment'}
                    </p>
                  </td>
                  <td className="py-3">{plan ? `${plan.duration} Month(s)` : 'Periodical'}</td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="border-t border-slate-200 pt-4 flex justify-between items-center bg-slate-50 p-4 rounded-lg">
            <span className="text-sm font-bold text-slate-800">Total Amount Paid</span>
            <span className="text-xl font-extrabold text-indigo-600">{formatCurrency(payment.amount)}</span>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-[11px] text-slate-400 space-y-1">
            <p className="italic">{receiptSettings.footerNotes}</p>
            <p className="text-slate-400 text-[10px]">{receiptSettings.termsAndConditions}</p>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 print:hidden">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};
