'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Compass
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
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVBtl72kWI5EF3axoOLhM6wEhMpeptUBGm8fsAPSxnS8KmTO6nbHLBw5vAPXvLwHgFGZ13YS-hjN1DD9PFKv-aT3lOrDsR1NVyqX_pDVFzrbYTmuMMnIXOXFPLk-ajjxdh7EKQ2FQ4r3DfSbrJo14BFqDUm69hsVpnItoaZ56effoF7AucXGdSghz9YkZSVfesiN6mSPNjpHG3ABXGGUrkTD026QzzBK-XfXulNLHdJop_IzHsNd1WB8FzARqRhL_-UauDILXf9HY"
  }
];

export default function Home() {
  // Scenario simulation state for Hero
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [animationStep, setAnimationStep] = useState<"typing" | "extracted" | "reasoning" | "recommendation">("typing");
  
  // Interactive demo section states
  const [activeDemo, setActiveDemo] = useState(demoPresets[0]);
  const [demoState, setDemoState] = useState<"idle" | "running" | "completed">("idle");
  const [demoTypedText, setDemoTypedText] = useState("");

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

  // --- Run Interactive Demo ---
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

  return (
    <div className="dark bg-[#070b13] text-[#f1f5f9] overflow-x-hidden min-h-screen font-sans">
      <Header />
      
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#070b13] via-[#090f1d] to-[#070b13]">
        {/* Glow ambient background elements */}
        <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Premium Text Stack */}
          <div className="lg:col-span-6 text-left space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Healthcare Search, Reinvented</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black leading-[1.08] tracking-tight text-white">
              Describe Your Symptoms. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#2dd4bf]">
                Find The Right Specialist.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-text-sub max-w-xl leading-relaxed">
              Stop wandering through generic doctor directories or panic-searching symptoms. Our clinical AI maps what you feel directly to the specialist you actually need.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/analyze" 
                className="bg-primary hover:bg-primary-hover text-white px-8 h-14 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group hover:scale-[1.01]"
              >
                <span>Analyze Symptoms</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  const el = document.getElementById("demo-box");
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-white/10 hover:bg-white/5 text-white px-8 h-14 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>Try Sandbox</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="flex -space-x-3">
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6_upf-qbfL4xV0goyl6chdz_RGI5C5JrGLEMt__fPvK4Kn_xsuiDoM1vRE_JKiFs3XGw8VQY8NhgFUg4eB7PmD0pPv3RbAiZXTKUjfH_VQn4548wdS1gpRSXt1r6nSsWDwS_ZSWNixMdB1taf75sECCM0Z6zEW-Kp3dlCXsHpK7oLGw53sBy4zHmZ2xUnh9SbAr_mpgt_6-RnqRZZ05dTW7SemK7M2oUVv_7c8GOsEmU95721CqhTSzWQvGpnMD2R_HlLw3MCt7E',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuKuYomVK3_ZH34X2ELoV37NxjmteCKQGguRWX4naMPZgSR6nEkwjhEzG8unRqyGQeAzCdYoCoDTaQQASNxYmv9gfNfP1lWWBnwKGO-7Xpw5QnvtL3o7s9ZETUCwSqv5l5Jcf7KY6h4u5UZMzsfnIfuahd0ggQ61XNwokC89qmYhAprZIxRBw9jpGs2SZ3LcZXjILP9y98AgrWVFlOoNAM-_7IpM4fQgkobOd8NmDRhTlVpaqGk-R-fJnOBjg5v_bmflTi3GE4vsA',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAGh2dA1h-P0QKgXABmjJuSrPhf24EST6bl0CG36u_p7z0zfhxyHbY-j-TqPVWPeg6O8T7QXiB2NZzAAkfIuPYj41kMW7_isiysmdYC5GkQGvH00w-H7SCTc5HuMMLaAH4AWFfGn7J9rTrdadOFgNnX95rcEBwEGZQe88itLcG7VJCgtADTU8yKVjBk-wm2Ar-xQYSyjDH-gFG2gowGaVkcgqusNJXRA5q0RlgKdD9Zxv298Fn6q-V23SNbNr4xsEIR7QNVCvc9KTo',
                ].map((src, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#070b13] bg-cover bg-center" style={{ backgroundImage: `url('${src}')` }} />
                ))}
              </div>
              <p className="text-xs font-medium text-text-muted">
                Engineered with clinical-grade accuracy. Guided over <span className="text-primary font-bold">12,000+ patients</span>.
              </p>
            </div>
          </div>

          {/* Right Side: Immersive AI Reasoning Canvas */}
          <div className="lg:col-span-6 w-full flex justify-center relative">
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="w-full max-w-xl bg-[#0d1525]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-5 min-h-[460px]">
              {/* Card Gloss Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-white/5 px-3 py-1 rounded-md border border-white/5">
                  <Brain className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>CareFind Triage Core</span>
                </div>
              </div>

              {/* Step 1: User Input simulation */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Patient Statement</p>
                <div className="bg-[#080d17] border border-white/5 rounded-xl p-4 min-h-[70px] text-sm text-white font-medium flex items-center leading-relaxed">
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
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Symptom Extraction</p>
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
                    className="space-y-2"
                  >
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Clinical Reasoning Engine</p>
                    <div className="bg-primary/[0.02] border border-primary/10 rounded-xl p-4 text-xs font-medium text-text-sub leading-relaxed flex items-start gap-2.5">
                      <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p>{heroScenarios[scenarioIndex].reasoning}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 4: Final Recommendation slide-up */}
              <AnimatePresence>
                {animationStep === "recommendation" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-auto border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        <Activity className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Matched Specialty</p>
                        <h4 className="font-bold text-base text-white">{heroScenarios[scenarioIndex].specialist}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Match Score</p>
                        <p className="text-sm font-black text-primary">{heroScenarios[scenarioIndex].match}% Accuracy</p>
                      </div>
                      <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${heroScenarios[scenarioIndex].urgencyStyle}`}>
                        {heroScenarios[scenarioIndex].urgency}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* ── TRUST BAR / CRITICAL STATISTICS ─────────────────────── */}
      <section className="py-12 bg-[#060a12] border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center text-center">
            {[
              { val: "900+", label: "Verified Specialists" },
              { val: "13+", label: "Clinical Specialties" },
              { val: "Dhaka", label: "Coverage Zone" },
              { val: "98%", label: "AI Diagnostic Match" },
              { val: "< 5 Min", label: "Average Session Time" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1.5 px-4 border-r border-white/5 last:border-none">
                <p className="text-2xl sm:text-3xl font-black text-white bg-clip-text bg-gradient-to-b from-white to-text-muted">
                  {stat.val}
                </p>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW THE CLINICAL WORKFLOW THINKS ────────────────────── */}
      <section className="py-24 bg-[#070b13] relative" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5" />
              <span>Symptom-to-Specialist Engine</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              We Don&apos;t Just Guess. We Map the Pathways.
            </h2>
            <p className="text-text-sub text-base sm:text-lg">
              Generic search engines match words. CareFind analyzes relationships, rules out red flags, and evaluates symptom severity before routing you to care.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
            {/* Background connecting line */}
            <div className="hidden lg:block absolute top-[40%] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 -z-10" />

            {/* Node 1: Input Statement */}
            <div className="bg-[#090f1d] border border-white/5 rounded-2xl p-5 shadow-xl relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-text-muted">1</div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">User Description</p>
              <div className="text-sm font-semibold text-white bg-[#060a12] p-3.5 rounded-xl border border-white/5">
                &ldquo;My chest hurts when I climb stairs.&rdquo;
              </div>
            </div>

            {/* Node 2: Parameter Extraction */}
            <div className="bg-[#090f1d] border border-white/5 rounded-2xl p-5 shadow-xl relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-text-muted">2</div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Extracted Parameters</p>
              <div className="space-y-1.5">
                {["Chest Pain", "Exertion Trigger", "Duration: 2 Weeks"].map((tag) => (
                  <div key={tag} className="flex items-center justify-between text-xs bg-primary/5 text-primary border border-primary/10 p-2.5 rounded-lg font-bold">
                    <span>{tag}</span>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Node 3: AI Reasoning Pathway */}
            <div className="bg-[#090f1d] border border-white/5 rounded-2xl p-5 shadow-xl relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-text-muted">3</div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Reasoning Analysis</p>
              <div className="bg-[#060a12] p-3 rounded-xl border border-white/5 text-[11px] font-medium text-text-sub space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
                  <span>Pattern Matching</span>
                </div>
                <p>Cross-referencing exertional chest pain with coronary registry questions.</p>
              </div>
            </div>

            {/* Node 4: Specialist Recommended */}
            <div className="bg-gradient-to-b from-primary/10 to-[#090f1d] border border-primary/30 rounded-2xl p-5 shadow-xl relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">4</div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Primary Specialist</p>
              <div className="bg-primary hover:bg-primary-hover p-4 rounded-xl shadow-lg text-center font-bold text-white transition-all scale-[1.02]">
                Cardiologist
                <div className="text-[10px] opacity-90 font-medium mt-1">98% Fit Accuracy</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── INTERACTIVE SANDBOX DEMO ───────────────────────────── */}
      <section className="py-24 bg-[#060a12] border-y border-white/5" id="demo-box">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Interactive Sandbox</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Try It in Real-Time
            </h2>
            <p className="text-text-sub text-base">
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
                      : "bg-[#0b1220] border-white/5 hover:border-white/20 text-text-sub"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Dashboard */}
          <div className="max-w-4xl mx-auto bg-[#0d1525] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Workspace details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Simulator Left Pane: Prompt Input */}
              <div className="flex flex-col justify-between p-5 bg-[#070b13] border border-white/5 rounded-xl space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Input Message</p>
                  <div className="text-sm md:text-base text-white font-medium leading-relaxed min-h-[120px] bg-[#090f1d]/50 p-4 border border-white/5 rounded-lg">
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
              <div className="flex flex-col justify-between p-5 bg-[#070b13] border border-white/5 rounded-xl min-h-[260px]">
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
                    <div className="space-y-1.5 bg-[#090f1d] p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Reasoning Pathway</p>
                      <p className="text-xs text-text-sub leading-relaxed font-semibold">
                        {activeDemo.explanation}
                      </p>
                    </div>

                    {/* Rec Specialist info */}
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Matched Specialist</p>
                        <h4 className="font-bold text-lg text-white">{activeDemo.specialist}</h4>
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
            <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1.5 font-semibold text-primary">
                <ShieldCheck className="w-4 h-4 shrink-0" /> Safety checks active
              </span>
              <span>Fully responsive clinical mapping environment.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOCTOR DISCOVERY SHOWCASE (HORIZONTAL SLIDER) ────────── */}
      <section className="py-24 bg-[#070b13] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Specialist Discovery Showcase</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Discover Qualified Providers
              </h2>
              <p className="text-text-sub text-base max-w-xl">
                Browse our verified care network. Connect directly with highly accurate clinical specialists in your immediate neighborhood.
              </p>
            </div>
            
            <Link 
              href="/analyze" 
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-hover group shrink-0"
            >
              <span>Map Specialists Near You</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Horizontal scroll grid */}
          <div className="flex gap-6 overflow-x-auto pb-8 pt-2 no-scrollbar scroll-smooth">
            {mockDoctors.map((doc, idx) => (
              <div 
                key={idx}
                className="w-80 shrink-0 bg-[#0d1525] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-primary/30 transition-all hover:scale-[1.01] hover:shadow-xl shadow-black/10 group"
              >
                <div className="space-y-4">
                  {/* Doctor Profile card */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-xl border border-white/10 bg-cover bg-center shrink-0" 
                      style={{ backgroundImage: `url('${doc.image}')` }}
                    />
                    <div>
                      <h4 className="font-bold text-base text-white group-hover:text-primary transition-colors">{doc.name}</h4>
                      <p className="text-xs text-text-muted font-bold">{doc.specialty}</p>
                    </div>
                  </div>

                  {/* Rating + Availability detail */}
                  <div className="flex justify-between items-center bg-[#070b13] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-white">{doc.rating}</span>
                      <span className="text-[10px] text-text-muted">({doc.reviews})</span>
                    </div>
                    <div className="text-xs text-[#2dd4bf] font-bold">
                      {doc.experience}
                    </div>
                  </div>

                  {/* Location & Booking detail */}
                  <div className="space-y-2 text-xs font-semibold text-text-sub">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{doc.distance}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#2dd4bf] shrink-0 animate-pulse" />
                      <span>{doc.avail}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-white/5">
                  <Link
                    href="/analyze"
                    className="w-full flex items-center justify-center rounded-xl h-10 border border-primary/20 hover:bg-primary/5 text-primary text-xs font-bold transition-all"
                  >
                    Select Specialist
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── EXPLAINABLE AI FLOW DIAGRAM SECTION ────────────────── */}
      <section className="py-24 bg-[#060a12] border-t border-white/5 relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Visual explainable graph left side */}
            <div className="lg:col-span-6 w-full relative flex justify-center order-2 lg:order-1">
              <div className="absolute inset-0 bg-primary/20 blur-[130px] rounded-full pointer-events-none" />
              
              <div className="w-full max-w-md bg-[#0d1525]/90 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 relative">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-primary" />
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Decision Pathway Audit Log</span>
                </div>

                <div className="space-y-4">
                  {/* Step A */}
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 mt-0.5">A</div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Symptom Node Checked</p>
                      <p className="text-[11px] text-text-muted">Primary symptom matches headache database.</p>
                    </div>
                  </div>

                  {/* Connecting line */}
                  <div className="w-0.5 h-6 bg-primary/20 ml-3" />

                  {/* Step B */}
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 mt-0.5">B</div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Rule Exclusion Applied</p>
                      <p className="text-[11px] text-text-muted">Checked for neurological red flags (no stiff neck, no photophobia).</p>
                    </div>
                  </div>

                  {/* Connecting line */}
                  <div className="w-0.5 h-6 bg-primary/20 ml-3" />

                  {/* Step C */}
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 mt-0.5">C</div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Demographics Filter</p>
                      <p className="text-[11px] text-text-muted">Adjusted diagnostic scores for Age: 25, Gender: Male parameters.</p>
                    </div>
                  </div>

                  {/* Connecting line */}
                  <div className="w-0.5 h-6 bg-primary/20 ml-3" />

                  {/* Step D */}
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 flex items-center justify-center text-[10px] font-black text-[#2dd4bf] shrink-0 mt-0.5">D</div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Final Recommendation Output</p>
                      <p className="text-[11px] text-[#2dd4bf] font-bold">Primary Specialist: Neurologist (Confidence match 94%)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#070b13] p-3 rounded-xl border border-white/5 text-[10px] font-medium text-text-muted leading-relaxed">
                  CareFind does not diagnose. It analyzes symptom vectors and outputs safety-conscious specialty navigation paths based on public clinical guidelines.
                </div>
              </div>
            </div>

            {/* Right text panel */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2" >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Explainable AI Architecture</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                We Don&apos;t Just Match. <br />We Explain Why.
              </h2>
              <p className="text-text-sub text-base leading-relaxed">
                Most platforms operate as black boxes, recommending doctors based on advertisement bidding. CareFind details every step of the decision flow:
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: "No Advertisement Bias", text: "Specialists are ranked purely by symptom relevance and geographical proximity, not bidding." },
                  { title: "Transparency Audits", text: "Every recommendation includes a diagnostic explanation of why that specific specialty matches." },
                  { title: "Safety Safeguards", text: "The engine runs real-time emergency checks first, automatically flagging life-threatening symptoms." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-text-muted leading-normal mt-0.5">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / PATIENT STORIES ──────────────────────── */}
      <section className="py-24 bg-[#070b13] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Trusted by Patients Everywhere
            </h2>
            <p className="text-text-sub text-base">
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
              <div key={idx} className="bg-[#0d1525] border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                    ))}
                  </div>
                  <p className="text-sm text-text-sub leading-relaxed font-semibold italic">
                    &ldquo;{testi.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                    {testi.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{testi.name}</h4>
                    <p className="text-[10px] text-text-muted font-semibold">{testi.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FINAL CTAs / CALL TO ACTION ─────────────────────────── */}
      <section className="py-24 bg-[#070b13] relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-gradient-to-r from-primary via-[#0f766e] to-[#0f172a] p-12 md:p-20 text-center border border-white/10 shadow-2xl overflow-hidden group">
            {/* Ambient lighting inside CTA card */}
            <div className="absolute top-[-50%] right-[-30%] w-96 h-96 bg-[#2dd4bf]/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to Find Your Care Pathway?
              </h2>
              <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Describe your symptoms in natural language. Get immediate clinical guidance, transparent assessments, and specialist referrals.
              </p>
              
              <div className="flex justify-center">
                <Link 
                  href="/analyze" 
                  className="bg-white text-primary hover:bg-[#f0fdfa] px-10 h-14 rounded-xl font-black text-base shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
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
