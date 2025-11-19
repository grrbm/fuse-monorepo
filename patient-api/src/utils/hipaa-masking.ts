/**
 * HIPAA Compliance - PHI Masking Utilities
 * 
 * This module provides functions to mask Protected Health Information (PHI)
 * to comply with HIPAA regulations when sending automated messages.
 * 
 * References:
 * - HIPAA Privacy Rule: https://www.hhs.gov/hipaa/for-professionals/privacy/index.html
 * - Safe Harbor De-identification: 18 identifiers that must be removed/masked
 */

/**
 * Mask phone number, showing only last 4 digits
 * @example
 * maskPhone('+15551234567') => 'XXX-XXX-4567'
 * maskPhone('5551234567') => 'XXX-XXX-4567'
 * maskPhone('(555) 123-4567') => 'XXX-XXX-4567'
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return 'XXX-XXX-XXXX';
  
  // Extract only digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 4) return 'XXX-XXX-XXXX';
  
  // Get last 4 digits
  const last4 = digits.slice(-4);
  
  return `XXX-XXX-${last4}`;
}

/**
 * Get only last 4 digits of phone (for SMS confirmation codes)
 * @example
 * getPhoneLast4('+15551234567') => '4567'
 */
export function getPhoneLast4(phone: string | null | undefined): string {
  if (!phone) return 'XXXX';
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return 'XXXX';
  
  return digits.slice(-4);
}

/**
 * Mask email address, showing only first character and domain
 * @example
 * maskEmail('john.doe@example.com') => 'j***@example.com'
 * maskEmail('test@gmail.com') => 't***@gmail.com'
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return 'XXXXX@XXXXX.com';
  
  const parts = email.split('@');
  if (parts.length !== 2) return 'XXXXX@XXXXX.com';
  
  const [username, domain] = parts;
  if (username.length === 0) return 'XXXXX@XXXXX.com';
  
  const maskedUsername = username[0] + '***';
  return `${maskedUsername}@${domain}`;
}

/**
 * Mask date of birth, showing only year
 * @example
 * maskDOB('1990-05-15') => 'XX/XX/1990'
 * maskDOB('05/15/1990') => 'XX/XX/1990'
 */
export function maskDOB(dob: string | null | undefined): string {
  if (!dob) return '**/**/****';
  
  // Try to extract year from various formats
  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    const year = dob.split('-')[0];
    return `**/**/${year}`;
  }
  
  // Format: MM/DD/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
    const year = dob.split('/')[2];
    return `**/**/${year}`;
  }
  
  // Format: DD-MM-YYYY or other
  const yearMatch = dob.match(/\d{4}/);
  if (yearMatch) {
    return `**/**/${yearMatch[0]}`;
  }
  
  return '**/**/****';
}

/**
 * Get only birth year
 * @example
 * getDOBYear('1990-05-15') => '1990'
 */
export function getDOBYear(dob: string | null | undefined): string {
  if (!dob) return '****';
  
  const yearMatch = dob.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : '****';
}

/**
 * Mask Social Security Number (SSN)
 * @example
 * maskSSN('123-45-6789') => 'XXX-XX-6789'
 * maskSSN('123456789') => 'XXX-XX-6789'
 */
export function maskSSN(ssn: string | null | undefined): string {
  if (!ssn) return 'XXX-XX-XXXX';
  
  // Extract only digits
  const digits = ssn.replace(/\D/g, '');
  
  if (digits.length !== 9) return 'XXX-XX-XXXX';
  
  // Get last 4 digits
  const last4 = digits.slice(-4);
  
  return `XXX-XX-${last4}`;
}

/**
 * Mask full name, showing only first name and last initial
 * @example
 * maskFullName('John', 'Doe') => 'John D.'
 */
export function maskFullName(firstName: string | null | undefined, lastName: string | null | undefined): string {
  if (!firstName && !lastName) return 'XXXXX XXXXX';
  if (!firstName) return `XXXXX ${lastName}`;
  if (!lastName) return firstName;
  
  const lastInitial = lastName[0]?.toUpperCase() || 'X';
  return `${firstName} ${lastInitial}.`;
}

