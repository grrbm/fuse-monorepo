// HIPAA-compliant API utilities
// Centralized API handling with proper error handling and security

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Generic API call function with JWT token handling
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get JWT token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    console.log('API URL being used:', apiUrl, 'Environment variable:', process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    console.log('📡 Response Debug:');
    console.log('  Status:', response.status);
    console.log('  Status Text:', response.statusText);
    console.log('  Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('  Response data:', data);

    if (!response.ok) {
      console.error('❌ API call failed:', endpoint, '- Status:', response.status);
      return {
        success: false,
        error: data.message || `Request failed with status ${response.status}`,
      };
    }

    // If this is a successful signin, store the token
    if (endpoint === '/auth/signin' && data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', data.token);
      console.log('✅ Token stored in localStorage');
    }

    // If this is a signout, remove the token
    if (endpoint === '/auth/signout' && typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      console.log('✅ Token removed from localStorage');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Don't log the actual error - could contain PHI
    console.error(`Network error on API call: ${endpoint}`);
    return {
      success: false,
      error: 'Network error occurred. Please try again.',
    };
  }
}

// Specialized authentication API calls
export const authApi = {
  signIn: async (email: string, password: string) => {
    console.log('🔐 SignIn attempt:', { email, passwordLength: password.length });
    const result = await apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('🔐 SignIn result:', result);
    return result;
  },

  signUp: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'patient' | 'provider';
    dateOfBirth?: string;
    phoneNumber?: string;
    clinicName?: string;
  }) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  signOut: async () =>
    apiCall('/auth/signout', { method: 'POST' }),

  getUser: async () =>
    apiCall('/auth/me'),

  refreshSession: async () =>
    apiCall('/auth/refresh', { method: 'POST' }),

  updateProfile: async (profileData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dob?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) =>
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// Generic data fetching with automatic error handling
export async function fetchWithAuth<T>(endpoint: string): Promise<T | null> {
  const result = await apiCall<T>(endpoint);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data || null;
}