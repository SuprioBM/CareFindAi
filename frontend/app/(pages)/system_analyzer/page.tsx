import { Space_Grotesk } from "next/font/google";

import {
  ClinicalIntakePanel,
  ClinicalResultPanel,
  EmergencyState,
} from "./component";
import styles from "./component/SystemAnalyzer.module.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function SystemAnalyzerPage() {
  return (
    <main
      className={`${styles.saRoot} ${spaceGrotesk.className} min-h-screen px-4 pt-8 pb-24 antialiased md:px-6 lg:px-8`}
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <EmergencyState />
        <ClinicalIntakePanel />
        <ClinicalResultPanel />
      </div>
    </main>
  );
}
