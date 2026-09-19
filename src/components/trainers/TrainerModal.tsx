import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Camera,
  X,
  Eye,
  RefreshCw,
  Sparkles,
  DollarSign,
  User,
  Phone,
  Mail,
  Award,
  Calendar,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Percent,
  Calculator,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { Trainer, SalaryType, CommissionBasis, CommissionRevenueTreatment } from '../../types';

interface TrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerToEdit?: Trainer | null;
}

const PRESET_AVATARS = [
  {
    label: 'Strength Coach (Male)',
    url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'HIIT & Mobility (Female)',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Powerbuilding (Male)',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Calisthenics (Female)',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Cardio & Endurance (Male)',
    url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Pilates & Recovery (Female)',
    url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Boxing & Agility (Male)',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Functional Fitness (Female)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
];

const SPECIALIZATIONS = [
  'Hypertrophy & Strength Conditioning',
  'Fat Loss, Functional Mobility & HIIT',
  'Olympic Weightlifting & Powerbuilding',
  'Calisthenics, Core & Posture Rehab',
  'Cardiovascular Endurance & Marathon Prep',
  'Pilates, Flexibility & Athletic Recovery',
  'CrossFit & High-Volume Conditioning',
  'Combat Sports & Boxing Conditioning',
  'Senior Fitness & Joint Longevity',
  'Custom Specialty',
];

const COMMISSION_BASIS_OPTIONS = [
  {
    value: 'Assigned Member Fees',
    label: "Assigned Members' Membership Payments",
  },
  {
    value: 'Personal Training Fees',
    label: 'Personal Training Fees',
  },
  {
    value: 'Selected Revenue',
    label: 'Selected Revenue',
  },
  {
    value: 'Custom Eligible Revenue',
    label: 'Custom Eligible Revenue',
  },
];

export const TrainerModal: React.FC<TrainerModalProps> = ({
  isOpen,
  onClose,
  trainerToEdit,
}) => {
  const { addTrainer, updateTrainer, currencySymbol, formatCurrency } = useGym();
  const { updateSalaryConfig, addSalaryConfig, getSalaryConfig } = usePayroll();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: 'Hypertrophy & Strength Conditioning',
    customSpecialization: '',
    experience: 3,
    photo: '',
    joiningDate: new Date().toISOString().split('T')[0],
    bio: '',
    status: 'Active' as 'Active' | 'Inactive',
    // Payroll & Salary configuration
    salaryType: '' as SalaryType | '',
    salary: '' as number | string,
    commissionPercentage: 50 as number | string,
    commissionBasis: 'Assigned Member Fees' as CommissionBasis,
    commissionRevenueTreatment: 'Paid amount' as CommissionRevenueTreatment,
    workingDaysPerMonth: 26 as number | string,
    hourlyRate: '' as number | string,
    dailyRate: '' as number | string,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (trainerToEdit) {
      const isKnownSpec = SPECIALIZATIONS.includes(trainerToEdit.specialization);
      const existingConfig = getSalaryConfig ? getSalaryConfig(trainerToEdit.id) : undefined;

      const normalizedSalaryType =
        trainerToEdit.salaryType ||
        existingConfig?.salaryType ||
        'Percentage / Commission';

      setFormData({
        name: trainerToEdit.name,
        phone: trainerToEdit.phone,
        email: trainerToEdit.email,
        specialization: isKnownSpec ? trainerToEdit.specialization : 'Custom Specialty',
        customSpecialization: isKnownSpec ? '' : trainerToEdit.specialization,
        experience: trainerToEdit.experience ?? 3,
        photo: trainerToEdit.photo || '',
        joiningDate: trainerToEdit.joiningDate || new Date().toISOString().split('T')[0],
        bio: trainerToEdit.bio || '',
        status: trainerToEdit.status || 'Active',
        salaryType: normalizedSalaryType,
        salary: trainerToEdit.salary !== undefined ? trainerToEdit.salary : (existingConfig?.baseSalary ?? 0),
        commissionPercentage:
          trainerToEdit.commissionPercentage !== undefined
            ? trainerToEdit.commissionPercentage
            : (existingConfig?.commissionPercentage ?? 50),
        commissionBasis:
          trainerToEdit.commissionBasis ||
          existingConfig?.commissionBasis ||
          'Assigned Member Fees',
        commissionRevenueTreatment:
          trainerToEdit.commissionRevenueTreatment ||
          existingConfig?.commissionRevenueTreatment ||
          'Paid amount',
        workingDaysPerMonth:
          trainerToEdit.workingDaysPerMonth ||
          existingConfig?.workingDaysPerMonth ||
          26,
        hourlyRate:
          trainerToEdit.hourlyRate !== undefined
            ? trainerToEdit.hourlyRate
            : (existingConfig?.hourlyRate ?? ''),
        dailyRate:
          trainerToEdit.dailyRate !== undefined
            ? trainerToEdit.dailyRate
            : (existingConfig?.dailyRate ?? ''),
      });
      setUrlInput(trainerToEdit.photo || '');
    } else {
      // For new coach, do NOT select default salary type - user must select
      setFormData({
        name: '',
        phone: '',
        email: '',
        specialization: 'Hypertrophy & Strength Conditioning',
        customSpecialization: '',
        experience: 3,
        photo: PRESET_AVATARS[0].url,
        joiningDate: new Date().toISOString().split('T')[0],
        bio: '',
        status: 'Active',
        salaryType: '',
        salary: '',
        commissionPercentage: 50,
        commissionBasis: 'Assigned Member Fees',
        commissionRevenueTreatment: 'Paid amount',
        workingDaysPerMonth: 26,
        hourlyRate: '',
        dailyRate: '',
      });
      setUrlInput('');
    }
    setErrors({});
    setIsPreviewModalOpen(false);
  }, [trainerToEdit, isOpen]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Selected file must be a valid image (PNG, JPG, WEBP).' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Image size cannot exceed 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, photo: result }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.photo;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrors((prev) => ({ ...prev, photo: 'Please provide a valid image URL' }));
      return;
    }
    setFormData((prev) => ({ ...prev, photo: urlInput.trim() }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.photo;
      return copy;
    });
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }));
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.photo || !formData.photo.trim()) {
      errs.photo = 'Profile picture is required for coaches';
    }
    if (!formData.name.trim()) {
      errs.name = 'Trainer full name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Contact phone number is required';
    }
    if (formData.email && !formData.email.includes('@')) {
      errs.email = 'Valid email address is required';
    }
    if (formData.specialization === 'Custom Specialty' && !formData.customSpecialization.trim()) {
      errs.customSpecialization = 'Please specify custom specialization';
    }

    // Payroll & Salary validation
    if (!formData.salaryType) {
      errs.salaryType = 'Please select a Salary Type';
    } else {
      if (formData.salaryType === 'Fixed Salary') {
        if (formData.salary === '' || Number(formData.salary) < 0) {
          errs.salary = 'Please enter a valid monthly salary amount';
        }
      } else if (formData.salaryType === 'Percentage / Commission') {
        if (
          formData.commissionPercentage === '' ||
          Number(formData.commissionPercentage) < 0 ||
          Number(formData.commissionPercentage) > 100
        ) {
          errs.commissionPercentage = 'Commission percentage must be between 0% and 100%';
        }
      } else if (formData.salaryType === 'Fixed + Percentage') {
        if (formData.salary === '' || Number(formData.salary) < 0) {
          errs.salary = 'Please enter a valid fixed monthly salary';
        }
        if (
          formData.commissionPercentage === '' ||
          Number(formData.commissionPercentage) < 0 ||
          Number(formData.commissionPercentage) > 100
        ) {
          errs.commissionPercentage = 'Commission percentage must be between 0% and 100%';
        }
      } else if (
        formData.salaryType === 'Attendance-Based Salary' ||
        (formData.salaryType as string) === 'Attendance Based'
      ) {
        if (formData.salary === '' || Number(formData.salary) < 0) {
          errs.salary = 'Please enter monthly base salary';
        }
        if (!formData.workingDaysPerMonth || Number(formData.workingDaysPerMonth) <= 0) {
          errs.workingDaysPerMonth = 'Working days must be greater than 0';
        }
      } else if (formData.salaryType === 'Hourly / Daily') {
        if (
          (formData.hourlyRate === '' || Number(formData.hourlyRate) <= 0) &&
          (formData.dailyRate === '' || Number(formData.dailyRate) <= 0)
        ) {
          errs.hourlyRate = 'Please enter an hourly rate or daily rate';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalSpecialization =
      formData.specialization === 'Custom Specialty'
        ? formData.customSpecialization.trim()
        : formData.specialization;

    const resolvedSalaryType = formData.salaryType as SalaryType;
    const baseSalaryValue = Number(formData.salary) || 0;
    const commissionPercentValue = Number(formData.commissionPercentage) || 0;
    const workingDaysValue = Number(formData.workingDaysPerMonth) || 26;
    const hourlyRateValue = formData.hourlyRate !== '' ? Number(formData.hourlyRate) : undefined;
    const dailyRateValue = formData.dailyRate !== '' ? Number(formData.dailyRate) : undefined;

    const payload: Omit<Trainer, 'id'> = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      specialization: finalSpecialization,
      experience: Number(formData.experience) || 1,
      salary: baseSalaryValue,
      salaryType: resolvedSalaryType,
      commissionPercentage: commissionPercentValue,
      commissionBasis: formData.commissionBasis,
      commissionRevenueTreatment: formData.commissionRevenueTreatment,
      workingDaysPerMonth: workingDaysValue,
      hourlyRate: hourlyRateValue,
      dailyRate: dailyRateValue,
      photo: formData.photo.trim(),
      joiningDate: formData.joiningDate,
      bio: formData.bio.trim(),
      status: formData.status,
    };

    if (trainerToEdit) {
      updateTrainer(trainerToEdit.id, payload);
      if (updateSalaryConfig) {
        updateSalaryConfig(trainerToEdit.id, {
          salaryType: resolvedSalaryType,
          baseSalary: baseSalaryValue,
          commissionPercentage: commissionPercentValue,
          commissionBasis: formData.commissionBasis,
          commissionRevenueTreatment: formData.commissionRevenueTreatment,
          workingDaysPerMonth: workingDaysValue,
          hourlyRate: hourlyRateValue,
          dailyRate: dailyRateValue,
          status: formData.status,
        });
      }
    } else {
      const newTrainer = addTrainer(payload);
      if (addSalaryConfig && newTrainer) {
        addSalaryConfig({
          id: newTrainer.id,
          employeeId: newTrainer.id,
          employeeType: 'Trainer',
          employeeName: newTrainer.name,
          employeeRole: 'Trainer',
          photo: newTrainer.photo,
          email: newTrainer.email,
          phone: newTrainer.phone,
          salaryType: resolvedSalaryType,
          baseSalary: baseSalaryValue,
          workingDaysPerMonth: workingDaysValue,
          commissionPercentage: commissionPercentValue,
          commissionBasis: formData.commissionBasis,
          commissionRevenueTreatment: formData.commissionRevenueTreatment,
          hourlyRate: hourlyRateValue,
          dailyRate: dailyRateValue,
          joiningDate: newTrainer.joiningDate,
          salaryEffectiveDate: newTrainer.joiningDate,
          paymentMethod: 'Bank Transfer',
          status: newTrainer.status || 'Active',
        });
      }
    }

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={trainerToEdit ? 'Edit Coach Profile' : 'Add New Fitness Coach'}
        description="Register coach credentials, athletic specialties, compensation model, and profile photo."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Required Photo Upload & Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                Coach Profile Photo <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photoInputMode === 'upload'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('presets')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photoInputMode === 'presets'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photoInputMode === 'url'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {/* Current Selected Photo Preview Card */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-lg border border-slate-200">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 shadow-sm bg-slate-100 flex items-center justify-center">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Trainer Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-300" />
                  )}
                </div>
                {formData.photo && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="absolute inset-0 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-semibold"
                    title="Enlarge Photo Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">
                  {formData.photo ? 'Photo Selected' : 'No Photo Selected'}
                </h4>
                <p className="text-xs text-slate-500">
                  {photoInputMode === 'upload' && 'Upload a clear headshot or athletic coaching photo (Max 5MB).'}
                  {photoInputMode === 'presets' && 'Select from athletic coach sample headshots.'}
                  {photoInputMode === 'url' && 'Paste an image web address (Unsplash, Cloudinary, etc.).'}
                </p>
                {formData.photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 pt-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Image
                  </button>
                )}
              </div>
            </div>

            {/* Mode 1: File Upload Box */}
            {photoInputMode === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors bg-white ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-7 h-7 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Click to browse or drag & drop photo here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}

            {/* Mode 2: Preset Coach Avatars */}
            {photoInputMode === 'presets' && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Select a Default Athletic Avatar:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, photo: preset.url }));
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.photo;
                          return copy;
                        });
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                        formData.photo === preset.url
                          ? 'border-indigo-600 ring-2 ring-indigo-300 scale-105 shadow-sm'
                          : 'border-transparent hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {formData.photo === preset.url && (
                        <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 3: Direct URL */}
            {photoInputMode === 'url' && (
              <div className="flex gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button size="sm" type="button" variant="primary" onClick={handleApplyUrl}>
                  Apply URL
                </Button>
              </div>
            )}

            {errors.photo && (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.photo}
              </p>
            )}
          </div>

          {/* Section 2: Coach Identity & Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              Personal Information & Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Frank Coleman"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />
              <Input
                label="Phone Number"
                required
                type="tel"
                placeholder="+1 (555) 987-6543"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="frank.coleman@apexfit.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />
              <Input
                label="Joining Date"
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Professional Specialization & Status */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Specialization & Employment Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                options={SPECIALIZATIONS.map((spec) => ({
                  value: spec,
                  label: spec,
                }))}
              />

              {formData.specialization === 'Custom Specialty' ? (
                <Input
                  label="Specify Custom Specialty"
                  required
                  placeholder="e.g. Kettlebell Mastery"
                  value={formData.customSpecialization}
                  onChange={(e) => setFormData({ ...formData, customSpecialization: e.target.value })}
                  error={errors.customSpecialization}
                />
              ) : (
                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  max="40"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Coach Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'Active', label: 'Active (Available for Assignment)' },
                  { value: 'Inactive', label: 'Inactive (On Leave / Suspended)' },
                ]}
              />
            </div>

            {/* Bio / About */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Bio / About Coach & Certifications
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Highlight athletic background, certifications (CSCS, NASM, USAW), coaching philosophy..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Section 4: Payroll / Salary Information */}
          <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Payroll / Salary Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the compensation scheme for this coach.
                </p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                Payroll Ready
              </span>
            </div>

            {/* 1. Salary Type Dropdown */}
            <div>
              <Select
                label="Salary Type"
                required
                value={formData.salaryType}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    salaryType: e.target.value as SalaryType | '',
                  });
                  if (errors.salaryType) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.salaryType;
                      return copy;
                    });
                  }
                }}
                error={errors.salaryType}
                options={[
                  { value: '', label: '-- Select Salary Type --' },
                  { value: 'Fixed Salary', label: 'Fixed Salary' },
                  { value: 'Percentage / Commission', label: 'Percentage / Commission' },
                  { value: 'Fixed + Percentage', label: 'Fixed + Percentage' },
                  { value: 'Attendance-Based Salary', label: 'Attendance Based' },
                  { value: 'Hourly / Daily', label: 'Hourly / Daily' },
                ]}
              />
            </div>

            {/* 2. Conditional: Fixed Salary */}
            {formData.salaryType === 'Fixed Salary' && (
              <div className="space-y-3 bg-white p-3.5 rounded-lg border border-slate-200">
                <Input
                  label={`Monthly Salary Amount (${currencySymbol})`}
                  required
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 50000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  error={errors.salary}
                />
                <p className="text-xs text-slate-500">
                  Coach receives a fixed monthly disbursement regardless of assigned client count.
                </p>
              </div>
            )}

            {/* 3. Conditional: Percentage / Commission */}
            {formData.salaryType === 'Percentage / Commission' && (
              <div className="space-y-3.5 bg-white p-3.5 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label="Commission Percentage (%)"
                    required
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 50"
                    value={formData.commissionPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionPercentage: e.target.value })
                    }
                    error={errors.commissionPercentage}
                  />

                  <Select
                    label="Commission Basis"
                    required
                    value={formData.commissionBasis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionBasis: e.target.value as CommissionBasis,
                      })
                    }
                    options={COMMISSION_BASIS_OPTIONS}
                  />
                </div>

                {/* Calculation Example Box */}
                <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Commission Calculation Formula:</span>
                  </div>
                  <p className="text-indigo-800">
                    If coach's assigned members pay <span className="font-bold">{currencySymbol} 100,000</span> in eligible membership payments:
                  </p>
                  <p className="font-mono font-bold text-indigo-700 bg-white/70 px-2 py-1 rounded inline-block">
                    {currencySymbol} 100,000 × {Number(formData.commissionPercentage) || 50}% = {currencySymbol} {((100000 * (Number(formData.commissionPercentage) || 50)) / 100).toLocaleString()} Commission
                  </p>
                </div>
              </div>
            )}

            {/* 4. Conditional: Fixed + Percentage */}
            {formData.salaryType === 'Fixed + Percentage' && (
              <div className="space-y-3.5 bg-white p-3.5 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <Input
                    label={`Fixed Monthly Salary (${currencySymbol})`}
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    error={errors.salary}
                  />

                  <Input
                    label="Commission Percentage (%)"
                    required
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 30"
                    value={formData.commissionPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionPercentage: e.target.value })
                    }
                    error={errors.commissionPercentage}
                  />

                  <Select
                    label="Commission Basis"
                    required
                    value={formData.commissionBasis}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionBasis: e.target.value as CommissionBasis,
                      })
                    }
                    options={COMMISSION_BASIS_OPTIONS}
                  />
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100 text-xs text-emerald-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                    Hybrid Compensation:
                  </span>
                  <p className="text-emerald-800">
                    Coach receives base fixed salary of <span className="font-bold">{formatCurrency(Number(formData.salary) || 0)}</span> PLUS <span className="font-bold">{Number(formData.commissionPercentage) || 0}%</span> of revenue from {formData.commissionBasis}.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Conditional: Attendance Based */}
            {(formData.salaryType === 'Attendance-Based Salary' ||
              (formData.salaryType as string) === 'Attendance Based') && (
              <div className="space-y-3.5 bg-white p-3.5 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label={`Monthly Base Salary (${currencySymbol})`}
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 40000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    error={errors.salary}
                  />

                  <Input
                    label="Working Days per Month"
                    required
                    type="number"
                    min="1"
                    max="31"
                    placeholder="26"
                    value={formData.workingDaysPerMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, workingDaysPerMonth: e.target.value })
                    }
                    error={errors.workingDaysPerMonth}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Monthly payout is calculated as: (Marked Present Days ÷ {Number(formData.workingDaysPerMonth) || 26}) × {formatCurrency(Number(formData.salary) || 0)}.
                </p>
              </div>
            )}

            {/* 6. Conditional: Hourly / Daily */}
            {formData.salaryType === 'Hourly / Daily' && (
              <div className="space-y-3.5 bg-white p-3.5 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label={`Hourly Rate (${currencySymbol} / hr)`}
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    error={errors.hourlyRate}
                  />

                  <Input
                    label={`Daily Rate (${currencySymbol} / day)`}
                    type="number"
                    min="0"
                    placeholder="e.g. 2500"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    error={errors.dailyRate}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Compensation calculated according to logged coaching sessions, class hours, or day shifts.
                </p>
              </div>
            )}

            {!formData.salaryType && (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Please select a <span className="font-bold">Salary Type</span> above to configure the specific compensation, commission rates, or salary inputs for this coach.
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              {trainerToEdit ? 'Save Changes' : 'Register Coach'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Full Size Photo Preview Lightbox */}
      {isPreviewModalOpen && formData.photo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-md w-full p-4 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Headshot Preview</h3>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
              <img
                src={formData.photo}
                alt="Trainer High Res"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 text-base">{formData.name || 'Trainer Name'}</p>
              <p className="text-xs text-indigo-600 font-medium">{formData.specialization}</p>
            </div>
            <Button
              size="md"
              variant="outline"
              className="w-full"
              onClick={() => setIsPreviewModalOpen(false)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
