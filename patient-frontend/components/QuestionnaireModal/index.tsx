import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, ModalContent, ModalBody } from "@heroui/react";
import { stripePromise } from "../../lib/stripe";
import { QuestionnaireModalProps } from "./types";
import { useClinicFromDomain } from "../../hooks/useClinicFromDomain";
import { useQuestionnaireModal } from "./hooks/useQuestionnaireModal";
import { LoadingState } from "./components/LoadingState";
import { ModalHeader } from "./components/ModalHeader";
import { CheckoutStepView } from "./components/CheckoutStepView";
import { ProductSelectionStepView } from "./components/ProductSelectionStepView";
import { ProgressBar } from "./components/ProgressBar";
import { StepHeader } from "./components/StepHeader";
import { RecommendedTreatmentView } from "./components/RecommendedTreatmentView";
import { BMICalculator } from "./components/BMICalculator";
import { SuccessStoriesView } from "./components/SuccessStoriesView";
import { AccountCreationStep, EmailVerificationStep, EmailInputModal } from "./AccountCreationStep";
import { RegularQuestionsView } from "./components/RegularQuestionsView";
import { InformationalStepView } from "./components/InformationalStepView";
import { StepNavigationButtons } from "./components/StepNavigationButtons";

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const { clinic: domainClinic, isLoading: isLoadingClinic } = useClinicFromDomain();
  
  const {
    // Data
    questionnaire,
    loading,
    // State
    currentStepIndex,
    answers,
    errors,
    selectedProducts,
    clientSecret,
    paymentIntentId,
    paymentStatus,
    shippingInfo,
    setShippingInfo,
    // Auth state
    isSignInMode,
    setIsSignInMode,
    signInEmail,
    setSignInEmail,
    signInPassword,
    setSignInPassword,
    signInError,
    setSignInError,
    isSigningIn,
    isEmailVerificationMode,
    setIsEmailVerificationMode,
    verificationEmail,
    setVerificationEmail,
    verificationCode,
    setVerificationCode,
    verificationError,
    showEmailModal,
    setShowEmailModal,
    emailModalLoading,
    emailModalError,
    setEmailModalError,
    // Plans & theme
    plans,
    selectedPlan,
    theme,
    themeVars,
    pharmacyCoverages,
    // Helpers
    getTotalSteps,
    isProductSelectionStep,
    isCheckoutStep,
    getCurrentQuestionnaireStep,
    replaceCurrentVariables,
    // Handlers
    handleAnswerChange,
    handleRadioChange,
    handleCheckboxChange,
    handleProductQuantityChange,
    handleSignIn,
    handleGoogleSignIn,
    emailVerificationHandlers,
    handlePlanSelection,
    createSubscriptionForPlan,
    handlePaymentSuccess,
    handlePaymentError,
    handleNext,
    handlePrevious,
    setErrors
  } = useQuestionnaireModal(
    props,
    domainClinic,
    isLoadingClinic
  );

  if (loading || !questionnaire || !questionnaire.steps) {
    return <LoadingState isOpen={isOpen} onClose={onClose} loading={loading} />;
  }

  const totalSteps = getTotalSteps();
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const currentStep = getCurrentQuestionnaireStep();

  // Determine step title and description
  let stepTitle = '';
  let stepDescription = '';
  if (isProductSelectionStep()) {
    stepTitle = 'Product Selection';
    stepDescription = 'Choose your NAD+ products';
  } else if (isCheckoutStep()) {
    stepTitle = 'Complete Your Order';
    stepDescription = 'Secure checkout for your weight management treatment';
  } else if (currentStep) {
    stepTitle = replaceCurrentVariables(currentStep.title);
    stepDescription = replaceCurrentVariables(currentStep.description || '');
  }

  if (!currentStep && !isProductSelectionStep() && !isCheckoutStep()) {
    handleNext();
    return null;
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onOpenChange={(open) => {
          if (!open && showEmailModal) return;
        }}
        isDismissable={!showEmailModal}
        isKeyboardDismissDisabled={showEmailModal}
        size="full"
        classNames={{
          base: "m-0 sm:m-0 max-w-full max-h-full",
          wrapper: "w-full h-full !z-40",
          backdrop: showEmailModal ? "!hidden" : "bg-overlay/50 !z-40"
        }}
        hideCloseButton
      >
        <ModalContent
          className="h-full bg-gray-50 questionnaire-theme"
          style={themeVars}
        >
          <ModalBody
            className="p-0 h-full flex flex-col"
            {...(showEmailModal ? { inert: '' as any } : {})}
          >
            <ModalHeader
              onClose={onClose}
              currentStep={currentStepIndex}
              totalSteps={totalSteps}
            />

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className={`w-full ${isCheckoutStep() ? 'max-w-5xl' : 'max-w-md'} mx-auto min-h-full flex flex-col justify-center`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {isCheckoutStep() ? (
                      <CheckoutStepView
                        progressPercent={progressPercent}
                        theme={theme}
                        onPrevious={handlePrevious}
                        canGoBack={currentStepIndex > 0}
                        clinic={domainClinic ? { name: domainClinic.name, logo: (domainClinic as any).logo } : null}
                        isLoadingClinic={isLoadingClinic}
                        plans={plans}
                        selectedPlan={selectedPlan}
                        onPlanChange={handlePlanSelection}
                        paymentStatus={paymentStatus}
                        clientSecret={clientSecret}
                        shippingInfo={shippingInfo}
                        onShippingInfoChange={(field, value) =>
                          setShippingInfo((prev) => ({ ...prev, [field]: value }))
                        }
                        onRetryPaymentSetup={() => {
                          // Handled in hook
                        }}
                        onCreateSubscription={createSubscriptionForPlan}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        stripePromise={stripePromise}
                        questionnaireProducts={questionnaire.treatment?.products}
                        selectedProducts={selectedProducts}
                        treatmentName={props.treatmentName ?? props.productName ?? ''}
                        pharmacyCoverages={pharmacyCoverages}
                        onNext={handleNext}
                      />
                    ) : isProductSelectionStep() ? (
                      <ProductSelectionStepView
                        progressPercent={progressPercent}
                        theme={theme}
                        products={questionnaire.treatment?.products}
                        selectedProducts={selectedProducts}
                        onProductQuantityChange={handleProductQuantityChange}
                        onNext={handleNext}
                        isCheckoutStep={isCheckoutStep}
                        paymentStatus={paymentStatus}
                        isLastStep={isLastStep}
                        isProductSelectionStep={isProductSelectionStep}
                      />
                    ) : (
                      <>
                        <ProgressBar progressPercent={progressPercent} color={theme.primary} backgroundColor="#E5E7EB" />
                        <StepHeader
                          onPrevious={handlePrevious}
                          canGoBack={currentStepIndex > 0}
                          clinic={domainClinic ? { name: domainClinic.name, logo: (domainClinic as any).logo } : null}
                          isLoadingClinic={isLoadingClinic}
                        />

                        {currentStep?.title === 'Recommended Treatment' ? (
                          <RecommendedTreatmentView
                            onAnswerChange={handleAnswerChange}
                            onNext={handleNext}
                          />
                        ) : (currentStep?.title === 'Body Measurements' || currentStep?.questions?.some(q => q.questionSubtype === 'bmi')) ? (
                          <BMICalculator
                            currentStep={currentStep}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                          />
                        ) : currentStep?.title === 'Success Stories' ? (
                          <SuccessStoriesView />
                        ) : currentStep?.title === 'Create Your Account' ? (
                          isEmailVerificationMode ? (
                            <EmailVerificationStep
                              email={verificationEmail}
                              code={verificationCode}
                              onCodeChange={setVerificationCode}
                              onVerify={emailVerificationHandlers.handleVerifyCode}
                              onBack={() => {
                                setIsEmailVerificationMode(false);
                                setVerificationCode('');
                              }}
                              onResendCode={emailVerificationHandlers.handleResendCode}
                              error={verificationError}
                              isVerifying={false}
                              clinicName={domainClinic?.name}
                            />
                          ) : (
                            <AccountCreationStep
                              isSignInMode={isSignInMode}
                              onToggleMode={() => {
                                setIsSignInMode(!isSignInMode);
                                setSignInEmail('');
                                setSignInPassword('');
                                if (setSignInError) setSignInError('');
                              }}
                              firstName={answers['firstName'] || ''}
                              lastName={answers['lastName'] || ''}
                              email={answers['email'] || ''}
                              mobile={answers['mobile'] || ''}
                              onFieldChange={handleAnswerChange}
                              signInEmail={signInEmail}
                              signInPassword={signInPassword}
                              signInError={signInError}
                              isSigningIn={isSigningIn}
                              onSignInEmailChange={(value) => {
                                setSignInEmail(value);
                                if (setSignInError) setSignInError('');
                              }}
                              onSignInPasswordChange={(value) => {
                                setSignInPassword(value);
                                if (setSignInError) setSignInError('');
                              }}
                              onSignIn={handleSignIn}
                              onEmailSignIn={emailVerificationHandlers.handleEmailSignIn}
                              onGoogleSignIn={handleGoogleSignIn}
                              clinicId={domainClinic?.id}
                              clinicName={domainClinic?.name}
                            />
                          )
                        ) : currentStep?.questions && currentStep.questions.length > 0 ? (
                          <RegularQuestionsView
                            currentStep={currentStep}
                            answers={answers}
                            errors={errors}
                            theme={theme}
                            replaceCurrentVariables={replaceCurrentVariables}
                            onAnswerChange={handleAnswerChange}
                            onRadioChange={handleRadioChange}
                            onCheckboxChange={handleCheckboxChange}
                            setErrors={setErrors}
                          />
                        ) : (
                          <InformationalStepView
                            stepTitle={stepTitle}
                            stepDescription={stepDescription}
                          />
                        )}

                        {!(isCheckoutStep() && paymentStatus !== 'succeeded') && !(currentStep?.title === 'Create Your Account' && (isSignInMode || isEmailVerificationMode)) && (
                          <StepNavigationButtons
                            isCheckoutStep={isCheckoutStep}
                            paymentStatus={paymentStatus}
                            currentStep={currentStep}
                            isSignInMode={isSignInMode}
                            isEmailVerificationMode={isEmailVerificationMode}
                            currentStepIndex={currentStepIndex}
                            answers={answers}
                            isLastStep={isLastStep}
                            isProductSelectionStep={isProductSelectionStep}
                            theme={theme}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onClose={onClose}
                            setCurrentStepIndex={() => {}}
                          />
                        )}
                      </>
                    )}

                    {isCheckoutStep() && paymentStatus !== 'succeeded' && (
                      <div className="text-center text-sm text-gray-600 mt-4">
                        Complete payment above to continue
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <EmailInputModal
        isOpen={showEmailModal}
        email={verificationEmail}
        onEmailChange={setVerificationEmail}
        onContinue={emailVerificationHandlers.handleSendCodeFromModal}
        onCancel={() => {
          setShowEmailModal(false);
          setVerificationEmail('');
          if (setEmailModalError) setEmailModalError('');
        }}
        isLoading={emailModalLoading}
        error={emailModalError}
      />
    </>
  );
};
