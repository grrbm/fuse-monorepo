import React from "react";
import {
    Card,
    CardBody,
    RadioGroup,
    Radio,
    Chip,
    Button,
    Input,
    Select,
    SelectItem,
    Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "../../StripePaymentForm";
import { CheckoutViewProps } from "../types";
import { US_STATES } from "@fuse/enums";


export const CheckoutView: React.FC<CheckoutViewProps> = ({
    plans,
    selectedPlan,
    onPlanChange,
    paymentStatus,
    clientSecret,
    shippingInfo,
    onShippingInfoChange,
    onRetryPaymentSetup,
    onCreateSubscription,
    onPaymentSuccess,
    onPaymentError,
    stripePromise,
    theme,
    questionnaireProducts,
    selectedProducts,
    treatmentName,
}) => {
    const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = React.useState(false);

    // Require shipping fields before enabling payment setup
    const canContinue = Boolean(
        selectedPlan &&
        (shippingInfo.address || '').trim() &&
        (shippingInfo.city || '').trim() &&
        (shippingInfo.state || '').trim() &&
        (shippingInfo.zipCode || '').trim()
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Mobile Order Summary - Collapsible */}
            <div className="lg:hidden">
                <button
                    onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                    className="w-full bg-white border-2 rounded-xl p-4 flex items-center justify-between"
                    style={{ borderColor: theme.primaryLighter }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primaryLighter }}>
                            <Icon icon="lucide:shopping-cart" className="w-5 h-5" style={{ color: theme.primary }} />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">Order Summary</div>
                            <div className="text-lg font-semibold" style={{ color: theme.primary }}>
                                ${selectedPlanData?.price.toFixed(2) || '0.00'}/mo
                            </div>
                        </div>
                    </div>
                    <Icon 
                        icon={isOrderSummaryOpen ? "lucide:chevron-up" : "lucide:chevron-down"} 
                        className="w-5 h-5 text-gray-400"
                    />
                </button>

                {isOrderSummaryOpen && (
                    <Card className="mt-2">
                        <CardBody className="p-4">
                            <div className="space-y-3 mb-4">
                                {questionnaireProducts?.filter((product) => (selectedProducts[product.id] || 0) > 0).map((product) => (
                                    <div key={product.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <Icon icon="lucide:pill" className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                                            <div className="text-xs text-gray-600 mb-1">{product.description}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Qty: {selectedProducts[product.id]}</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    ${(product.price * (selectedProducts[product.id] || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Divider className="my-3" />

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Plan: {selectedPlanData?.name || 'None'}</span>
                                    <span className="font-medium">${selectedPlanData?.price.toFixed(2) || '0.00'}/mo</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Total Due Today</span>
                                    <span className="text-xl font-bold" style={{ color: theme.primary }}>
                                        ${selectedPlanData?.price.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Only charged if prescribed by a licensed physician
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Header - Mobile Optimized */}
                    <div className="px-1">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">Complete Your Subscription</h2>
                        <p className="text-sm md:text-base text-gray-600">Secure checkout for your {treatmentName} subscription</p>
                    </div>

                    {/* Plan Selection - Mobile Optimized */}
                    <Card>
                        <CardBody className="p-4 md:p-6">
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4 md:mb-6">Choose Your Plan</h3>
                            <RadioGroup
                                value={selectedPlan}
                                onValueChange={onPlanChange}
                                className="space-y-3 md:space-y-4"
                                isDisabled={paymentStatus === 'processing' || !!clientSecret}
                            >
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-lg border-2 p-3 md:p-4 transition-all ${
                                            paymentStatus === 'processing' || !!clientSecret 
                                                ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                                                : ''
                                        } ${
                                            selectedPlan === plan.id 
                                                ? 'border-success-500 bg-success-50' 
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2 md:gap-3">
                                            <Radio value={plan.id} className="mt-1 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                                    <label className="font-medium text-gray-900 cursor-pointer text-sm md:text-base">
                                                        {plan.name}
                                                    </label>
                                                    {plan.badge && (
                                                        <Chip color={plan.badgeColor} size="sm" variant="flat" className="w-fit">
                                                            {plan.badge}
                                                        </Chip>
                                                    )}
                                                </div>
                                                <div className="text-xs md:text-sm text-gray-600 mb-2">{plan.description}</div>
                                                <div className="flex items-baseline gap-2 mb-2 md:mb-3">
                                                    <span className="text-lg md:text-xl font-semibold" style={{ color: theme.primary }}>
                                                        ${plan.price.toFixed(2)}/mo
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-xs md:text-sm text-gray-600">
                                                    <div className="font-medium">Includes:</div>
                                                    {plan.features?.map((feature, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <Icon icon="lucide:check" className="w-3 h-3 flex-shrink-0" style={{ color: theme.primary }} />
                                                            <span className="break-words">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardBody>
                    </Card>

                    {/* Shipping Information - Mobile Optimized */}
                    <Card>
                        <CardBody className="p-4 md:p-6">
                            <div className="flex items-center gap-2 mb-4 md:mb-6">
                                <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: theme.primary }}>
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Icon icon="lucide:check" className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-base md:text-lg font-medium text-gray-900">Shipping Information</h3>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <Input
                                    label="Street Address"
                                    placeholder="Enter address"
                                    value={shippingInfo.address}
                                    onValueChange={(value) => onShippingInfoChange('address', value)}
                                    variant="bordered"
                                    isRequired
                                    classNames={{
                                        input: "text-base md:text-sm",
                                        inputWrapper: "h-12 md:h-10"
                                    }}
                                />

                                <Input
                                    label="Apartment / Suite / Unit (optional)"
                                    value={shippingInfo.apartment}
                                    onValueChange={(value) => onShippingInfoChange('apartment', value)}
                                    variant="bordered"
                                    classNames={{
                                        input: "text-base md:text-sm",
                                        inputWrapper: "h-12 md:h-10"
                                    }}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <Input
                                        label="City"
                                        value={shippingInfo.city}
                                        onValueChange={(value) => onShippingInfoChange('city', value)}
                                        variant="bordered"
                                        isRequired
                                        classNames={{
                                            input: "text-base md:text-sm",
                                            inputWrapper: "h-12 md:h-10"
                                        }}
                                    />
                                    {shippingInfo.country === 'us' ? (
                                        <Select
                                            label="State"
                                            placeholder="Select State"
                                            selectedKeys={shippingInfo.state ? [shippingInfo.state] : []}
                                            onSelectionChange={(keys) => {
                                                const selectedKey = Array.from(keys)[0] as string;
                                                onShippingInfoChange('state', selectedKey);
                                            }}
                                            variant="bordered"
                                            isRequired
                                            classNames={{
                                                trigger: "h-12 md:h-10"
                                            }}
                                        >
                                            {US_STATES.map((state) => (
                                                <SelectItem key={state.key}>{state.name}</SelectItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        <Input
                                            label="State/Province"
                                            placeholder="Enter state or province"
                                            value={shippingInfo.state}
                                            onValueChange={(value) => onShippingInfoChange('state', value)}
                                            variant="bordered"
                                            isRequired
                                            classNames={{
                                                input: "text-base md:text-sm",
                                                inputWrapper: "h-12 md:h-10"
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <Input
                                        label="Zip Code"
                                        value={shippingInfo.zipCode}
                                        onValueChange={(value) => onShippingInfoChange('zipCode', value)}
                                        variant="bordered"
                                        isRequired
                                        classNames={{
                                            input: "text-base md:text-sm",
                                            inputWrapper: "h-12 md:h-10"
                                        }}
                                    />
                                    <Select
                                        label="Country"
                                        selectedKeys={[shippingInfo.country]}
                                        onSelectionChange={(keys) => {
                                            const selectedKey = Array.from(keys)[0] as string;
                                            onShippingInfoChange('country', selectedKey);
                                        }}
                                        variant="bordered"
                                        classNames={{
                                            trigger: "h-12 md:h-10"
                                        }}
                                    >
                                        <SelectItem key="us">🇺🇸 United States</SelectItem>
                                    </Select>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Payment Information - Mobile Optimized */}
                    <Card>
                        <CardBody className="p-4 md:p-6 space-y-3 md:space-y-4">
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:shield" className="w-5 h-5 flex-shrink-0" style={{ color: theme.primary }} />
                                <h3 className="text-base md:text-lg font-medium text-gray-900">Payment Information</h3>
                                <Icon icon="lucide:shield" className="w-4 h-4 text-gray-400" />
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Icon icon="lucide:credit-card" className="w-4 h-4" style={{ color: theme.primary }} />
                                <span className="font-medium">Card</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs md:text-sm" style={{ color: theme.primary }}>
                                <Icon icon="lucide:shield" className="w-4 h-4 flex-shrink-0" />
                                <span>Secure, fast checkout with Link</span>
                            </div>

                            {paymentStatus === 'processing' && (
                                <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-lg text-center">
                                    <Icon icon="lucide:loader-2" className="text-3xl md:text-4xl text-blue-500 mx-auto mb-2 md:mb-3 animate-spin" />
                                    <h4 className="text-base md:text-lg font-semibold text-blue-800 mb-1 md:mb-2">Initializing Payment</h4>
                                    <p className="text-sm md:text-base text-blue-600">Setting up secure payment processing...</p>
                                </div>
                            )}

                            {paymentStatus === 'failed' && (
                                <div className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg text-center">
                                    <Icon icon="lucide:alert-circle" className="text-3xl md:text-4xl text-red-500 mx-auto mb-2 md:mb-3" />
                                    <h4 className="text-base md:text-lg font-semibold text-red-800 mb-1 md:mb-2">Payment Setup Failed</h4>
                                    <p className="text-sm md:text-base text-red-600 mb-3 md:mb-4">Unable to initialize payment processing</p>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={onRetryPaymentSetup}
                                        startContent={<Icon icon="lucide:refresh-cw" />}
                                        className="w-full sm:w-auto"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {!clientSecret && paymentStatus === 'processing' && (
                                <div className="text-center py-6 md:py-8 bg-blue-50 rounded-lg border border-blue-200">
                                    <Icon icon="lucide:loader-2" className="text-2xl md:text-3xl text-blue-500 mx-auto mb-2 animate-spin" />
                                    <p className="text-base md:text-lg font-medium text-blue-900 mb-1">Setting up your subscription...</p>
                                    <p className="text-xs md:text-sm text-blue-700">Please wait while we prepare your payment</p>
                                </div>
                            )}

                            {!clientSecret && paymentStatus === 'idle' && selectedPlan && (
                                <div className="space-y-3 md:space-y-4">
                                    <div className="text-center py-4 md:py-6 bg-blue-50 rounded-lg border border-blue-200">
                                        <Icon icon="lucide:check-circle" className="text-2xl md:text-3xl text-blue-500 mx-auto mb-2" />
                                        <p className="text-base md:text-lg font-medium text-blue-900 mb-1">Plan Selected</p>
                                        <p className="text-xs md:text-sm text-blue-700">
                                            {selectedPlanData?.name} - ${selectedPlanData?.price}/mo
                                        </p>
                                    </div>
                                    <Button
                                        color="primary"
                                        size="lg"
                                        className="w-full h-12 md:h-auto text-base"
                                        isDisabled={!canContinue}
                                        onPress={() => onCreateSubscription(selectedPlan)}
                                    >
                                        <span className="truncate">Continue with {selectedPlanData?.name} - ${selectedPlanData?.price}/mo</span>
                                    </Button>
                                    {!canContinue && (
                                        <div className="text-center text-xs text-gray-500">
                                            Fill out shipping address to continue
                                        </div>
                                    )}
                                </div>
                            )}

                            {!clientSecret && paymentStatus === 'idle' && !selectedPlan && (
                                <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <Icon icon="lucide:mouse-pointer-click" className="text-2xl md:text-3xl text-gray-400 mx-auto mb-2" />
                                    <p className="text-base md:text-lg font-medium text-gray-700 mb-1">Select a Plan Above</p>
                                    <p className="text-xs md:text-sm text-gray-500">Choose your preferred billing cycle to continue</p>
                                </div>
                            )}

                            {clientSecret && paymentStatus === 'idle' && (
                                <div className="space-y-3 md:space-y-4">
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                                        <Icon icon="lucide:shield-check" className="text-xl md:text-2xl text-green-500 mx-auto mb-1" />
                                        <p className="text-sm text-green-700 font-medium">Secure Payment Ready</p>
                                    </div>
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <StripePaymentForm
                                            amount={selectedPlanData?.price || 0}
                                            onSuccess={onPaymentSuccess}
                                            onError={onPaymentError}
                                            loading={false}
                                        />
                                    </Elements>
                                </div>
                            )}

                            {paymentStatus === 'succeeded' && (
                                <div className="bg-green-50 border border-green-200 p-4 md:p-6 rounded-lg text-center">
                                    <Icon icon="lucide:check-circle" className="text-3xl md:text-4xl text-green-500 mx-auto mb-2 md:mb-3" />
                                    <h4 className="text-base md:text-lg font-semibold text-green-800 mb-1 md:mb-2">Payment Successful!</h4>
                                    <p className="text-sm md:text-base text-green-600 mb-3 md:mb-4">Your order has been processed successfully</p>
                                    <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-green-600">
                                        <Icon icon="lucide:shield-check" />
                                        <span>Secure payment completed</span>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 leading-relaxed">
                                By providing your card information, you allow the clinic to charge your card for future payments in
                                accordance with their terms.
                            </p>
                        </CardBody>
                    </Card>

                    {/* Terms and Legal - Mobile Optimized */}
                    <Card>
                        <CardBody className="p-4 md:p-6">
                            <div className="space-y-3 md:space-y-4 text-xs text-gray-500 leading-relaxed">
                                <p>
                                    By completing checkout, you agree to our{' '}
                                    <a href="/terms" className="text-success-600 hover:underline">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="/privacy" className="text-success-600 hover:underline">
                                        Privacy Policy
                                    </a>
                                    .
                                </p>

                                <p>
                                    <strong>Payment Authorization:</strong> We'll securely pre-authorize your payment method for the amount shown. You'll only be charged if a licensed physician prescribes your medication after reviewing your medical information.
                                </p>

                                <p>
                                    <strong>Medical Disclaimer:</strong> By submitting this form, I confirm that all information provided is accurate and complete to the best of my knowledge. I understand that providing incomplete and/or inaccurate information is essential for safe treatment.
                                </p>

                                <p>
                                    *Product packaging may vary. California residents: prescriptions may contain only semaglutide as the active ingredient.
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Desktop Order Summary Sidebar - Hidden on Mobile */}
                <div className="hidden lg:block lg:col-span-1">
                    <Card className="sticky top-8">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg" style={{ backgroundColor: theme.primaryLighter }}>
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.primary }}>
                                    <Icon icon="lucide:check" className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate" style={{ color: theme.primary }}>
                                        Your medication is reserved
                                    </div>
                                    <div className="text-xs" style={{ color: theme.primary }}>
                                        Complete checkout to secure your prescription
                                    </div>
                                </div>
                                <div className="text-sm font-mono flex-shrink-0" style={{ color: theme.primary }}>
                                    14:39
                                </div>
                            </div>

                            <h3 className="font-medium text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-4">
                                {questionnaireProducts?.filter((product) => (selectedProducts[product.id] || 0) > 0).map((product) => (
                                    <div key={product.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                            <Icon icon="lucide:pill" className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 text-sm truncate">{product.name}</div>
                                            <div className="text-xs text-gray-600 mb-1 line-clamp-2">{product.description}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Qty: {selectedProducts[product.id]}</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    ${(product.price * (selectedProducts[product.id] || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Divider className="my-4" />

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Selected Plan: {selectedPlanData?.name || 'None'}</span>
                                    <span className="font-medium">${selectedPlanData?.price.toFixed(2) || '0.00'}/mo</span>
                                </div>
                            </div>

                            <Divider className="my-4" />

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Total Due Today</span>
                                    <span className="text-xl font-semibold">
                                        ${selectedPlanData?.price.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Only charged if prescribed by a licensed physician. We'll securely hold your payment method. No charge until prescribed.
                                </p>
                            </div>

                            <Divider className="my-4" />

                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">What's Included</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-success-500"></div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-900">Free medical consultation</div>
                                            <div className="text-xs text-gray-500">Board-certified physicians licensed in your state</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-success-500"></div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-900">Free expedited shipping</div>
                                            <div className="text-xs text-gray-500">2-day delivery included with every order</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-success-500"></div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-900">Money-back guarantee</div>
                                            <div className="text-xs text-gray-500">100% satisfaction or full refund</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-success-500"></div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-900">Secure payment processing</div>
                                            <div className="text-xs text-gray-500">Bank-level encryption & security</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};