/**
 * Mask street address, showing only city and state
 * @example
 * maskAddress('123 Main St', 'Austin', 'TX', '78701') => 'Austin, TX'
 */
export function maskAddress(
  street?: string | null,
  city?: string | null,
  state?: string | null,
  zipCode?: string | null
): string {
  if (!city && !state) return 'XXXXX, XX';
  if (!city) return state || 'XX';
  if (!state) return city;
  
  return `${city}, ${state}`;
}

/**
 * Mask ZIP code, showing only first 3 digits
 * @example
 * maskZipCode('78701') => '787XX'
 * maskZipCode('78701-1234') => '787XX'
 */
export function maskZipCode(zipCode: string | null | undefined): string {
  if (!zipCode) return 'XXXXX';
  
  const digits = zipCode.replace(/\D/g, '');
  if (digits.length < 3) return 'XXXXX';
  
  const first3 = digits.slice(0, 3);
  return `${first3}XX`;
}

/**
 * Calculate age from DOB (safe to share, not direct identifier)
 * @example
 * calculateAge('1990-05-15') => 34
 */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return null;
  }
}

/**
 * Generate safe merge tags context with masked PHI
 * This combines all masking functions to create a safe context object
 */
export interface SafePHIContext {
  // Original data (use with caution!)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  
  // Safe masked versions (HIPAA compliant)
  email_masked: string;
  phone_masked: string;
  phone_last4: string;
  dob_masked: string;
  dob_year: string;
  age: number | null;
  name_masked: string;
  
  // Additional safe fields
  city?: string;
  state?: string;
  address_masked?: string;
  zip_masked?: string;
}

/**
 * Create safe PHI context from user data
 */
export function createSafePHIContext(user: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  dob?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  zipCode?: string | null;
}): SafePHIContext {
  return {
    // Original (pass through, but warn when used)
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    email: user.email || undefined,
    phone: user.phoneNumber || undefined,
    dob: user.dob || undefined,
    
    // Masked versions (HIPAA safe)
    email_masked: maskEmail(user.email),
    phone_masked: maskPhone(user.phoneNumber),
    phone_last4: getPhoneLast4(user.phoneNumber),
    dob_masked: maskDOB(user.dob),
    dob_year: getDOBYear(user.dob),
    age: calculateAge(user.dob),
    name_masked: maskFullName(user.firstName, user.lastName),
    
    // Safe location data (city/state ok, address/zip masked)
    city: user.city || undefined,
    state: user.state || undefined,
    address_masked: maskAddress(user.address, user.city, user.state, user.zipCode),
    zip_masked: maskZipCode(user.zipCode)
  };
}

/**
 * List of PHI fields that should trigger warnings
 */
export const PHI_SENSITIVE_FIELDS = [
  'email',
  'phone',
  'phoneNumber',
  'dob',
  'ssn',
  'address',
  'zipCode',
  'zip'
];

/**
 * Check if a template contains unmasked PHI fields
 */
export function detectUnmaskedPHI(templateBody: string): string[] {
  const warnings: string[] = [];
  
  // Check for sensitive merge tags
  if (/\{\{email\}\}/.test(templateBody)) {
    warnings.push('{{email}} - Consider using {{email_masked}} instead');
  }
  
  if (/\{\{phone(?:Number)?\}\}/.test(templateBody)) {
    warnings.push('{{phone}} - Consider using {{phone_last4}} or {{phone_masked}} instead');
  }
  
  if (/\{\{dob\}\}/.test(templateBody)) {
    warnings.push('{{dob}} - Consider using {{dob_year}} or {{age}} instead');
  }
  
  if (/\{\{ssn\}\}/.test(templateBody)) {
    warnings.push('{{ssn}} - Should NEVER be included in automated messages');
  }
  
  if (/\{\{(?:address|zipCode|zip)\}\}/.test(templateBody)) {
    warnings.push('{{address/zip}} - Consider using {{city}} and {{state}} instead');
  }
  
  return warnings;
}

