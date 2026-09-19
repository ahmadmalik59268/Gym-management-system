import React from 'react';
import { Printer, Download, Dumbbell, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Membership } from '../../types';
import { useGym } from '../../context/GymContext';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership: Membership | null;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  membership,
}) => {
  const { gymProfile, receiptSettings, getMember, getPlan, formatCurrency, showToast } = useGym();

  if (!membership) return null;

  const member = getMember(membership.memberId);
  const plan = getPlan(membership.planId);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    showToast(`Invoice exported (INV-${membership.id}.pdf)`, 'success');
  };

  const invoiceNumber = `INV-${membership.id.replace(/[^0-9]/g, '').padStart(5, '0') || membership.id}`;
  const isPaid = membership.remaining === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Membership Invoice — ${invoiceNumber}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Standard printable invoice & tax-compliant billing receipt
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print Invoice
            </Button>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET */}
        <div
          id="printable-membership-invoice"
          className="printable-sheet bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6 text-slate-800"
        >
          {/* Gym Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold shadow-sm">
                <Dumbbell className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                  {gymProfile.gymName || 'APEX CORE ATHLETIC CLUB'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {gymProfile.address || 'Facility Headquarters'} • Tel: {gymProfile.phone || '+1 555-0199'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Tax Registration: {receiptSettings.taxNumber || 'REG-TAX-2026-99'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                OFFICIAL MEMBERSHIP INVOICE
              </span>
              <span className="text-base font-extrabold text-slate-900 block font-mono">
                {invoiceNumber}
              </span>
              <span className="text-[11px] text-slate-500">
                Date: {membership.startDate || new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>

          {/* Bill To & Subscription Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed Athlete:
              </span>
              <p className="text-sm font-black text-slate-900">{member?.fullName || 'Valued Athlete'}</p>
              <p className="text-slate-600">Member ID: {membership.memberId}</p>
              <p className="text-slate-600">Phone: {member?.phone || 'N/A'}</p>
              <p className="text-slate-600">Email: {member?.email || 'N/A'}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Subscription Terms:
              </span>
              <p className="text-slate-700 font-medium">
                Plan Type: <span className="font-bold text-slate-900">{membership.customPlanName || (plan ? plan.name : 'Standard Access')}</span>
              </p>
              <p className="text-slate-600">
                Duration: {membership.startDate} to {membership.endDate}
              </p>
              <div>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> SETTLED IN FULL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                    <AlertCircle className="w-3 h-3" /> BALANCE OUTSTANDING
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Item Description</th>
                  <th className="py-3 px-3">Validity</th>
                  <th className="py-3 px-3 text-right">Fee</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-4 px-3">
                    <p className="font-bold text-slate-900 text-sm">
                      {membership.customPlanName || (plan ? plan.name : 'Gym Facility Access')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Full turnkey access to gym equipment, locker facilities, and general coaching.
                    </p>
                  </td>
                  <td className="py-4 px-3 font-medium text-slate-600">
                    {membership.startDate} - {membership.endDate}
                  </td>
                  <td className="py-4 px-3 text-right font-bold text-slate-900">
                    {formatCurrency(membership.amount)}
                  </td>
                  <td className="py-4 px-3 text-right font-bold text-emerald-600">
                    {formatCurrency(membership.paid)}
                  </td>
                  <td className="py-4 px-3 text-right font-extrabold text-rose-600">
                    {formatCurrency(membership.remaining)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Summary Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Gross Plan Fee:</span>
              <span className="font-bold text-slate-900">{formatCurrency(membership.amount)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 font-medium">
              <span>Amount Received to Date:</span>
              <span className="font-bold">{formatCurrency(membership.paid)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-extrabold">
              <span className="text-slate-900">Net Remaining Due:</span>
              <span className={membership.remaining > 0 ? 'text-rose-600 text-base' : 'text-emerald-600 text-base'}>
                {formatCurrency(membership.remaining)}
              </span>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
            <div>
              <div className="border-b border-slate-400 w-44 mb-1.5 h-8"></div>
              <span className="text-[11px] font-bold text-slate-700 block">Received By / Cashier</span>
              <span className="text-[10px] text-slate-400">Official Front Desk Representative</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="border-b border-slate-400 w-44 mb-1.5 h-8"></div>
              <span className="text-[11px] font-bold text-slate-700 block">Authorized Signatory</span>
              <span className="text-[10px] text-slate-400">{gymProfile.gymName} Official Stamp</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 italic pt-2">
            <p>{receiptSettings.termsAndConditions || 'Membership is non-transferable and subject to gym rules.'}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
};
