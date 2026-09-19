import React, { useState, useMemo } from 'react';
import { Search, User, CreditCard, Dumbbell, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { useGym } from '../../context/GymContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const { members, trainers, payments, memberships, getPlan } = useGym();
  const navigate = useNavigate();

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase().trim();

    const matchedMembers = (members || []).filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );

    const matchedTrainers = (trainers || []).filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.specialization.toLowerCase().includes(q)
    );

    const matchedPayments = (payments || []).filter(
      (p) =>
        p.receiptNumber.toLowerCase().includes(q) ||
        p.memberId.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q)
    );

    const matchedMemberships = (memberships || []).filter((ms) => {
      const plan = getPlan(ms.planId);
      return (
        ms.id.toLowerCase().includes(q) ||
        ms.memberId.toLowerCase().includes(q) ||
        (plan && plan.name.toLowerCase().includes(q))
      );
    });

    return {
      members: matchedMembers.slice(0, 4),
      trainers: matchedTrainers.slice(0, 3),
      payments: matchedPayments.slice(0, 3),
      memberships: matchedMemberships.slice(0, 3),
      totalCount:
        matchedMembers.length +
        matchedTrainers.length +
        matchedPayments.length +
        matchedMemberships.length,
    };
  }, [query, members, trainers, payments, memberships, getPlan]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, trainers, receipts, plans..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Results container */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pt-1">
          {!query.trim() && (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>Type member name, ID, trainer, or receipt number to search instantly.</p>
            </div>
          )}

          {query.trim() && searchResults?.totalCount === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {searchResults && searchResults.members.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <User className="w-3.5 h-3.5" />
                <span>Members</span>
              </div>
              <div className="space-y-1">
                {searchResults.members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(`/members/${m.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={m.profilePhoto} name={m.fullName} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{m.fullName}</div>
                        <div className="text-xs text-slate-500">{m.id} • {m.phone}</div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.status === 'Active'
                          ? 'success'
                          : m.status === 'Expiring Soon'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {m.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchResults && searchResults.trainers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Trainers</span>
              </div>
              <div className="space-y-1">
                {searchResults.trainers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(`/trainers`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={t.photo} name={t.name} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.specialization}</div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-600 font-medium">View Staff →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchResults && searchResults.payments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payments & Receipts</span>
              </div>
              <div className="space-y-1">
                {searchResults.payments.map((p) => (
                  <button
                    key={p.receiptNumber}
                    onClick={() => handleSelect(`/payments`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">Receipt #{p.receiptNumber}</div>
                      <div className="text-xs text-slate-500">Member: {p.memberId} • Method: {p.paymentMethod}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">${p.amount.toFixed(2)}</div>
                      <span className="text-[11px] text-emerald-600 font-medium">{p.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
