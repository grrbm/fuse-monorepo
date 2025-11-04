import { User } from './auth';

/**
 * Gets the emoji avatar based on user gender
 * @param user - User object (may have gender property)
 * @param gender - Optional gender string (male, female, etc.)
 * @returns Emoji string for the avatar
 */
export function getAvatarEmoji(user?: User | null, gender?: string | null): string {
  // Try to get gender from user object first, then from parameter
  const userGender = (user as any)?.gender || gender;
  
  if (userGender) {
    const genderLower = userGender.toLowerCase();
    
    // Check for male variations
    if (genderLower === 'male' || genderLower === 'm' || genderLower === 'man' || genderLower === 'hombre') {
      return '👨'; // Man emoji
    }
    
    // Check for female variations
    if (genderLower === 'female' || genderLower === 'f' || genderLower === 'woman' || genderLower === 'mujer') {
      return '👩'; // Woman emoji
    }
  }
  
  // Default to a neutral person emoji if gender is not specified
  return '👤'; // Neutral person emoji
}

/**
 * Creates a data URL for an emoji avatar
 * This can be used as the src for Avatar components
 */
export function createEmojiAvatar(emoji: string, size: number = 200): string {
  // Create a canvas to render the emoji
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback if canvas is not available
    return '';
  }
  
  // Set a light background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, size, size);
  
  // Set font size and draw emoji
  ctx.font = `${size * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);
  
  return canvas.toDataURL();
}

/**
 * Gets avatar emoji or creates data URL for Avatar component
 * For Avatar components, we can use the emoji directly or create a data URL
 */
export function getAvatarProps(user?: User | null, gender?: string | null) {
  const emoji = getAvatarEmoji(user, gender);
  
  // Option 1: Use emoji directly as fallback text
  // Option 2: Create data URL (but this might be overkill)
  // For simplicity, we'll just return the emoji and let Avatar handle it
  
  return {
    name: user?.firstName || user?.email || 'User',
    fallback: emoji,
  };
}

