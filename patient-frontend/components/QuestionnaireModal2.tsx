import React from "react";
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
  CardBody
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall } from "../lib/api";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../lib/stripe";
import { StripePaymentForm } from "./StripePaymentForm";

// Types
interface QuestionOption {
  id: string;
  optionText: string;
  optionValue: string;
  optionOrder: number;
}

interface Question {
  id: string;
  questionText: string;
  answerType: string;
  isRequired: boolean;
  questionOrder: number;
  placeholder?: string;
  helpText?: string;
  options?: QuestionOption[];
}

interface QuestionnaireStep {
  id: string;
  title: string;
  description?: string;
  stepOrder: number;
  questions?: Question[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  dosage: string;
  imageUrl: string;
}

interface QuestionnaireData {
  id: string;
  title: string;
  description?: string;
  checkoutStepPosition: number;
  steps: QuestionnaireStep[];
  treatment?: {
    products: Product[];
  };
}

interface QuestionnaireModal2Props {
  isOpen: boolean;
  onClose: () => void;
  treatmentId: string;
  treatmentName: string;
}

export const QuestionnaireModal2: React.FC<QuestionnaireModal2Props> = ({
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
          
          // Ensure steps array exists
          if (!questionnaireData.steps || !Array.isArray(questionnaireData.steps)) {
            console.error('❌ No steps found in questionnaire data');
            throw new Error('Questionnaire has no steps');
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
    }
  }, [isOpen]);

