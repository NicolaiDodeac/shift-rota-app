"use client";

import LoaderOverlay from "@/components/LoaderOverlay";
import ResultOverlay from "@/components/ResultOverlay";
import { ShiftForm } from "@/components/ShiftForm";
import { ShiftPreview } from "@/components/ShiftPreview";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useShiftForm } from "@/lib/hooks/useShiftForm";
import s from "./page.module.css";

export default function Page() {
  const {
    status,
    cfg,
    setCfg,
    useDedicated,
    setUseDedicated,
    dedicatedName,
    setDedicatedName,
    dedicatedColorId,
    setDedicatedColorId,
    isPushing,
    result,
    setResult,
    progress,
    events,
    pushToGoogle,
    deleteFromGoogle,
    qs,
  } = useShiftForm();

  return (
    <div className={s.container}>
      <h1 className={s.title}>4-on-4-off Shift Rota</h1>

      <SignInPrompt status={status} />

      <ShiftForm
        cfg={cfg}
        setCfg={setCfg}
        useDedicated={useDedicated}
        setUseDedicated={setUseDedicated}
        dedicatedName={dedicatedName}
        setDedicatedName={setDedicatedName}
        dedicatedColorId={dedicatedColorId}
        setDedicatedColorId={setDedicatedColorId}
        isPushing={isPushing}
        onPush={pushToGoogle}
        onDelete={deleteFromGoogle}
        qs={qs}
      />

      <ShiftPreview events={events} />

      {/* Overlays */}
      {isPushing && (
        <LoaderOverlay
          title="Syncing to Google Calendar…"
          sub="Please keep this tab open."
          progressCurrent={progress?.current}
          progressTotal={progress?.total}
        />
      )}
      {result && (
        <ResultOverlay
          ok={result.ok}
          title={result.title}
          sub={result.sub}
          onClose={() => setResult(null)}
          autoHideMs={2200}
        />
      )}
    </div>
  );
}
