import React from "react";
import { Icon } from "@iconify/react";

interface StepHeaderProps {
    canGoBack: boolean;
    onPrevious: () => void;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ canGoBack, onPrevious }) => (
    <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-normal text-gray-900">fuse.health</h1>
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



