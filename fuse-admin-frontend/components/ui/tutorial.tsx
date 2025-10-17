import { tutorialSteps } from "@/utils/tutorialSteps";
import Joyride from "react-joyride";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Tutorial = ({
  runTutorial,
  steps,
  setRunTutorial,
  endLabel,
  onFinish,
}: {
  runTutorial: boolean;
  steps?: any;
  onFinish?: () => void;
  setRunTutorial?: (runTutorial: boolean) => void;
  endLabel?: string;
}) => {
  const router = useRouter();

  const handleJoyrideCallback = (data: any) => {
    const { status, action, index } = data;

    if (action === "next" && index === 2) {
      console.log('Redirigiendo a products desde step 3');
      router.push("/products");
      return;
    }

    if (action === "next" && index === 3) {
      document.getElementById("tutorial-step-4")?.click();
      return;
    }

    if (action === "next" && index === 5) {
      const el = document.getElementsByClassName("view-product")[0] as HTMLElement | undefined;
      if (el) el.click();
      return;
    }

    if (action === "next" && index === 6) {
      document.getElementById("enable-product-for-clinic")?.click();
      return;
    }

    if (status === "finished" || status === "skipped") {
      setRunTutorial?.(false);
      onFinish?.();
    }
  };

  return (
    <Joyride
      steps={steps || tutorialSteps}
      run={runTutorial}
      callback={handleJoyrideCallback}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      disableCloseOnEsc={true}
      disableOverlayClose={true}
      locale={{
        close: "Close",
        last: endLabel || "End",
        next: "Continue",
        skip: "Skip",
        back: "Back",
      }}
    />
  );
};

export default Tutorial;
