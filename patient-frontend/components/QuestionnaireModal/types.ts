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
    category?: 'normal' | 'user_profile' | 'doctor';
    isDeadEnd?: boolean;
    required?: boolean;
    questions?: Question[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    placeholderSig: string;
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
    treatmentId?: string;
    treatmentName?: string;
    questionnaireId?: string; // when provided, load questionnaire directly (product-based)
    productName?: string; // optional label when questionnaire is product-based
    productCategory?: string; // optional product category (e.g., weight_loss)
    productFormVariant?: string; // '1' | '2' when product-based; if '2' prepend standardized steps
    // Product checkout fallback pricing
    productPrice?: number;
    productStripePriceId?: string;
    productStripeProductId?: string;
    tenantProductId?: string;
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