  // Create payment intent when entering checkout step
  React.useEffect(() => {
    const createPaymentIntent = async () => {
      if (!isCheckoutStep() || !questionnaire) {
        return;
      }

      if (clientSecret) {
        return;
      }

      const total = Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
        const product = questionnaire.treatment?.products.find(p => p.id === productId);
        return total + (product ? product.price * quantity : 0);
      }, 0);

      if (total <= 0) {
        setPaymentStatus('idle');
        return;
      }

      try {
        setPaymentStatus('processing');
        
        const result = await apiCall('/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({
            amount: total,
            treatmentId: treatmentId,
            selectedProducts: selectedProducts
          })
        });

        if (result.success && result.data) {
          const paymentData = result.data.data || result.data;
          setClientSecret(paymentData.clientSecret);
          setPaymentIntentId(paymentData.paymentIntentId);
          setPaymentStatus('idle');
        } else {
          throw new Error(result.error || 'Failed to create payment intent');
        }
      } catch (error) {
        setPaymentStatus('failed');
      }
    };

    createPaymentIntent();
  }, [currentStepIndex, questionnaire, selectedProducts, treatmentId, clientSecret]);


  // Helper functions for checkout steps
  const getTotalSteps = (): number => {
    if (!questionnaire) return 0;
    return questionnaire.steps.length + 2; // +2 for product selection and checkout
  };

  const isProductSelectionStep = (): boolean => {
    if (!questionnaire) return false;
    const checkoutPos = questionnaire.checkoutStepPosition;
    const productStepIndex = checkoutPos === -1 ? questionnaire.steps.length : checkoutPos;
    return currentStepIndex === productStepIndex;
  };

  const isCheckoutStep = (): boolean => {
    if (!questionnaire) return false;
    const checkoutPos = questionnaire.checkoutStepPosition;
    const checkoutStepIndex = checkoutPos === -1 ? questionnaire.steps.length + 1 : checkoutPos + 1;
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

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
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
      // If checkout step is reached but no products selected, redirect to product selection
      const hasSelectedProducts = Object.values(selectedProducts).some(qty => qty > 0);
      if (!hasSelectedProducts) {
        alert('Please select products first before proceeding to checkout.');
        // Navigate back to product selection step
        const checkoutPos = questionnaire.checkoutStepPosition;
        const productStepIndex = checkoutPos === -1 ? questionnaire.steps.length : checkoutPos;
        setCurrentStepIndex(productStepIndex);
        return false;
      }
      return true;
    }

    // Validate regular questionnaire step
    const currentStep = getCurrentQuestionnaireStep();
    if (!currentStep) return true;

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

  // Handle payment success
  const handlePaymentSuccess = async () => {
    try {
      if (!paymentIntentId) {
        throw new Error('No payment intent ID');
      }

      const result = await apiCall('/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: paymentIntentId
        })
      });

      if (result.success) {
        setPaymentStatus('succeeded');
        // Don't close modal, allow user to continue with questionnaire steps
      } else {
        throw new Error('Payment confirmation failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      alert('Payment confirmation failed. Please contact support.');
    }
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    setPaymentStatus('failed');
    alert(`Payment failed: ${error}`);
  };

  // Submit questionnaire
  const handleSubmit = () => {
    if (!isCheckoutStep()) {
      alert('Questionnaire submitted! (Implementation pending)');
      onClose();
    }
    // For checkout step, submission is handled by the Stripe form
  };

  // Render product selection step
  const renderProductSelection = () => {
    if (!questionnaire?.treatment?.products) return null;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Select Your Products</h2>
          <p className="text-gray-600">Choose the NAD+ products you'd like to order</p>
        </div>
        
        <div className="space-y-4">
          {questionnaire.treatment.products.map((product) => {
            const quantity = selectedProducts[product.id] || 0;
            const totalPrice = product.price * quantity;
            
            return (
              <Card key={product.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Dosage:</span> {product.dosage}
                    </p>
                    <p className="text-lg font-bold text-primary">${product.price}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      isDisabled={quantity <= 0}
                      onPress={() => handleProductQuantityChange(product.id, Math.max(0, quantity - 1))}
                    >
                      <Icon icon="lucide:minus" />
                    </Button>
                    
                    <div className="min-w-[60px] text-center">
                      <span className="text-lg font-semibold">{quantity}</span>
                      {quantity > 0 && (
                        <p className="text-sm text-primary font-medium">
                          ${totalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => handleProductQuantityChange(product.id, quantity + 1)}
                    >
                      <Icon icon="lucide:plus" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Total */}
        <Card className="bg-primary-50 border border-primary-200">
          <CardBody className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                ${Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
                  const product = questionnaire.treatment?.products.find(p => p.id === productId);
                  return total + (product ? product.price * quantity : 0);
                }, 0).toFixed(2)}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // Render checkout step
  const renderCheckout = () => {
    const total = Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = questionnaire?.treatment?.products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);

    const hasSelectedProducts = Object.values(selectedProducts).some(qty => qty > 0);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Payment</h2>
          <p className="text-gray-600">Complete your order</p>
        </div>

        {!hasSelectedProducts && (
          <Card className="bg-yellow-50 border border-yellow-200">
            <CardBody className="p-6 text-center">
              <Icon icon="lucide:shopping-cart" className="text-4xl text-yellow-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Products Selected</h3>
              <p className="text-yellow-700 mb-4">
                You need to select products before proceeding to checkout.
              </p>
              <Button
                color="warning"
                onPress={() => {
                  const checkoutPos = questionnaire?.checkoutStepPosition || -1;
                  const productStepIndex = checkoutPos === -1 ? questionnaire!.steps.length : checkoutPos;
                  setCurrentStepIndex(productStepIndex);
                }}
                startContent={<Icon icon="lucide:arrow-left" />}
              >
                Go to Product Selection
              </Button>
            </CardBody>
          </Card>
        )}

        {hasSelectedProducts && (
          <>
            <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              {Object.entries(selectedProducts)
                .filter(([_, quantity]) => quantity > 0)
                .map(([productId, quantity]) => {
                  const product = questionnaire?.treatment?.products.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <div key={productId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                      </div>
                      <p className="font-semibold">${(product.price * quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            
            
            {/* Processing state */}
            {paymentStatus === 'processing' && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                <Icon icon="lucide:loader-2" className="text-4xl text-blue-500 mx-auto mb-3 animate-spin" />
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Initializing Payment</h4>
                <p className="text-blue-600">Setting up secure payment processing...</p>
                <div className="mt-3 flex justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Failed state */}
            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
                <Icon icon="lucide:alert-circle" className="text-4xl text-red-500 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-red-800 mb-2">Payment Setup Failed</h4>
                <p className="text-red-600 mb-4">Unable to initialize payment processing</p>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    console.log('💳 Retrying payment initialization...');
                    setPaymentStatus('idle');
                    setClientSecret(null);
                    setPaymentIntentId(null);
                  }}
                  startContent={<Icon icon="lucide:refresh-cw" />}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Success state - Payment form */}
            {clientSecret && paymentStatus === 'idle' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                  <Icon icon="lucide:shield-check" className="text-2xl text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-green-700 font-medium">Secure Payment Ready</p>
                </div>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    loading={false}
                  />
                </Elements>
              </div>
            )}

            {/* Completed state */}
            {paymentStatus === 'succeeded' && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                <Icon icon="lucide:check-circle" className="text-4xl text-green-500 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h4>
                <p className="text-green-600 mb-4">Your order has been processed successfully</p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
                  <Icon icon="lucide:shield-check" />
                  <span>Secure payment completed</span>
                </div>
                {!isLastStep && (
                  <p className="text-sm text-gray-600">
                    You can now continue with the remaining questionnaire steps
                  </p>
                )}
              </div>
            )}

            {/* Waiting/Preparing state */}
            {paymentStatus === 'idle' && !clientSecret && total > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
                <Icon icon="lucide:clock" className="text-4xl text-yellow-500 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">Preparing Payment</h4>
                <p className="text-yellow-600 mb-4">Getting everything ready for checkout...</p>
                
                {/* Manual trigger button */}
                <Button
                  color="primary"
                  variant="flat"
                  onPress={async () => {
                    setPaymentStatus('processing');
                    
                    try {
                      const result = await apiCall('/create-payment-intent', {
                        method: 'POST',
                        body: JSON.stringify({
                          amount: total,
                          treatmentId: treatmentId,
                          selectedProducts: selectedProducts
                        })
                      });

                      if (result.success && result.data) {
                        const paymentData = result.data.data || result.data;
                        setClientSecret(paymentData.clientSecret);
                        setPaymentIntentId(paymentData.paymentIntentId);
                        setPaymentStatus('idle');
                      } else {
                        throw new Error(result.error || 'Failed to create payment intent');
                      }
                    } catch (error) {
                      setPaymentStatus('failed');
                    }
                  }}
                  startContent={<Icon icon="lucide:credit-card" />}
                >
                  Initialize Payment
                </Button>
              </div>
            )}

            {/* No products selected state */}
            {paymentStatus === 'idle' && !clientSecret && total === 0 && (
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
                <Icon icon="lucide:shopping-cart-x" className="text-4xl text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Products Selected</h4>
                <p className="text-gray-500">Payment will be available once you select products</p>
              </div>
            )}
          </CardBody>
        </Card>
          </>
        )}
      </div>
    );
  };

  // Render question based on type
  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || '';
    const hasError = !!errors[question.id];

    const commonProps = {
      isInvalid: hasError,
      errorMessage: errors[question.id],
      description: question.helpText
    };

    switch (question.answerType) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            key={question.id}
            type={question.answerType === 'email' ? 'email' : question.answerType === 'phone' ? 'tel' : 'text'}
            label={question.questionText}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <Input
            key={question.id}
            type="number"
            label={question.questionText}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            {...commonProps}
          />
        );

      case 'date':
        return (
          <Input
            key={question.id}
            type="date"
            label={question.questionText}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={question.id}
            label={question.questionText}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            minRows={3}
            {...commonProps}
          />
        );

      case 'radio':
        return (
          <div key={question.id} className="space-y-2">
            <label className="text-sm font-medium">
              {question.questionText}
              {question.isRequired && <span className="text-danger ml-1">*</span>}
            </label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleAnswerChange(question.id, val)}
              isInvalid={hasError}
              errorMessage={errors[question.id]}
            >
              {question.options?.map((option) => (
                <Radio key={option.id} value={option.optionValue}>
                  {option.optionText}
                </Radio>
              ))}
            </RadioGroup>
            {question.helpText && (
              <p className="text-sm text-foreground-500">{question.helpText}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.id} className="space-y-2">
            <label className="text-sm font-medium">
              {question.questionText}
              {question.isRequired && <span className="text-danger ml-1">*</span>}
            </label>
            <CheckboxGroup
              value={value || []}
              onValueChange={(val) => handleAnswerChange(question.id, val)}
              isInvalid={hasError}
              errorMessage={errors[question.id]}
            >
              {question.options?.map((option) => (
                <Checkbox key={option.id} value={option.optionValue}>
                  {option.optionText}
                </Checkbox>
              ))}
            </CheckboxGroup>
            {question.helpText && (
              <p className="text-sm text-foreground-500">{question.helpText}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <Select
            key={question.id}
            label={question.questionText}
            placeholder={question.placeholder || "Select an option"}
            selectedKeys={value ? new Set([value]) : new Set()}
            onSelectionChange={(keys) => {
              const selectedValue = Array.from(keys)[0] as string;
              handleAnswerChange(question.id, selectedValue);
            }}
            {...commonProps}
          >
            {question.options?.map((option) => (
              <SelectItem key={option.optionValue}>
                {option.optionText}
              </SelectItem>
            ))}
          </Select>
        );

      case 'height':
        return (
          <div key={question.id} className="space-y-2">
            <label className="text-sm font-medium">
              {question.questionText}
              {question.isRequired && <span className="text-danger ml-1">*</span>}
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="5"
                label="Feet"
                value={value.feet || ''}
                onChange={(e) => handleAnswerChange(question.id, { ...value, feet: e.target.value })}
              />
              <Input
                type="number"
                placeholder="10"
                label="Inches"
                value={value.inches || ''}
                onChange={(e) => handleAnswerChange(question.id, { ...value, inches: e.target.value })}
              />
            </div>
            {hasError && <p className="text-danger text-sm">{errors[question.id]}</p>}
          </div>
        );

      case 'weight':
        return (
          <Input
            key={question.id}
            type="number"
            label={question.questionText + ' (lbs)'}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            {...commonProps}
          />
        );

      default:
        return (
          <Input
            key={question.id}
            type="text"
            label={question.questionText}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            {...commonProps}
          />
        );
    }
  };

  if (loading || !questionnaire || !questionnaire.steps || questionnaire.steps.length === 0) {
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
    stepTitle = 'Payment';
    stepDescription = 'Complete your order';
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
      <ModalContent className="h-full bg-white">
        <ModalBody className="p-0 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="text-gray-500"
              >
                <Icon icon="lucide:x" className="text-xl" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{questionnaire.title}</h1>
                <p className="text-sm text-gray-600">{treatmentName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {totalSteps}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 border-b border-gray-100">
            <Progress 
              value={progressPercent} 
              className="w-full"
              color="primary"
              size="sm"
            />
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardBody className="p-6 space-y-6">
                      {/* Render appropriate step content */}
                      {isProductSelectionStep() ? (
                        renderProductSelection()
                      ) : isCheckoutStep() ? (
                        renderCheckout()
                      ) : (
                        <>
                          {/* Step Header */}
                          <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">{stepTitle}</h2>
                            {stepDescription && (
                              <p className="text-gray-600">{stepDescription}</p>
                            )}
                          </div>

                          {/* Questions */}
                          {currentStep?.questions && currentStep.questions.length > 0 ? (
                            <div className="space-y-6">
                              {currentStep.questions.map(renderQuestion)}
                            </div>
                          ) : null}
                        </>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="light"
              onPress={handlePrevious}
              isDisabled={currentStepIndex === 0}
              startContent={<Icon icon="lucide:arrow-left" />}
            >
              Previous
            </Button>

            {/* Show appropriate button based on current step and payment status */}
            {!(isCheckoutStep() && clientSecret && paymentStatus !== 'succeeded') && (
              <Button
                color="primary"
                onPress={handleNext}
                endContent={<Icon icon={
                  isLastStep ? "lucide:check" : 
                  (isCheckoutStep() && paymentStatus === 'succeeded') ? "lucide:arrow-right" :
                  isCheckoutStep() ? "lucide:credit-card" : 
                  "lucide:arrow-right"
                } />}
              >
                {isLastStep ? 'Complete' : 
                 (isCheckoutStep() && paymentStatus === 'succeeded') ? 'Continue' :
                 isProductSelectionStep() ? 'Continue to Checkout' : 'Next'}
              </Button>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};