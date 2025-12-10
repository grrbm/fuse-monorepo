import { useEffect, useRef } from "react";

export function useGoogleOAuth(
  answers: Record<string, any>,
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setPatientFirstName: React.Dispatch<React.SetStateAction<string>>,
  setPatientName: React.Dispatch<React.SetStateAction<string>>,
  setUserId: React.Dispatch<React.SetStateAction<string | null>>,
  setAccountCreated: React.Dispatch<React.SetStateAction<boolean>>
) {
  const hasHandledGoogleAuthRef = useRef(false);

  // Reset Google OAuth flag when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      console.log('🧹 [CLEANUP] Resetting hasHandledGoogleAuthRef on component unmount');
      hasHandledGoogleAuthRef.current = false;
    };
  }, []);

  // Handle Google OAuth callback - set user data from URL params
  useEffect(() => {
    console.log('🔍 [GOOGLE OAUTH] Effect triggered, current URL:', window.location.href);
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get('googleAuth');
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    const skipAccount = urlParams.get('skipAccount');

    console.log('🔍 [GOOGLE OAUTH] URL params:', { googleAuth, hasToken: !!token, hasUser: !!userStr, skipAccount });
    console.log('🔍 [GOOGLE OAUTH] Full URL params object:', Object.fromEntries(urlParams.entries()));

    if (googleAuth === 'success' && token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        console.log('👤 [GOOGLE OAUTH] Parsed user data:', userData);

        // Pre-fill the form with user's data
        const newAnswers = {
          ...answers,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          mobile: userData.phoneNumber || ''
        };

        setAnswers(newAnswers);
        setPatientFirstName(userData.firstName);
        setPatientName(`${userData.firstName} ${userData.lastName}`.trim());
        setUserId(userData.id);
        setAccountCreated(true);

        // Mark that we've handled Google OAuth - this prevents step reset
        hasHandledGoogleAuthRef.current = true;

        console.log('✅ [GOOGLE OAUTH] User data loaded, accountCreated set to true, marked as handled');

        // Clean URL but KEEP skipAccount flag for step initialization
        if (skipAccount === 'true') {
          const cleanUrl = `${window.location.pathname}?skipAccount=true`;
          console.log('🧹 [GOOGLE OAUTH] Cleaning URL but keeping skipAccount flag');
          console.log('🧹 [GOOGLE OAUTH] Before:', window.location.href);
          console.log('🧹 [GOOGLE OAUTH] After:', cleanUrl);
          window.history.replaceState({}, document.title, cleanUrl);
        }

      } catch (error) {
        console.error('❌ [GOOGLE OAUTH] Failed to parse user data:', error);
      }
    } else if (googleAuth === 'error') {
      alert('Google sign-in failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.log('ℹ️ [GOOGLE OAUTH] No Google OAuth params detected in URL');
    }
  }, []); // Run once on mount

  return { hasHandledGoogleAuthRef };
}

