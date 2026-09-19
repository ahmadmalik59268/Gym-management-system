import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Dumbbell, Calendar, User, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { WorkoutPlan } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { WorkoutPlanModal } from '../components/fitness/WorkoutPlanModal';

export const WorkoutPlans: React.FC = () => {
  const { workoutPlans, getMember, trainers } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('All');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  const filteredPlans = useMemo(() => {
    return (workoutPlans || []).filter((w) => {
      const member = getMember(w.memberId);
      const coach = (trainers || []).find((t) => t.id === w.trainerId);
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        w.title.toLowerCase().includes(q) ||
        (member && member.fullName.toLowerCase().includes(q)) ||
        (coach && coach.name.toLowerCase().includes(q));

      const matchesGoal = goalFilter === 'All' || w.goal === goalFilter;

      return matchesSearch && matchesGoal;
    });
  }, [workoutPlans, searchQuery, goalFilter, getMember, trainers]);

  const toggleExpand = (id: string) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workout Programs & Routines</h2>
          <p className="text-xs text-slate-500 mt-1">
            Custom periodized strength programs, split days, and movement protocols.
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
        >
          Create Workout Plan
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routine title, member name, or coach..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Goal:</span>
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Goals</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Endurance">Endurance</option>
            <option value="General Fitness">General Fitness</option>
          </select>
        </div>
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          title="No workout plans found"
          description="Create customized workout routines for your athletes."
          actionLabel="Create Workout Plan"
          onAction={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const member = getMember(plan.memberId);
            const coach = trainers.find((t) => t.id === plan.trainerId);
            const isExpanded = expandedPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Header Summary */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900">{plan.title}</h3>
                      <Badge variant="indigo" size="sm">
                        {plan.goal}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Athlete:{' '}
                        <strong className="text-slate-800 font-semibold">
                          {member?.fullName || plan.memberId}
                        </strong>
                      </span>
                      {coach && (
                        <span className="flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                          Coach: <strong className="text-slate-800 font-semibold">{coach.name}</strong>
                        </span>
                      )}
                      <span>• {(plan.exercises || []).length} Exercises Included</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Days:
                      </span>
                      {(plan.workoutDays || []).map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleExpand(plan.id)}
                    >
                      {isExpanded ? (
                        <>
                          Collapse <ChevronUp className="w-3.5 h-3.5 ml-1" />
                        </>
                      ) : (
                        <>
                          View Exercises <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details: Movements Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-3">Group</th>
                            <th className="px-4 py-3">Exercise Name</th>
                            <th className="px-4 py-3">Sets</th>
                            <th className="px-4 py-3">Reps</th>
                            <th className="px-4 py-3">Rest Interval</th>
                            <th className="px-4 py-3">Coaching Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(plan.exercises || []).map((ex, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="px-4 py-3 font-semibold text-indigo-600">
                                {ex.category}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-900">{ex.name}</td>
                              <td className="px-4 py-3 font-semibold">{ex.sets}</td>
                              <td className="px-4 py-3">{ex.reps}</td>
                              <td className="px-4 py-3 font-mono text-slate-500">{ex.restTime}</td>
                              <td className="px-4 py-3 text-slate-500">
                                {ex.notes || 'Full range of motion'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {plan.notes && (
                      <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-900">
                        <strong className="font-bold">Coach Notes: </strong>
                        {plan.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Workout Plan Modal */}
      <WorkoutPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        planToEdit={editingPlan}
      />
    </div>
  );
};
