import { tutorialSteps } from "@/utils/tutorialSteps";
import Joyride from "react-joyride";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Tutorial = ({
  runTutorial,
  setRunTutorial,
  steps,
  onFinish,
}: {
  runTutorial: boolean;
  setRunTutorial: (runTutorial: boolean) => void;
  steps?: any;
  onFinish?: () => void;
}) => {
  const router = useRouter();

  const handleJoyrideCallback = (data: any) => {
    const { status, action, index } = data;

    if (action === "next" && index === 2) {
      console.log('Redirigiendo a products desde step 3');
      setRunTutorial(true);
      router.push("/products");
      return;
    }

    if (action === "next" && index === 4) {
      console.log('Abriendo formulario de nuevo producto');
      setRunTutorial(true);
      router.push("/products/new");
      return;
    }

    if (action === "next" && index === 5) {
      console.log('Tutorial completado');
      setRunTutorial(false);
      return;
    }

    if (status === "finished" || status === "skipped") {
      setRunTutorial(false);
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
        last: "End",
        next: "Continue",
        skip: "Skip",
        back: "Back",
      }}
    />
  );
};

export default Tutorial;
