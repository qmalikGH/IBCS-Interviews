'use client';

// ============================================================
// IBCS Interview Tool — Main Wizard Controller
// Renders the correct component for the current phase.
//
// Phase flow (between-subjects redesign):
//   welcome → stufe1 → stufe2_tasks → stufe2_alt_preview → stufe3 → completed
// ============================================================

import { useStore } from '@/lib/store';
import ProgressBar from '@/components/ProgressBar';
import WelcomeStep from '@/components/WelcomeStep';
import OnboardingStep from '@/components/OnboardingStep';
import Stage1Controller from '@/components/Stage1Controller';
import Stage2Controller from '@/components/Stage2Controller';
import AltReportPreview from '@/components/AltReportPreview';
import Stage3Controller from '@/components/Stage3Controller';
import CompletionStep from '@/components/CompletionStep';

export default function Home() {
  const currentPhase = useStore((s) => s.currentPhase);

  function renderPhase() {
    switch (currentPhase) {
      case 'welcome':
        return <WelcomeStep />;

      case 'onboarding':
        return <OnboardingStep />;

      case 'stufe1':
        return <Stage1Controller />;

      case 'stufe2_tasks':
        return <Stage2Controller />;

      case 'stufe2_alt_preview':
        return <AltReportPreview />;

      case 'stufe3':
        return <Stage3Controller />;

      case 'completed':
        return <CompletionStep />;

      default:
        return null;
    }
  }

  return (
    <>
      <ProgressBar />
      {renderPhase()}
    </>
  );
}
