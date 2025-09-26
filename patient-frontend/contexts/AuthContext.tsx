import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, checkAuth, signOut } from '../lib/auth';
import { useRouter } from 'next/router';
import { SessionTimeoutManager } from '../lib/sessionTimeout';
import { SessionWarning } from '../components/SessionWarning';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const router = useRouter();
  const sessionManager = React.useRef<SessionTimeoutManager | null>(null);

  const refreshUser = async () => {
    try {
      const userData = await checkAuth();
      console.log('🔍 AuthContext - Loaded user data:', userData);
      console.log('🔍 AuthContext - User clinicId:', userData?.clinicId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user');
      setUser(null);
    }
  };

  const handleSignOut = async () => {
    try {
      // Stop session timeout when signing out
      if (sessionManager.current) {
        sessionManager.current.stop();
      }
      setShowSessionWarning(false);
      
      // Remove JWT token from localStorage
      localStorage.removeItem('auth_token');
      
      await signOut();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out failed');
    }
  };

  const handleSessionWarning = () => {
    setShowSessionWarning(true);
    setCountdown(300); // 5 minutes
    
    // Start countdown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSignOut(); // Auto logout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleExtendSession = () => {
    setShowSessionWarning(false);
    if (sessionManager.current) {
      sessionManager.current.resetTimer();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Only check auth if we're not on public pages
      const publicPaths = ['/signin', '/signup', '/privacy', '/terms', '/hipaa-notice', '/treatments/weightloss'];
      if (!publicPaths.includes(router.pathname)) {
        await refreshUser();
      }
      setLoading(false);
    };

    initAuth();
  }, [router.pathname]);

  // Redirect to signin if user becomes unauthenticated
  useEffect(() => {
    const publicPaths = ['/signin', '/signup', '/privacy', '/terms', '/hipaa-notice', '/treatments/weightloss'];
    if (!loading && !user && !publicPaths.includes(router.pathname)) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Initialize session timeout when user is authenticated
  useEffect(() => {
    const publicPaths = ['/signin', '/signup', '/privacy', '/terms', '/hipaa-notice'];
    if (user && !publicPaths.includes(router.pathname)) {
      // Initialize session manager
      if (!sessionManager.current) {
        sessionManager.current = new SessionTimeoutManager({
          onWarning: handleSessionWarning,
          onTimeout: handleSignOut,
        });
      }
      sessionManager.current.start();
    } else if (sessionManager.current) {
      // Stop session manager when user is not authenticated or on public pages
      sessionManager.current.stop();
    }

    // Cleanup on unmount
    return () => {
      if (sessionManager.current) {
        sessionManager.current.stop();
      }
    };
  }, [user, router.pathname]);

  const value = {
    user,
    loading,
    signOut: handleSignOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionWarning
        isOpen={showSessionWarning}
        onExtendSession={handleExtendSession}
        onLogout={handleSignOut}
        countdown={countdown}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}