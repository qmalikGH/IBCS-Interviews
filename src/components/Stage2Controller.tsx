'use client';

// ============================================================
// IBCS Interview Tool — Stage2Controller
// Between-subjects design: each participant sees ONE report
// (native OR IBCS), determined by store.reportOrder.
//
// The controller resolves which base URL to use and passes it
// to ReportTaskStep, which builds per-task iframe URLs using
// each task's pageName field.
// ============================================================

import { useStore } from '@/lib/store';
import ReportTaskStep from '@/components/ReportTaskStep';
import { stufe2Tasks } from '@/config/tasks';
import { stripPageName } from '@/config/pairs';

// ── Power BI base URLs (Stufe 2 reports) ────────────────────
// Strip any default pageName from the env URL — per-task
// navigation will append the correct one.

const NATIVE_REPORT_BASE = stripPageName(
  process.env.NEXT_PUBLIC_PBI_NATIVE_URL ||
  'https://app.powerbi.com/view?r=PLACEHOLDER_NATIVE',
);

const IBCS_REPORT_BASE = stripPageName(
  process.env.NEXT_PUBLIC_PBI_IBCS_URL ||
  'https://app.powerbi.com/view?r=PLACEHOLDER_IBCS',
);

// ── Component ─────────────────────────────────────────────────

export default function Stage2Controller() {
  const reportOrder = useStore((s) => s.reportOrder);
  const nextStep    = useStore((s) => s.nextStep);

  // Between-subjects: participant is assigned exactly ONE report
  const isNativeAssigned =
    reportOrder === 'native_first' || reportOrder === null;

  const assignedBaseUrl: string =
    isNativeAssigned ? NATIVE_REPORT_BASE : IBCS_REPORT_BASE;

  const assignedType: 'native' | 'ibcs' =
    isNativeAssigned ? 'native' : 'ibcs';

  return (
    <ReportTaskStep
      reportBaseUrl={assignedBaseUrl}
      reportType={assignedType}
      tasks={stufe2Tasks}
      stage="stufe2_tasks"
      onComplete={nextStep}
    />
  );
}
