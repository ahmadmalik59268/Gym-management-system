import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { PhotoUpload } from '../common/PhotoUpload';
import { Member } from '../../types';
import { useGym } from '../../context/GymContext';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
}) => {
  const { addMember, updateMember } = useGym();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    guardianName: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: '',
    emergencyName: '',
    emergencyRelation: 'Guardian',
    emergencyPhone: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Expired' | 'Expiring Soon',
    notes: '',
    profilePhoto: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        fullName: memberToEdit.fullName,
        guardianName: memberToEdit.guardianName,
        phone: memberToEdit.phone,
        email: memberToEdit.email,
        dob: memberToEdit.dob,
        gender: memberToEdit.gender,
        address: memberToEdit.address,
        emergencyName: memberToEdit.emergencyContact.name,
        emergencyRelation: memberToEdit.emergencyContact.relation,
        emergencyPhone: memberToEdit.emergencyContact.phone,
        joinDate: memberToEdit.joinDate,
        status: memberToEdit.status,
        notes: memberToEdit.notes,
        profilePhoto: memberToEdit.profilePhoto,
      });
    } else {
      setFormData({
        fullName: '',
        guardianName: '',
        phone: '',
        email: '',
        dob: '1996-06-12',
        gender: 'Male',
        address: '',
        emergencyName: '',
        emergencyRelation: 'Guardian',
        emergencyPhone: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        notes: '',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      });
    }
    setErrors({});
  }, [memberToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile picture is required';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: formData.fullName.trim(),
      guardianName: formData.guardianName.trim() || 'N/A',
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@member.gym`,
      dob: formData.dob || '1995-01-01',
      gender: formData.gender,
      address: formData.address.trim() || 'Gym Member Resident',
      emergencyContact: {
        name: formData.emergencyName.trim() || 'Primary Contact',
        relation: formData.emergencyRelation.trim() || 'Family',
        phone: formData.emergencyPhone.trim() || formData.phone.trim(),
      },
      joinDate: formData.joinDate,
      status: formData.status,
      notes: formData.notes.trim(),
      profilePhoto: formData.profilePhoto,
    };

    if (memberToEdit) {
      updateMember(memberToEdit.id, payload);
    } else {
      addMember(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? 'Edit Member Profile' : 'Quick Register Member'}
      description="Update athlete personal credentials, photo, health notes, and emergency contacts."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!memberToEdit && (
          <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <p className="text-xs text-indigo-950 font-medium">
                Want to setup Membership + Trainer + Workout + Diet + Receipt in one flow?
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                navigate('/members/add');
              }}
              className="shrink-0 text-xs py-1"
            >
              Open Full Wizard
            </Button>
          </div>
        )}

        {/* Photo Upload */}
        <PhotoUpload
          value={formData.profilePhoto}
          onChange={(photo) => {
            setFormData({ ...formData, profilePhoto: photo });
            if (errors.profilePhoto) {
              setErrors((prev) => {
                const c = { ...prev };
                delete c.profilePhoto;
                return c;
              });
            }
          }}
          required
          error={errors.profilePhoto}
          label="Profile Photo (Required)"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Marcus Sterling"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
          />
          <Input
            label="Father / Guardian Name"
            placeholder="e.g. Robert Sterling"
            value={formData.guardianName}
            onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
          />
          <Input
            label="Phone Number"
            required
            type="tel"
            placeholder="+92 300 0000000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="client@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          />
          <Select
            label="Gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </div>

        <Input
          label="Physical Address"
          placeholder="e.g. 742 Evergreen Terrace, Sector F-10"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Emergency Contact"
            placeholder="Name"
            value={formData.emergencyName}
            onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
          />
          <Input
            label="Relation"
            placeholder="e.g. Spouse"
            value={formData.emergencyRelation}
            onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
          />
          <Input
            label="Emergency Phone"
            placeholder="Phone number"
            value={formData.emergencyPhone}
            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Join Date"
            type="date"
            required
            value={formData.joinDate}
            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
          />
          <Select
            label="Member Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Expiring Soon', label: 'Expiring Soon' },
              { value: 'Expired', label: 'Expired' },
            ]}
          />
        </div>

        <Input
          label="Notes / Health Considerations"
          placeholder="e.g. Certified CPR, Asthmatic, Personal Trainer Request"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {memberToEdit ? 'Save Changes' : 'Register Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
