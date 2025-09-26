import React from 'react';
import { apiCall } from '../lib/api';
import { extractClinicSlugFromDomain } from '../lib/clinic-utils';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export interface UseClinicFromDomainResult {
  clinic: Clinic | null;
  hasClinicSubdomain: boolean;
  isLoading: boolean;
  error: string | null;
  clinicSlug: string | null;
}

/**
 * Custom hook to automatically detect and load clinic data from the current domain
 * 
 * Examples:
 * - saboia.xyz.localhost:3000 -> loads clinic with slug "saboia.xyz"
 * - app.fuse.health -> loads clinic with slug "fuse.health"
 * - localhost:3000 -> no clinic (main site)
 */
export function useClinicFromDomain(): UseClinicFromDomainResult {
  const [clinic, setClinic] = React.useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadClinic = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const domainInfo = extractClinicSlugFromDomain();

      if (domainInfo.hasClinicSubdomain && domainInfo.clinicSlug) {
        console.log('🏥 Loading clinic from domain:', domainInfo.clinicSlug);

        const result = await apiCall(`/clinic/by-slug/${domainInfo.clinicSlug}`);

        if (result.success && result.data) {
          const clinicData = result.data.data || result.data;
          setClinic(clinicData);
          console.log('✅ Loaded clinic data:', clinicData);
        } else {
          setError('Clinic not found');
          console.error('❌ Clinic not found for slug:', domainInfo.clinicSlug);
        }
      } else {
        // No clinic subdomain detected - this is normal for main site
        setClinic(null);
      }
    } catch (err) {
      setError('Failed to load clinic');
      console.error('❌ Error loading clinic:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load clinic when component mounts
  React.useEffect(() => {
    loadClinic();
  }, [loadClinic]);

  const domainInfo = extractClinicSlugFromDomain();

  return {
    clinic,
    hasClinicSubdomain: domainInfo.hasClinicSubdomain,
    isLoading,
    error,
    clinicSlug: domainInfo.clinicSlug
  };
}

/**
 * Simple utility function to get just the clinic slug from current domain
 * Use this when you only need the slug and don't want to trigger API calls
 */
export function getClinicSlugFromDomain(): string | null {
  const domainInfo = extractClinicSlugFromDomain();
  return domainInfo.clinicSlug;
}