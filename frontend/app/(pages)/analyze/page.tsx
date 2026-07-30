'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { AnalysisResponse } from '@/types/types';
import SymptomAnalysisResult from '@/components/pageComponents/SymptomAnalysisResult';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  options?: string[];
};

export default function SymptomsPage() {
  const [step, setStep] = useState<'intake' | 'chat' | 'completed'>('intake');
  const [sessionId, setSessionId] = useState<string>('');
  
  // Intake Form States
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [primarySymptom, setPrimarySymptom] = useState<string>('');
  
  // Chat States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [nextQuestionKey, setNextQuestionKey] = useState<string | null>(null);
  const [nextQuestionOptions, setNextQuestionOptions] = useState<string[]>([]);
  const [clinicalState, setClinicalState] = useState<any>(null);
  const [triageResult, setTriageResult] = useState<any>(null);
  
  // UX States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Start the state-driven triage session
  async function handleStartTriage(e: React.FormEvent) {
    e.preventDefault();
    if (!primarySymptom.trim()) {
      setError('Please describe your primary symptom first.');
      return;
    }
    if (!age || !gender || !duration) {
      setError('Please fill in all demographic details before starting.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const newSessionId = `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setSessionId(newSessionId);

      const res = await apiFetch('/triage/start', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: newSessionId,
          message: primarySymptom,
          age: Number(age),
          gender: gender,
          duration: duration
        }),
      });

      const parsed = await res.json();
      if (!res.ok) {
        throw new Error(parsed?.message || 'Failed to start symptom analysis.');
      }

      const { sessionId: responseSessionId, status, clinicalState: responseState, nextQuestion, triageResult: responseTriage } = parsed;
      if (responseSessionId) {
        setSessionId(responseSessionId);
      }
      setClinicalState(responseState);

      // Populate initial message list
      const initialMessages: Message[] = [
        { role: 'user', content: primarySymptom }
      ];

      if (nextQuestion) {
        initialMessages.push({
          role: 'assistant',
          content: nextQuestion.question,
          options: nextQuestion.options || []
        });
        setNextQuestionKey(nextQuestion.key);
        setNextQuestionOptions(nextQuestion.options || []);
        setStep('chat');
      }

      if (status === 'COMPLETED' || responseTriage) {
        setTriageResult(responseTriage);
        setStep('completed');
      }

      setMessages(initialMessages);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to initialize session. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Continue the triage by sending message responses
  async function handleSendMessage(responseContent: string) {
    if (!responseContent.trim() || loading) return;

    setError('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: responseContent }]);
    setInputText('');

    try {
      const res = await apiFetch('/triage/message', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          message: responseContent
        }),
      });

      const parsed = await res.json();
      if (!res.ok) {
        throw new Error(parsed?.message || 'Failed to submit response.');
      }

      const { sessionId: responseSessionId, status, clinicalState: responseState, nextQuestion, triageResult: responseTriage } = parsed;
      if (responseSessionId) {
        setSessionId(responseSessionId);
      }
      setClinicalState(responseState);

      if (nextQuestion) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: nextQuestion.question,
            options: nextQuestion.options || []
          }
        ]);
        setNextQuestionKey(nextQuestion.key);
        setNextQuestionOptions(nextQuestion.options || []);
      }

      if (status === 'COMPLETED' || responseTriage) {
        setTriageResult(responseTriage);
        setNextQuestionKey(null);
        setNextQuestionOptions([]);
        setStep('completed');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong. Please resend your answer.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep('intake');
    setSessionId('');
    setAge('');
    setGender('');
    setDuration('');
    setPrimarySymptom('');
    setMessages([]);
    setInputText('');
    setNextQuestionKey(null);
    setNextQuestionOptions([]);
    setClinicalState(null);
    setTriageResult(null);
    setError('');
  }

  // Map backend triage result to props expected by SymptomAnalysisResult component
  const mappedAnalysisResult: AnalysisResponse | null = triageResult ? {
    specialist: triageResult.specialties?.[0] || 'General Physician',
    specialists: triageResult.specialties || [],
    score: triageResult.score || 80,
    urgency: triageResult.urgency?.toLowerCase() || 'low',
    matchedSymptoms: clinicalState?.symptoms || [],
    explanation: triageResult.next_step || 'Consult recommended medical specialist.',
    warningMessage: triageResult.reasons?.[0] || '',
    canShowDoctors: triageResult.urgency?.toLowerCase() !== 'self-care'
  } : null;

  return (
    <div className="bg-surface text-text-base min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="px-4 py-4 mb-6 flex flex-col gap-2 border-b border-primary/10">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-primary">
            Symptom Triage Analyzer
          </h1>
          <p className="text-text-muted text-base leading-normal">
            Explain your health concerns in natural language. Our clinical system evaluates symptoms, severity, and directs you to Dhaka's optimal medical specialists.
          </p>
        </div>

        {error && (
          <div className="mx-4 mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* STEP 1: INTAKE SCREEN */}
        {step === 'intake' && (
          <form onSubmit={handleStartTriage} className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            
            {/* Left side: Demographics intake */}
            <div className="md:col-span-1 bg-card border border-primary/10 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary border-b border-primary/10 pb-3">
                <span className="material-symbols-outlined">person</span> Demographics
              </h2>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-sub">Age</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="rounded-xl border border-primary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary p-3 text-sm font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-sub">Gender</label>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="rounded-xl border border-primary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary p-3 text-sm font-medium"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-sub">Duration of Symptoms</label>
                <select
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="rounded-xl border border-primary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary p-3 text-sm font-medium"
                >
                  <option value="">Select Duration</option>
                  <option value="few_hours">A few hours</option>
                  <option value="1_day">1 day</option>
                  <option value="2_days">2 days</option>
                  <option value="3_to_5_days">3 to 5 days</option>
                  <option value="1_week">1 week</option>
                  <option value="2_weeks_plus">More than 2 weeks</option>
                </select>
              </div>
            </div>

            {/* Right side: Describe symptoms */}
            <div className="md:col-span-2 bg-card border border-primary/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary border-b border-primary/10 pb-3">
                  <span className="material-symbols-outlined">medical_information</span> Medical Concern
                </h2>
                <p className="text-sm text-text-muted">
                  Provide a detailed description of how you are feeling (e.g. "I have a sharp headache behind my left eye and felt slightly nauseous this morning").
                </p>
                <textarea
                  required
                  value={primarySymptom}
                  onChange={(e) => setPrimarySymptom(e.target.value)}
                  placeholder="Describe your symptoms in your own words..."
                  className="w-full min-h-[160px] rounded-xl border border-primary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary p-4 text-base font-normal resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-xl h-12 bg-primary hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed text-white text-base font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.01]"
              >
                <span className="material-symbols-outlined mr-2">
                  {loading ? 'hourglass_top' : 'auto_awesome'}
                </span>
                {loading ? 'Starting Analysis...' : 'Start Clinical Triage'}
              </button>
            </div>

          </form>
        )}

        {/* STEP 2 & 3: ACTIVE CHAT SCREEN / RESULTS */}
        {(step === 'chat' || step === 'completed') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
            
            {/* Left Column: Chat + Results Box */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Chat Thread Panel */}
              <div className="bg-card border border-primary/10 rounded-2xl shadow-sm flex flex-col min-h-[500px] max-h-[650px] justify-between overflow-hidden">
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-primary/5 text-text-base border border-primary/10 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl rounded-bl-none px-5 py-4 space-y-1.5 max-w-[200px] animate-pulse">
                        <div className="flex gap-1.5 justify-center items-center h-4">
                          <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input / Action Controls */}
                <div className="p-4 border-t border-primary/10 bg-primary/[0.01] flex flex-col gap-3">
                  
                  {/* Render Quick-Action Option Buttons if provided by backend */}
                  {step === 'chat' && nextQuestionOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-2 animate-fade-in">
                      {nextQuestionOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSendMessage(opt)}
                          disabled={loading}
                          className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 'chat' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMessage(inputText);
                        }}
                        disabled={loading}
                        placeholder="Type your response here..."
                        className="flex-1 rounded-xl border border-primary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary px-4 py-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendMessage(inputText)}
                        disabled={loading || !inputText.trim()}
                        className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600 font-semibold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Clinical Triage Evaluation Complete
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full flex items-center justify-center rounded-xl h-11 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors"
                      >
                        Start New Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Render Final Recommendation Panel once completed */}
              {step === 'completed' && mappedAnalysisResult && (
                <div className="animate-fade-in w-full">
                  <SymptomAnalysisResult
                    analysis={mappedAnalysisResult}
                    loading={loading}
                    searchedSymptoms={primarySymptom}
                  />
                </div>
              )}
            </div>

            {/* Sidebar Cockpit / Clinical Progress Panel */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Live Clinical Cockpit */}
              <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/10 pb-3">
                  <span className="material-symbols-outlined">dashboard</span> Clinical Progress
                </h3>

                <div className="space-y-4">
                  {/* Demographics Card */}
                  <div className="bg-surface/50 border border-primary/5 rounded-xl p-3 flex justify-between text-xs font-semibold">
                    <div>
                      <span className="text-text-muted">Age: </span>
                      <span className="text-text-base">{clinicalState?.demographics?.age || 'N/A'}</span>
                    </div>
                    <div className="border-l border-primary/10 h-4 mx-2" />
                    <div>
                      <span className="text-text-muted">Gender: </span>
                      <span className="text-text-base capitalize">{clinicalState?.demographics?.gender || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Identified Symptoms list */}
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Identified Symptoms</p>
                    {clinicalState?.symptoms && clinicalState.symptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {clinicalState.symptoms.map((sym: string) => (
                          <span
                            key={sym}
                            className="bg-primary/10 text-primary border border-primary/5 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize"
                          >
                            {sym.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-text-muted">No symptoms matched yet.</p>
                    )}
                  </div>

                  {/* Red flags triggers */}
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Red Flags Evaluated</p>
                    {clinicalState?.redFlags && clinicalState.redFlags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {clinicalState.redFlags.map((flag: string) => (
                          <span
                            key={flag}
                            className="bg-red-500/10 text-red-500 border border-red-500/10 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize"
                          >
                            {flag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-text-muted">No red flags triggered.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}