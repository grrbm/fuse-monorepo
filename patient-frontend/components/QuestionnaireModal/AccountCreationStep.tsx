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

              {/* Continue with Apple */}
              <button
                onClick={() => {
                  // TODO: Implement Apple OAuth
                  alert('Apple sign-in coming soon!');
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <Icon icon="ic:baseline-apple" className="text-2xl" />
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Terms and Privacy */}
            <p className="text-center text-xs text-gray-500 leading-relaxed px-4">
              By creating an account using email, Google or Apple, I agree to the{' '}
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


