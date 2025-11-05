import React from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
  loading?: boolean;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onSuccess,
  onError,
  amount,
  loading = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required but won't be used since we handle success in the callback
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'An error occurred during payment');
      setIsProcessing(false);
    } else {
      // Payment succeeded
      onSuccess();
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-lg border">
        <PaymentElement 
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: true
            },
            paymentMethodOrder: ['card', 'link']
          }}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="text-base sm:text-lg font-semibold text-gray-900 order-2 sm:order-1">
          Total: ${amount.toFixed(2)}
        </div>
        
        <Button
          type="submit"
          color="primary"
          size="lg"
          isDisabled={!stripe || loading || isProcessing}
          isLoading={isProcessing}
          startContent={
            isProcessing ? null : <Icon icon="lucide:credit-card" />
          }
          className="w-full sm:w-auto order-1 sm:order-2 h-12 md:h-auto text-base"
        >
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};