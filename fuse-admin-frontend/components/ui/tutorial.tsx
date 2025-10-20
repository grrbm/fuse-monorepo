import { tutorialSteps } from "@/utils/tutorialSteps";
import Joyride from "react-joyride";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const { authenticatedFetch } = useAuth();
  
  const handleTutorialFinish = async () => {
    try {
        console.log('🔍 Marking tutorial as finished')
        const response = await authenticatedFetch(`${API_URL}/brand-subscriptions/mark-tutorial-finished`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            console.log('✅ Tutorial marked as finished')
        } else {
            console.error('❌ Failed to mark tutorial as finished')
        }
    } catch (error) {
        console.error('❌ Error marking tutorial as finished:', error)
    }
}

  const handleJoyrideCallback = (data: any) => {
    const { status, action, index } = data;

    if (action === "next" && index === 2) {
      router.push("/products");
      return;
    }

    if (action === "next" && index === 3) {
      document.getElementById("select-products-btn")?.click();
      return;
    }

    if (action === "next" && index === 6) {
      const el = document.getElementsByClassName("enable-product-btn")[0] as HTMLElement | undefined;
      if (el) el.click();
      document.getElementById("my-products-btn")?.click();
      return;
    }

    if (status === "finished" || status === "skipped") {
      setRunTutorial?.(false);
      handleTutorialFinish();
      if (typeof window !== 'undefined') {
        localStorage.setItem('tutorialCompleted', 'true');
      }
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
