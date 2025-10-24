import React from "react";
import { Icon } from "@iconify/react";
// Note: Clinic data is passed from parent to avoid refetching per step

interface StepHeaderProps {
    canGoBack: boolean;
    onPrevious: () => void;
    clinic?: { name: string; logo?: string } | null;
    isLoadingClinic?: boolean;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ canGoBack, onPrevious, clinic, isLoadingClinic }) => {


    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                {isLoadingClinic ? (
                    <>
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                    </>
                ) : (
                    <>
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
                    </>
                )}
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



