import React from "react";
import { Icon } from "@iconify/react";
import { apiCall } from "../../../lib/api";
import { extractClinicSlugFromDomain } from "../../../lib/clinic-utils";

interface StepHeaderProps {
    canGoBack: boolean;
    onPrevious: () => void;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ canGoBack, onPrevious }) => {
    const [clinic, setClinic] = React.useState<{ name: string; logo?: string } | null>(null);

    // Load clinic data from domain (checks vanity domain first, then subdomain)
    React.useEffect(() => {
        const loadClinicFromDomain = async () => {
            try {
                // This function checks vanity domain first, then falls back to subdomain
                const domainInfo = await extractClinicSlugFromDomain();

                if (domainInfo.hasClinicSubdomain && domainInfo.clinicSlug) {
                    console.log('🏥 StepHeader - Loading clinic data for slug:', domainInfo.clinicSlug);

                    const result = await apiCall(`/clinic/by-slug/${domainInfo.clinicSlug}`);
                    if (result.success && result.data && result.data.data) {
                        const clinicData = result.data.data;
                        setClinic({
                            name: clinicData.name,
                            logo: clinicData.logo
                        });
                        console.log('✅ StepHeader - Loaded clinic data:', clinicData.name);
                    } else {
                        console.error('❌ StepHeader - Failed to load clinic data:', result);
                        setClinic(null);
                    }
                } else {
                    console.log('ℹ️ StepHeader - No clinic subdomain or custom domain detected');
                    setClinic(null);
                }
            } catch (error) {
                console.error('❌ StepHeader - Error loading clinic data:', error);
                setClinic(null);
            }
        };

        loadClinicFromDomain();
    }, []);

    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                {clinic?.logo && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                            src={clinic.logo}
                            alt={`${clinic.name} logo`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <h1 className="text-2xl font-normal text-gray-900">
                    {clinic?.name || "fuse.health"}
                </h1>
            </div>

            <div>
                {canGoBack && (
                    <button
                        onClick={onPrevious}
                        className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
                    >
                        <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-1" />
                        Back
                    </button>
                )}
            </div>
        </div>
    );
};



