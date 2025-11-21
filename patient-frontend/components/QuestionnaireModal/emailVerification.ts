import { sendVerificationCode, verifyCode } from "./auth";

interface EmailVerificationHandlers {
  handleEmailSignIn: () => void;
  handleSendCodeFromModal: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
  handleResendCode: () => Promise<void>;
}

interface EmailVerificationState {
  answers: Record<string, any>;
  verificationEmail: string;
  verificationCode: string;
  questionnaire: any;
  currentStepIndex: number;
  setVerificationError: (error: string) => void;
  setVerificationEmail: (email: string) => void;
  setIsEmailVerificationMode: (mode: boolean) => void;
  setIsVerifying: (verifying: boolean) => void;
  setVerificationCode: (code: string) => void;
  setAnswers: (answers: any) => void;
  setPatientFirstName: (name: string) => void;
  setPatientName: (name: string) => void;
  setUserId: (id: string) => void;
  setAccountCreated: (created: boolean) => void;
  setCurrentStepIndex: (index: any) => void;
  getTotalSteps: () => number;
  setShowEmailModal: (show: boolean) => void;
  setEmailModalLoading: (loading: boolean) => void;
  setEmailModalError: (error: string) => void;
}

export const createEmailVerificationHandlers = (
  state: EmailVerificationState
): EmailVerificationHandlers => {
  const handleSendCodeFromModal = async () => {
    const email = state.verificationEmail || state.answers['email'];
    
    console.log('📧 Attempting to send code to:', email);
    
    if (!email || !email.includes('@')) {
      state.setEmailModalError('Please enter a valid email address');
      return;
    }

    state.setEmailModalError('');
    state.setEmailModalLoading(true);
    
    const result = await sendVerificationCode(email);
    
    state.setEmailModalLoading(false);
    
    if (result.success) {
      // Update the answers with the email
      if (state.verificationEmail && state.verificationEmail !== state.answers['email']) {
        state.setAnswers((prev: any) => ({ ...prev, email: state.verificationEmail }));
      }
      
      // Close modal and show verification step
      state.setShowEmailModal(false);
      state.setIsEmailVerificationMode(true);
      console.log('✅ Verification code sent');
    } else {
      state.setEmailModalError(result.error || 'Failed to send verification code');
    }
  };

  const handleVerifyCode = async () => {
    state.setVerificationError('');
    state.setIsVerifying(true);

    const result = await verifyCode(state.verificationEmail, state.verificationCode);

    if (result.success) {
      if (result.isExistingUser && result.userData) {
        // Existing user - fill in their data and advance
        const newAnswers = {
          ...state.answers,
          firstName: result.userData.firstName,
          lastName: result.userData.lastName,
          email: result.userData.email,
          mobile: result.userData.phoneNumber
        };

        state.setAnswers(newAnswers);
        state.setPatientFirstName(result.userData.firstName);
        state.setPatientName(`${result.userData.firstName} ${result.userData.lastName}`.trim());
        state.setUserId(result.userData.id);
        state.setAccountCreated(true);

        // Exit verification mode and advance
        state.setIsEmailVerificationMode(false);
        state.setVerificationCode('');
        
        console.log('✅ Existing user verified, advancing');
        
        setTimeout(() => {
          if (state.questionnaire) {
            const totalSteps = state.getTotalSteps();
            if (state.currentStepIndex < totalSteps - 1) {
              state.setCurrentStepIndex((prev: number) => prev + 1);
            }
          }
        }, 150);
      } else {
        // New user - email verified, stay on form to complete signup
        state.setAnswers((prev: any) => ({ ...prev, email: result.email || state.verificationEmail }));
        state.setIsEmailVerificationMode(false);
        state.setVerificationCode('');
        console.log('✅ New user email verified, continue with signup');
      }
    } else {
      state.setVerificationError(result.error || 'Invalid verification code');
    }

    state.setIsVerifying(false);
  };

  const handleResendCode = async () => {
    state.setVerificationError('');
    const result = await sendVerificationCode(state.verificationEmail);
    
    if (result.success) {
      alert('Verification code sent!');
    } else {
      state.setVerificationError(result.error || 'Failed to resend code');
    }
  };

  const handleEmailSignIn = () => {
    console.log('🔵 handleEmailSignIn called');
    const email = state.answers['email'];
    
    console.log('📧 Current email in answers:', email);
    
    if (!email || !email.includes('@')) {
      // Show email input modal
      console.log('📧 No valid email, calling setShowEmailModal(true)');
      state.setShowEmailModal(true);
      console.log('📧 setShowEmailModal called');
      state.setVerificationEmail('');
      state.setEmailModalError('');
      return;
    }

    // Email already filled, show modal with pre-filled email
    console.log('📧 Email exists, pre-filling modal');
    state.setVerificationEmail(email);
    state.setShowEmailModal(true);
    state.setEmailModalError('');
  };

  return {
    handleEmailSignIn,
    handleSendCodeFromModal,
    handleVerifyCode,
    handleResendCode
  };
};

