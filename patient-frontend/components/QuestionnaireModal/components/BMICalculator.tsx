import React from 'react';
import { QuestionnaireStep } from '../types';

interface BMICalculatorProps {
    currentStep: QuestionnaireStep;
    answers: Record<string, any>;
    onAnswerChange: (questionId: string, value: any) => void;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({
    currentStep,
    answers,
    onAnswerChange,
}) => {
    // Find BMI questions dynamically by questionSubtype
    const bmiQuestions = currentStep?.questions?.filter(q => q.questionSubtype === 'bmi') || [];
    const weightQuestion = bmiQuestions.find(q => q.questionText?.toLowerCase().includes('weight'));
    const feetQuestion = bmiQuestions.find(q => q.questionText?.toLowerCase().includes('feet'));
    const inchesQuestion = bmiQuestions.find(q => q.questionText?.toLowerCase().includes('inches'));

    // Get question IDs or fallback to hardcoded keys for legacy support
    const weightKey = weightQuestion?.id || 'weight';
    const feetKey = feetQuestion?.id || 'heightFeet';
    const inchesKey = inchesQuestion?.id || 'heightInches';

    // State for animated width (starts at 0, animates to target)
    const [animatedWidth, setAnimatedWidth] = React.useState(0);

    // Track if we've done the initial animation
    const hasAnimatedRef = React.useRef(false);

    // Calculate BMI width for animation (0-100%)
    const bmiWidth = React.useMemo(() => {
        const weightValue = answers[weightKey];
        const feetValue = answers[feetKey];
        const inchesValue = answers[inchesKey];

        // Only proceed if all values exist and are not empty strings
        if (!weightValue || !feetValue || !inchesValue ||
            weightValue === '' || feetValue === '' || inchesValue === '') {
            return 0;
        }

        const weight = parseFloat(weightValue as string);
        const feet = parseFloat(feetValue as string);
        const inches = parseFloat(inchesValue as string);

        // Only calculate if all values are present, valid, and height is meaningful
        if (weight > 0 && !isNaN(feet) && !isNaN(inches) && feet >= 0 && inches >= 0) {
            const totalInches = feet * 12 + inches;
            if (totalInches === 0) return 0; // No height = no BMI

            const heightInMeters = totalInches * 0.0254;
            const weightInKg = weight * 0.453592;
            const bmi = weightInKg / (heightInMeters * heightInMeters);
            return Math.min((bmi / 40) * 100, 100);
        }
        return 0;
    }, [answers[weightKey], answers[feetKey], answers[inchesKey], weightKey, feetKey, inchesKey]);

    // Animate from 0 to target width on first render with values, then smoothly transition
    React.useEffect(() => {
        if (bmiWidth > 0) {
            if (!hasAnimatedRef.current) {
                // First time: animate from 0
                hasAnimatedRef.current = true;
                setAnimatedWidth(0);
                // Use requestAnimationFrame to ensure browser paints 0% first
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setAnimatedWidth(bmiWidth);
                    });
                });
            } else {
                // Subsequent times: just update directly (CSS transition will handle it)
                setAnimatedWidth(bmiWidth);
            }
        } else {
            // Reset if BMI goes back to 0
            hasAnimatedRef.current = false;
            setAnimatedWidth(0);
        }
    }, [bmiWidth]);

    console.log('🔍 BMI Calculator Debug:', {
        bmiQuestions,
        weightQuestion,
        feetQuestion,
        inchesQuestion,
        weightKey,
        feetKey,
        inchesKey,
        answers,
        weightValue: answers[weightKey],
        feetValue: answers[feetKey],
        inchesValue: answers[inchesKey],
        weightEmpty: answers[weightKey] === '',
        feetEmpty: answers[feetKey] === '',
        inchesEmpty: answers[inchesKey] === '',
        bmiWidth,
        animatedWidth,
    });

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                    {currentStep?.title || 'What is your current height and weight?'}
                </h3>
                <p className="text-gray-600 text-sm">{currentStep?.description || "We'll calculate your BMI to check your eligibility"}</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-gray-900 font-medium mb-2">
                        {weightQuestion?.questionText || 'Weight (pounds)'}
                        {weightQuestion?.isRequired && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="number"
                        value={answers[weightKey] || ''}
                        onChange={(e) => onAnswerChange(weightKey, e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder={weightQuestion?.placeholder || "200"}
                    />
                </div>

                <div>
                    <label className="block text-gray-900 font-medium mb-2">Height</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <input
                                type="number"
                                value={answers[feetKey] || ''}
                                onChange={(e) => onAnswerChange(feetKey, e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder={feetQuestion?.placeholder || "6"}
                            />
                            <p className="text-gray-600 text-sm mt-1">{feetQuestion?.questionText || 'Feet'}</p>
                        </div>
                        <div>
                            <input
                                type="number"
                                value={answers[inchesKey] || ''}
                                onChange={(e) => onAnswerChange(inchesKey, e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder={inchesQuestion?.placeholder || "2"}
                            />
                            <p className="text-gray-600 text-sm mt-1">{inchesQuestion?.questionText || 'Inches'}</p>
                        </div>
                    </div>
                </div>

                {/* BMI Result */}
                {(() => {
                    // Check if all fields have actual values (not empty strings or undefined)
                    const weightValue = answers[weightKey];
                    const feetValue = answers[feetKey];
                    const inchesValue = answers[inchesKey];

                    // Only proceed if all values exist and are not empty strings
                    if (!weightValue || !feetValue || !inchesValue ||
                        weightValue === '' || feetValue === '' || inchesValue === '') {
                        return null;
                    }

                    const weight = parseFloat(weightValue as string);
                    const feet = parseFloat(feetValue as string);
                    const inches = parseFloat(inchesValue as string);

                    // Only calculate if all values are valid numbers and height is meaningful
                    if (weight > 0 && !isNaN(feet) && !isNaN(inches) && feet >= 0 && inches >= 0) {
                        const totalInches = feet * 12 + inches;
                        // Require at least some height (total inches > 0)
                        if (totalInches === 0) return null;

                        const heightInMeters = totalInches * 0.0254;
                        const weightInKg = weight * 0.453592;
                        const bmi = weightInKg / (heightInMeters * heightInMeters);

                        let category = '';
                        let colorClass = '';

                        if (bmi < 18.5) {
                            category = 'Underweight';
                            colorClass = 'bg-blue-500';
                        } else if (bmi < 25) {
                            category = 'Normal';
                            colorClass = 'bg-green-500';
                        } else if (bmi < 30) {
                            category = 'Overweight';
                            colorClass = 'bg-yellow-500';
                        } else {
                            category = 'Obese';
                            colorClass = 'bg-red-500';
                        }

                        return (
                            <div>
                                <h3 className="text-gray-900 font-medium mb-4">Your BMI Result</h3>
                                <div className="relative mb-4 h-[46px]">
                                    {/* Grey underlay - background */}
                                    <div className="w-full px-6 rounded-full bg-gray-200 h-[46px] flex items-center"></div>

                                    {/* Animated colored overlay */}
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
                                        style={{
                                            width: `${animatedWidth}%`
                                        }}
                                    />

                                    {/* Text on top */}
                                    <div className="absolute top-0 left-0 w-full px-6 py-3 text-gray-900 font-medium text-center z-20">
                                        {bmi.toFixed(1)} - {category}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-sm">
                                    <div className="text-center">
                                        <p className="font-medium text-gray-900">Underweight</p>
                                        <p className="text-gray-600">{"<18.5"}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-gray-900">Normal</p>
                                        <p className="text-gray-600">18.5-24.9</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-gray-900">Overweight</p>
                                        <p className="text-gray-600">25-29.9</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-gray-900">Obese</p>
                                        <p className="text-gray-600">≥30</p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
};

