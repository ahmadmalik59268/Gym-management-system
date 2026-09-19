import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Apple, Droplets, Flame, Edit2, User, Sparkles } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { DietPlan } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { DietPlanModal } from '../components/fitness/DietPlanModal';

export const DietPlans: React.FC = () => {
  const { dietPlans, getMember } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);

  const filteredPlans = useMemo(() => {
    return (dietPlans || []).filter((d) => {
      const member = getMember(d.memberId);
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        (member && member.fullName.toLowerCase().includes(q));

      const matchesGoal = goalFilter === 'All' || d.goal === goalFilter;

      return matchesSearch && matchesGoal;
    });
  }, [dietPlans, searchQuery, goalFilter, getMember]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nutrition & Diet Plans</h2>
          <p className="text-xs text-slate-500 mt-1">
            Custom macronutrient balances, daily caloric intake, and meal meal schedules.
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
          Create Diet Plan
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
            placeholder="Search diet plan or member..."
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
            <option value="Maintenance">Maintenance</option>
            <option value="Ketogenic">Ketogenic</option>
          </select>
        </div>
      </div>

      {/* Diet Plans Grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          title="No diet plans found"
          description="Design personalized meal plans for gym members."
          actionLabel="Create Diet Plan"
          onAction={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => {
            const member = getMember(plan.memberId);

            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{plan.title}</h3>
                      <Badge variant="success" size="sm">
                        {plan.goal}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Assigned To:{' '}
                      <strong className="text-slate-800">{member?.fullName || plan.memberId}</strong>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setEditingPlan(plan);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>

                {/* Macro & Calorie Targets */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-3">
                      <div className="p-2 rounded-md bg-amber-100 text-amber-700">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-600 block">
                          Daily Calories
                        </span>
                        <span className="text-lg font-extrabold text-amber-900">
                          {plan.calories} kcal
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
                      <div className="p-2 rounded-md bg-blue-100 text-blue-700">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 block">
                          Hydration Target
                        </span>
                        <span className="text-lg font-extrabold text-blue-900">
                          {plan.waterTarget} Liters
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Meal Breakdown Items */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <strong className="text-indigo-700 block mb-0.5">Breakfast:</strong>
                      <p className="text-slate-700">{plan.breakfast}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <strong className="text-indigo-700 block mb-0.5">Lunch:</strong>
                      <p className="text-slate-700">{plan.lunch}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <strong className="text-indigo-700 block mb-0.5">Dinner:</strong>
                      <p className="text-slate-700">{plan.dinner}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <strong className="text-indigo-700 block mb-0.5">Snacks:</strong>
                      <p className="text-slate-700">{plan.snacks}</p>
                    </div>
                  </div>

                  {plan.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                      &ldquo;{plan.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diet Plan Modal */}
      <DietPlanModal
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
