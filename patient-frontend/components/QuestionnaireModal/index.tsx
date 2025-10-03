import React, { useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Progress,
  Input,
  Textarea,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
  Divider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall } from "../../lib/api";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../lib/stripe";
import { StripePaymentForm } from "../StripePaymentForm";
import {
  QuestionnaireModalProps,
  QuestionnaireData,
  QuestionnaireStep,
  PlanOption,
} from "./types";
import { createTheme, buildThemeVars } from "./theme";
import { ProgressBar } from "./components/ProgressBar";
import { StepHeader } from "./components/StepHeader";
import { QuestionRenderer } from "./components/QuestionRenderer";
import { CheckoutView } from "./components/CheckoutView";
import { ProductSelection } from "./components/ProductSelection";

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({
  isOpen,
  onClose,
  treatmentId,
  treatmentName
}) => {
  const [questionnaire, setQuestionnaire] = React.useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = React.useState<Record<string, number>>({});
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = React.useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = React.useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  // Checkout form state
  const [selectedPlan, setSelectedPlan] = React.useState("monthly");

  // Medication modal state
  const [showMedicationModal, setShowMedicationModal] = React.useState(false);
  const [selectedMedication, setSelectedMedication] = React.useState("semaglutide-orals");
  const [shippingInfo, setShippingInfo] = React.useState({
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "us"
  });
  const [checkoutPaymentInfo, setCheckoutPaymentInfo] = React.useState({
    cardNumber: "",
    expiryDate: "",
    securityCode: "",
    country: "brazil"
  });

  // Use real treatment plans from the backend
  const plans = useMemo(() => {
    if (!questionnaire?.treatment?.treatmentPlans || questionnaire.treatment.treatmentPlans.length === 0) {
      return [];
    }

    return questionnaire.treatment.treatmentPlans
      .filter((plan: any) => plan.active)
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((plan: any) => ({
        id: plan.billingInterval, // Use billingInterval as ID (monthly, quarterly, annual)
        uuid: plan.id, // Keep UUID for database operations
        name: plan.name,
        description: plan.description || `Billed ${plan.billingInterval}`,
        price: plan.price,
        badge: plan.popular ? "Most Popular" : undefined,
        badgeColor: plan.popular ? "success" as const : "primary" as const,
        stripePriceId: plan.stripePriceId,
        billingInterval: plan.billingInterval,
        features: [
          "Prescription medications included",
          "Free expedited shipping",
          "HSA + FSA eligible",
          "Home delivery included"
        ]
      }));
  }, [questionnaire?.treatment?.treatmentPlans]);

  // Set default selected plan to first available plan
  React.useEffect(() => {
    console.log('🎯 Plan selection useEffect:', {
      plansLength: plans.length,
      selectedPlan,
      firstPlanId: plans[0]?.id,
      allPlans: plans.map(p => ({ id: p.id, name: p.name }))
    });

    if (plans.length > 0 && !selectedPlan) {
      console.log('🎯 Setting selectedPlan to first plan:', plans[0].id);
      setSelectedPlan(plans[0].id);
    }
  }, [plans, selectedPlan]);

  // US States list
  const usStates = [
    { key: "AL", name: "Alabama" },
    { key: "AK", name: "Alaska" },
    { key: "AZ", name: "Arizona" },
    { key: "AR", name: "Arkansas" },
    { key: "CA", name: "California" },
    { key: "CO", name: "Colorado" },
    { key: "CT", name: "Connecticut" },
    { key: "DE", name: "Delaware" },
    { key: "FL", name: "Florida" },
    { key: "GA", name: "Georgia" },
    { key: "HI", name: "Hawaii" },
    { key: "ID", name: "Idaho" },
    { key: "IL", name: "Illinois" },
    { key: "IN", name: "Indiana" },
    { key: "IA", name: "Iowa" },
    { key: "KS", name: "Kansas" },
    { key: "KY", name: "Kentucky" },
    { key: "LA", name: "Louisiana" },
    { key: "ME", name: "Maine" },
    { key: "MD", name: "Maryland" },
    { key: "MA", name: "Massachusetts" },
    { key: "MI", name: "Michigan" },
    { key: "MN", name: "Minnesota" },
    { key: "MS", name: "Mississippi" },
    { key: "MO", name: "Missouri" },
    { key: "MT", name: "Montana" },
    { key: "NE", name: "Nebraska" },
    { key: "NV", name: "Nevada" },
    { key: "NH", name: "New Hampshire" },
    { key: "NJ", name: "New Jersey" },
    { key: "NM", name: "New Mexico" },
    { key: "NY", name: "New York" },
    { key: "NC", name: "North Carolina" },
    { key: "ND", name: "North Dakota" },
    { key: "OH", name: "Ohio" },
    { key: "OK", name: "Oklahoma" },
    { key: "OR", name: "Oregon" },
    { key: "PA", name: "Pennsylvania" },
    { key: "RI", name: "Rhode Island" },
    { key: "SC", name: "South Carolina" },
    { key: "SD", name: "South Dakota" },
    { key: "TN", name: "Tennessee" },
    { key: "TX", name: "Texas" },
    { key: "UT", name: "Utah" },
    { key: "VT", name: "Vermont" },
    { key: "VA", name: "Virginia" },
    { key: "WA", name: "Washington" },
    { key: "WV", name: "West Virginia" },
    { key: "WI", name: "Wisconsin" },
    { key: "WY", name: "Wyoming" },
    { key: "DC", name: "District of Columbia" }
  ];

  // Load questionnaire data
  React.useEffect(() => {
    const loadQuestionnaire = async () => {
      if (!isOpen || !treatmentId) return;

      setLoading(true);
      try {
        // Fetch both questionnaire and treatment products
        const [questionnaireResult, treatmentResult] = await Promise.all([
          apiCall(`/questionnaires/treatment/${treatmentId}`),
          apiCall(`/treatments/${treatmentId}`)
        ]);
        console.log('📋 Questionnaire API result:', questionnaireResult);
        console.log('📋 Treatment API result:', treatmentResult);

        if (questionnaireResult.success && questionnaireResult.data && treatmentResult.success && treatmentResult.data) {
          // The actual questionnaire data is nested in result.data.data
          const questionnaireData = questionnaireResult.data.data || questionnaireResult.data;
          const treatmentData = treatmentResult.data.data || treatmentResult.data;
          console.log('📋 Questionnaire data:', questionnaireData);
          console.log('📋 Treatment data:', treatmentData);
          console.log('📋 Steps:', questionnaireData.steps);

          // Ensure steps array exists (allow empty arrays for checkout-only questionnaires)
          if (!Array.isArray(questionnaireData.steps)) {
            console.log('⚠️ No steps array found, initializing empty array for checkout-only questionnaire');
            questionnaireData.steps = [];
          }

          // Combine questionnaire with treatment products
          const combinedData = {
            ...questionnaireData,
            treatment: treatmentData
          };

          setQuestionnaire(combinedData);
        } else {
          throw new Error('Failed to load questionnaire');
        }
      } catch (error) {
        console.error('Error loading questionnaire:', error);
        alert('Failed to load questionnaire: ' + (error as Error).message);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaire();
  }, [isOpen, treatmentId, onClose]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setAnswers({});
      setErrors({});
      setQuestionnaire(null);
      setSelectedProducts({});
      setClientSecret(null);
      setPaymentIntentId(null);
      setPaymentStatus('idle');
      setSelectedPlan("monthly");
      setShippingInfo({
        address: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        country: "us"
      });
      setCheckoutPaymentInfo({
        cardNumber: "",
        expiryDate: "",
        securityCode: "",
        country: "brazil"
      });
    }
  }, [isOpen]);

  // Set initial step when questionnaire loads
  React.useEffect(() => {
    if (questionnaire && isOpen) {
      // Always start at step 0 (either first questionnaire step or product selection)
      setCurrentStepIndex(0);
    }
  }, [questionnaire, isOpen]);

  // Create subscription when entering checkout step (DISABLED - now done on payment submit)
  React.useEffect(() => {
    const createSubscription = async () => {
      return; // Disabled auto-creation - subscription created on payment submit
      console.log('🔄 useEffect triggered - checking conditions:', {
        isCheckoutStep: isCheckoutStep(),
        hasQuestionnaire: !!questionnaire,
        hasClientSecret: !!clientSecret,
        hasTreatmentId: !!treatmentId,
        currentStepIndex,
        selectedPlan
      });

      if (!isCheckoutStep() || !questionnaire) {
        console.log('⏭️ Skipping: not checkout step or no questionnaire');
        return;
      }

      if (clientSecret) {
        console.log('⏭️ Skipping: clientSecret already exists');
        return;
      }

      if (!treatmentId) {
        console.log('⏭️ Skipping: no treatmentId');
        setPaymentStatus('idle');
        return;
      }

      if (!selectedPlan) {
        console.log('⏭️ Skipping: no plan selected yet, waiting...');
        setPaymentStatus('idle');
        return;
      }

      try {
        console.log('💳 Auto-creating treatment subscription...');
        console.log('🔍 Debug subscription creation:', {
          selectedPlan,
          plansAvailable: plans.map(p => ({ id: p.id, name: p.name })),
          planLookupResult: plans.find(plan => plan.id === selectedPlan)
        });

        const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
        const stripePriceId = selectedPlanData?.stripePriceId;

        if (!stripePriceId) {
          console.error('❌ No stripePriceId found for selected plan:', selectedPlan);
          setPaymentStatus('idle');
          return;
        }


        // Prepare user details for subscription
        const userDetails = {
          firstName: answers['firstName'],
          lastName: answers['lastName'],
          email: answers['email'],
          phoneNumber: answers['mobile']
        };

        console.log('💳 Request payload:', {
          treatmentId: treatmentId,
          stripePriceId: stripePriceId,
          userDetails: userDetails
        });
        setPaymentStatus('processing');

        const result = await apiCall('/payments/treatment/sub', {
          method: 'POST',
          body: JSON.stringify({
            treatmentId: treatmentId,
            stripePriceId: stripePriceId,
            userDetails: userDetails
          })
        });

        console.log('💳 Subscription API response:', result);

        if (result.success && result.data) {
          // Handle nested response structure: result.data.data or result.data
          let subscriptionData = result.data;
          if (result.data.data) {
            subscriptionData = result.data.data;
          }

          console.log('💳 Subscription data extracted:', subscriptionData);

          if (subscriptionData.clientSecret) {
            setClientSecret(subscriptionData.clientSecret);
            setPaymentIntentId(subscriptionData.subscriptionId || subscriptionData.id);
            setPaymentStatus('idle');
            console.log('💳 Treatment subscription auto-created successfully');
          } else {
            console.error('❌ No clientSecret in subscription response:', subscriptionData);
            setPaymentStatus('idle'); // Fall back to manual trigger
          }
        } else {
          console.error('❌ Subscription creation failed:', result);
          setPaymentStatus('idle'); // Fall back to manual trigger
        }
      } catch (error) {
        console.error('❌ Subscription creation error:', error);
        setPaymentStatus('idle'); // Fall back to manual trigger
      }
    };

    createSubscription();
  }, [currentStepIndex, treatmentId, clientSecret, selectedPlan]);


  // Helper functions for checkout steps
  const getTotalSteps = (): number => {
    if (!questionnaire) return 0;
    // For subscription treatments, skip product selection step
    return questionnaire.steps.length + 1; // +1 for checkout only
  };

  const isProductSelectionStep = (): boolean => {
    // Skip product selection for subscription treatments
    return false;
  };

  const isCheckoutStep = (): boolean => {
    if (!questionnaire) return false;
    const checkoutPos = questionnaire.checkoutStepPosition;
    // For subscription treatments, checkout comes right after questionnaire steps
    const checkoutStepIndex = checkoutPos === -1 ? questionnaire.steps.length : checkoutPos;
    return currentStepIndex === checkoutStepIndex;
  };

  const getCurrentQuestionnaireStep = () => {
    if (!questionnaire || isProductSelectionStep() || isCheckoutStep()) return null;

    const checkoutPos = questionnaire.checkoutStepPosition;
    let actualStepIndex = currentStepIndex;

    // Adjust for checkout steps if they appear before this step
    if (checkoutPos !== -1 && currentStepIndex > checkoutPos + 1) {
      actualStepIndex = currentStepIndex - 2;
    }

    return questionnaire.steps[actualStepIndex];
  };

  // Function to build questionnaire answers object (for real-time logging)
  const buildQuestionnaireAnswers = (currentAnswers: Record<string, any>) => {
    const questionnaireAnswers: Record<string, string> = {};

    // Process each questionnaire step and question
    questionnaire?.steps?.forEach(step => {
      step.questions?.forEach(question => {
        const answerKey = question.id;
        const answerValue = currentAnswers[answerKey];

        if (answerValue !== undefined && answerValue !== '') {
          // For single/multiple choice and checkbox questions, get the option text
          if (question.answerType === 'single_choice' || question.answerType === 'multiple_choice' || question.answerType === 'checkbox') {
            if (Array.isArray(answerValue)) {
              // Multiple choice/checkbox - join selected options
              const selectedTexts = answerValue.map(value => {
                const option = question.options?.find(opt => opt.optionValue === value);
                return option?.optionText || value;
              });
              questionnaireAnswers[question.questionText] = selectedTexts.join(', ');
            } else {
              // Single choice - find the option text
              const option = question.options?.find(opt => opt.optionValue === answerValue);
              questionnaireAnswers[question.questionText] = option?.optionText || answerValue;
            }
          } else {
            // For text inputs, number inputs, etc., use the value directly
            questionnaireAnswers[question.questionText] = String(answerValue);
          }
        }
      });
    });

    // Add form fields from account creation step
    if (currentAnswers['firstName']) questionnaireAnswers['First Name'] = currentAnswers['firstName'];
    if (currentAnswers['lastName']) questionnaireAnswers['Last Name'] = currentAnswers['lastName'];
    if (currentAnswers['email']) questionnaireAnswers['Email Address'] = currentAnswers['email'];
    if (currentAnswers['mobile']) questionnaireAnswers['Mobile Number'] = currentAnswers['mobile'];

    // Add calculated BMI fields
    if (currentAnswers['weight']) questionnaireAnswers['Weight (pounds)'] = currentAnswers['weight'];
    if (currentAnswers['heightFeet']) questionnaireAnswers['Height Feet'] = currentAnswers['heightFeet'];
    if (currentAnswers['heightInches']) questionnaireAnswers['Height Inches'] = currentAnswers['heightInches'];
    if (currentAnswers['heightAndWeight']) questionnaireAnswers['What is your current height and weight?'] = currentAnswers['heightAndWeight'];
    if (currentAnswers['bmi'] && currentAnswers['bmiCategory']) {
      questionnaireAnswers['BMI Result'] = `${currentAnswers['bmi']} - ${currentAnswers['bmiCategory']}`;
    }

    return questionnaireAnswers;
  };

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };

    // Calculate BMI if weight or height fields are being updated
    if (questionId === 'weight' || questionId === 'heightFeet' || questionId === 'heightInches') {
      const weight = parseFloat(newAnswers['weight'] as string);
      const feet = parseFloat(newAnswers['heightFeet'] as string);
      const inches = parseFloat(newAnswers['heightInches'] as string);

      if (weight && feet >= 0 && inches >= 0) {
        const totalInches = feet * 12 + inches;
        const heightInMeters = totalInches * 0.0254;
        const weightInKg = weight * 0.453592;
        const bmi = weightInKg / (heightInMeters * heightInMeters);

        let category = '';
        if (bmi < 18.5) {
          category = 'Underweight';
        } else if (bmi < 25) {
          category = 'Normal';
        } else if (bmi < 30) {
          category = 'Overweight';
        } else {
          category = 'Obese';
        }

        // Add BMI data to answers
        newAnswers['bmi'] = bmi.toFixed(1);
        newAnswers['bmiCategory'] = category;
        newAnswers['heightAndWeight'] = `${weight} lbs, ${feet}'${inches}"`;
      }
    }

    setAnswers(newAnswers);

    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }

    // Log the updated questionnaire answers in real-time
    const questionnaireAnswers = buildQuestionnaireAnswers(newAnswers);
    console.log('📋 ⚡ Real-time questionnaire update:');
    console.log(`📋 Changed: "${questionId}" = `, value);
    console.log('📋 Current questionnaire answers:', questionnaireAnswers);
  };

  const handleRadioChange = (questionId: string, value: any) => {
    // Update state synchronously for immediate navigation
    let newAnswers = { ...answers, [questionId]: value };

    // Log the updated questionnaire answers in real-time
    const questionnaireAnswers = buildQuestionnaireAnswers(newAnswers);
    console.log('📋 ⚡ Real-time questionnaire update (Radio):');
    console.log(`📋 Changed: "${questionId}" = `, value);
    console.log('📋 Current questionnaire answers:', questionnaireAnswers);

    // Generic logic: Clear dependent questions when ANY radio answer actually changes
    const currentStep = getCurrentQuestionnaireStep();
    const question = currentStep?.questions?.find(q => q.id === questionId);

    if (question && question.answerType === 'radio') {
      const previousValue = answers[questionId];

      // Only clear dependent questions if the answer actually changed
      if (previousValue !== value) {
        // Helper function to recursively find all questions that depend on a given question
        const findDependentQuestions = (targetQuestionOrder: number, visitedOrders = new Set()): number[] => {
          if (visitedOrders.has(targetQuestionOrder)) return [];
          visitedOrders.add(targetQuestionOrder);

          const dependentOrders: number[] = [];

          currentStep.questions.forEach(q => {
            const logic = (q as any).conditionalLogic;
            if (logic && logic.includes(`questionOrder:${targetQuestionOrder},answer:`)) {
              dependentOrders.push(q.questionOrder);
              // Recursively find questions that depend on this question
              const subDependents = findDependentQuestions(q.questionOrder, visitedOrders);
              dependentOrders.push(...subDependents);
            }
          });

          return dependentOrders;
        };

        // Find all questions that depend on this radio question
        const dependentOrders = findDependentQuestions(question.questionOrder);

        // Clear answers for all dependent questions
        currentStep.questions.forEach(q => {
          if (dependentOrders.includes(q.questionOrder)) {
            delete newAnswers[q.id];
          }
        });
      }
    }

    setAnswers(newAnswers);

    // Clear errors for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }

    // Check if current step has conditional questions
    const hasConditionalQuestions = currentStep?.questions?.some(q =>
      (q as any).conditionalLogic
    );

    // Only auto-advance if there are no conditional questions in this step
    if (!hasConditionalQuestions && questionnaire) {
      const totalSteps = getTotalSteps();
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleCheckboxChange = (questionId: string, optionValue: string, isChecked: boolean) => {
    const currentValues = answers[questionId] || [];
    const newValues = isChecked
      ? [...currentValues, optionValue]
      : currentValues.filter((v: string) => v !== optionValue);

    // Update state
    setAnswers(prev => ({
      ...prev,
      [questionId]: newValues
    }));

    // Clear errors for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }

    // Log the updated questionnaire answers in real-time
    const questionnaireAnswers = buildQuestionnaireAnswers({
      ...answers,
      [questionId]: newValues
    });
    console.log('📋 ⚡ Real-time questionnaire update (checkbox):');
    console.log(`📋 Changed: "${questionId}" = `, newValues);
    console.log('📋 Current questionnaire answers:', questionnaireAnswers);

    // Auto-advance if "None of the above" is selected
    if (isChecked && (optionValue.toLowerCase().includes('none of the above') ||
      optionValue.toLowerCase().includes('none of these'))) {
      // Check if current step has conditional questions
      const currentStep = getCurrentQuestionnaireStep();
      const hasConditionalQuestions = currentStep?.questions?.some(q =>
        (q as any).conditionalLogic
      );

      // Only auto-advance if there are no conditional questions in this step
      if (!hasConditionalQuestions && questionnaire) {
        const totalSteps = getTotalSteps();
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          handleSubmit();
        }
      }
    }
  };

  // Handle product quantity changes
  const handleProductQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    if (!questionnaire) return true;

    // Validate product selection step
    if (isProductSelectionStep()) {
      const hasSelectedProducts = Object.values(selectedProducts).some(qty => qty > 0);
      if (!hasSelectedProducts) {
        alert('Please select at least one product to continue.');
        return false;
      }
      return true;
    }

    // Validate checkout step
    if (isCheckoutStep()) {
      // For subscription treatments, no product validation needed

      // Validate required shipping fields
      const requiredShippingFields = ['address', 'city', 'state', 'zipCode'];
      for (const field of requiredShippingFields) {
        if (!shippingInfo[field as keyof typeof shippingInfo]?.trim()) {
          alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
          return false;
        }
      }

      // Validate Stripe payment is completed
      if (paymentStatus !== 'succeeded') {
        alert('Please complete your payment information before proceeding.');
        return false;
      }

      return true;
    }

    // Validate regular questionnaire step
    const currentStep = getCurrentQuestionnaireStep();
    if (!currentStep) return true;

    // Special validation for Create Your Account step
    if (currentStep.title === 'Create Your Account') {
      const stepErrors: Record<string, string> = {};
      const requiredFields = ['firstName', 'lastName', 'email', 'mobile'];

      for (const field of requiredFields) {
        const answer = answers[field];
        if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
          stepErrors[field] = 'This field is required';
        }
      }

      // Basic email validation
      const email = answers['email'];
      if (email && !email.includes('@')) {
        stepErrors['email'] = 'Please enter a valid email address';
      }

      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }

    // Special validation for Body Measurements step
    if (currentStep.title === 'Body Measurements') {
      const stepErrors: Record<string, string> = {};
      const requiredFields = ['weight', 'heightFeet', 'heightInches'];

      for (const field of requiredFields) {
        const answer = answers[field];
        if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
          stepErrors[field] = 'This field is required';
        }
      }

      // Validate numeric values
      const weight = parseFloat(answers['weight'] as string);
      const feet = parseFloat(answers['heightFeet'] as string);
      const inches = parseFloat(answers['heightInches'] as string);

      if (weight && (weight < 50 || weight > 1000)) {
        stepErrors['weight'] = 'Please enter a valid weight';
      }

      if (feet && (feet < 1 || feet > 10)) {
        stepErrors['heightFeet'] = 'Please enter a valid height';
      }

      if (inches && (inches < 0 || inches >= 12)) {
        stepErrors['heightInches'] = 'Inches must be between 0 and 11';
      }

      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }

    const stepErrors: Record<string, string> = {};

    if (currentStep.questions) {
      for (const question of currentStep.questions) {
        if (question.isRequired) {
          const answer = answers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0) ||
            (typeof answer === 'string' && answer.trim() === '')) {
            stepErrors[question.id] = 'This field is required';
          }
        }
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Navigate to next step
  const handleNext = () => {
    if (validateCurrentStep() && questionnaire) {
      const totalSteps = getTotalSteps();
      if (currentStepIndex < totalSteps - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Handle plan selection and create subscription
  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId);

    setClientSecret(null);

    setTimeout(async () => {
      await createSubscriptionForPlan(planId);
    }, 100);
  };

  // Create subscription for a specific plan
  const createSubscriptionForPlan = async (planId: string) => {
    try {
      setPaymentStatus('processing');

      const selectedPlanData = plans.find(plan => plan.id === planId);
      const stripePriceId = selectedPlanData?.stripePriceId;

      if (!stripePriceId) {
        console.error('❌ No stripePriceId found for plan:', planId);
        setPaymentStatus('failed');
        return null;
      }

      // Prepare user details for subscription
      const userDetails = {
        firstName: answers['firstName'],
        lastName: answers['lastName'],
        email: answers['email'],
        phoneNumber: answers['mobile']
      };

      // Prepare questionnaire answers in the required format
      const questionnaireAnswers: Record<string, string> = {};

      console.log('📋 Starting questionnaire answers collection...');
      console.log('📋 Raw answers object:', answers);

      // Process each questionnaire step and question
      questionnaire?.steps?.forEach((step, stepIndex) => {
        console.log(`📋 Processing Step ${stepIndex + 1}: ${step.title}`);

        step.questions?.forEach((question, questionIndex) => {
          const answerKey = question.id; // Use question ID as the key
          const answerValue = answers[answerKey];

          console.log(`📋   Question ${questionIndex + 1}: "${question.questionText}"`);
          console.log(`📋   Answer key: "${answerKey}", Raw value:`, answerValue);

          if (answerValue !== undefined && answerValue !== '') {
            let processedAnswer = '';

            // For single/multiple choice questions, get the option text
            if (question.answerType === 'single_choice' || question.answerType === 'multiple_choice') {
              if (Array.isArray(answerValue)) {
                // Multiple choice - join selected options
                const selectedTexts = answerValue.map(value => {
                  const option = question.options?.find(opt => opt.optionValue === value);
                  return option?.optionText || value;
                });
                processedAnswer = selectedTexts.join(', ');
                console.log(`📋   Multiple choice processed:`, selectedTexts);
              } else {
                // Single choice - find the option text
                const option = question.options?.find(opt => opt.optionValue === answerValue);
                processedAnswer = option?.optionText || answerValue;
                console.log(`📋   Single choice processed: "${processedAnswer}"`);
              }
            } else {
              // For text inputs, number inputs, etc., use the value directly
              processedAnswer = String(answerValue);
              console.log(`📋   Text input processed: "${processedAnswer}"`);
            }

            questionnaireAnswers[question.questionText] = processedAnswer;
            console.log(`📋   ✅ Added to answers: "${question.questionText}" = "${processedAnswer}"`);
          } else {
            console.log(`📋   ⏭️ Skipped (empty/undefined)`);
          }
        });

        console.log(`📋 Step ${stepIndex + 1} complete. Current answers:`, { ...questionnaireAnswers });
      });

      // Add form fields from account creation step
      console.log('📋 Adding account creation fields...');
      if (answers['firstName']) {
        questionnaireAnswers['First Name'] = answers['firstName'];
        console.log(`📋 ✅ Added: "First Name" = "${answers['firstName']}"`);
      }
      if (answers['lastName']) {
        questionnaireAnswers['Last Name'] = answers['lastName'];
        console.log(`📋 ✅ Added: "Last Name" = "${answers['lastName']}"`);
      }
      if (answers['email']) {
        questionnaireAnswers['Email Address'] = answers['email'];
        console.log(`📋 ✅ Added: "Email Address" = "${answers['email']}"`);
      }
      if (answers['mobile']) {
        questionnaireAnswers['Mobile Number'] = answers['mobile'];
        console.log(`📋 ✅ Added: "Mobile Number" = "${answers['mobile']}"`);
      }

      console.log('📋 🎉 Final questionnaire answers object:', questionnaireAnswers);

      console.log('💳 Creating subscription for selected plan:', {
        treatmentId,
        stripePriceId,
        planId,
        planName: selectedPlanData?.name
      });

      const result = await apiCall('/payments/treatment/sub', {
        method: 'POST',
        body: JSON.stringify({
          treatmentId: treatmentId,
          stripePriceId: stripePriceId,
          userDetails: userDetails,
          questionnaireAnswers: questionnaireAnswers,
          shippingInfo: shippingInfo
        })
      });

      if (result.success && result.data) {
        const subscriptionData = result.data.data || result.data;
        if (subscriptionData.clientSecret) {
          setClientSecret(subscriptionData.clientSecret);
          setPaymentIntentId(subscriptionData.paymentIntentId || subscriptionData.subscriptionId || subscriptionData.id);
          setPaymentStatus('idle');
          console.log('💳 Subscription created successfully for plan:', selectedPlanData?.name);
          return subscriptionData.clientSecret;
        }
      }

      console.error('❌ Subscription creation failed:', result);
      setPaymentStatus('failed');
      return null;
    } catch (error) {
      console.error('❌ Subscription creation error:', error);
      setPaymentStatus('failed');
      return null;
    }
  };

  // Handle payment success (for subscription payments)
  const handlePaymentSuccess = async () => {
    try {
      if (!paymentIntentId) {
        throw new Error('No payment intent ID');
      }

      // For manual capture flow, payment is authorized but not captured yet
      // The subscription will be created when payment is manually captured later
      setPaymentStatus('succeeded');
      console.log('💳 Payment authorized successfully:', paymentIntentId);
      console.log('💳 Subscription will be created after manual payment capture');

      // Don't close modal, allow user to continue with questionnaire steps
    } catch (error) {
      setPaymentStatus('failed');
      alert('Payment authorization failed. Please contact support.');
    }
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    setPaymentStatus('failed');
    alert(`Payment failed: ${error}`);
  };

  // Submit questionnaire
  const handleSubmit = async () => {
    if (isCheckoutStep()) {
      // Handle checkout submission
      try {
        console.log('💳 Processing checkout with data:', {
          selectedPlan,
          shippingInfo,
          paymentInfo: checkoutPaymentInfo,
          selectedProducts,
          answers
        });

        // Here you would integrate with your actual payment processing
        // For now, we'll just show a success message
        alert('Order submitted successfully! (Payment processing implementation pending)');
        onClose();
      } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your order. Please try again.');
      }
    } else {
      alert('Questionnaire submitted! (Implementation pending)');
      onClose();
    }
  };

  const theme = useMemo(() => createTheme(questionnaire?.color), [questionnaire?.color]);
  const themeVars = useMemo(
    () => ({
      "--q-primary": theme.primary,
      "--q-primary-dark": theme.primaryDark,
      "--q-primary-darker": theme.primaryDarker,
      "--q-primary-light": theme.primaryLight,
      "--q-primary-lighter": theme.primaryLighter,
      "--q-primary-text": theme.text,
    } as React.CSSProperties),
    [theme]
  );

  useEffect(() => {
    console.log("[QuestionnaireModal] theme", {
      questionnaireColor: questionnaire?.color,
      theme,
    });
  }, [questionnaire?.color, theme]);

  if (loading || !questionnaire || !questionnaire.steps) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        classNames={{
          base: "m-0 sm:m-0 max-w-full max-h-full",
          wrapper: "w-full h-full",
          backdrop: "bg-overlay/50"
        }}
        hideCloseButton
      >
        <ModalContent className="h-full bg-white">
          <ModalBody className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Icon icon="lucide:loader-2" className="text-4xl text-primary animate-spin" />
              </div>
              <p className="text-lg">
                {loading ? 'Loading questionnaire...' : 'No questionnaire found for this treatment'}
              </p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const totalSteps = getTotalSteps();
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const currentStep = getCurrentQuestionnaireStep();

  // Determine step title and description
  let stepTitle = '';
  let stepDescription = '';

  if (isProductSelectionStep()) {
    stepTitle = 'Product Selection';
    stepDescription = 'Choose your NAD+ products';
  } else if (isCheckoutStep()) {
    stepTitle = 'Complete Your Order';
    stepDescription = 'Secure checkout for your weight management treatment';
  } else if (currentStep) {
    stepTitle = currentStep.title;
    stepDescription = currentStep.description || '';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      classNames={{
        base: "m-0 sm:m-0 max-w-full max-h-full",
        wrapper: "w-full h-full",
        backdrop: "bg-overlay/50"
      }}
      hideCloseButton
    >
      <ModalContent className="h-full bg-gray-50 questionnaire-theme" style={themeVars}>
        <ModalBody className="p-0 h-full flex flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icon icon="lucide:x" className="text-xl" />
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {totalSteps}
              </p>
            </div>

            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className={`w-full ${isCheckoutStep() ? 'max-w-5xl' : 'max-w-md'} mx-auto min-h-full flex flex-col justify-center`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {isCheckoutStep() ? (
                    // Checkout step with custom layout
                    <>
                      {/* Progress Bar */}
                      <ProgressBar progressPercent={progressPercent} color={theme.primary} />

                      {/* Brand and Previous button for checkout */}
                      <StepHeader
                        onPrevious={handlePrevious}
                        canGoBack={currentStepIndex > 0}
                      />

                      <div className="bg-white rounded-2xl p-6 space-y-6">
                        <CheckoutView
                          plans={plans}
                          selectedPlan={selectedPlan}
                          onPlanChange={handlePlanSelection}
                          paymentStatus={paymentStatus}
                          clientSecret={clientSecret}
                          shippingInfo={shippingInfo}
                          onShippingInfoChange={(field, value) =>
                            setShippingInfo((prev) => ({ ...prev, [field]: value }))
                          }
                          onRetryPaymentSetup={() => {
                            setPaymentStatus('idle');
                            setClientSecret(null);
                            setPaymentIntentId(null);
                          }}
                          onCreateSubscription={createSubscriptionForPlan}
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentError={handlePaymentError}
                          stripePromise={stripePromise}
                          theme={theme}
                          questionnaireProducts={questionnaire.treatment?.products}
                          selectedProducts={selectedProducts}
                          treatmentName={treatmentName}
                        />
                      </div>
                    </>
                  ) : isProductSelectionStep() ? (
                    // Product selection step
                    <>
                      {/* Progress Bar */}
                      <ProgressBar progressPercent={progressPercent} color={theme.primary} />

                      <div className="bg-white rounded-2xl p-6 space-y-6">
                        <ProductSelection
                          products={questionnaire.treatment?.products}
                          selectedProducts={selectedProducts}
                          onChange={handleProductQuantityChange}
                        />

                        {/* Continue button for product selection */}
                        {!(isCheckoutStep() && paymentStatus !== 'succeeded') && (
                          <button
                            onClick={handleNext}
                            disabled={isCheckoutStep() && paymentStatus !== 'succeeded'}
                            className="w-full text-white font-medium py-4 px-6 rounded-2xl text-base h-auto flex items-center justify-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: theme.primary,
                              ...(isCheckoutStep() && paymentStatus !== 'succeeded' ? {} : { boxShadow: `0 10px 20px -10px ${theme.primaryDark}` })
                            }}
                          >
                            {isLastStep ? (isCheckoutStep() ? 'Complete Order' : 'Continue') :
                              (isCheckoutStep() && paymentStatus === 'succeeded') ? 'Continue' :
                                isProductSelectionStep() ? 'Continue to Checkout' :
                                  isCheckoutStep() ? 'Complete Order' : 'Continue'}
                            <Icon icon="lucide:chevron-right" className="ml-2 h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    // Regular questionnaire steps with v0 styling
                    <>
                      {/* Progress Bar */}
                      <ProgressBar progressPercent={progressPercent} color={theme.primary} backgroundColor="#E5E7EB" />

                      {/* Brand and Previous button */}
                      <StepHeader
                        onPrevious={handlePrevious}
                        canGoBack={currentStepIndex > 0}
                      />

                      {/* Questions */}
                      {currentStep?.title === 'Recommended Treatment' ? (
                        // Custom treatment recommendation page
                        (() => {
                          const medications = [
                            {
                              id: "compounded-semaglutide",
                              name: "Compounded Semaglutide",
                              type: "Injectable",
                              badge: "Most Popular",
                              badgeColor: "bg-emerald-100 text-emerald-700",
                              subtitle: "Weekly Injectable",
                              description: "Most commonly prescribed for consistent weight management",
                              benefits: ["16% average weight loss", "Once-weekly injection"],
                              icon: "💉",
                            },
                            {
                              id: "semaglutide-orals",
                              name: "Semaglutide Orals",
                              type: "Oral",
                              badge: "Oral",
                              badgeColor: "bg-gray-100 text-gray-700",
                              subtitle: "Daily Oral Option",
                              description: "Needle-free alternative with flexible dosing",
                              benefits: ["Oral dissolvable tablet", "Same active ingredient as Rybelsus®"],
                              icon: "heyfeels",
                              isSelected: true,
                            },
                            {
                              id: "compounded-tirzepatide",
                              name: "Compounded Tirzepatide",
                              type: "Injectable",
                              badge: null,
                              subtitle: "Dual-Action Injectable",
                              description: "Works on two hormone pathways for enhanced results",
                              benefits: ["22% average weight loss", "GLP-1 and GIP receptor activation"],
                              icon: "💉",
                            },
                            {
                              id: "tirzepatide-orals",
                              name: "Tirzepatide Orals",
                              type: "Oral",
                              badge: "Oral",
                              badgeColor: "bg-gray-100 text-gray-700",
                              subtitle: "Dual-Action Oral",
                              description: "Advanced two-pathway approach in oral form",
                              benefits: ["Oral dissolvable tablet", "GLP-1 and GIP receptor activation"],
                              icon: "heyfeels",
                            },
                          ];

                          return (
                            <>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-2xl font-medium text-gray-900 mb-3">Recommended Treatment</h3>
                                  <p className="text-gray-600 text-base">Based on your assessment, our providers recommend this treatment</p>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                                  <div className="flex items-center gap-2 text-emerald-600 mb-4">
                                    <Icon icon="lucide:check" className="w-4 h-4" />
                                    <span className="text-sm font-medium">Provider Recommended</span>
                                  </div>
                                  <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                                      <div className="text-white text-xs font-bold">
                                        <div>hey</div>
                                        <div>feels</div>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-medium text-gray-900">Semaglutide Orals</h3>
                                      </div>
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                          Most Popular
                                        </span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Oral</span>
                                      </div>
                                      <p className="text-gray-900 font-medium mb-1">Daily Oral Option</p>
                                      <p className="text-gray-600 text-sm mb-4">Needle-free alternative with flexible dosing</p>

                                      <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2">
                                          <Icon icon="lucide:check" className="w-4 h-4 text-emerald-600" />
                                          <span className="text-gray-700 text-sm">Oral dissolvable tablet</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Icon icon="lucide:check" className="w-4 h-4 text-emerald-600" />
                                          <span className="text-gray-700 text-sm">Same active ingredient as Rybelsus®</span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => {
                                          // Handle treatment selection
                                          handleAnswerChange('selectedTreatment', 'Semaglutide Orals');
                                          handleNext();
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-2xl text-base h-auto flex items-center justify-center gap-2 transition-colors"
                                      >
                                        Select This Treatment
                                        <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setShowMedicationModal(true)}
                                  className="w-full bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Icon icon="lucide:plus" className="w-4 h-4" />
                                  <span className="font-medium">View Other Treatment Options</span>
                                </button>

                                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Icon icon="lucide:lock" className="w-4 h-4 text-gray-600" />
                                    <h3 className="font-medium text-gray-900">About Compounded Medications</h3>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Icon icon="lucide:check" className="w-4 h-4 text-emerald-600" />
                                      <span className="text-gray-700 text-sm">Same active ingredients as brand-name medications</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon icon="lucide:check" className="w-4 h-4 text-emerald-600" />
                                      <span className="text-gray-700 text-sm">Custom formulated by licensed US pharmacies</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon icon="lucide:check" className="w-4 h-4 text-emerald-600" />
                                      <span className="text-gray-700 text-sm">Physician oversight with personalized dosing</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                                  <Icon icon="lucide:dollar-sign" className="w-4 h-4" />
                                  <span>Special pricing available • $0 due today • Only pay if prescribed</span>
                                </div>
                              </div>

                              {/* Medication Selection Modal */}
                              {showMedicationModal && (
                                <div className="fixed inset-0 flex items-start justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', margin: 0 }}>
                                  <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
                                      <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-medium text-gray-900">Choose Preferred Medication</h2>
                                        <button
                                          onClick={() => setShowMedicationModal(false)}
                                          className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                          <Icon icon="lucide:x" className="w-5 h-5" />
                                        </button>
                                      </div>
                                      <p className="text-gray-600 text-sm mt-2">
                                        Your provider will take this into consideration when creating your treatment plan.
                                      </p>
                                    </div>

                                    <div className="p-6 space-y-4">
                                      {medications.map((medication) => (
                                        <div
                                          key={medication.id}
                                          className={`relative border rounded-2xl p-4 cursor-pointer transition-all ${selectedMedication === medication.id
                                            ? "border-emerald-500 bg-emerald-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                          onClick={() => setSelectedMedication(medication.id)}
                                        >
                                          {selectedMedication === medication.id && (
                                            <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                              <Icon icon="lucide:check" className="w-4 h-4 text-white" />
                                            </div>
                                          )}

                                          <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 flex items-center justify-center">
                                              {medication.icon === "heyfeels" ? (
                                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                                                  <div className="text-white text-xs font-bold">
                                                    <div>hey</div>
                                                    <div>feels</div>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                                  {medication.icon}
                                                </div>
                                              )}
                                            </div>

                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-medium text-gray-900">{medication.name}</h3>
                                                {medication.badge && (
                                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${medication.badgeColor}`}>
                                                    {medication.badge}
                                                  </span>
                                                )}
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                                                  {medication.type}
                                                </span>
                                              </div>

                                              <p className="text-emerald-600 font-medium text-sm mb-1">{medication.subtitle}</p>
                                              <p className="text-gray-600 text-sm mb-3">{medication.description}</p>

                                              <div className="space-y-1">
                                                {medication.benefits.map((benefit, index) => (
                                                  <div key={index} className="flex items-center gap-2">
                                                    <Icon icon="lucide:check" className="w-3 h-3 text-emerald-600" />
                                                    <span className="text-gray-700 text-sm">{benefit}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()
                      ) : currentStep?.title === 'Body Measurements' ? (
                        // Custom BMI calculator
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-medium text-gray-900 mb-3">
                              What is your current height and weight?
                            </h3>
                            <p className="text-gray-600 text-sm">We'll calculate your BMI to check your eligibility</p>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <label className="block text-gray-900 font-medium mb-2">Weight (pounds)</label>
                              <input
                                type="number"
                                value={answers['weight'] || ''}
                                onChange={(e) => handleAnswerChange('weight', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="200"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-900 font-medium mb-2">Height</label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <input
                                    type="number"
                                    value={answers['heightFeet'] || ''}
                                    onChange={(e) => handleAnswerChange('heightFeet', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="6"
                                  />
                                  <p className="text-gray-600 text-sm mt-1">Feet</p>
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    value={answers['heightInches'] || ''}
                                    onChange={(e) => handleAnswerChange('heightInches', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="2"
                                  />
                                  <p className="text-gray-600 text-sm mt-1">Inches</p>
                                </div>
                              </div>
                            </div>

                            {/* BMI Result */}
                            {answers['weight'] && answers['heightFeet'] && answers['heightInches'] && (
                              (() => {
                                const weight = parseFloat(answers['weight'] as string);
                                const feet = parseFloat(answers['heightFeet'] as string);
                                const inches = parseFloat(answers['heightInches'] as string);

                                if (weight && feet >= 0 && inches >= 0) {
                                  const totalInches = feet * 12 + inches;
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
                                          key={`${weight}-${feet}-${inches}`}
                                          className={`absolute top-0 left-0 h-full rounded-full ${colorClass}`}
                                          style={{
                                            animation: 'bmi-expand 1s ease-out forwards',
                                            transformOrigin: 'left center',
                                            width: `${Math.min((bmi / 40) * 100, 100)}%`
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
                              })()
                            )}
                          </div>
                        </div>
                      ) : currentStep?.title === 'Success Stories' ? (
                        // Custom success stories page
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-medium text-gray-900 mb-3">But first, I want you to meet...</h3>
                            <p className="text-gray-600 text-sm">Real customers who've achieved amazing results with HeyFeels</p>
                          </div>

                          <div
                            className="overflow-x-auto mb-8 cursor-grab active:cursor-grabbing scrollbar-hidden"
                            onMouseDown={(e) => {
                              const container = e.currentTarget;
                              const startX = e.pageX - container.offsetLeft;
                              const scrollLeft = container.scrollLeft;

                              const handleMouseMove = (e: MouseEvent) => {
                                const x = e.pageX - container.offsetLeft;
                                const walk = (x - startX) * 1;
                                container.scrollLeft = scrollLeft - walk;
                              };

                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };

                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          >
                            <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                              {/* Alex's testimonial */}
                              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0" style={{ width: '254px' }}>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-before-0.webp"
                                      alt="Alex before"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                                      Before
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-after-0.webp"
                                      alt="Alex after"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                                      After
                                    </div>
                                  </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Alex, 28</h3>
                                <p className="text-gray-600 mb-4">
                                  Lost <span className="text-emerald-600 font-semibold">14 pounds</span> in 4 months
                                </p>
                                <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                  Verified Customer
                                </div>
                              </div>

                              {/* Jordan's testimonial */}
                              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0" style={{ width: '254px' }}>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-before-1.webp"
                                      alt="Jordan before"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                                      Before
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-after-1.webp"
                                      alt="Jordan after"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                                      After
                                    </div>
                                  </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Jordan, 32</h3>
                                <p className="text-gray-600 mb-4">
                                  Lost <span className="text-emerald-600 font-semibold">18 pounds</span> in 5 months
                                </p>
                                <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                  Verified Customer
                                </div>
                              </div>

                              {/* Taylor's testimonial */}
                              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0" style={{ width: '254px' }}>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-before-2.webp"
                                      alt="Taylor before"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                                      Before
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-after-2.webp"
                                      alt="Taylor after"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                                      After
                                    </div>
                                  </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Taylor, 35</h3>
                                <p className="text-gray-600 mb-4">
                                  Lost <span className="text-emerald-600 font-semibold">12 pounds</span> in 3 months
                                </p>
                                <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                  Verified Customer
                                </div>
                              </div>

                              {/* Casey's testimonial */}
                              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0" style={{ width: '254px' }}>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-before-3.webp"
                                      alt="Casey before"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                                      Before
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <img
                                      src="/before-after/m-after-3.webp"
                                      alt="Casey after"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                                      After
                                    </div>
                                  </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Casey, 41</h3>
                                <p className="text-gray-600 mb-4">
                                  Lost <span className="text-emerald-600 font-semibold">16 pounds</span> in 6 months
                                </p>
                                <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                  Verified Customer
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-gray-600 text-base leading-relaxed">
                              Swipe to see more success stories and start your own transformation journey.
                            </p>
                          </div>
                        </div>
                      ) : currentStep?.title === 'Create Your Account' ? (
                        // Custom account creation form
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-3">Create your account</h3>
                            <p className="text-gray-600 text-base">We'll use this information to set up your personalized care plan</p>
                          </div>

                          <div className="space-y-6">
                            {/* First Name and Last Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                  type="text"
                                  value={answers['firstName'] || ''}
                                  onChange={(e) => handleAnswerChange('firstName', e.target.value)}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  placeholder="John"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                  type="text"
                                  value={answers['lastName'] || ''}
                                  onChange={(e) => handleAnswerChange('lastName', e.target.value)}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  placeholder="Cena"
                                />
                              </div>
                            </div>

                            {/* Email Address */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                              <input
                                type="email"
                                value={answers['email'] || ''}
                                onChange={(e) => handleAnswerChange('email', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="john.cena@gmail.com"
                              />
                            </div>

                            {/* Mobile Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                                  <span className="text-lg mr-2">🇺🇸</span>
                                </div>
                                <input
                                  type="tel"
                                  value={answers['mobile'] || ''}
                                  onChange={(e) => handleAnswerChange('mobile', e.target.value)}
                                  className="w-full pl-16 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  placeholder="(213) 343-4134"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-100 rounded-xl p-4 mt-6">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              <span className="font-medium">Your privacy matters.</span> Your information is encrypted and securely
                              stored. We never share your data without your consent.
                            </p>
                          </div>
                        </div>
                      ) : currentStep?.questions && currentStep.questions.length > 0 ? (
                        <div className="space-y-6">
                          {currentStep.questions
                            .filter((question) => {
                              const conditionalLogic = (question as any).conditionalLogic;
                              if (!conditionalLogic) return true;

                              try {
                                const parts = conditionalLogic.split(',');
                                const targetQuestionOrder = parseInt(parts[0].split(':')[1]);
                                const answerPart = parts.slice(1).join(',');
                                const requiredAnswer = answerPart.substring(answerPart.indexOf(':') + 1);

                                const targetQuestion = currentStep.questions.find(q => q.questionOrder === targetQuestionOrder);
                                if (targetQuestion) {
                                  const targetAnswer = answers[targetQuestion.id];
                                  return targetAnswer === requiredAnswer;
                                }
                                return false;
                              } catch (error) {
                                console.error('Error parsing conditional logic:', conditionalLogic);
                                return true;
                              }
                            })
                            .sort((a, b) => {
                              const aLevel = (a as any).conditionalLevel || 0;
                              const bLevel = (b as any).conditionalLevel || 0;
                              const aSubOrder = (a as any).subQuestionOrder;
                              const bSubOrder = (b as any).subQuestionOrder;
                              const aConditional = (a as any).conditionalLogic;
                              const bConditional = (b as any).conditionalLogic;

                              if (aLevel !== bLevel) {
                                return aLevel - bLevel;
                              }

                              const sameConditionalGroup = aConditional && bConditional &&
                                aConditional.split(',')[0] === bConditional.split(',')[0] &&
                                aConditional.split(',')[1] === bConditional.split(',')[1];

                              if (sameConditionalGroup &&
                                aSubOrder !== null && aSubOrder !== undefined &&
                                bSubOrder !== null && bSubOrder !== undefined) {
                                return aSubOrder - bSubOrder;
                              }

                              return a.questionOrder - b.questionOrder;
                            })
                            .map((question) => (
                              <QuestionRenderer
                                key={question.id}
                                question={question}
                                answers={answers}
                                errors={errors}
                                theme={theme}
                                onAnswerChange={handleAnswerChange}
                                onRadioChange={handleRadioChange}
                                onCheckboxChange={handleCheckboxChange}
                              />
                            ))}
                        </div>
                      ) : (
                        // Informational steps (like Welcome)
                        <div className="text-center space-y-4">
                          <h2 className="text-2xl font-medium text-gray-900 mb-3">
                            {stepTitle}
                          </h2>
                          {stepDescription && (
                            <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
                              {stepDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Continue button for regular steps */}
                      {!(isCheckoutStep() && paymentStatus !== 'succeeded') && (
                        <button
                          onClick={handleNext}
                          disabled={isCheckoutStep() && paymentStatus !== 'succeeded'}
                          className="w-full text-white font-medium py-4 px-6 rounded-2xl text-base h-auto flex items-center justify-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: theme.primary,
                            ...(isCheckoutStep() && paymentStatus !== 'succeeded' ? {} : { boxShadow: `0 10px 20px -10px ${theme.primaryDark}` })
                          }}
                        >
                          {isLastStep ? (isCheckoutStep() ? 'Complete Order' : 'Continue') :
                            (isCheckoutStep() && paymentStatus === 'succeeded') ? 'Continue' :
                              isProductSelectionStep() ? 'Continue to Checkout' :
                                isCheckoutStep() ? 'Complete Order' : 'Continue'}
                          <Icon icon="lucide:chevron-right" className="ml-2 h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Show payment completion status for checkout step */}
                  {isCheckoutStep() && paymentStatus !== 'succeeded' && (
                    <div className="text-center text-sm text-gray-600 mt-4">
                      Complete payment above to continue
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};