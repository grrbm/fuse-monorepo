// Utility functions for clinic subdomain handling

export interface ClinicDomainInfo {
  hasClinicSubdomain: boolean;
  clinicSlug: string | null;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Extracts clinic slug from current domain
 * 
 * Development examples:
 * - saboia.xyz.localhost:3000 -> slug: "saboia.xyz"
 * - g-health.localhost:3000 -> slug: "g-health"  
 * - limitless.health.localhost:3000 -> no slug (special case)
 * - localhost:3000 -> no slug
 * 
 * Production examples:
 * - app.fuse.health -> slug: "fuse.health"
 * - app.hims.com -> slug: "hims.com"
 * - app.limitless.health -> no slug (special case)
 * - app.anydomain.anyextension -> slug: "anydomain.anyextension"
 * - fuse.health -> no slug (direct domain access)
 */
export function extractClinicSlugFromDomain(): ClinicDomainInfo {
  if (typeof window === 'undefined') {
    return {
      hasClinicSubdomain: false,
      clinicSlug: null,
      isDevelopment: false,
      isProduction: false
    };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  console.log('🔍 Domain analysis:', { hostname, parts });

  // Development: Check if 'localhost' appears in any position
  const localhostIndex = parts.indexOf('localhost');
  const isDevelopment = localhostIndex !== -1 && parts[0] !== 'www';

  // Production: app.fuse.health, app.hims.com, app.anydomain.anyextension
  const isProduction = parts.length >= 3 && parts[0] === 'app';

  let clinicSlug: string | null = null;
  let hasClinicSubdomain = false;

  if (isDevelopment && localhostIndex > 0) {
    // Development: extract everything before 'localhost' 
    // saboia.xyz.localhost -> saboia.xyz
    // g-health.localhost -> g-health
    clinicSlug = parts.slice(0, localhostIndex).join('.');
    hasClinicSubdomain = true;
  } else if (isProduction) {
    // Production: extract everything after 'app.' (fuse.health from app.fuse.health)
    clinicSlug = parts.slice(1).join('.');
    hasClinicSubdomain = true;
  } else if (hostname.endsWith('.fuse.health') && parts.length >= 3 && parts[0] !== 'app' && parts[0] !== 'www') {
    // Production clinic subdomain: <clinic>.fuse.health
    clinicSlug = parts[0];
    hasClinicSubdomain = true;
  }

  // Special case: limitless.health should act as the normal website (no clinic)
  if (clinicSlug === 'fuse.health') {
    clinicSlug = null;
    hasClinicSubdomain = false;
  }

  const result = {
    hasClinicSubdomain,
    clinicSlug,
    isDevelopment,
    isProduction
  };

  console.log('🏥 Clinic domain extraction result:', result);
  return result;
}