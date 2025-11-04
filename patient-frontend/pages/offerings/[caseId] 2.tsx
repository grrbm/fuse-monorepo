import React from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Button, Chip, Spinner, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { fetchWithAuth } from "../../lib/api";

export default function OfferingDetailsPage() {
    const router = useRouter();
    const { caseId: orderId } = router.query as { caseId?: string }; // Using caseId param name for backward compatibility
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [order, setOrder] = React.useState<any>(null);

    React.useEffect(() => {
        if (!orderId) return;
        (async () => {
            try {
                setLoading(true);
                const res: any = await fetchWithAuth(`/orders/${orderId}`);
                const orderData = res?.data || null;
                setOrder(orderData);
                setError(null);
            } catch (e) {
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        })();
    }, [orderId]);

    return (
        <div className="p-4 md:p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="flat" startContent={<Icon icon="lucide:arrow-left" />} onPress={() => router.back()}>
                    Back
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">Order Details</h1>
                {order && <span className="text-xs text-foreground-400 font-mono">{order.orderNumber}</span>}
            </div>

            {loading ? (
                <Card><CardBody className="h-24 flex items-center justify-center"><Spinner label="Loading..." /></CardBody></Card>
            ) : error ? (
                <Card><CardBody className="text-danger">{error}</CardBody></Card>
            ) : !order ? (
                <Card className="border-dashed"><CardBody className="text-foreground-500">Order not found.</CardBody></Card>
            ) : (
                <div className="space-y-4">
                    {/* Order Information Card */}
                    <Card className="transition-shadow hover:shadow-md">
                        <CardBody>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <div className="font-medium text-foreground text-lg">Order Information</div>
                                    <div className="mt-1 text-sm text-foreground-500">Order #{order.orderNumber}</div>
                                </div>
                                <Chip size="sm" variant="flat" color={
                                    order.status === 'delivered' || order.status === 'paid' ? 'success' as any :
                                        order.status === 'cancelled' ? 'danger' as any :
                                            'warning' as any
                                }>
                                    {order.status}
                                </Chip>
                            </div>
                            <Divider className="my-3" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div><span className="text-foreground-500">Status:</span> {order.status}</div>
                                    <div><span className="text-foreground-500">Total Amount:</span> ${order.totalAmount}</div>
                                    <div><span className="text-foreground-500">Created:</span> {new Date(order.createdAt).toLocaleString()}</div>
                                    {false && <div><span className="text-foreground-500">MD Case ID:</span> <span className="font-mono text-xs">{order.mdCaseId}</span></div>}
                                </div>
                                <div className="space-y-2">
                                    {order.shippingAddress && (
                                        <div>
                                            <span className="text-foreground-500">Shipping Address:</span>
                                            <div className="mt-1 text-foreground-600">
                                                {order.shippingAddress.street}<br />
                                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Questionnaire Answers Card */}
                    {order.questionnaireAnswers && (
                        <Card className="transition-shadow hover:shadow-md">
                            <CardBody>
                                <div className="font-medium text-foreground text-lg mb-3">Questionnaire Answers</div>
                                <Divider className="my-3" />
                                <div className="space-y-3">
                                    {/* Check if structured format */}
                                    {order.questionnaireAnswers.answers && order.questionnaireAnswers.metadata ? (
                                        // Structured format
                                        order.questionnaireAnswers.answers.map((answer: any, index: number) => (
                                            <div key={index} className="bg-content2/40 p-3 rounded-md">
                                                <div className="font-medium text-sm text-foreground">{answer.questionText}</div>
                                                <div className="mt-1 text-sm text-foreground-600">
                                                    {answer.selectedOptions && answer.selectedOptions.length > 0 ? (
                                                        answer.selectedOptions.map((opt: any) => opt.optionText).join(', ')
                                                    ) : (
                                                        String(answer.answer)
                                                    )}
                                                </div>
                                                {answer.stepCategory && (
                                                    <div className="mt-1 text-xs text-foreground-400">
                                                        Category: {answer.stepCategory}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        // Legacy format
                                        Object.entries(order.questionnaireAnswers).map(([question, answer]) => (
                                            <div key={question} className="bg-content2/40 p-3 rounded-md">
                                                <div className="font-medium text-sm text-foreground">{question}</div>
                                                <div className="mt-1 text-sm text-foreground-600">{String(answer)}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Doctor Notes Card */}
                    {order.doctorNotes && (
                        <Card className="transition-shadow hover:shadow-md border-2 border-primary-200">
                            <CardBody>
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon icon="lucide:stethoscope" className="text-primary" width={20} />
                                    <div className="font-medium text-foreground text-lg">Doctor's Notes</div>
                                </div>
                                <Divider className="my-3" />
                                <div className="bg-primary-50/50 p-4 rounded-md">
                                    <p className="text-sm text-foreground-700 whitespace-pre-wrap">{order.doctorNotes}</p>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                </div>
            )}
        </div>
    );
}


