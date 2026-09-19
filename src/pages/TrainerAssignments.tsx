import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, UserCheck, Dumbbell, Calendar, Trash2, ShieldCheck } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { AssignTrainerModal } from '../components/trainers/AssignTrainerModal';

export const TrainerAssignments: React.FC = () => {
  const { trainerAssignments, trainers, members, getMember } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const filteredAssignments = useMemo(() => {
    const list = trainerAssignments || [];
    return list.filter((a) => {
      const trainer = (trainers || []).find((t) => t.id === a.trainerId);
      const member = getMember(a.memberId);
      const q = searchQuery.toLowerCase().trim();

      return (
        !q ||
        (trainer && trainer.name.toLowerCase().includes(q)) ||
        (member && member.fullName.toLowerCase().includes(q)) ||
        a.memberId.toLowerCase().includes(q)
      );
    });
  }, [trainerAssignments, trainers, searchQuery, getMember]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Trainer Assignments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Active 1-on-1 personal coaching relationships and performance commitments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/trainers">
            <Button size="md" variant="outline" icon={<Dumbbell className="w-4 h-4" />}>
              Coaches Roster
            </Button>
          </Link>
          <Button
            size="md"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAssignModalOpen(true)}
          >
            Assign Coach
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by coach or athlete name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Assignments Table */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="There are currently no active coaching pairings matching your criteria."
          actionLabel="Assign Coach"
          onAction={() => setIsAssignModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Assigned Coach</th>
                  <th className="px-4 py-3.5">Specialization</th>
                  <th className="px-4 py-3.5">Member / Client</th>
                  <th className="px-4 py-3.5">Coaching Since</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((a) => {
                  const trainer = trainers.find((t) => t.id === a.trainerId);
                  const member = getMember(a.memberId);

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={trainer?.photo} name={trainer?.name || 'Coach'} size="sm" />
                          <div>
                            {trainer ? (
                              <Link
                                to={`/trainers/${trainer.id}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                              >
                                {trainer.name}
                              </Link>
                            ) : (
                              <span className="font-bold text-slate-900">Coach</span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {a.trainerId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-indigo-600 font-medium">
                        {trainer?.specialization || 'General Fitness'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={member?.profilePhoto}
                            name={member?.fullName || a.memberId}
                            size="xs"
                          />
                          <div>
                            <Link
                              to={`/members/${a.memberId}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {member?.fullName || a.memberId}
                            </Link>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {a.memberId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{a.startDate}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="success" size="sm">
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/members/${a.memberId}`}>
                          <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                            View Client →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Coach Modal */}
      <AssignTrainerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
};
