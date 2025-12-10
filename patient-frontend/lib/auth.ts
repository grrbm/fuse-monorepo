// HIPAA-compliant authentication utilities using JWT tokens
// No PHI should be stored in localStorage or exposed in logs

import { authApi } from "./api";

export interface User {
  id: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  clinicId?: string;
  createdAt?: string;
  lastLoginAt?: string;
  gender?: string;
}

// Check if user is authenticated by calling the backend
export async function checkAuth(): Promise<User | null> {
  try {
    const result = await authApi.getUser();

    if (!result.success) {
      return null;
    }

    // Handle potential double nesting from apiCall wrapper
    const userData = (result.data as any)?.user || result.data;

    return userData as User;
  } catch {
    // Do not log details to avoid PHI exposure
    return null;
  }
}

// Sign out user
export async function signOut(): Promise<boolean> {
  try {
    const result = await authApi.signOut();
    return result.success;
  } catch {
    return false;
  }
}

// Role-based access control helper
export function hasPermission(
  user: User | null,
  requiredRole: User["role"][]
): boolean {
  if (!user) return false;
  return requiredRole.includes(user.role);
}

// Check if user can access another user's data (RBAC)
export function canAccessUserData(
  currentUser: User | null,
  targetUserId: string
): boolean {
  if (!currentUser) return false;

  // Admins and doctors can access any patient data
  if (currentUser.role === "admin" || currentUser.role === "doctor") {
    return true;
  }

  // Patients can only access their own data
  if (currentUser.role === "patient") {
    return currentUser.id === targetUserId;
  }

  return false;
}
