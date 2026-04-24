"use client";

import { Space_Grotesk } from "next/font/google";

import {
  ClinicalIntakePanel,
  ClinicalResultPanel,
  EmergencyState,
} from "./component";
import styles from "./component/SystemAnalyzer.module.css";
import { useTriageSession } from "./hooks/useTriageSession";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function SystemAnalyzerPage() {
  const {
    sessionId,
    hasStarted,
    messages,
    nextQuestion,
    triageResult,
    isEmergencyStop,
    age,
    setAge,
    gender,
    setGender,
    duration,
    setDuration,
    input,
    setInput,
    loading,
    error,
    isComplete,
    submitCurrentInput,
    submitOption,
    resetSession,
  } = useTriageSession();

  const shouldShowEmergency = triageResult?.urgency === "EMERGENCY";

  return (
    <main
      className={`${styles.saRoot} ${spaceGrotesk.className} min-h-screen px-4 pt-8 pb-24 antialiased md:px-6 lg:px-8`}
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {shouldShowEmergency ? (
          <EmergencyState
            urgency={triageResult.urgency}
            nextStep={triageResult.next_step}
          />
        ) : null}

        <ClinicalIntakePanel
          sessionId={sessionId}
          hasStarted={hasStarted}
          messages={messages}
          nextQuestion={nextQuestion}
          loading={loading}
          error={error}
          input={input}
          onInputChange={setInput}
          onSubmit={() => {
            void submitCurrentInput();
          }}
          onSelectOption={(option) => {
            void submitOption(option);
          }}
          isEmergencyStop={isEmergencyStop}
          isComplete={isComplete}
          age={age}
          onAgeChange={setAge}
          gender={gender}
          onGenderChange={setGender}
          duration={duration}
          onDurationChange={setDuration}
        />

        <ClinicalResultPanel
          triageResult={triageResult}
          loading={loading}
          isComplete={isComplete}
          onReset={resetSession}
        />
      </div>
    </main>
  );
}
