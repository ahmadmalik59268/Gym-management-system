import React from 'react';
import { Printer, Download, Dumbbell, ShieldCheck, Phone, Mail, Calendar, User, Heart, Activity } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Member } from '../../types';
import { useGym } from '../../context/GymContext';

interface PrintMemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const PrintMemberProfileModal: React.FC<PrintMemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const {
    gymProfile,
    memberships,
    getPlan,
    assignments,
    getTrainer,
    attendance,
    formatCurrency,
    showToast,
  } = useGym();

  if (!member) return null;

  const currentMembership = memberships.find(
    (m) => m.memberId === member.id && m.status === 'Active'
  ) || memberships.find((m) => m.memberId === member.id);

  const plan = currentMembership ? getPlan(currentMembership.planId) : null;
  const assignment = assignments.find((a) => a.memberId === member.id && a.status === 'Active');
  const trainer = assignment ? getTrainer(assignment.trainerId) : null;

  const memberLogs = (attendance || []).filter(
    (a) => a.personId === member.id || a.memberId === member.id
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    showToast(`Member profile card exported (${member.id}.pdf)`, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Print Member Profile Dossier — ${member.fullName}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Ready for A4 portrait document print & member ID card generation
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
              Print Document
            </Button>
          </div>
        </div>

        {/* PRINTABLE MEMBER SHEET */}
        <div
          id="printable-member-profile"
          className="printable-sheet bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6 text-slate-800"
        >
          {/* Gym Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
            <div className="flex items-center gap-3.5">
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
                  Member Registration & Fitness Dossier
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                OFFICIAL ATHLETE RECORD
              </span>
              <span className="text-base font-extrabold text-slate-900 block font-mono">
                {member.id}
              </span>
              <span className="text-[11px] text-slate-500">
                Printed: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Member Card Top Section */}
          <div className="flex flex-col sm:flex-row gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200 avoid-break">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <Avatar
                src={member.profilePhoto}
                name={member.fullName}
                size="xl"
                className="w-24 h-24 rounded-xl border-2 border-white shadow-sm"
              />
              <span className="text-[10px] font-mono font-bold text-slate-400">{member.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Full Athlete Name
                </span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">
                  {member.fullName}
                </span>
                <span className="text-slate-500">{member.gender} • {member.age} Years Old</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Membership Status
                </span>
                <span className="inline-block mt-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded text-xs">
                  {member.status.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contact Phone
                </span>
                <span className="font-semibold text-slate-800">{member.phone}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="font-semibold text-slate-800">{member.email}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Join Date
                </span>
                <span className="font-semibold text-slate-800">{member.joinDate}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Emergency Contact
                </span>
                <span className="font-semibold text-slate-800">{member.emergencyContact || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Membership & Subscription Detail */}
          <div className="space-y-3 avoid-break">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Active Subscription & Package Contract
            </h3>

            {currentMembership ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Plan Tier</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {currentMembership.customPlanName || (plan ? plan.name : 'Active Plan')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Validity Period</span>
                  <span className="font-medium text-slate-800 block mt-0.5">
                    {currentMembership.startDate} to {currentMembership.endDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee Billed</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {formatCurrency(currentMembership.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Outstanding Balance</span>
                  <span className="font-extrabold text-rose-600 block mt-0.5">
                    {currentMembership.remaining > 0 ? formatCurrency(currentMembership.remaining) : 'Rs. 0 (Paid)'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No active membership plan recorded.</p>
            )}
          </div>

          {/* Assigned Coach / Trainer */}
          <div className="space-y-3 avoid-break">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              Assigned Coach / Trainer Details
            </h3>

            {trainer ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <Avatar src={trainer.profilePhoto} name={trainer.fullName} size="sm" />
                  <div>
                    <span className="font-bold text-slate-900 block">{trainer.fullName}</span>
                    <span className="text-slate-500 text-[11px]">{trainer.specialization} • ID: {trainer.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 block font-medium">Coach Phone: {trainer.phone}</span>
                  <span className="text-indigo-600 font-bold text-[11px]">Direct PT Assignment</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">General floor training (no dedicated personal coach assigned).</p>
            )}
          </div>

          {/* Health & Fitness Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 avoid-break text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Fitness Objective
              </span>
              <p className="text-slate-800 font-medium">
                {member.fitnessGoal || 'Strength, general stamina, and functional conditioning.'}
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Medical & Safety Notes
              </span>
              <p className="text-slate-800 font-medium">
                {member.medicalHistory || 'No declared medical contraindications.'}
              </p>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="space-y-3 avoid-break">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              Turnstile Attendance Metrics
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Visits</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{memberLogs.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Check-In</span>
                <span className="text-sm font-bold text-indigo-600 mt-1 block">
                  {memberLogs[0]?.date || 'None'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Access Permission</span>
                <span className="text-sm font-bold text-emerald-600 mt-1 block">
                  {member.status === 'Active' ? 'Active Clearance' : 'Requires Renewal'}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs avoid-break">
            <div>
              <div className="border-b border-slate-400 w-48 mb-1.5 h-10"></div>
              <span className="text-[11px] font-bold text-slate-700 block">Member Signature</span>
              <span className="text-[10px] text-slate-400">Acknowledges Gym Terms & Rules</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="border-b border-slate-400 w-48 mb-1.5 h-10"></div>
              <span className="text-[11px] font-bold text-slate-700 block">Authorized Gym Manager</span>
              <span className="text-[10px] text-slate-400">{gymProfile.gymName} Verification Stamp</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Profile Sheet
          </Button>
        </div>
      </div>
    </Modal>
  );
};
