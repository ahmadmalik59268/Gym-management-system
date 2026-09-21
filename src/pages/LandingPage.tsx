import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dumbbell,
  Users,
  Award,
  CalendarCheck2,
  ArrowRight,
  Clock,
  HeartPulse,
  ShieldCheck,
  CheckCircle,
  Menu,
  X,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  LayoutDashboard,
  Zap,
  Check,
  Star,
  Activity,
  Send,
  CheckCircle2,
  Calendar,
  CreditCard,
  Flame,
  Timer,
  Fingerprint,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Shield,
  Utensils,
  Trophy,
  BadgeCheck,
} from 'lucide-react';
import { useAuth, getRoleDefaultPath } from '../context/AuthContext';
import { useGym } from '../context/GymContext';
import { FormSubmissionType } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, profile } = useAuth();
  const { addFormSubmission, gymProfile, plans, generalSettings } = useGym();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPlanPeriod, setSelectedPlanPeriod] = useState<'all' | 'monthly' | 'quarterly' | 'annual'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    formType: 'Membership Inquiry' as FormSubmissionType,
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currencySymbol = generalSettings?.currencySymbol || 'Rs.';
  const gymPhone = gymProfile?.phone || '03326109729';
  const gymEmail = gymProfile?.email || 'ahmadmalik59268@gmail.com';
  const gymAddress = gymProfile?.address || 'Shahdara, Lahore';
  const gymName = gymProfile?.gymName || 'ApexFit Commercial Club';

  // Format phone number for WhatsApp link
  const cleanPhoneForWhatsApp = gymPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp.startsWith('0') ? '92' + cleanPhoneForWhatsApp.slice(1) : cleanPhoneForWhatsApp}?text=${encodeURIComponent('Hello ApexFit! I would like to inquire about gym membership and facilities.')}`;

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      setSubmitError('Please provide your name and phone number.');
      return;
    }
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await addFormSubmission({
        name: contactForm.name.trim(),
        email: contactForm.email.trim() || 'inquiry@apexfit.local',
        phone: contactForm.phone.trim(),
        formType: contactForm.formType,
        subject: contactForm.subject.trim() || `${contactForm.formType} - Shahdara Branch`,
        message: contactForm.message.trim(),
        status: 'New',
        notes: `Submitted via Gym Website on ${new Date().toLocaleString()}`,
      });

      setSubmitSuccess(true);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        formType: 'Membership Inquiry',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitSuccess(false), 7000);
    } catch (err: any) {
      console.error('Contact submission failed:', err);
      setSubmitError(err.message || 'Submission failed. Please try again or WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gymFeatures = [
    {
      icon: <Dumbbell className="w-6 h-6 text-indigo-400" />,
      title: 'Heavy Strength & Free Weights',
      desc: 'Olympic barbells, power cages, custom dumbbell rack up to 50kg, and imported heavy selectorized machines for serious muscle building.',
      badge: 'Strength Zone',
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      title: 'Modern Cardio & Conditioning',
      desc: 'Commercial high-grade treadmills, cross-trainers, spin bikes, and stair masters in a dedicated air-conditioned cardio section.',
      badge: 'Cardio Zone',
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: 'Certified Personal Trainers',
      desc: 'Qualified fitness coaches for 1-on-1 guidance, posture correction, personalized workout splits (PPL / Bro Split), and safety.',
      badge: '1-on-1 Coaching',
    },
    {
      icon: <Utensils className="w-6 h-6 text-teal-400" />,
      title: 'Customized Diet & Nutrition Plans',
      desc: 'Personalized high-protein meal plans for fat loss, lean muscle gain, weight gain, and supplement guidance tailored to your body type.',
      badge: 'Diet & Macros',
    },
    {
      icon: <Fingerprint className="w-6 h-6 text-cyan-400" />,
      title: 'Smart Digital Turnstile Gate Entry',
      desc: 'Hassle-free RFID and digital QR access. Members can walk in quickly with verified membership status and no manual register waiting.',
      badge: 'Fast Entry',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
      title: 'Clean, AC & Hygienic Environment',
      desc: 'Fully air-conditioned halls, clean locker facilities, filtered drinking water, power backup generator, and motivating sound system.',
      badge: 'Facility',
    },
  ];

  const gymTimings = [
    { day: 'Monday – Saturday', hours: '6:00 AM – 11:00 PM', status: 'Full Day Open' },
    { day: 'Sunday', hours: '4:00 PM – 10:00 PM', status: 'Evening Open' },
    { day: 'Ladies Hours (Optional)', hours: '11:00 AM – 2:00 PM', status: 'Reserved Slot' },
  ];

  const defaultPlans = [
    {
      id: 'p1',
      name: 'Monthly Standard',
      duration: '1 Month',
      price: 3500,
      popular: false,
      features: [
        'Full Gym & Cardio Access',
        'Locker Room & Shower Access',
        'General Trainer Guidance',
        'Standard Operating Hours',
        'Free Wi-Fi & Water Station',
      ],
    },
    {
      id: 'p2',
      name: 'Quarterly Pro (3 Months)',
      duration: '3 Months',
      price: 9000,
      popular: true,
      features: [
        'All Monthly Standard Benefits',
        'Save Rs. 1,500 on 3-Month Pack',
        '1 Free Personalized Diet Chart',
        'Body Composition & Fat Analysis',
        'Priority Locker Facility',
      ],
    },
    {
      id: 'p3',
      name: 'Half-Yearly Elite (6 Months)',
      duration: '6 Months',
      price: 16000,
      popular: false,
      features: [
        'Unlimited 24/7 Turnstile Access',
        'Customized Workout Split Routine',
        'Bi-Weekly Diet Progress Updates',
        '2 Free Guest Passes / Month',
        'Free Gym Shaker Bottle',
      ],
    },
    {
      id: 'p4',
      name: 'Annual VIP Membership',
      duration: '12 Months',
      price: 28000,
      popular: false,
      features: [
        'Maximum Value (Save over 35%)',
        'Permanent Reserved Locker',
        'Full Personal Training Consultation',
        'Unlimited Diet & Routine Adjustments',
        'VIP Club Member Card & Kit',
      ],
    },
  ];

  const faqs = [
    {
      q: 'What are the gym timings and location?',
      a: `We are located at ${gymAddress}. The gym is open Monday through Saturday from 6:00 AM to 11:00 PM, and on Sundays from 4:00 PM to 10:00 PM with backup power generator.`,
    },
    {
      q: 'Do you provide workout routines and diet charts for beginners?',
      a: 'Yes! Every new member receives proper onboarding, body assessment, a beginner workout routine, and dietary guidelines based on your fitness goals (weight loss, weight gain, or muscle building).',
    },
    {
      q: 'Are personal trainers available?',
      a: 'Yes, we have certified personal trainers available for dedicated 1-on-1 coaching, form correction, intense transformation programs, and competition prep.',
    },
    {
      q: 'How does the digital gate check-in work?',
      a: 'When you register, you receive a digital member pass / RFID card. Just tap at the entrance turnstile gate for instant 1-second check-in.',
    },
    {
      q: 'Can I get a 1-day free trial before joining?',
      a: 'Absolutely! You can submit the inquiry form below or send us a WhatsApp message at 03326109729 to book your free trial session.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Banner if logged in */}
      {user && (
        <div className="bg-indigo-950/80 border-b border-indigo-800/40 text-xs py-2 px-4 sticky top-0 z-55 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-slate-300">
              Logged in as <strong className="text-white">{profile?.full_name || user.email}</strong> ({role})
            </span>
            <button
              onClick={() => navigate(getRoleDefaultPath(role))}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to ERP Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Gym Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight uppercase">
                {gymName}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  {gymAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => handleNavClick('features')} className="text-xs font-bold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer">
              Gym Facilities
            </button>
            <button onClick={() => handleNavClick('plans')} className="text-xs font-bold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer">
              Membership Plans
            </button>
            <button onClick={() => handleNavClick('schedule')} className="text-xs font-bold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer">
              Timings & Location
            </button>
            <button onClick={() => handleNavClick('faq')} className="text-xs font-bold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer">
              FAQ
            </button>
            <button onClick={() => handleNavClick('contact')} className="text-xs font-bold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer">
              Contact Us
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>

            {user ? (
              <button
                onClick={() => navigate(getRoleDefaultPath(role))}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Member / Staff Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 p-6 space-y-4"
          >
            <button onClick={() => handleNavClick('features')} className="block w-full text-left py-2 font-bold text-slate-200">
              Gym Facilities
            </button>
            <button onClick={() => handleNavClick('plans')} className="block w-full text-left py-2 font-bold text-slate-200">
              Membership Plans
            </button>
            <button onClick={() => handleNavClick('schedule')} className="block w-full text-left py-2 font-bold text-slate-200">
              Timings & Location
            </button>
            <button onClick={() => handleNavClick('faq')} className="block w-full text-left py-2 font-bold text-slate-200">
              FAQ
            </button>
            <button onClick={() => handleNavClick('contact')} className="block w-full text-left py-2 font-bold text-slate-200">
              Contact & Inquiries
            </button>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {gymPhone}</span>
              </a>
              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700"
              >
                Member / Staff Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PREMIER FITNESS & BODYBUILDING CLUB • SHAHDARA</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Achieve Your Peak Physique at{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
                  {gymName}
                </span>
              </h1>

              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                Experience world-class training in Shahdara, Lahore. Equipped with heavy imported strength machines, high-end cardio zone, certified personal trainers, customized diet plans, and seamless digital turnstile entry.
              </p>

              {/* Gym Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
                  <Dumbbell className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">Equipment</div>
                    <div className="text-xs font-black text-white">Imported Machines</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">Coaches</div>
                    <div className="text-xs font-black text-white">Certified Trainers</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <Fingerprint className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">Entry</div>
                    <div className="text-xs font-black text-white">Smart Digital Gate</div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <button
                  onClick={() => handleNavClick('contact')}
                  className="px-7 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>Join Gym / Get Free Day Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`tel:${gymPhone}`}
                  className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call: {gymPhone}</span>
                </a>
              </div>

              {/* Verified Address & Timings Pill */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>{gymAddress}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>6:00 AM – 11:00 PM (Mon-Sat)</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Gym Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-2xl space-y-5">
                
                {/* Visual Header */}
                <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
                    alt="Gym Facility"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider">{gymName}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Air Conditioned & Clean Arena</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-[10px] font-black uppercase">
                      Shahdara
                    </span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Training Types</div>
                    <div className="font-bold text-white mt-0.5">Strength • Fat Loss • Muscle</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Active Members</div>
                    <div className="font-bold text-emerald-400 mt-0.5">500+ Fitness Enthusiasts</div>
                  </div>
                </div>

                {/* Direct Action Contact Card */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Have questions? Speak to Manager</div>
                    <div className="text-[11px] text-slate-300">{gymPhone}</div>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CORE GYM FACILITIES (MARA GYM KE ASAL FEATURES) */}
      <section id="features" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
              World-Class Gym Facilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Everything You Need for a Serious Transformation
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We provide the highest quality equipment, clean atmosphere, and professional guidance to help you smash your fitness goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gymFeatures.map((feat, index) => (
              <div
                key={index}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 space-y-4 group hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                    {feat.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. MEMBERSHIP PACKAGES */}
      <section id="plans" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
              Simple & Affordable Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Choose Your Membership Plan
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transparent fees with no hidden charges. All packages include full equipment & cardio access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <div className="text-xs text-slate-400">{plan.duration} Duration</div>
                  </div>

                  <div className="flex items-baseline gap-1 py-2 border-y border-slate-800/80">
                    <span className="text-3xl font-black text-white">
                      {currencySymbol} {plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">/ package</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setContactForm((prev) => ({
                        ...prev,
                        subject: `Inquiry for ${plan.name} (${currencySymbol} ${plan.price})`,
                      }));
                      handleNavClick('contact');
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800'
                    }`}
                  >
                    <span>Select & Inquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. TIMINGS & LOCATION (SCHEDULE) */}
      <section id="schedule" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Schedule Table Left */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                Operating Schedule
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Gym Timings & Slots
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                We stay open throughout the week with continuous power backup so your training is never interrupted.
              </p>

              <div className="space-y-3">
                {gymTimings.map((timing, tIndex) => (
                  <div
                    key={tIndex}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">{timing.day}</div>
                        <div className="text-sm font-black text-emerald-400">{timing.hours}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                      {timing.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 flex items-center gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Heavy generator backup ensures uninterrupted AC and lighting during load shedding.</span>
              </div>
            </div>

            {/* Location & Map Card Right */}
            <div className="lg:col-span-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Gym Location</span>
                  <h3 className="text-2xl font-black text-white mt-1">{gymAddress}</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Conveniently situated with dedicated parking space for bikes and cars.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Phone Support</div>
                      <div className="text-xs font-bold text-white">{gymPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                      <div className="text-xs font-bold text-white">{gymEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Address</div>
                      <div className="text-xs font-bold text-white">{gymAddress}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Location</span>
                  </a>

                  <a
                    href={`tel:${gymPhone}`}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Direct Call</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-5 text-left font-bold text-xs sm:text-sm text-white flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaqIndex === index ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. CONTACT & INQUIRY FORM */}
      <section id="contact" className="py-20 bg-slate-900/50 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                Start Today
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Send an Inquiry or Book a Free Trial
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Fill out the quick form and our gym staff will contact you right away. You can also visit our club directly in Shahdara, Lahore.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Phone Support</div>
                    <div className="text-xs font-bold text-white">{gymPhone}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                    <div className="text-xs font-bold text-white">{gymEmail}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Location</div>
                    <div className="text-xs font-bold text-white">{gymAddress}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Member Registration & Inquiry</h3>
              <p className="text-xs text-slate-400 mb-6">
                Please leave your details below and our team will get back to you shortly.
              </p>

              {submitSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-200 flex items-center gap-3 text-xs">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold text-white">Inquiry Received!</strong>
                    <span>Thank you! Your inquiry has been submitted to {gymName}. We will reach out soon.</span>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-950 border border-rose-700 text-rose-200 flex items-center gap-3 text-xs">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                {/* Inquiry Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Inquiry Reason</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Membership Inquiry', 'Free Trial', 'Custom Quote', 'General'] as FormSubmissionType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setContactForm({ ...contactForm, formType: t })}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer truncate ${
                          contactForm.formType === t
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Ahmad Malik"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="e.g. 03326109729"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="e.g. ahmadmalik59268@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Message or Questions</label>
                  <textarea
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us about your fitness goals (weight gain, fat loss, or personal training)..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Gym Admin</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-10 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm uppercase">
                {gymName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{gymAddress}</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <a href={`tel:${gymPhone}`} className="hover:text-white transition-colors">{gymPhone}</a>
              <span>•</span>
              <a href={`mailto:${gymEmail}`} className="hover:text-white transition-colors">{gymEmail}</a>
              <span>•</span>
              <button onClick={() => navigate('/login')} className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer">
                Portal Login
              </button>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-900 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} {gymName}. All rights reserved. Shahdara, Lahore.
          </div>
        </div>
      </footer>
    </div>
  );
};
