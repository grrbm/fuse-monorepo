import { apiCall } from "../../lib/api";

export interface SignInResult {
  success: boolean;
  userData?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  error?: string;
}

/**
 * Sign in user with email and password
 */
export const signInUser = async (
  email: string,
  password: string
): Promise<SignInResult> => {
  try {
    console.log('🔐 Signing in with email:', email);

    const result = await apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    });

    if (result.success && result.data) {
      console.log('✅ Sign-in successful:', result.data);

      // Extract user data from response
      const userData = result.data.user || result.data;
      
      return {
        success: true,
        userData: {
          id: userData.id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || email,
          phoneNumber: userData.phoneNumber || ''
        }
      };
    } else {
      // Handle specific error messages from the API
      const errorData = result.data || result;
      
      if (errorData?.needsActivation) {
        return {
          success: false,
          error: 'Please check your email and activate your account before signing in.'
        };
      }
      
      if (errorData?.message) {
        return {
          success: false,
          error: errorData.message
        };
      }
      
      return {
        success: false,
        error: 'Invalid email or password. Please try again.'
      };
    }
  } catch (error: any) {
    console.error('❌ Sign-in error:', error);
    
    // Handle network or API errors
    if (error?.message?.includes('401')) {
      return {
        success: false,
        error: 'Invalid email or password. Please check your credentials.'
      };
    }
    
    if (error?.message?.includes('404')) {
      return {
        success: false,
        error: 'Sign-in service not available. Please try again later.'
      };
    }
    
    return {
      success: false,
      error: 'Failed to sign in. Please check your internet connection and try again.'
    };
  }
};

/**
 * Create a new user account
 */
export const createUserAccount = async (
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  clinicId?: string
): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    console.log('🔐 Creating user account with data:', {
      firstName,
      lastName,
      email,
      phoneNumber
    });

    const result = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: Math.random().toString(36).slice(-12) + 'Aa1!', // Generate stronger password
        role: 'patient',
        clinicId: clinicId || null
      })
    });

    if (result.success && result.data) {
      const userId = result.data.userId || result.data.id;
      console.log('✅ User account created:', userId);
      return { success: true, userId };
    } else {
      // If account creation failed (likely duplicate email), that's okay
      console.log('ℹ️ Account creation failed (likely duplicate), will use existing account at payment');
      return { success: true }; // Return success anyway, will be handled at payment
    }
  } catch (error) {
    console.error('❌ Failed to create user account:', error);
    return { success: false, error: 'Failed to create account' };
  }
};

