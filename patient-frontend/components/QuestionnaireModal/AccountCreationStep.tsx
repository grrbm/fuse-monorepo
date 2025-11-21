import React from "react";
import { Icon } from "@iconify/react";

interface AccountCreationStepProps {
  isSignInMode: boolean;
  onToggleMode: () => void;
  
  // Sign-up form props
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  onFieldChange: (field: string, value: string) => void;
  
  // Sign-in form props
  signInEmail: string;
  signInPassword: string;
  signInError: string;
  isSigningIn: boolean;
  onSignInEmailChange: (value: string) => void;
  onSignInPasswordChange: (value: string) => void;
  onSignIn: () => void;
  
  // Email verification props
  onEmailSignIn: () => void;
  
  clinicName?: string;
}

export const AccountCreationStep: React.FC<AccountCreationStepProps> = ({
  isSignInMode,
  onToggleMode,
  firstName,
  lastName,
  email,
  mobile,
  onFieldChange,
  signInEmail,
  signInPassword,
  signInError,
  isSigningIn,
  onSignInEmailChange,
  onSignInPasswordChange,
  onSignIn,
  onEmailSignIn,
  clinicName
}) => {
  return (
    <div className="space-y-4">
      {isSignInMode ? (
        // Sign In Form
        <>
          <div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Sign in to your account</h3>
            <p className="text-gray-600 text-base">Welcome back! Sign in to continue</p>
          </div>

          <div className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => onSignInEmailChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="john.cena@gmail.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSignIn();
                  }
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={signInPassword}
                onChange={(e) => onSignInPasswordChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSignIn();
                  }
                }}
              />
            </div>

            {/* Error Message */}
            {signInError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{signInError}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              onClick={onSignIn}
              disabled={isSigningIn || !signInEmail || !signInPassword}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSigningIn ? (
                <>
                  <Icon icon="lucide:loader-2" className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Back to Sign Up */}
          <div className="text-center pt-4">
            <span className="text-gray-600">Don't have an account? </span>
            <button 
              onClick={onToggleMode}
              className="text-gray-900 font-medium hover:underline"
            >
              Sign Up
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-100 rounded-xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <Icon icon="lucide:lock" className="text-gray-600 text-lg flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">
                {clinicName || 'Hims'} takes your privacy seriously with industry leading encryption.
              </p>
            </div>
          </div>
        </>
      ) : (
        // Sign Up Form
        <>
          <div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Create your account</h3>
            <p className="text-gray-600 text-base">We'll use this information to set up your personalized care plan</p>
          </div>

          <div className="space-y-6">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => onFieldChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => onFieldChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Cena"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onFieldChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="john.cena@gmail.com"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-lg mr-2">🇺🇸</span>
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => onFieldChange('mobile', e.target.value)}
                  className="w-full pl-16 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="(213) 343-4134"
                />
              </div>
            </div>
          </div>

          {/* OAuth Section */}
          <div className="space-y-4 pt-4">
            {/* Already have an account */}
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button 
                onClick={onToggleMode}
                className="text-gray-900 font-medium hover:underline"
              >
                Sign In
              </button>
            </div>

            {/* Divider with "or" */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 font-medium">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {/* Continue with Google */}
              <button
                onClick={() => {
                  // TODO: Implement Google OAuth
                  alert('Google sign-in coming soon!');
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <Icon icon="flat-color-icons:google" className="text-xl" />
                <span>Continue with Google</span>
              </button>

              {/* Continue with Email */}
              <button
                onClick={onEmailSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <Icon icon="lucide:mail" className="text-xl" />
                <span>Continue with Email</span>
              </button>
            </div>

            {/* Terms and Privacy */}
            <p className="text-center text-xs text-gray-500 leading-relaxed px-4">
              By creating an account, I agree to the{' '}
              <a href="#" className="text-gray-700 underline hover:text-gray-900">
                Terms & Conditions
              </a>
              {' '}and acknowledge the{' '}
              <a href="#" className="text-gray-700 underline hover:text-gray-900">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-100 rounded-xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <Icon icon="lucide:lock" className="text-gray-600 text-lg flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">
                {clinicName || 'Hims'} takes your privacy seriously with industry leading encryption.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Email Verification Code Input Component
interface EmailVerificationStepProps {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onBack: () => void;
  onResendCode: () => void;
  error: string;
  isVerifying: boolean;
  clinicName?: string;
}

export const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({
  email,
  code,
  onCodeChange,
  onVerify,
  onBack,
  onResendCode,
  error,
  isVerifying,
  clinicName
}) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [codeDigits, setCodeDigits] = React.useState<string[]>(['', '', '', '', '', '']);

  // Update code digits when code prop changes
  React.useEffect(() => {
    if (code.length === 6) {
      setCodeDigits(code.split(''));
    }
  }, [code]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);

    // Update parent component
    onCodeChange(newDigits.join(''));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newDigits.every(d => d) && index === 5) {
      setTimeout(() => onVerify(), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter' && codeDigits.every(d => d)) {
      onVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCodeDigits(digits);
      onCodeChange(pastedData);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-3">Verify your email</h3>
        <p className="text-gray-600 text-base">
          We've sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <div className="space-y-6 pt-4">
        {/* 6-Digit Code Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter verification code</label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {codeDigits.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={onVerify}
          disabled={isVerifying || codeDigits.some(d => !d)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Icon icon="lucide:loader-2" className="animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <span className="text-gray-600 text-sm">Didn't receive the code? </span>
          <button 
            onClick={onResendCode}
            className="text-emerald-600 text-sm font-medium hover:underline"
          >
            Resend
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-100 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <Icon icon="lucide:lock" className="text-gray-600 text-lg flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            {clinicName || 'Hims'} takes your privacy seriously with industry leading encryption.
          </p>
        </div>
      </div>
    </div>
  );
};

