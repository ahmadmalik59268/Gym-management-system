import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Sparkles,
  Layers,
  Calendar,
  CreditCard,
  CheckCircle2,
  Ban,
  Tag,
  DollarSign,
  Clock,
  Info,
  User,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  Dumbbell,
  Apple,
  ChevronRight,
  ChevronLeft,
  Printer,
  Eye,
  Plus,
  Trash2,
  Award,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { PhotoUpload } from '../components/common/PhotoUpload';
import { TrainerModal } from '../components/trainers/TrainerModal';
import { Exercise, ExerciseCategory } from '../types';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const AddMemberPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    addMember,
    plans,
    addMembership,
    trainers,
    assignments,
    assignMemberToTrainer,
    addWorkoutPlan,
    addDietPlan,
    formatCurrency,
    currencySymbol,
    showToast,
    gymProfile,
  } = useGym();

  // Wizard active step
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // STEP 1: Member Information
  const [memberInfo, setMemberInfo] = useState({
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    fullName: '',
    guardianName: '',
    phone: '',
    email: '',
    dob: '1998-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: '',
    emergencyName: '',
    emergencyRelation: 'Spouse',
    emergencyPhone: '',
    joinDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // STEP 2: Membership
  const [membershipConfig, setMembershipConfig] = useState<{
    enabled: boolean;
    mode: 'catalog' | 'custom';
    planId: string;
    customPlanName: string;
    durationValue: number;
    durationUnit: 'months' | 'days';
    startDate: string;
    endDate: string;
    planPrice: number;
    discount: number;
    paidAmount: number;
    paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Online';
  }>({
    enabled: true,
    mode: 'catalog',
    planId: plans[0]?.id || '',
    customPlanName: 'Custom Membership',
    durationValue: 1,
    durationUnit: 'months',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    planPrice: plans[0]?.price || 0,
    discount: 0,
    paidAmount: plans[0]?.price || 0,
    paymentMethod: 'Cash',
  });

  // STEP 3: Trainer Assignment
  const [trainerConfig, setTrainerConfig] = useState<{
    enabled: boolean;
    trainerId: string;
  }>({
    enabled: false,
    trainerId: trainers[0]?.id || '',
  });
  const [isNewTrainerModalOpen, setIsNewTrainerModalOpen] = useState(false);

  // STEP 4: Workout Plan
  const [workoutConfig, setWorkoutConfig] = useState<{
    enabled: boolean;
    goal: string;
    workoutDays: string[];
    exercises: Exercise[];
    notes: string;
  }>({
    enabled: false,
    goal: 'Muscle Hypertrophy & Strength',
    workoutDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    exercises: [
      {
        category: 'Chest' as ExerciseCategory,
        name: 'Barbell Flat Bench Press',
        sets: 4,
        reps: '8-12',
        restTime: '90 sec',
        notes: 'Warm up with empty bar',
      },
      {
        category: 'Arms' as ExerciseCategory,
        name: 'Triceps Rope Pushdowns',
        sets: 3,
        reps: '12-15',
        restTime: '60 sec',
        notes: 'Strict form, full squeeze',
      },
      {
        category: 'Back' as ExerciseCategory,
        name: 'Lat Pulldown',
        sets: 4,
        reps: '10-12',
        restTime: '90 sec',
        notes: 'Wide overhand grip',
      },
    ],
    notes: 'Standard starter routine. Re-evaluate in 4 weeks.',
  });

  // STEP 5: Diet Plan
  const [dietConfig, setDietConfig] = useState<{
    enabled: boolean;
    goal: string;
    calories: number;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
    waterTarget: number;
    notes: string;
  }>({
    enabled: false,
    goal: 'Lean Muscle & Energy',
    calories: 2400,
    breakfast: '4 Scrambled Eggs + 2 Whole Wheat Toast + 1 Banana',
    lunch: '200g Grilled Chicken Breast + 1 Cup Brown Rice + Mixed Veggies',
    dinner: '200g Grilled Fish / Paneer + Steamed Broccoli + Sweet Potato',
    snacks: 'Whey Protein Shake with Almond Milk + Handful of Walnuts',
    waterTarget: 3.5,
    notes: 'Avoid sugary drinks and refined seed oils.',
  });

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto calculate membership dates and amounts
  useEffect(() => {
    if (!membershipConfig.enabled) return;

    if (membershipConfig.mode === 'catalog') {
      const selected = plans.find((p) => p.id === membershipConfig.planId) || plans[0];
      if (selected) {
        const basePrice = selected.price;
        const dur = selected.duration || 1;
        const start = new Date(membershipConfig.startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + dur);

        const calculatedFinal = Math.max(0, basePrice - (membershipConfig.discount || 0));

        setMembershipConfig((prev) => ({
          ...prev,
          planPrice: basePrice,
          endDate: end.toISOString().split('T')[0],
          paidAmount: prev.paidAmount === 0 ? calculatedFinal : prev.paidAmount,
        }));
      }
    } else {
      const start = new Date(membershipConfig.startDate);
      const end = new Date(start);
      if (membershipConfig.durationUnit === 'months') {
        end.setMonth(end.getMonth() + Number(membershipConfig.durationValue || 1));
      } else {
        end.setDate(end.getDate() + Number(membershipConfig.durationValue || 1));
      }
      setMembershipConfig((prev) => ({
        ...prev,
        endDate: end.toISOString().split('T')[0],
      }));
    }
  }, [
    membershipConfig.enabled,
    membershipConfig.mode,
    membershipConfig.planId,
    membershipConfig.durationValue,
    membershipConfig.durationUnit,
    membershipConfig.startDate,
    plans,
  ]);

  // Derived financial math
  const calculatedFinalAmount = Math.max(
    0,
    (membershipConfig.planPrice || 0) - (membershipConfig.discount || 0)
  );
  const calculatedRemaining = Math.max(
    0,
    calculatedFinalAmount - (membershipConfig.paidAmount || 0)
  );

  // Selected Trainer Info
  const selectedTrainer = useMemo(() => {
    return trainers.find((t) => t.id === trainerConfig.trainerId);
  }, [trainers, trainerConfig.trainerId]);

  const trainerAssignedMembersCount = useMemo(() => {
    if (!selectedTrainer) return 0;
    return (assignments || []).filter((a) => a.trainerId === selectedTrainer.id).length;
  }, [assignments, selectedTrainer]);

  // Validation functions
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!memberInfo.profilePhoto) {
      errs.profilePhoto = 'Profile picture is REQUIRED for membership registration';
    }
    if (!memberInfo.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }
    if (!memberInfo.phone.trim()) {
      errs.phone = 'Phone Number is required';
    }
    if (!memberInfo.joinDate) {
      errs.joinDate = 'Join Date is required';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast('Please provide all required member information (including photo).', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (membershipConfig.enabled) {
      if (membershipConfig.mode === 'custom' && !membershipConfig.customPlanName.trim()) {
        errs.customPlanName = 'Custom plan name is required';
      }
      if (membershipConfig.discount < 0) {
        errs.discount = 'Discount cannot be negative';
      }
      if (membershipConfig.paidAmount < 0) {
        errs.paidAmount = 'Paid amount cannot be negative';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
    }
    setErrors({});
    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final submission action
  const handleFinalSubmit = (actionAfter: 'view' | 'print' | 'save') => {
    // Final check for step 1
    if (!memberInfo.profilePhoto || !memberInfo.fullName.trim() || !memberInfo.phone.trim()) {
      setCurrentStep(1);
      validateStep1();
      return;
    }

    // 1. Create Member
    const newMember = addMember({
      fullName: memberInfo.fullName.trim(),
      guardianName: memberInfo.guardianName.trim() || 'N/A',
      profilePhoto: memberInfo.profilePhoto,
      phone: memberInfo.phone.trim(),
      email: memberInfo.email.trim() || `${memberInfo.fullName.toLowerCase().replace(/\s+/g, '.')}@member.gym`,
      dob: memberInfo.dob || '1998-01-01',
      gender: memberInfo.gender,
      address: memberInfo.address.trim() || 'Gym Member Resident',
      emergencyContact: {
        name: memberInfo.emergencyName.trim() || 'Primary Reach',
        relation: memberInfo.emergencyRelation.trim() || 'Emergency Contact',
        phone: memberInfo.emergencyPhone.trim() || memberInfo.phone.trim(),
      },
      joinDate: memberInfo.joinDate,
      status: membershipConfig.enabled ? 'Active' : 'Expired',
      notes: memberInfo.notes.trim(),
    });

    // 2. Create Membership (if enabled)
    if (membershipConfig.enabled) {
      const selectedPlan = plans.find((p) => p.id === membershipConfig.planId);
      const planName =
        membershipConfig.mode === 'catalog'
          ? selectedPlan?.name || 'Standard Access'
          : membershipConfig.customPlanName.trim();

      addMembership(
        {
          memberId: newMember.id,
          planId: membershipConfig.mode === 'catalog' && selectedPlan ? selectedPlan.id : 'custom',
          customPlanName: planName,
          startDate: membershipConfig.startDate,
          endDate: membershipConfig.endDate,
          totalAmount: calculatedFinalAmount,
          paid: Number(membershipConfig.paidAmount || 0),
          remaining: calculatedRemaining,
          status: 'Active',
        },
        membershipConfig.paymentMethod
      );
    }

    // 3. Assign Trainer (if enabled)
    if (trainerConfig.enabled && trainerConfig.trainerId) {
      assignMemberToTrainer(trainerConfig.trainerId, newMember.id);
    }

    // 4. Create Workout Plan (if enabled)
    if (workoutConfig.enabled && workoutConfig.exercises.length > 0) {
      addWorkoutPlan({
        title: `${memberInfo.fullName}'s Customized Split`,
        memberId: newMember.id,
        trainerId: trainerConfig.enabled ? trainerConfig.trainerId : undefined,
        goal: workoutConfig.goal,
        workoutDays: workoutConfig.workoutDays,
        exercises: workoutConfig.exercises,
        notes: workoutConfig.notes,
      });
    }

    // 5. Create Diet Plan (if enabled)
    if (dietConfig.enabled) {
      addDietPlan({
        title: `${memberInfo.fullName}'s Meal Strategy`,
        memberId: newMember.id,
        trainerId: trainerConfig.enabled ? trainerConfig.trainerId : undefined,
        goal: dietConfig.goal,
        calories: dietConfig.calories,
        breakfast: dietConfig.breakfast,
        lunch: dietConfig.lunch,
        dinner: dietConfig.dinner,
        snacks: dietConfig.snacks,
        waterTarget: dietConfig.waterTarget,
        notes: dietConfig.notes,
      });
    }

    showToast(`Member ${newMember.fullName} registered successfully!`, 'success');

    if (actionAfter === 'print') {
      // Trigger print and view
      setTimeout(() => {
        window.print();
      }, 500);
      navigate(`/members/${newMember.id}`);
    } else {
      navigate(`/members/${newMember.id}`);
    }
  };

  // Workout helpers
  const handleAddExercise = () => {
    setWorkoutConfig((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          category: 'Chest',
          name: '',
          sets: 3,
          reps: '10-12',
          restTime: '60s',
          notes: '',
        },
      ],
    }));
  };

  const handleRemoveExercise = (idx: number) => {
    setWorkoutConfig((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateExercise = (idx: number, field: keyof Exercise, value: any) => {
    setWorkoutConfig((prev) => {
      const updated = [...prev.exercises];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, exercises: updated };
    });
  };

  const toggleWorkoutDay = (day: string) => {
    setWorkoutConfig((prev) => {
      const exists = prev.workoutDays.includes(day);
      return {
        ...prev,
        workoutDays: exists
          ? prev.workoutDays.filter((d) => d !== day)
          : [...prev.workoutDays, day],
      };
    });
  };

  // Wizard Steps metadata
  const stepsList = [
    { num: 1, label: 'Member Info', desc: 'Personal & Photo' },
    { num: 2, label: 'Membership', desc: 'Plan & Pricing' },
    { num: 3, label: 'Trainer', desc: 'Coach Assignment' },
    { num: 4, label: 'Workout', desc: 'Exercise Split' },
    { num: 5, label: 'Diet Plan', desc: 'Nutrition Goal' },
    { num: 6, label: 'Payment', desc: 'Receipt & Method' },
    { num: 7, label: 'Review', desc: 'Confirm & Save' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/members">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Comprehensive Member Registration
            </h1>
            <p className="text-xs text-slate-500">
              One-stop receptionist flow: Profile, Plan, Coach, Workout, Nutrition & Payment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Step {currentStep} of 7:</span>
          <Badge variant="indigo" size="md">
            {stepsList[currentStep - 1].label}
          </Badge>
        </div>
      </div>

      {/* Interactive Step Wizard Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-2">
          {stepsList.map((st) => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < currentStep) {
                    setCurrentStep(st.num as WizardStep);
                  } else if (st.num === currentStep + 1) {
                    handleNext();
                  }
                }}
                className={`flex-1 flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-xs'
                    : isCompleted
                    ? 'hover:bg-slate-50 text-slate-700'
                    : 'opacity-60 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold block truncate">{st.label}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{st.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: MEMBER INFORMATION                                                */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <Card
          title="1. Member Personal Information"
          subtitle="Required athlete photo, personal credentials, and contact emergency info."
        >
          <div className="space-y-6">
            {/* Required Photo Upload */}
            <PhotoUpload
              value={memberInfo.profilePhoto}
              onChange={(photo) => {
                setMemberInfo((prev) => ({ ...prev, profilePhoto: photo }));
                if (errors.profilePhoto) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.profilePhoto;
                    return copy;
                  });
                }
              }}
              required
              error={errors.profilePhoto}
              label="Member Profile Picture (Required)"
              helperText="Official gym member identification photo. Required before final registration."
            />

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Jordan Michael"
                value={memberInfo.fullName}
                onChange={(e) => setMemberInfo({ ...memberInfo, fullName: e.target.value })}
                error={errors.fullName}
              />
              <Input
                label="Father / Guardian Name"
                placeholder="e.g. Michael Sr."
                value={memberInfo.guardianName}
                onChange={(e) => setMemberInfo({ ...memberInfo, guardianName: e.target.value })}
              />
              <Input
                label="Phone Number"
                required
                type="tel"
                placeholder="+92 300 1234567"
                value={memberInfo.phone}
                onChange={(e) => setMemberInfo({ ...memberInfo, phone: e.target.value })}
                error={errors.phone}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="jordan@gym.com"
                value={memberInfo.email}
                onChange={(e) => setMemberInfo({ ...memberInfo, email: e.target.value })}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={memberInfo.dob}
                onChange={(e) => setMemberInfo({ ...memberInfo, dob: e.target.value })}
              />
              <Select
                label="Gender"
                value={memberInfo.gender}
                onChange={(e) => setMemberInfo({ ...memberInfo, gender: e.target.value as any })}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>

            {/* Address & Emergency Reach */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Address & Emergency Contact
              </h3>
              <Input
                label="Physical Residential Address"
                placeholder="Street Address, Block / Sector, City"
                value={memberInfo.address}
                onChange={(e) => setMemberInfo({ ...memberInfo, address: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Emergency Contact Name"
                  placeholder="Primary contact person"
                  value={memberInfo.emergencyName}
                  onChange={(e) => setMemberInfo({ ...memberInfo, emergencyName: e.target.value })}
                />
                <Input
                  label="Relation"
                  placeholder="e.g. Spouse, Parent, Brother"
                  value={memberInfo.emergencyRelation}
                  onChange={(e) => setMemberInfo({ ...memberInfo, emergencyRelation: e.target.value })}
                />
                <Input
                  label="Emergency Phone"
                  placeholder="+92 300 9998888"
                  value={memberInfo.emergencyPhone}
                  onChange={(e) => setMemberInfo({ ...memberInfo, emergencyPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Join Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <Input
                label="Member Join Date"
                required
                type="date"
                value={memberInfo.joinDate}
                onChange={(e) => setMemberInfo({ ...memberInfo, joinDate: e.target.value })}
                error={errors.joinDate}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Member Notes / Medical Conditions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lower back stiffness, beginner lifter, goal: lose 10kg"
                  value={memberInfo.notes}
                  onChange={(e) => setMemberInfo({ ...memberInfo, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: MEMBERSHIP & PAYMENT MATH                                         */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <Card
          title="2. Membership Plan & Financial Configuration"
          subtitle="Configure package tier, custom duration, automatic discounts, and paid amounts."
        >
          <div className="space-y-6">
            {/* Toggle Enable Membership */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Assign Membership Plan Now?</span>
                <span className="text-xs text-slate-500">
                  Turn off if you only want to register the member profile without starting a subscription today.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMembershipConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  membershipConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    membershipConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {membershipConfig.enabled ? (
              <div className="space-y-5">
                {/* Plan Mode Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      setMembershipConfig((prev) => ({ ...prev, mode: 'catalog' }))
                    }
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      membershipConfig.mode === 'catalog'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Predefined Plan Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMembershipConfig((prev) => ({ ...prev, mode: 'custom' }))
                    }
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      membershipConfig.mode === 'custom'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Custom Plan (Custom Fee & Tenure)
                  </button>
                </div>

                {membershipConfig.mode === 'catalog' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Select Predefined Plan"
                      value={membershipConfig.planId}
                      onChange={(e) =>
                        setMembershipConfig((prev) => ({ ...prev, planId: e.target.value }))
                      }
                      options={(plans || []).map((p) => ({
                        value: p.id,
                        label: `${p.name} (${formatCurrency(p.price)} / ${p.duration} mo)`,
                      }))}
                    />
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Selected Plan Features
                      </label>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                        {plans.find((p) => p.id === membershipConfig.planId)?.description ||
                          'Full gym facility access, locker room, cardio & strength floor.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Custom Plan Name"
                        required
                        placeholder="e.g. VIP Quarterly Pass, Student Deal"
                        value={membershipConfig.customPlanName}
                        onChange={(e) =>
                          setMembershipConfig((prev) => ({
                            ...prev,
                            customPlanName: e.target.value,
                          }))
                        }
                        error={errors.customPlanName}
                      />
                      <Input
                        label="Duration Number"
                        type="number"
                        min="1"
                        value={membershipConfig.durationValue}
                        onChange={(e) =>
                          setMembershipConfig((prev) => ({
                            ...prev,
                            durationValue: Math.max(1, Number(e.target.value)),
                          }))
                        }
                      />
                      <Select
                        label="Duration Unit"
                        value={membershipConfig.durationUnit}
                        onChange={(e) =>
                          setMembershipConfig((prev) => ({
                            ...prev,
                            durationUnit: e.target.value as any,
                          }))
                        }
                        options={[
                          { value: 'months', label: 'Months' },
                          { value: 'days', label: 'Days' },
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Membership Start Date"
                    type="date"
                    required
                    value={membershipConfig.startDate}
                    onChange={(e) =>
                      setMembershipConfig((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                  />
                  <Input
                    label="Calculated Expiry / End Date (Editable)"
                    type="date"
                    required
                    value={membershipConfig.endDate}
                    onChange={(e) =>
                      setMembershipConfig((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </div>

                {/* Automatic Financial Calculations Card */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Auto-Calculated Financial Summary
                    </span>
                    <span className="text-xs text-slate-400">
                      Formula: Final = Price - Discount | Due = Final - Paid
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Plan Price ({currencySymbol || 'Rs.'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={membershipConfig.planPrice}
                        onChange={(e) =>
                          setMembershipConfig((prev) => ({
                            ...prev,
                            planPrice: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                        Discount ({currencySymbol || 'Rs.'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={membershipConfig.discount}
                        onChange={(e) =>
                          setMembershipConfig((prev) => ({
                            ...prev,
                            discount: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                        Final Net Amount
                      </label>
                      <div className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-extrabold flex items-center justify-between">
                        <span>{formatCurrency(calculatedFinalAmount)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                        Paid Amount ({currencySymbol || 'Rs.'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={membershipConfig.paidAmount}
                        onChange={(e) =>
                          setMembershipConfig((prev) => ({
                            ...prev,
                            paidAmount: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-slate-800 border border-emerald-600/50 rounded-lg px-3 py-2 text-sm text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Payment Method & Remaining Balance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-700">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Payment Method
                      </label>
                      <select
                        value={membershipConfig.paymentMethod}
                        onChange={(e) =>
                          setMembershipConfig((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Credit / Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Online">Online / EasyPaisa / JazzCash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Remaining Amount (Auto-Calculated)
                      </label>
                      <div
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-between ${
                          calculatedRemaining > 0
                            ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
                            : 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                        }`}
                      >
                        <span>{formatCurrency(calculatedRemaining)}</span>
                        <span className="text-[10px] font-normal uppercase tracking-wider">
                          {calculatedRemaining > 0 ? 'Balance Due' : 'Fully Paid'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  No initial membership will be generated. The member will be created in expired/dormant state until you assign a plan from their profile.
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: TRAINER ASSIGNMENT                                                */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <Card
          title="3. Personal Coach / Trainer Assignment"
          subtitle="Assign a certified fitness coach immediately without leaving the registration wizard."
        >
          <div className="space-y-6">
            {/* Toggle Enable Trainer */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Assign Personal Trainer?</span>
                <span className="text-xs text-slate-500">
                  Assign a dedicated trainer to oversee this athlete's workouts and check-ins.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTrainerConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  trainerConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    trainerConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {trainerConfig.enabled ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex-1">
                    <Select
                      label="Select Trainer"
                      value={trainerConfig.trainerId}
                      onChange={(e) =>
                        setTrainerConfig((prev) => ({ ...prev, trainerId: e.target.value }))
                      }
                      options={(trainers || []).map((t) => ({
                        value: t.id,
                        label: `${t.name} (${t.specialization})`,
                      }))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsNewTrainerModalOpen(true)}
                  >
                    + Add New Trainer
                  </Button>
                </div>

                {/* Trainer Card Details */}
                {selectedTrainer && (
                  <div className="p-5 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={selectedTrainer.photo}
                        name={selectedTrainer.name}
                        size="xl"
                        className="border-2 border-white shadow-sm"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {selectedTrainer.name}
                          </h4>
                          <Badge variant="indigo" size="sm">
                            {selectedTrainer.specialization}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {selectedTrainer.phone} • {selectedTrainer.email}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Joined: {selectedTrainer.joiningDate} • Status: {selectedTrainer.status}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-xl border border-indigo-100 text-center sm:text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Assigned Athletes
                      </span>
                      <span className="text-lg font-extrabold text-indigo-600">
                        {trainerAssignedMembersCount} Active Members
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400 shrink-0" />
                <span>
                  Trainer assignment skipped. You can assign a coach at any time from the Member Profile.
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: WORKOUT PLAN                                                      */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <Card
          title="4. Workout Plan & Training Split"
          subtitle="Define training goal, workout days, and customize exercises with sets, reps, and rest times."
        >
          <div className="space-y-6">
            {/* Toggle Enable Workout */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Create Workout Plan Now?</span>
                <span className="text-xs text-slate-500">
                  Setup exercise split for this athlete directly during onboarding.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setWorkoutConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  workoutConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    workoutConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {workoutConfig.enabled ? (
              <div className="space-y-6">
                {/* Goal and Quick Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Fitness Goal"
                    placeholder="e.g. Hypertrophy, Weight Loss, Strength"
                    value={workoutConfig.goal}
                    onChange={(e) =>
                      setWorkoutConfig((prev) => ({ ...prev, goal: e.target.value }))
                    }
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Quick Preset Routines
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Push / Pull / Legs',
                        'Full Body 3x Week',
                        'Weight Loss Cardio Split',
                        'Upper / Lower 4-Day',
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setWorkoutConfig((prev) => ({ ...prev, goal: preset }))
                          }
                          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-md text-xs font-medium border border-slate-200 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workout Days Split */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Workout Days Split (Select Active Days)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                      (day) => {
                        const isSelected = workoutConfig.workoutDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWorkoutDay(day)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {day.slice(0, 3)}
                            <span className="block text-[10px] font-normal opacity-80">
                              {isSelected ? 'Active' : 'Rest'}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Exercises Table / Form */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-indigo-600" />
                      Assigned Exercises ({workoutConfig.exercises.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={handleAddExercise}
                    >
                      + Add Exercise
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {workoutConfig.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <div className="sm:col-span-3">
                          <select
                            value={ex.category}
                            onChange={(e) =>
                              handleUpdateExercise(idx, 'category', e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                          >
                            <option value="Chest">Chest</option>
                            <option value="Back">Back</option>
                            <option value="Shoulders">Shoulders</option>
                            <option value="Arms">Arms</option>
                            <option value="Legs">Legs</option>
                            <option value="Cardio">Cardio</option>
                            <option value="Core">Core</option>
                          </select>
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Exercise Name (e.g. Incline DB Press)"
                            value={ex.name}
                            onChange={(e) =>
                              handleUpdateExercise(idx, 'name', e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="Sets"
                            min="1"
                            value={ex.sets}
                            onChange={(e) =>
                              handleUpdateExercise(idx, 'sets', Number(e.target.value))
                            }
                            className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center text-slate-900 font-bold focus:outline-none"
                          />
                          <span className="text-xs text-slate-400">×</span>
                          <input
                            type="text"
                            placeholder="Reps"
                            value={ex.reps}
                            onChange={(e) =>
                              handleUpdateExercise(idx, 'reps', e.target.value)
                            }
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Rest (e.g. 60s)"
                            value={ex.restTime}
                            onChange={(e) =>
                              handleUpdateExercise(idx, 'restTime', e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove exercise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workout Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Trainer Notes / Form Tips
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide guidance on progressive overload, warmups, or form cues..."
                    value={workoutConfig.notes}
                    onChange={(e) =>
                      setWorkoutConfig((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400 shrink-0" />
                <span>
                  Workout plan configuration skipped. A trainer or coach can generate custom workout routines later.
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: DIET PLAN                                                         */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <Card
          title="5. Diet & Nutrition Strategy"
          subtitle="Prescribe daily meal plans, water target, and macronutrient guidelines."
        >
          <div className="space-y-6">
            {/* Toggle Enable Diet */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Create Diet Plan Now?</span>
                <span className="text-xs text-slate-500">
                  Assign custom meal structure, calories, and hydration targets.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDietConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dietConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    dietConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {dietConfig.enabled ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Nutrition Goal"
                    placeholder="e.g. Lean Bulk, Caloric Deficit"
                    value={dietConfig.goal}
                    onChange={(e) =>
                      setDietConfig((prev) => ({ ...prev, goal: e.target.value }))
                    }
                  />
                  <Input
                    label="Target Calories (kcal)"
                    type="number"
                    value={dietConfig.calories}
                    onChange={(e) =>
                      setDietConfig((prev) => ({
                        ...prev,
                        calories: Number(e.target.value),
                      }))
                    }
                  />
                  <Input
                    label="Daily Water Target (Liters)"
                    type="number"
                    step="0.5"
                    value={dietConfig.waterTarget}
                    onChange={(e) =>
                      setDietConfig((prev) => ({
                        ...prev,
                        waterTarget: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                {/* Meals */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <Input
                    label="Breakfast"
                    placeholder="e.g. 4 boiled eggs, oatmeal with berries & honey"
                    value={dietConfig.breakfast}
                    onChange={(e) =>
                      setDietConfig((prev) => ({ ...prev, breakfast: e.target.value }))
                    }
                  />
                  <Input
                    label="Lunch"
                    placeholder="e.g. 200g chicken breast, quinoa, green salad"
                    value={dietConfig.lunch}
                    onChange={(e) =>
                      setDietConfig((prev) => ({ ...prev, lunch: e.target.value }))
                    }
                  />
                  <Input
                    label="Dinner"
                    placeholder="e.g. Grilled fish / cottage cheese, sweet potato, lentils"
                    value={dietConfig.dinner}
                    onChange={(e) =>
                      setDietConfig((prev) => ({ ...prev, dinner: e.target.value }))
                    }
                  />
                  <Input
                    label="Mid-Day Snacks & Supplements"
                    placeholder="e.g. Whey protein shake, almonds, greek yogurt"
                    value={dietConfig.snacks}
                    onChange={(e) =>
                      setDietConfig((prev) => ({ ...prev, snacks: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dietary Notes & Restrictions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Allergies (lactose, nuts, gluten) or meal timing guidelines..."
                    value={dietConfig.notes}
                    onChange={(e) =>
                      setDietConfig((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400 shrink-0" />
                <span>
                  Diet plan skipped. Nutrition plans can be assigned anytime directly through the Nutrition tab.
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: PAYMENT SUMMARY & RECEIPT OPTIONS                                  */}
      {/* ========================================================================= */}
      {currentStep === 6 && (
        <Card
          title="6. Payment Summary & Official Receipt"
          subtitle="Verify itemized billing amounts, payment breakdown, and select post-registration action."
        >
          <div className="space-y-6">
            {/* Printable styled receipt box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              {/* Gym Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{gymProfile.gymName}</h3>
                  <p className="text-xs text-slate-500">{gymProfile.address}</p>
                  <p className="text-xs text-slate-500">Tel: {gymProfile.phone}</p>
                </div>
                <div className="sm:text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    REGISTRATION BILLING
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Date: {memberInfo.joinDate}</p>
                </div>
              </div>

              {/* Member Summary Header */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Avatar src={memberInfo.profilePhoto} name={memberInfo.fullName} size="lg" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm text-slate-900">{memberInfo.fullName}</h4>
                  <p className="text-xs text-slate-600">Phone: {memberInfo.phone}</p>
                  <p className="text-xs text-slate-500">
                    Plan:{' '}
                    {membershipConfig.enabled
                      ? membershipConfig.mode === 'catalog'
                        ? plans.find((p) => p.id === membershipConfig.planId)?.name
                        : membershipConfig.customPlanName
                      : 'No Active Subscription'}
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Validity</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3">
                        <span className="font-bold text-slate-900 block">
                          {membershipConfig.enabled
                            ? membershipConfig.mode === 'catalog'
                              ? plans.find((p) => p.id === membershipConfig.planId)?.name
                              : membershipConfig.customPlanName
                            : 'Gym Registration Access'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {membershipConfig.enabled
                            ? `Access: ${membershipConfig.startDate} to ${membershipConfig.endDate}`
                            : 'Standard Membership File'}
                        </span>
                      </td>
                      <td className="py-3 font-medium">
                        {membershipConfig.enabled
                          ? `${membershipConfig.durationValue || 1} ${membershipConfig.durationUnit || 'Mo'}`
                          : 'Lifetime Record'}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        {formatCurrency(membershipConfig.planPrice)}
                      </td>
                    </tr>
                    {membershipConfig.discount > 0 && (
                      <tr className="text-amber-600">
                        <td className="py-2.5 font-medium">Special Concession / Discount</td>
                        <td className="py-2.5">—</td>
                        <td className="py-2.5 text-right font-bold">
                          - {formatCurrency(membershipConfig.discount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td colSpan={2} className="pt-3 font-bold text-slate-900">
                        Total Payable
                      </td>
                      <td className="pt-3 text-right font-extrabold text-base text-slate-900">
                        {formatCurrency(calculatedFinalAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="pt-1.5 text-slate-600">
                        Amount Paid ({membershipConfig.paymentMethod})
                      </td>
                      <td className="pt-1.5 text-right font-bold text-emerald-600">
                        {formatCurrency(membershipConfig.paidAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="pt-1.5 text-slate-600">
                        Remaining Due Balance
                      </td>
                      <td
                        className={`pt-1.5 text-right font-bold ${
                          calculatedRemaining > 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(calculatedRemaining)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: FINAL REVIEW BEFORE SAVING                                         */}
      {/* ========================================================================= */}
      {currentStep === 7 && (
        <Card
          title="7. Final Review & Member Creation"
          subtitle="Double check all registered components before writing to the database."
        >
          <div className="space-y-5">
            {/* Review Box 1: Member Info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar src={memberInfo.profilePhoto} name={memberInfo.fullName} size="xl" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{memberInfo.fullName}</h3>
                  <p className="text-xs text-slate-600">
                    Phone: {memberInfo.phone} • Email: {memberInfo.email || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Joined: {memberInfo.joinDate} • Gender: {memberInfo.gender}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="shrink-0"
              >
                Edit Info
              </Button>
            </div>

            {/* Review Box 2: Membership */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                  Membership Subscription
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {membershipConfig.enabled
                    ? membershipConfig.mode === 'catalog'
                      ? plans.find((p) => p.id === membershipConfig.planId)?.name
                      : membershipConfig.customPlanName
                    : 'Skipped / Unassigned'}
                </h4>
                {membershipConfig.enabled && (
                  <p className="text-xs text-slate-600">
                    Duration: {membershipConfig.startDate} to {membershipConfig.endDate} • Fee:{' '}
                    {formatCurrency(calculatedFinalAmount)} (Paid: {formatCurrency(membershipConfig.paidAmount)}, Due: {formatCurrency(calculatedRemaining)})
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(2)}
                className="shrink-0"
              >
                Edit Plan
              </Button>
            </div>

            {/* Review Box 3: Trainer */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                  Assigned Personal Coach
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {trainerConfig.enabled && selectedTrainer
                    ? `${selectedTrainer.name} (${selectedTrainer.specialization})`
                    : 'No Coach Assigned'}
                </h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(3)}
                className="shrink-0"
              >
                Edit Coach
              </Button>
            </div>

            {/* Review Box 4: Workout & Diet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                    Workout Plan
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {workoutConfig.enabled
                      ? `${workoutConfig.goal} (${workoutConfig.exercises.length} exercises, ${workoutConfig.workoutDays.length} active days)`
                      : 'Skipped'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-indigo-600"
                >
                  Edit
                </Button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                    Diet Plan
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {dietConfig.enabled
                      ? `${dietConfig.goal} (${dietConfig.calories} kcal, ${dietConfig.waterTarget}L Water)`
                      : 'Skipped'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-indigo-600"
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Submission Buttons */}
            <div className="p-5 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  Ready to Complete Registration
                </span>
              </div>
              <p className="text-xs text-indigo-900/80">
                Click below to finalize member registration. All subscriptions, workout routines, nutrition templates, and payment receipts will be generated immediately.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={() => handleFinalSubmit('view')}
                  className="shadow-md"
                >
                  Save & View Member Profile
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => handleFinalSubmit('print')}
                >
                  Save & Print Official Receipt
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STICKY BOTTOM NAVIGATION BAR FOR MOBILE & DESKTOP                         */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 sm:px-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={handleBack}
              >
                Back
              </Button>
            ) : (
              <Link to="/members">
                <Button type="button" variant="ghost" size="md">
                  Cancel
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              Step {currentStep} of 7: {stepsList[currentStep - 1].label}
            </span>

            {currentStep < 7 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={handleNext}
              >
                Next: {stepsList[currentStep].label}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => handleFinalSubmit('view')}
              >
                Complete Registration
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inline New Trainer Creation Modal */}
      <TrainerModal
        isOpen={isNewTrainerModalOpen}
        onClose={() => setIsNewTrainerModalOpen(false)}
      />
    </div>
  );
};
