'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HeartPulse, 
  Star, 
  MapPin, 
  Check, 
  Activity, 
  Brain, 
  Layers, 
  ChevronRight, 
  CheckCircle,
  Clock,
  Compass,
  Building,
  UserCheck,
  Calendar,
  Stethoscope,
  Heart,
  Plus,
  FileText,
  Phone
} from "lucide-react";
import Header from '@/components/pageComponents/header';
import Footer from '@/components/pageComponents/footer';

// Typing scenarios for the Hero live visualization
const heroScenarios = [
  {
    input: "I have sharp chest pain that spreads to my jaw when I walk upstairs.",
    symptoms: ["Chest Pain", "Exertion Trigger", "Jaw Radiation"],
    reasoning: "Ischemic cardiac pattern warning: exertional discomfort with typical jaw radiation.",
    specialist: "Cardiologist",
    match: 98,
    urgency: "EMERGENCY",
    urgencyStyle: "bg-red-500/10 text-red-400 border border-red-500/20"
  },
  {
    input: "Sudden splitting headache with a very stiff neck and high fever.",
    symptoms: ["Headache", "Stiff Neck", "Fever"],
    reasoning: "Potential meningeal irritation warning. Excludes routine migraine variants.",
    specialist: "Emergency Physician",
    match: 96,
    urgency: "EMERGENCY",
    urgencyStyle: "bg-red-500/10 text-red-400 border border-red-500/20"
  },
  {
    input: "Persistent wheezing at night and dry cough for over 3 weeks.",
    symptoms: ["Cough", "Wheezing", "Night Aggravation", "3 Weeks"],
    reasoning: "Bronchial hyperresponsiveness mapped. No cardiovascular symptoms reported.",
    specialist: "Pulmonologist",
    match: 92,
    urgency: "URGENT",
    urgencyStyle: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
  }
];

// Interactive demo presets
const demoPresets = [
  {
    id: "demo-1",
    label: "Skin rash",
    prompt: "I have developed itchy red rashes on my arms that are spreading for 10 days.",
    symptoms: ["Rash", "Itching", "Spreading", "10 Days"],
    explanation: "Eczematous or contact dermatitis profile. Denies systemic symptoms like fever or respiratory distress.",
    specialist: "Dermatologist",
    confidence: "94% Match Score",
    urgency: "Routine Assessment",
    urgencyColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: "demo-2",
    label: "Chronic Migraine",
    prompt: "Severe throbbing headaches behind my right eye with sensitivity to light and nausea.",
    symptoms: ["Headache", "Unilateral (behind eye)", "Photophobia", "Nausea"],
    explanation: "Classic migraine pathway matching neurologically. Denies head injury, stiff neck, or sudden thunderclap onset.",
    specialist: "Neurologist",
    confidence: "95% Match Score",
    urgency: "Scheduled Consultation",
    urgencyColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: "demo-3",
    label: "Joint swelling",
    prompt: "My knees are swollen, stiff, and painful in the morning, making it hard to walk.",
    symptoms: ["Joint Pain", "Morning Stiffness", "Swelling", "Impaired Mobility"],
    explanation: "Inflammatory arthropathy or rheumatoid indicators identified. Recommended laboratory evaluation.",
    specialist: "Rheumatologist",
    confidence: "91% Match Score",
    urgency: "Urgent Assessment",
    urgencyColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  }
];

