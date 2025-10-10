import React from "react";
import { Icon } from "@iconify/react";
import { Question, ThemePalette } from "../types";

interface QuestionRendererProps {
    question: Question;
    answers: Record<string, any>;
    errors: Record<string, string>;
    theme: ThemePalette;
    onAnswerChange: (questionId: string, value: any) => void;
    onRadioChange: (questionId: string, value: any) => void;
    onCheckboxChange: (questionId: string, optionValue: string, isChecked: boolean) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
    question,
    answers,
    errors,
    theme,
    onAnswerChange,
    onRadioChange,
    onCheckboxChange,
}) => {
    const value = answers[question.id] || "";
    const hasError = !!errors[question.id];

    switch (question.answerType) {
        case "text":
        case "email":
        case "phone":
            return (
                <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: "var(--q-primary-text)" }}>
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                        type={question.answerType === "email" ? "email" : question.answerType === "phone" ? "tel" : "text"}
                        placeholder={question.placeholder}
                        value={value}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}
                        style={hasError ? undefined : {
                            borderColor: theme.primaryLight,
                            color: "#111827"
                        }}
                        onFocus={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primary;
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryLight}`;
                                e.currentTarget.style.backgroundColor = theme.primaryLighter;
                            }
                        }}
                        onBlur={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primaryLight;
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.backgroundColor = "#FFFFFF";
                            }
                        }}
                    />
                    {question.helpText && (
                        <p className="text-sm text-gray-600">{question.helpText}</p>
                    )}
                    {hasError && (
                        <p className="text-sm text-red-600">{errors[question.id]}</p>
                    )}
                </div>
            );

        case "number": {
            const hasSubtype = (question as any).questionSubtype;
            return (
                <div key={question.id} className="space-y-4">
                    <div>
                        <h3 className="text-2xl font-medium text-gray-900 mb-3">
                            {question.questionText}
                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        {question.helpText && (
                            <p className="text-gray-600">{question.helpText}</p>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder={question.placeholder}
                            value={value}
                            onChange={(e) => onAnswerChange(question.id, e.target.value)}
                            className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                                } outline-none ${hasSubtype ? "pr-16" : ""}`}
                            style={hasError ? undefined : {
                                borderColor: theme.primaryLight,
                                color: "#111827"
                            }}
                            onFocus={(e) => {
                                if (!hasError) {
                                    e.currentTarget.style.borderColor = theme.primary;
                                    e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryLight}`;
                                    e.currentTarget.style.backgroundColor = theme.primaryLighter;
                                }
                            }}
                            onBlur={(e) => {
                                if (!hasError) {
                                    e.currentTarget.style.borderColor = theme.primaryLight;
                                    e.currentTarget.style.boxShadow = "none";
                                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                                }
                            }}
                            onWheel={(e) => hasSubtype && e.currentTarget.blur()}
                        />
                        {hasSubtype && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                                {(question as any).questionSubtype}
                            </div>
                        )}
                    </div>
                    {(question as any).footerNote && (
                        <div className="bg-gray-100 mt-8 rounded-xl p-4">
                            <p
                                className="text-gray-600 text-sm"
                                dangerouslySetInnerHTML={{ __html: (question as any).footerNote }}
                            />
                        </div>
                    )}
                    {hasError && (
                        <p className="text-sm text-red-600">{errors[question.id]}</p>
                    )}
                </div>
            );
        }

        case "date":
            return (
                <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: "var(--q-primary-text)" }}>
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white hover:border-gray-300 focus:border-primary focus:bg-primary-light"
                            } outline-none`}
                    />
                    {question.helpText && (
                        <p className="text-sm text-gray-600">{question.helpText}</p>
                    )}
                    {hasError && (
                        <p className="text-sm text-red-600">{errors[question.id]}</p>
                    )}
                </div>
            );

        case "textarea":
            return (
                <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: "var(--q-primary-text)" }}>
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                        placeholder={question.placeholder}
                        value={value}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        rows={4}
                        className={`w-full p-4 rounded-2xl border-2 transition-all resize-none ${hasError
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                            } outline-none`}
                        style={hasError ? undefined : {
                            borderColor: theme.primaryLight,
                            color: "#111827"
                        }}
                        onFocus={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primary;
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryLight}`;
                                e.currentTarget.style.backgroundColor = theme.primaryLighter;
                            }
                        }}
                        onBlur={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primaryLight;
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.backgroundColor = "#FFFFFF";
                            }
                        }}
                    />
                    {question.helpText && (
                        <p className="text-sm text-gray-600">{question.helpText}</p>
                    )}
                    {hasError && (
                        <p className="text-sm text-red-600">{errors[question.id]}</p>
                    )}
                </div>
            );

        case "radio": {
            const renderGenericRadio = () => (
                <div key={question.id} className="space-y-4">
                    <div>
                        <h3 className="text-2xl font-medium text-gray-900 mb-3">
                            {question.questionText}
                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        {question.helpText && <p className="text-gray-600">{question.helpText}</p>}
                    </div>

                    <div className="space-y-3">
                        {question.options?.map((option) => {
                            const isSelected = value === option.optionValue;
                            return (
                                <label
                                    key={option.id}
                                    className={`block w-full p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? "" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                    style={isSelected ? { backgroundColor: theme.primaryLight, borderColor: theme.primary } : undefined}
                                >
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name={question.id}
                                                value={option.optionValue}
                                                checked={isSelected}
                                                onChange={(e) => onRadioChange(question.id, e.target.value)}
                                                className="sr-only"
                                            />
                                            <div
                                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                                style={isSelected ? { borderColor: theme.primary, backgroundColor: theme.primary } : undefined}
                                            >
                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                        <span className="ml-3 text-gray-900 font-medium">{option.optionText}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    {hasError && <p className="text-sm text-red-600">{errors[question.id]}</p>}
                </div>
            );

            if (question.questionText === "What's your gender at birth?") {
                const genderOptions = [
                    { value: "Male", label: "Male", emoji: "🧑" },
                    { value: "Female", label: "Female", emoji: "👩" }
                ];

                return (
                    <div key={question.id} className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-3">
                                {question.questionText}
                                {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            {question.helpText && <p className="text-gray-600">{question.helpText}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {genderOptions.map((option) => {
                                const isSelected = value === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`p-6 rounded-2xl border-2 text-center transition-all ${isSelected ? "" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                        style={isSelected ? { backgroundColor: theme.primaryLight, borderColor: theme.primary } : undefined}
                                        onClick={() => onRadioChange(question.id, option.value)}
                                    >
                                        <div className="text-4xl mb-3">{option.emoji}</div>
                                        <span
                                            className={`font-medium text-lg ${isSelected ? "" : "text-gray-900"}`}
                                            style={{ color: isSelected ? theme.primary : undefined }}
                                        >
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            return renderGenericRadio();
        }

        case "checkbox":
            return (
                <div key={question.id} className="space-y-4">
                    <div>
                        <h3 className="text-2xl font-medium text-gray-900 mb-3">
                            {question.questionText}
                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        {question.helpText && <p className="text-gray-600">{question.helpText}</p>}
                    </div>

                    <div className="space-y-3">
                        {question.options?.map((option) => {
                            const currentValues = Array.isArray(value) ? value : [];
                            const isChecked = currentValues.includes(option.optionValue);
                            return (
                                <label
                                    key={option.id}
                                    className={`block w-full p-4 rounded-2xl border-2 cursor-pointer transition-all ${isChecked ? "" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                    style={isChecked ? { backgroundColor: theme.primaryLight, borderColor: theme.primary } : undefined}
                                >
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                value={option.optionValue}
                                                checked={isChecked}
                                                onChange={(e) => onCheckboxChange(question.id, option.optionValue, e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div
                                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                                style={isChecked ? { borderColor: theme.primary, backgroundColor: theme.primary } : undefined}
                                            >
                                                {isChecked && <Icon icon="lucide:check" className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                        <span className="ml-3 text-gray-900 font-medium">{option.optionText}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    {hasError && <p className="text-sm text-red-600">{errors[question.id]}</p>}
                </div>
            );

        case "select":
            if ((question as any).questionSubtype === "State") {
                const stateAbbreviations: Record<string, string> = {
                    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
                    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
                    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
                    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
                    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
                    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
                    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
                    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
                    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
                    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
                    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
                    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
                    "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC"
                };

                return (
                    <div key={question.id} className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-3">
                                {question.questionText}
                                {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            {question.helpText && <p className="text-gray-600">{question.helpText}</p>}
                        </div>

                        <div className="space-y-3">
                            {question.options?.map((option) => {
                                const stateAbbr = stateAbbreviations[option.optionText];
                                const isSelected = value === option.optionValue;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={`block w-full p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? "" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                        style={isSelected ? { backgroundColor: theme.primaryLight, borderColor: theme.primary } : undefined}
                                        onClick={() => onRadioChange(question.id, option.optionValue)}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
                                                {stateAbbr ? (
                                                    <img
                                                        src={`/images/${stateAbbr}.svg`}
                                                        alt={`${option.optionText} flag`}
                                                        className="w-6 h-4 object-cover rounded-sm"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-sm"></div>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{option.optionText}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {hasError && <p className="text-sm text-red-600">{errors[question.id]}</p>}
                    </div>
                );
            }

            return (
                <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: "var(--q-primary-text)" }}>
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                            } outline-none`}
                        style={hasError ? undefined : {
                            borderColor: theme.primaryLight,
                            color: "#111827"
                        }}
                        onFocus={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primary;
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryLight}`;
                                e.currentTarget.style.backgroundColor = theme.primaryLighter;
                            }
                        }}
                        onBlur={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primaryLight;
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.backgroundColor = "#FFFFFF";
                            }
                        }}
                    >
                        <option value="">{question.placeholder || "Select an option"}</option>
                        {question.options?.map((option) => (
                            <option key={option.id} value={option.optionValue}>
                                {option.optionText}
                            </option>
                        ))}
                    </select>
                    {question.helpText && <p className="text-sm text-gray-600">{question.helpText}</p>}
                    {hasError && <p className="text-sm text-red-600">{errors[question.id]}</p>}
                </div>
            );

        case "height":
            return (
                <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: "var(--q-primary-text)" }}>
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <input
                                type="number"
                                placeholder="5"
                                value={value.feet || ""}
                                onChange={(e) => onAnswerChange(question.id, { ...value, feet: e.target.value })}
                                className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                    } outline-none`}
                                style={hasError ? undefined : {
                                    borderColor: theme.primaryLight,
                                    color: "#111827"
                                }}
                                onFocus={(e) => {
                                    if (!hasError) {
                                        e.currentTarget.style.borderColor = theme.primary;
                                        e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryLight}`;
                                        e.currentTarget.style.backgroundColor = theme.primaryLighter;
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!hasError) {
                                        e.currentTarget.style.borderColor = theme.primaryLight;
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                                    }
                                }}
                            />
                            <label className="block text-xs text-gray-500 mt-1 ml-1">Feet</label>
                        </div>
                        <div className="flex-1">
                            <input
                                type="number"
                                placeholder="10"
                                value={value.inches || ""}
                                onChange={(e) => onAnswerChange(question.id, { ...value, inches: e.target.value })}
                                className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                    } outline-none`}
                                style={hasError ? undefined : {
                                    borderColor: theme.primaryLight,
                                    color: "#111827"
                                }}
                                onFocus={(e) => {
                                    if (!hasError) {
                                        e.currentTarget.style.borderColor = theme.primary;
                                        e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryLight}`;
                                        e.currentTarget.style.backgroundColor = theme.primaryLighter;
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!hasError) {
                                        e.currentTarget.style.borderColor = theme.primaryLight;
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                                    }
                                }}
                            />
                            <label className="block text-xs text-gray-500 mt-1 ml-1">Inches</label>
                        </div>
                    </div>
                    {question.helpText && (
                        <p className="text-sm text-gray-600">{question.helpText}</p>
                    )}
                    {hasError && (
                        <p className="text-sm text-red-600">{errors[question.id]}</p>
                    )}
                </div>
            );

        case "weight":
            return (
                <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: "var(--q-primary-text)" }}>
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                        type="number"
                        placeholder={question.placeholder}
                        value={value}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                            } outline-none`}
                        style={hasError ? undefined : {
                            borderColor: theme.primaryLight,
                            color: "#111827"
                        }}
                        onFocus={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primary;
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryLight}`;
                                e.currentTarget.style.backgroundColor = theme.primaryLighter;
                            }
                        }}
                        onBlur={(e) => {
                            if (!hasError) {
                                e.currentTarget.style.borderColor = theme.primaryLight;
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.backgroundColor = "#FFFFFF";
                            }
                        }}
                    />
                    {question.helpText && (
                        <p className="text-sm text-gray-600">{question.helpText}</p>
                    )}
                    {hasError && (
                        <p className="text-sm text-red-600">{errors[question.id]}</p>
                    )}
                </div>
            );

        default:
            return (
                <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: "var(--q-primary-text)" }}>
                        {question.questionText}
                        {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                        type="text"
                        placeholder={question.placeholder}
                        value={value}
                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all ${hasError
                            ? "border-red-300 bg-red-50"
                            : `border-gray-200 bg-white hover:border-gray-300`}
              outline-none`}
                    />
                    {question.helpText && (
                        <p className="text-sm text-gray-600">{question.helpText}</p>
                    )}
                    {hasError && (
                        <p className="text-sm text-red-600">{errors[question.id]}</p>
                    )}
                </div>
            );
    }
};


