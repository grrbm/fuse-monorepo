import { sendVerificationCode, verifyCode } from "./auth";

interface EmailVerificationHandlers {
  handleEmailSignIn: () => Promise<void>;
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
}

export const createEmailVerificationHandlers = (
  state: EmailVerificationState
): EmailVerificationHandlers => {
  const handleEmailSignIn = async () => {
    const email = state.answers['email'];
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address first');
      return;
    }

    state.setVerificationError('');
    state.setVerificationEmail(email);
    
    const result = await sendVerificationCode(email);
    
    if (result.success) {
      state.setIsEmailVerificationMode(true);
      console.log('✅ Verification code sent');
    } else {
      alert(result.error || 'Failed to send verification code');
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

  return {
    handleEmailSignIn,
    handleVerifyCode,
    handleResendCode
  };
};

