export interface QuestionOption {
    id: string;
    optionText: string;
    optionValue: string;
    optionOrder: number;
}

export interface Question {
    id: string;
    questionText: string;
    answerType: string;
    isRequired: boolean;
    questionOrder: number;
    placeholder?: string;
    helpText?: string;
    options?: QuestionOption[];
    conditionalLogic?: string;
    conditionalLevel?: number;
    subQuestionOrder?: number;
    [key: string]: any;
}

export interface QuestionnaireStep {
    id: string;
    title: string;
    description?: string;
    stepOrder: number;
    questions?: Question[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    dosage: string;
    imageUrl: string;
}

export type ShippingInfoUpdater = (field: string, value: string) => void;

export interface TreatmentPlan {
    id: string;
    billingInterval: string;
    sortOrder: number;
    price: number;
    name: string;
    description?: string;
    popular?: boolean;
    active?: boolean;
    stripePriceId?: string;
    features?: string[];
    [key: string]: any;
}

export interface QuestionnaireData {
    id: string;
    title: string;
    description?: string;
    checkoutStepPosition: number;
    color?: string | null;
    steps: QuestionnaireStep[];
    treatment?: {
        products: Product[];
        treatmentPlans?: TreatmentPlan[];
        [key: string]: any;
    };
    [key: string]: any;
}

export interface QuestionnaireModalProps {
    isOpen: boolean;
    onClose: () => void;
    treatmentId: string;
    treatmentName: string;
}

export interface ThemePalette {
    primary: string;
    primaryDark: string;
    primaryDarker: string;
    primaryLight: string;
    primaryLighter: string;
    text: string;
}

export interface PlanOption {
    id: string;
    uuid?: string;
    name: string;
    description?: string;
    price: number;
    badge?: string;
    badgeColor?: "success" | "primary";
    stripePriceId?: string;
    billingInterval?: string;
    features?: string[];
}

export interface CheckoutViewProps {
    plans: PlanOption[];
    selectedPlan: string;
    onPlanChange: (planId: string) => void;
    paymentStatus: "idle" | "processing" | "succeeded" | "failed";
    clientSecret: string | null;
    shippingInfo: Record<string, string>;
    onShippingInfoChange: ShippingInfoUpdater;
    onRetryPaymentSetup: () => void;
    onCreateSubscription: (planId: string) => Promise<void>;
    onPaymentSuccess: () => Promise<void>;
    onPaymentError: (error: string) => void;
    stripePromise: any;
    theme: ThemePalette;
    questionnaireProducts?: Product[];
    selectedProducts: Record<string, number>;
    treatmentName: string;
}