const mockDoctors = [
  {
    name: "Dr. Sarah Rahman",
    specialty: "Cardiologist",
    rating: "4.9",
    reviews: 142,
    experience: "12 Yrs Exp",
    distance: "1.2 km away",
    avail: "Available Today",
    timeline: "Sat-Mon: 5:00 PM - 8:00 PM",
    phone: "+880 1711-123456",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6_upf-qbfL4xV0goyl6chdz_RGI5C5JrGLEMt__fPvK4Kn_xsuiDoM1vRE_JKiFs3XGw8VQY8NhgFUg4eB7PmD0pPv3RbAiZXTKUjfH_VQn4548wdS1gpRSXt1r6nSsWDwS_ZSWNixMdB1taf75sECCM0Z6zEW-Kp3dlCXsHpK7oLGw53sBy4zHmZ2xUnh9SbAr_mpgt_6-RnqRZZ05dTW7SemK7M2oUVv_7c8GOsEmU95721CqhTSzWQvGpnMD2R_HlLw3MCt7E"
  },
  {
    name: "Dr. Asif Zaman",
    specialty: "Neurologist",
    rating: "4.8",
    reviews: 98,
    experience: "9 Yrs Exp",
    distance: "2.5 km away",
    avail: "Available Tomorrow",
    timeline: "Sun-Tue: 4:30 PM - 7:30 PM",
    phone: "+880 1711-654321",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuKuYomVK3_ZH34X2ELoV37NxjmteCKQGguRWX4naMPZgSR6nEkwjhEzG8unRqyGQeAzCdYoCoDTaQQASNxYmv9gfNfP1lWWBnwKGO-7Xpw5QnvtL3o7s9ZETUCwSqv5l5Jcf7KY6h4u5UZMzsfnIfuahd0ggQ61XNwokC89qmYhAprZIxRBw9jpGs2SZ3LcZXjILP9y98AgrWVFlOoNAM-_7IpM4fQgkobOd8NmDRhTlVpaqGk-R-fJnOBjg5v_bmflTi3GE4vsA"
  },
  {
    name: "Dr. Sabrina Karim",
    specialty: "Dermatologist",
    rating: "4.9",
    reviews: 167,
    experience: "14 Yrs Exp",
    distance: "0.8 km away",
    avail: "Available Today",
    timeline: "Mon-Wed: 3:00 PM - 6:00 PM",
    phone: "+880 1711-987654",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGh2dA1h-P0QKgXABmjJuSrPhf24EST6bl0CG36u_p7z0zfhxyHbY-j-TqPVWPeg6O8T7QXiB2NZzAAkfIuPYj41kMW7_isiysmdYC5GkQGvH00w-H7SCTc5HuMMLaAH4AWFfGn7J9rTrdadOFgNnX95rcEBwEGZQe88itLcG7VJCgtADTU8yKVjBk-wm2Ar-xQYSyjDH-gFG2gowGaVkcgqusNJXRA5q0RlgKdD9Zxv298Fn6q-V23SNbNr4xsEIR7QNVCvc9KTo"
  },
  {
    name: "Dr. Tanvir Hasan",
    specialty: "Rheumatologist",
    rating: "4.7",
    reviews: 84,
    experience: "8 Yrs Exp",
    distance: "3.1 km away",
    avail: "Available Monday",
    timeline: "Wed-Fri: 5:00 PM - 8:00 PM",
    phone: "+880 1711-345678",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVBtl72kWI5EF3axoOLhM6wEhMpeptUBGm8fsAPSxnS8KmTO6nbHLBw5vAPXvLwHgFGZ13YS-hjN1DD9PFKv-aT3lOrDsR1NVyqX_pDVFzrbYTmuMMnIXOXFPLk-ajjxdh7EKQ2FQ4r3DfSbrJo14BFqDUm69hsVpnItoaZ56effoF7AucXGdSghz9YkZSVfesiN6mSPNjpHG3ABXGGUrkTD026QzzBK-XfXulNLHdJop_IzHsNd1WB8FzARqRhL_-UauDILXf9HY"
  }
];

