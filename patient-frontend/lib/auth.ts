// HIPAA-compliant authentication utilities using JWT tokens
// No PHI should be stored in localStorage or exposed in logs

import { authApi } from './api';

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin'; // Changed from 'provider' to 'doctor' to match backend
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  clinicId?: string; // For doctors associated with a clinic
  createdAt?: string;
  lastLoginAt?: string;
  // Add other non-PHI user properties as needed
}

// Check if user is authenticated by calling the backend
export async function checkAuth(): Promise<User | null> {
  try {
    const result = await authApi.getUser();
    console.log('🔍 checkAuth - API result:', result);

    if (!result.success) {
      return null;
    }

    // Handle potential double nesting from apiCall wrapper
    const userData = result.data.user || result.data;
    console.log('🔍 checkAuth - User data:', userData);
    console.log('🔍 checkAuth - User clinicId:', userData?.clinicId);
    return userData;
  } catch (error) {
    // Don't log the actual error - could contain PHI
    console.error('Auth check failed');
    return null;
  }
}

// Sign out user
export async function signOut(): Promise<boolean> {
  try {
    const result = await authApi.signOut();
    return result.success;
  } catch (error) {
    console.error('Sign out failed');
    return false;
  }
}

// Role-based access control helper
export function hasPermission(user: User | null, requiredRole: User['role'][]): boolean {
  if (!user) return false;
  return requiredRole.includes(user.role);
}

// Check if user can access another user's data (RBAC)
export function canAccessUserData(currentUser: User | null, targetUserId: string): boolean {
  if (!currentUser) return false;

  // Admins and providers can access any patient data
  if (currentUser.role === 'admin' || currentUser.role === 'doctor') {
    return true;
  }

  // Patients can only access their own data
  if (currentUser.role === 'patient') {
    return currentUser.id === targetUserId;
  }

  return false;
}