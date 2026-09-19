import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserCheck,
  Check,
  Filter,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { useGym } from '../../context/GymContext';
import { Trainer, Member } from '../../types';

interface AssignMembersToTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: Trainer;
}

export const AssignMembersToTrainerModal: React.FC<AssignMembersToTrainerModalProps> = ({
  isOpen,
  onClose,
  trainer,
}) => {
  const { members, trainerAssignments, assignMemberToTrainer, memberships, plans } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unassigned' | 'active'>('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Get currently assigned members for this trainer
  const currentAssignedIds = useMemo(() => {
    return (trainerAssignments || [])
      .filter((a) => a.trainerId === trainer.id && (a.status === 'Active' || !a.status))
      .map((a) => a.memberId);
  }, [trainerAssignments, trainer.id]);

  // Map of memberId -> assignedTrainerId
  const memberToTrainerMap = useMemo(() => {
    const map = new Map<string, string>();
    (trainerAssignments || []).forEach((a) => {
      if (a.status === 'Active' || !a.status) {
        map.set(a.memberId, a.trainerId);
      }
    });
    return map;
  }, [trainerAssignments]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.fullName.toLowerCase().includes(q) ||
        member.id.toLowerCase().includes(q) ||
        member.phone.includes(q) ||
        member.email.toLowerCase().includes(q);

      const assignedTrainer = memberToTrainerMap.get(member.id);
      const isAssignedToThisTrainer = assignedTrainer === trainer.id;

      if (!matchesSearch) return false;

      if (filterMode === 'unassigned') {
        return !assignedTrainer;
      }
      if (filterMode === 'active') {
        return member.status === 'Active';
      }

      return true;
    });
  }, [members, searchQuery, filterMode, memberToTrainerMap, trainer.id]);

  const handleToggleSelect = (memberId: string) => {
    if (currentAssignedIds.includes(memberId)) return; // Already assigned
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSelectAllUnassigned = () => {
    const unassignedInView = filteredMembers
      .filter((m) => !currentAssignedIds.includes(m.id))
      .map((m) => m.id);

    const allSelected = unassignedInView.every((id) => selectedMemberIds.includes(id));

    if (allSelected) {
      setSelectedMemberIds((prev) => prev.filter((id) => !unassignedInView.includes(id)));
    } else {
      setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...unassignedInView])));
    }
  };

  const handleAssignSelected = () => {
    if (selectedMemberIds.length === 0) return;
    selectedMemberIds.forEach((mId) => {
      assignMemberToTrainer(trainer.id, mId);
    });
    setSelectedMemberIds([]);
    onClose();
  };

  const handleSingleAssign = (memberId: string) => {
    assignMemberToTrainer(trainer.id, memberId);
    setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Athletes to Coach ${trainer.name}`}
      description={`Pair active gym members with ${trainer.name} (${trainer.specialization}).`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete by name, ID, or phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Athletes
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unassigned')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                filterMode === 'unassigned'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unassigned Only
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                filterMode === 'active'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Members
            </button>
          </div>
        </div>

        {/* Multi-Select Action Bar */}
        <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 px-4 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllUnassigned}
              className="font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              Select / Deselect all available
            </button>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">
              {selectedMemberIds.length} athlete(s) selected
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            disabled={selectedMemberIds.length === 0}
            icon={<UserCheck className="w-3.5 h-3.5" />}
            onClick={handleAssignSelected}
          >
            Assign Selected ({selectedMemberIds.length})
          </Button>
        </div>

        {/* Member Table/List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-100">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No matching members found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try adjusting your search criteria or filter mode.
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isAlreadyAssignedToThis = currentAssignedIds.includes(member.id);
              const isSelected = selectedMemberIds.includes(member.id);
              const otherTrainerId = memberToTrainerMap.get(member.id);

              // Find active membership
              const activeMembership = (memberships || []).find(
                (ms) => ms.memberId === member.id && ms.status === 'Active'
              );
              const plan = activeMembership
                ? (plans || []).find((p) => p.id === activeMembership.planId)
                : null;

              return (
                <div
                  key={member.id}
                  onClick={() => {
                    if (!isAlreadyAssignedToThis) {
                      handleToggleSelect(member.id);
                    }
                  }}
                  className={`flex items-center justify-between p-3.5 transition-colors cursor-pointer ${
                    isAlreadyAssignedToThis
                      ? 'bg-slate-50/80 cursor-default opacity-85'
                      : isSelected
                      ? 'bg-indigo-50/50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left: Checkbox + Avatar + Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected || isAlreadyAssignedToThis}
                      disabled={isAlreadyAssignedToThis}
                      onChange={() => handleToggleSelect(member.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 disabled:opacity-50"
                    />

                    <Avatar src={member.profilePhoto} name={member.fullName} size="md" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {member.fullName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {member.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 truncate">
                        <span>{member.phone}</span>
                        {plan && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">{plan.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status / Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={
                        member.status === 'Active'
                          ? 'success'
                          : member.status === 'Expiring Soon'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {member.status}
                    </Badge>

                    {isAlreadyAssignedToThis ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        Assigned
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant={isSelected ? 'primary' : 'outline'}
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleAssign(member.id);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Total roster: <strong className="text-slate-800">{currentAssignedIds.length}</strong> active client(s)
          </span>
          <Button variant="outline" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