export default function Home() {
  const router = useRouter();

  // Scenario simulation state for Hero
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [animationStep, setAnimationStep] = useState<"typing" | "extracted" | "reasoning" | "recommendation">("typing");
  
  // Interactive demo section states
  const [activeDemo, setActiveDemo] = useState(demoPresets[0]);
  const [demoState, setDemoState] = useState<"idle" | "running" | "completed">("idle");
  const [demoTypedText, setDemoTypedText] = useState("");

  // Care Customization Onboarding Form State
  const [onboardPathway, setOnboardPathway] = useState<string>("specialist");
  const [onboardState, setOnboardState] = useState<'options' | 'success'>('options');
  const [onboardInput, setOnboardInput] = useState("");



  useEffect(() => {
    if (process.env.NODE_ENV === "development" || location.search.includes("debug=true")) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.onload = () => {
        (window as any).eruda.init();
      };
      document.body.appendChild(script);
    }
  }, []);

  // --- Scenario Loop for Hero Canvas ---
  useEffect(() => {
    let typeTimer: NodeJS.Timeout;
    let transitionTimer: NodeJS.Timeout;
    const currentText = heroScenarios[scenarioIndex].input;
    let charIndex = 0;
    
    // Reset states
    setTypedInput("");
    setAnimationStep("typing");

    // Typing effect
    const type = () => {
      if (charIndex < currentText.length) {
        setTypedInput(currentText.substring(0, charIndex + 1));
        charIndex++;
        typeTimer = setTimeout(type, 30);
      } else {
        // Typing finished -> show extraction
        transitionTimer = setTimeout(() => {
          setAnimationStep("extracted");
          // Show reasoning
          transitionTimer = setTimeout(() => {
            setAnimationStep("reasoning");
            // Show recommendation
            transitionTimer = setTimeout(() => {
              setAnimationStep("recommendation");
              // Wait and move to next scenario
              transitionTimer = setTimeout(() => {
                setScenarioIndex((prev) => (prev + 1) % heroScenarios.length);
              }, 4500);
            }, 1000);
          }, 1200);
        }, 800);
      }
    };

    typeTimer = setTimeout(type, 500);

    return () => {
      clearTimeout(typeTimer);
      clearTimeout(transitionTimer);
    };
  }, [scenarioIndex]);

  // Run demo logic
  const runDemo = (preset: typeof demoPresets[0]) => {
    setActiveDemo(preset);
    setDemoState("running");
    setDemoTypedText("");
    
    let charIndex = 0;
    const textToType = preset.prompt;
    
    const typeDemo = () => {
      if (charIndex < textToType.length) {
        setDemoTypedText(textToType.substring(0, charIndex + 1));
        charIndex++;
        setTimeout(typeDemo, 25);
      } else {
        setTimeout(() => {
          setDemoState("completed");
        }, 800);
      }
    };
    
    setTimeout(typeDemo, 300);
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardInput) return;
    setOnboardState('success');
  };

  return (
    <div className="bg-surface text-text-base overflow-x-hidden min-h-screen font-sans transition-colors duration-300">
      <Header />
      
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-border bg-gradient-to-b from-surface via-card/20 to-surface">
        {/* Glow ambient background elements */}
        <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Premium Text Stack */}
          <div className="lg:col-span-6 text-left space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>High-Precision Healthcare Navigation</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black leading-[1.1] tracking-tight text-text-base">
              Navigate Your Medical <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#2dd4bf]">
                Care With Absolute Clarity.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-text-sub max-w-xl leading-relaxed">
              Describe your symptoms in natural language. Our clinical AI maps your distress directly to board-certified specialists—minimizing delay, ensuring diagnostic accuracy, and restoring control.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/analyze" 
                className="bg-primary hover:bg-primary-hover text-white px-8 h-14 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group hover:scale-[1.01]"
              >
                <span>Launch Clinical Analysis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  const el = document.getElementById("demo-box");
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-border hover:bg-card text-text-base px-8 h-14 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Try Simulator</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4 pt-6 border-t border-border">
              <div className="flex -space-x-3">
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6_upf-qbfL4xV0goyl6chdz_RGI5C5JrGLEMt__fPvK4Kn_xsuiDoM1vRE_JKiFs3XGw8VQY8NhgFUg4eB7PmD0pPv3RbAiZXTKUjfH_VQn4548wdS1gpRSXt1r6nSsWDwS_ZSWNixMdB1taf75sECCM0Z6zEW-Kp3dlCXsHpK7oLGw53sBy4zHmZ2xUnh9SbAr_mpgt_6-RnqRZZ05dTW7SemK7M2oUVv_7c8GOsEmU95721CqhTSzWQvGpnMD2R_HlLw3MCt7E',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuKuYomVK3_ZH34X2ELoV37NxjmteCKQGguRWX4naMPZgSR6nEkwjhEzG8unRqyGQeAzCdYoCoDTaQQASNxYmv9gfNfP1lWWBnwKGO-7Xpw5QnvtL3o7s9ZETUCwSqv5l5Jcf7KY6h4u5UZMzsfnIfuahd0ggQ61XNwokC89qmYhAprZIxRBw9jpGs2SZ3LcZXjILP9y98AgrWVFlOoNAM-_7IpM4fQgkobOd8NmDRhTlVpaqGk-R-fJnOBjg5v_bmflTi3GE4vsA',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAGh2dA1h-P0QKgXABmjJuSrPhf24EST6bl0CG36u_p7z0zfhxyHbY-j-TqPVWPeg6O8T7QXiB2NZzAAkfIuPYj41kMW7_isiysmdYC5GkQGvH00w-H7SCTc5HuMMLaAH4AWFfGn7J9rTrdadOFgNnX95rcEBwEGZQe88itLcG7VJCgtADTU8yKVjBk-wm2Ar-xQYSyjDH-gFG2gowGaVkcgqusNJXRA5q0RlgKdD9Zxv298Fn6q-V23SNbNr4xsEIR7QNVCvc9KTo',
                ].map((src, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-surface bg-cover bg-center" style={{ backgroundImage: `url('${src}')` }} />
                ))}
              </div>
              <p className="text-xs font-bold text-text-muted">
                Aligned with BMDC guidelines. Trusted by over <span className="text-primary font-black">12,000+ patients</span> in Bangladesh.
              </p>
            </div>
          </div>

          {/* Right Side: Immersive AI Reasoning Canvas */}
          <div className="lg:col-span-6 w-full flex justify-center relative">
            <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-5 min-h-[460px] transition-colors duration-300">
              {/* Card Gloss Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted bg-surface px-3 py-1 rounded-md border border-border">
                  <Brain className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>CareFind Triage Core</span>
                </div>
              </div>

              {/* Step 1: User Input simulation */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient Statement</p>
                <div className="bg-surface border border-border rounded-xl p-4 min-h-[70px] text-sm text-text-base font-bold flex items-center leading-relaxed">
                  {typedInput}
                  <span className="w-1.5 h-4 ml-1 bg-primary animate-ping shrink-0" />
                </div>
              </div>

              {/* Step 2: Extraction Node Map */}
              <AnimatePresence>
                {animationStep !== "typing" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">AI Symptom Extraction</p>
                    <div className="flex flex-wrap gap-2">
                      {heroScenarios[scenarioIndex].symptoms.map((symptom, idx) => (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: idx * 0.15 }}
                          key={symptom}
                          className="bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3" />
                          {symptom}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: AI Reasoning log */}
              <AnimatePresence>
                {(animationStep === "reasoning" || animationStep === "recommendation") && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5 bg-surface p-3.5 rounded-xl border border-border"
                  >
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Clinical Inference</p>
                    <p className="text-xs text-text-sub font-semibold leading-relaxed">
                      {heroScenarios[scenarioIndex].reasoning}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 4: Final Recommendation result card */}
              <AnimatePresence>
                {animationStep === "recommendation" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-card border border-border rounded-xl p-4 flex justify-between items-center shadow-lg mt-auto"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Mapped Specialist</p>
                      <h4 className="font-bold text-lg text-text-base flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-primary" />
                        {heroScenarios[scenarioIndex].specialist}
                      </h4>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${heroScenarios[scenarioIndex].urgencyStyle}`}>
                        {heroScenarios[scenarioIndex].urgency}
                      </span>
                      <p className="text-xs font-black text-primary">{heroScenarios[scenarioIndex].match}% Match confidence</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY & CLINICAL INTEGRATION PILLARS ────────────── */}
      <section className="py-12 bg-card border-b border-border relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {[
            {
              icon: <ShieldCheck className="w-6 h-6 text-primary" />,
              title: "Absolute Privacy Assurance",
              desc: "Fully encrypted records. Your symptoms are stored securely aligned with global medical confidentiality standards."
            },
            {
              icon: <Compass className="w-6 h-6 text-secondary" />,
              title: "BMDC Registry Mappings",
              desc: "We verify and connect you only with active, board-certified specialist physicians registered under the Bangladesh Medical Council."
            },
            {
              icon: <Activity className="w-6 h-6 text-emerald-500" />,
              title: "Real-Time Pricing & Audits",
              desc: "Prescription scanning retrieves live prices (BDT) and lists certified, bioequivalent generic alternatives instantly."
            }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-xl hover:bg-surface/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-text-base">{item.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed font-semibold">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HIGH-CONVERSION MODULE: CARE CUSTOMIZATION ONBOARDING ────── */}
      <section className="py-24 bg-surface border-b border-border relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="absolute top-[-30%] right-[-20%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Left text stack */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 animate-pulse" />
                <span>Onboarding Coordinator</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-base leading-tight">
                Establish Your Priority Care Pathway.
              </h2>
              <p className="text-sm text-text-sub leading-relaxed font-semibold">
                Skip directory browsing. Tell our coordinator what care you require, and we will customize a priority medical navigation plan for you instantly.
              </p>
              
              <div className="space-y-3 font-semibold text-xs text-text-sub">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>Immediate access to matching specialist schedules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>Personalized prescription cost savings reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>Direct triage history stored in your Patient Dashboard</span>
                </div>
              </div>
            </div>

            {/* Right form stack */}
            <div className="lg:col-span-6">
              {onboardState === 'options' ? (
                <form onSubmit={handleOnboardSubmit} className="bg-surface border border-border p-6 rounded-2xl space-y-5 shadow-inner">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Care Pathway Goal</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'specialist', label: 'Match Doctors', icon: <UserCheck className="w-4 h-4" /> },
                        { id: 'presc', label: 'Save Medicine', icon: <FileText className="w-4 h-4" /> },
                        { id: 'family', label: 'Family Plan', icon: <Layers className="w-4 h-4" /> }
                      ].map(path => (
                        <button
                          key={path.id}
                          type="button"
                          onClick={() => setOnboardPathway(path.id)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center text-[10px] font-bold transition-all ${
                            onboardPathway === path.id
                              ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                              : "bg-card border-border text-text-muted hover:border-text-muted"
                          }`}
                        >
                          {path.icon}
                          <span>{path.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="onboard-stmt" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Primary Medical Concern / Diagnosis Key
                    </label>
                    <input
                      id="onboard-stmt"
                      type="text"
                      required
                      value={onboardInput}
                      onChange={(e) => setOnboardInput(e.target.value)}
                      placeholder="e.g. chronic skin itching, chest tightness on stairs..."
                      className="w-full rounded-xl h-12 bg-card border border-border text-text-base text-xs font-semibold px-4 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl h-12 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-primary/25"
                  >
                    <span>Request Coordinator Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl text-center space-y-4 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-text-base">Care Setup Initiated</h3>
                  <p className="text-xs text-text-muted leading-relaxed font-semibold">
                    We have created your priority onboarding profile. Go to the dashboard or start a full diagnostic analysis to continue your custom care plan!
                  </p>
                  <button
                    onClick={() => {
                      setOnboardState('options');
                      setOnboardInput("");
                    }}
                    className="text-primary hover:text-primary-hover text-xs font-bold underline"
                  >
                    Configure Another Goal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE SANDBOX DEMO ───────────────────────────── */}
      <section className="py-24 bg-card border-b border-border relative" id="demo-box">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Interactive Sandbox</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-base">
              Try It in Real-Time
            </h2>
            <p className="text-text-sub text-base font-semibold">
              Select one of the sample scenarios below to witness how the clinical parsing engine maps diagnostic keys to specialties.
            </p>
            
            {/* Quick click presets */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              {demoPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => runDemo(preset)}
                  disabled={demoState === "running"}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    activeDemo.id === preset.id
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                      : "bg-surface border-border hover:border-text-muted text-text-sub"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Dashboard */}
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Workspace details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Simulator Left Pane: Prompt Input */}
              <div className="flex flex-col justify-between p-5 bg-surface border border-border rounded-xl space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Input Message</p>
                  <div className="text-sm md:text-base text-text-base font-bold leading-relaxed min-h-[120px] bg-card p-4 border border-border rounded-lg">
                    {demoState === "idle" ? activeDemo.prompt : demoTypedText}
                    {demoState === "running" && <span className="w-1.5 h-4 ml-1 bg-primary animate-ping inline-block" />}
                  </div>
                </div>
                
                <button
                  onClick={() => runDemo(activeDemo)}
                  disabled={demoState === "running"}
                  className="w-full flex items-center justify-center rounded-xl h-11 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold transition-all text-sm gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {demoState === "running" ? "Analyzing Symptoms..." : "Analyze Diagnostic Flow"}
                </button>
              </div>

              {/* Simulator Right Pane: AI Parsed Results */}
              <div className="flex flex-col justify-between p-5 bg-surface border border-border rounded-xl min-h-[260px]">
                {demoState === "running" ? (
                  <div className="flex-1 flex flex-col justify-center items-center gap-3 py-12">
                    <Activity className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs text-text-muted font-bold tracking-wider animate-pulse">Running Clinical Mapping Layer...</p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    
                    {/* Symptoms parsed */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Identified Symptoms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDemo.symptoms.map((symptom) => (
                          <span key={symptom} className="bg-primary/10 text-primary border border-primary/20 rounded-md px-2.5 py-1 text-xs font-bold">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-1.5 bg-card p-3 rounded-lg border border-border">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Reasoning Pathway</p>
                      <p className="text-xs text-text-sub leading-relaxed font-semibold">
                        {activeDemo.explanation}
                      </p>
                    </div>

                    {/* Rec Specialist info */}
                    <div className="pt-3 border-t border-border flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Matched Specialist</p>
                        <h4 className="font-bold text-lg text-text-base">{activeDemo.specialist}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider mb-1 ${activeDemo.urgencyColor}`}>
                          {activeDemo.urgency}
                        </span>
                        <p className="text-xs font-black text-primary">{activeDemo.confidence}</p>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Bottom action alert */}
            <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-text-muted font-semibold">
              <span className="flex items-center gap-1.5 text-primary">
                <ShieldCheck className="w-4 h-4 shrink-0" /> Safety checks active
              </span>
              <span>Fully responsive clinical mapping environment.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEDICATED PRESCRIPTION ANALYZER FEATURE SHOWCASE ────────── */}
      <section className="py-24 bg-surface border-b border-border relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Smart Prescription Scanner</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text-base">
              Prescription Digitization & Generic Savings
            </h2>
            <p className="text-sm text-text-muted font-semibold leading-relaxed">
              Upload prescription images to instantly extract medicines, identify active ingredients, and review bioequivalent generic alternatives with live price comparisons in Bangladesh.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Benefits left selector */}
            <div className="lg:col-span-6 space-y-6">
              <h3 className="font-bold text-lg text-text-base border-b border-border pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Core Extraction Capabilities</span>
              </h3>
              
              <div className="space-y-4">
                {[
                  { title: "AI Handwritten Rx Transcriber", desc: "Deciphers physician handwriting using clinical vision models to structure your dosage, frequency, and medication names." },
                  { title: "Generic Alternatives Index", desc: "Compares local brands from Square, Beximco, and Incepta to find cost-effective equivalent drugs matching the same active ingredients." },
                  { title: "Real-Time Pricing (BDT)", desc: "Retrieves localized medicine prices dynamically, allowing you to estimate and minimize your monthly pharmacy bills." },
                  { title: "Safe Side-Effects & Usage Alert", desc: "Translates standard pharmaceutical disclosures into simple patient guidance so you understand risk factors." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-base">{item.title}</h4>
                      <p className="text-xs text-text-muted font-semibold mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock digitized prescription result preview */}
            <div className="lg:col-span-6 bg-surface border border-border p-6 rounded-2xl shadow-inner space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <span className="text-xs font-bold text-text-base flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Prescription Scan Complete</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                  4 Meds Extracted
                </span>
              </div>

              {/* Sample medicines layout list */}
              <div className="space-y-3">
                {[
                  { name: "Amoxicillin 625mg", desc: "Antibiotic • Brand: Moxilin", alt: "৳ 42.00 (Square Alternative)" },
                  { name: "Paracetamol 500mg", desc: "Analgesic • Brand: Napa", alt: "৳ 1.50 (Acme Alternative)" }
                ].map((med, idx) => (
                  <div key={idx} className="p-3 bg-card border border-border rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-bold text-text-base">{med.name}</h5>
                      <p className="text-[10px] text-text-muted font-semibold mt-0.5">{med.desc}</p>
                    </div>
                    <span className="text-[10px] font-black text-primary">{med.alt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-semibold">
                <span className="text-text-muted">Explore generic drug alternatives securely.</span>
                <Link
                  href="/prescription-analyzer"
                  className="flex items-center gap-1 text-primary hover:text-primary-hover font-bold transition-all hover:scale-[1.01]"
                >
                  <span>Launch Prescription Analyzer</span>
                  <ChevronRight className="w-4.5 h-4.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOCTOR DISCOVERY SHOWCASE (DIRECT BOOKINGS & TIMELINES) ── */}
      <section className="py-24 bg-card relative z-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 animate-spin" />
                <span>Specialist Timelines</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-base">
                Instant Specialist Directory Mapping
              </h2>
              <p className="text-text-sub text-base font-semibold">
                Access a validated network of certified medical professionals in Bangladesh.
              </p>
            </div>
            
            <Link 
              href="/find_nearby_doctors" 
              className="text-primary hover:text-primary-hover text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Specialist Timelines</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards list showing Timelines and Contact numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockDoctors.map((doc, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col justify-between h-[380px] shadow-lg relative overflow-hidden group">
                <div className="space-y-4">
                  {/* Photo and general */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-border overflow-hidden bg-[#070b13]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-base">{doc.name}</h4>
                      <p className="text-[10px] text-primary font-black uppercase tracking-wider">{doc.specialty}</p>
                    </div>
                  </div>

                  {/* Badges list */}
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                    <span className="bg-card text-text-sub border border-border rounded px-2 py-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {doc.rating} ({doc.reviews})
                    </span>
                    <span className="bg-card text-text-sub border border-border rounded px-2 py-0.5">
                      {doc.experience}
                    </span>
                  </div>

                  {/* Status alert & Timeline */}
                  <div className="bg-card border border-border p-3.5 rounded-xl text-xs space-y-2">
                    <p className="text-[9px] font-bold uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {doc.avail}
                    </p>
                    <div className="flex flex-col gap-1 border-t border-border/60 pt-1.5 font-semibold text-[11px] text-text-sub">
                      <span className="text-text-muted uppercase text-[9px] font-bold tracking-wider">Weekly Timeline:</span>
                      <span className="flex items-center gap-1 text-text-base">
                        <Clock className="w-3 h-3 text-primary shrink-0" />
                        {doc.timeline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom phone call booking */}
                <div className="border-t border-border pt-4 flex flex-col gap-2.5 text-xs font-bold uppercase tracking-wider text-text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    {doc.distance}
                  </span>
                  <a 
                    href={`tel:${doc.phone}`} 
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[10px] hover:bg-primary hover:text-white transition-all text-center"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {doc.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / CLINICAL PROTOCOL ────────────────────── */}
      <section className="py-24 bg-surface border-b border-border relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-base">
              The CareFind Protocol
            </h2>
            <p className="text-text-sub text-base font-semibold">
              Three precise layers engineered to simplify your doctor discovery path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[28%] left-[20%] right-[20%] h-0.5 bg-border z-0" />
            
            {[
              {
                step: "01",
                title: "Describe Symptoms",
                desc: "Type symptoms in plain words. Our neural parser extracts clinical indicators and rules out emergency flags."
              },
              {
                step: "02",
                title: "Clinical Analysis",
                desc: "We verify the urgency level, display generic medicine savings, and select the precise BMDC medical specialty needed."
              },
              {
                step: "03",
                title: "Direct Consultation",
                desc: "Select matching local doctors, book instant virtual care consultations, or check in-clinic availability slots."
              }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4 relative z-10 group">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-primary font-black text-lg shadow-md group-hover:border-primary transition-all">
                  {step.step}
                </div>
                <h3 className="font-bold text-lg text-text-base">{step.title}</h3>
                <p className="text-xs text-text-muted max-w-xs leading-relaxed font-semibold">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS / PATIENT STORIES ──────────────────────── */}
      <section className="py-24 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-base">
              Trusted by Patients Everywhere
            </h2>
            <p className="text-text-sub text-base font-semibold">
              Here is how CareFind has simplified healthcare navigation for actual patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "I developed a persistent exertional headache and was terrified. CareFind immediately ruled out emergency triggers, mapped me to a neurologist, and guided my consultation path. Splendid help.",
                name: "Sarah K.",
                location: "Dhaka, BD"
              },
              {
                quote: "Finding the right doctor used to take days of asking friends. CareFind recommended a dermatologist for my chronic eczema within minutes. The accuracy was perfect.",
                name: "Ahsan T.",
                location: "Gulshan, Dhaka"
              },
              {
                quote: "The explainable triage matches are highly reliable. I felt confident about consulting the recommended cardiologist because I could see the exact exertional triggers mapped in the report.",
                name: "Maria A.",
                location: "Dhanmondi, Dhaka"
              }
            ].map((testi, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-md hover:border-primary/20 transition-all">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-text-sub leading-relaxed font-semibold italic">
                    &ldquo;{testi.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                    {testi.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-base">{testi.name}</h4>
                    <p className="text-[10px] text-text-muted font-bold">{testi.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FINAL CTAs / CALL TO ACTION ─────────────────────────── */}
      <section className="py-24 bg-surface relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-gradient-to-r from-primary via-[#0f766e] to-[#0d1525] p-12 md:p-20 text-center border border-border shadow-2xl overflow-hidden group">
            {/* Ambient lighting inside CTA card */}
            <div className="absolute top-[-50%] right-[-30%] w-96 h-96 bg-[#2dd4bf]/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to Find Your Care Pathway?
              </h2>
              <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                Describe your symptoms in natural language. Get immediate clinical guidance, transparent assessments, and specialist referrals.
              </p>
              
              <div className="flex justify-center">
                <Link 
                  href="/analyze" 
                  className="bg-white text-primary hover:bg-[#f0fdfa] px-10 h-14 rounded-xl font-bold text-base shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Health Analysis</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
