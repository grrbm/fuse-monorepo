import React from "react";
import { Card, CardBody, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { fetchWithAuth, apiCall } from "../lib/api";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";

type OfferingItem = {
    orderId: string;
    orderNumber: string;
    caseId: string | null;
    offeringId: string | null;
    caseOfferingId: string | null;
    title: string;
    productId: string | null;
    productType: string | null;
    status: string;
    orderStatus: string;
    createdAt: string;
    updatedAt: string;
    classification: "approved" | "pending";
    details?: any;
    // Enhanced fields
    tenantProduct?: {
        id: string;
        name: string;
        description?: string;
        dosage?: string;
        category?: string;
        stripePriceId?: string;
        isActive: boolean;
    } | null;
    questionnaireAnswers?: {
        format: 'structured' | 'legacy';
        answers?: any[];
        metadata?: any;
    } | null;
};

export const OfferingsSection: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [approved, setApproved] = React.useState<OfferingItem[]>([]);
    const [pending, setPending] = React.useState<OfferingItem[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [selected, setSelected] = React.useState<OfferingItem | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState<Record<string, boolean>>({});

    const openDetails = (item: OfferingItem) => {
        setSelected(item);
        setIsOpen(true);
    };

    const closeDetails = () => {
        setIsOpen(false);
        setSelected(null);
    };

    const loadOfferings = React.useCallback(async () => {
        try {
            setLoading(true);
            const res: any = await fetchWithAuth<{ success: boolean; data: OfferingItem[] }>(
                "/md/offerings"
            );
            const items = (res?.data as any[]) || [];
            setApproved(items.filter((i) => i.classification === "approved"));
            setPending(items.filter((i) => i.classification === "pending"));
            setError(null);
        } catch (e) {
            setError("Failed to load offerings");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadOfferings();
    }, [loadOfferings]);

    const handleResync = async (item: OfferingItem) => {
        if (!item.caseId) return;
        setRefreshing((prev) => ({ ...prev, [item.caseId as string]: true }));
        try {
            await apiCall("/md/resync", {
                method: "POST",
                body: JSON.stringify({ caseId: item.caseId })
            });
            await loadOfferings();
        } catch { }
        finally {
            setRefreshing((prev) => ({ ...prev, [item.caseId as string]: false }));
        }
    };

    if (loading) {
        return (
            <Card>
                <CardBody className="flex items-center justify-center h-24">
                    <Spinner label="Loading your offerings..." />
                </CardBody>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardBody>
                    <div className="text-danger">{error}</div>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold tracking-tight">Approved offerings</h2>
                    <Chip size="sm" variant="flat" color="success">{approved.length}</Chip>
                </div>
                {approved.length === 0 ? (
                    <Card className="border-dashed">
                        <CardBody>
                            <div className="text-foreground-500">No approved offerings yet.</div>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {approved.map((item) => (
                            item.orderId ? (
                                <Link href={`/offerings/${item.orderId}`} key={`${item.orderId}-${item.offeringId || item.caseOfferingId || "none"}`} className="block">
                                    <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                        <CardBody>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="font-medium text-foreground">{item.title}</div>
                                                    <div className="mt-1 text-sm text-foreground-500">Order {item.orderNumber}</div>
                                                    {item.tenantProduct && item.tenantProduct.dosage && (
                                                        <div className="text-xs text-foreground-400 mt-1">
                                                            {item.tenantProduct.dosage}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Chip color="success" size="sm" variant="flat">Approved</Chip>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-1 text-xs text-foreground-500">
                                                <Icon icon="lucide:clock" />
                                                <span>Updated {new Date(item.updatedAt).toLocaleString()}</span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Link>
                            ) : (
                                <Card key={`${item.orderId}-${item.offeringId || item.caseOfferingId || "none"}`} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => openDetails(item)}>
                                    <CardBody>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-medium text-foreground">{item.title}</div>
                                                <div className="mt-1 text-sm text-foreground-500">Order {item.orderNumber}</div>
                                                {item.caseId && (
                                                    <div className="text-xs text-foreground-400 mt-1">Case: <span className="font-mono">{item.caseId}</span></div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button isIconOnly size="sm" variant="light" aria-label="Refresh" onClick={(ev) => { ev.stopPropagation(); handleResync(item); }} isDisabled={!item.caseId}>
                                                    {item.caseId && refreshing[item.caseId] ? (
                                                        <Icon icon="lucide:loader-2" className="animate-spin" />
                                                    ) : (
                                                        <Icon icon="lucide:refresh-cw" />
                                                    )}
                                                </Button>
                                                <Chip color="success" size="sm" variant="flat">Approved</Chip>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground-500">
                                            <div className="flex items-center gap-1">
                                                <Icon icon="lucide:clock" />
                                                <span>Updated {new Date(item.updatedAt).toLocaleString()}</span>
                                            </div>
                                            {item.productType && (
                                                <div className="flex items-center gap-1 justify-end md:justify-start">
                                                    <Icon icon="lucide:tag" />
                                                    <span className="capitalize">{item.productType.replace(/^.*\\\\/, '')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            )
                        ))}
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold tracking-tight">Pending offerings</h2>
                    <Chip size="sm" variant="flat" color="warning">{pending.length}</Chip>
                </div>
                {pending.length === 0 ? (
                    <Card className="border-dashed">
                        <CardBody>
                            <div className="text-foreground-500">No pending offerings.</div>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {pending.map((item) => (
                            item.orderId ? (
                                <Link href={`/offerings/${item.orderId}`} key={`${item.orderId}-pending-${item.orderId}`} className="block">
                                    <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                        <CardBody>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="font-medium text-foreground">{item.title}</div>
                                                    <div className="mt-1 text-sm text-foreground-500">Order {item.orderNumber}</div>
                                                    {item.tenantProduct && item.tenantProduct.dosage && (
                                                        <div className="text-xs text-foreground-400 mt-1">
                                                            {item.tenantProduct.dosage}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Chip color="warning" size="sm" variant="flat">Pending</Chip>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-1 text-xs text-foreground-500">
                                                <Icon icon="lucide:clock" />
                                                <span>Updated {new Date(item.updatedAt).toLocaleString()}</span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Link>
                            ) : (
                                <Card key={`${item.orderId}-pending-${item.caseId}`} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => openDetails(item)}>
                                    <CardBody>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="font-medium text-foreground">{item.title}</div>
                                                <div className="mt-1 text-sm text-foreground-500">Order {item.orderNumber}</div>
                                                {item.tenantProduct && item.tenantProduct.dosage && (
                                                    <div className="text-xs text-foreground-400 mt-1">
                                                        {item.tenantProduct.dosage}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Chip color="warning" size="sm" variant="flat">Pending</Chip>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs text-foreground-500">
                                            <Icon icon="lucide:clock" />
                                            <span>Updated {new Date(item.updatedAt).toLocaleString()}</span>
                                        </div>
                                    </CardBody>
                                </Card>
                            )
                        ))}
                    </div>
                )}
            </div>

            <OfferingDetailsModal item={selected} isOpen={isOpen} onClose={closeDetails} />
        </div>
    );
};

export const OfferingDetailsModal: React.FC<{ item: OfferingItem | null, isOpen: boolean, onClose: () => void }> = ({ item, isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{item?.title || 'Offering details'}</ModalHeader>
                        <ModalBody>
                            {item ? (
                                <div className="space-y-4 text-sm">
                                    {/* Basic Order Information */}
                                    <div className="space-y-2">
                                        <div><span className="text-foreground-500">Order:</span> {item.orderNumber}</div>
                                        {item.caseId && <div><span className="text-foreground-500">Case:</span> <span className="font-mono">{item.caseId}</span></div>}
                                        <div><span className="text-foreground-500">Status:</span> {item.status}</div>
                                        {item.details?.statusDetails && <div><span className="text-foreground-500">Status details:</span> {item.details.statusDetails}</div>}
                                    </div>

                                    {/* TenantProduct Information */}
                                    {item.tenantProduct && (
                                        <div className="border-t pt-3">
                                            <div className="font-medium text-foreground mb-2">Product Details</div>
                                            <div className="space-y-1">
                                                <div><span className="text-foreground-500">Name:</span> {item.tenantProduct.name}</div>
                                                {item.tenantProduct.description && <div><span className="text-foreground-500">Description:</span> {item.tenantProduct.description}</div>}
                                                {item.tenantProduct.dosage && <div><span className="text-foreground-500">Dosage:</span> {item.tenantProduct.dosage}</div>}
                                                {item.tenantProduct.category && <div><span className="text-foreground-500">Category:</span> {item.tenantProduct.category}</div>}
                                                <div><span className="text-foreground-500">Active:</span> {item.tenantProduct.isActive ? 'Yes' : 'No'}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Questionnaire Answers */}
                                    {item.questionnaireAnswers && (
                                        <div className="border-t pt-3">
                                            <div className="font-medium text-foreground mb-2">Questionnaire Answers</div>
                                            <div className="space-y-2">
                                                <div><span className="text-foreground-500">Format:</span> {item.questionnaireAnswers.format}</div>
                                                {item.questionnaireAnswers.format === 'structured' && item.questionnaireAnswers.answers && (
                                                    <div className="max-h-40 overflow-y-auto">
                                                        <div className="text-xs text-foreground-500 mb-1">Structured Answers:</div>
                                                        {item.questionnaireAnswers.answers.map((answer: any, index: number) => (
                                                            <div key={index} className="bg-gray-50 p-2 rounded text-xs mb-1">
                                                                <div className="font-medium">{answer.questionText}</div>
                                                                <div className="text-foreground-500">
                                                                    {answer.selectedOptions && answer.selectedOptions.length > 0 ? (
                                                                        answer.selectedOptions.map((opt: any) => opt.optionText).join(', ')
                                                                    ) : (
                                                                        String(answer.answer)
                                                                    )}
                                                                </div>
                                                                <div className="text-foreground-400 text-xs mt-1">
                                                                    Step: {answer.stepCategory || 'N/A'} | Type: {answer.answerType}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.questionnaireAnswers.format === 'legacy' && (
                                                    <div className="max-h-40 overflow-y-auto">
                                                        <div className="text-xs text-foreground-500 mb-1">Legacy Answers:</div>
                                                        {Object.entries(item.questionnaireAnswers.answers || {}).map(([question, answer]) => (
                                                            <div key={question} className="bg-gray-50 p-2 rounded text-xs mb-1">
                                                                <div className="font-medium">{question}</div>
                                                                <div className="text-foreground-500">{String(answer)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* MD Integration Details */}
                                    {item.details?.directions && <div><span className="text-foreground-500">Directions:</span> {item.details.directions}</div>}
                                    {item.details?.thankYouNote && <div><span className="text-foreground-500">Thank you note:</span> {item.details.thankYouNote}</div>}
                                    {item.details?.clinicalNote && <div><span className="text-foreground-500">Clinical note:</span> {item.details.clinicalNote}</div>}
                                    {item.details?.product && (
                                        <div className="border-t pt-3">
                                            <div className="font-medium">MD Integration Product</div>
                                            <div className="text-foreground-500">{item.details.product.title || item.details.product.id}</div>
                                            {item.details.product.description && <div className="text-foreground-500">{item.details.product.description}</div>}
                                            {item.details.product.pharmacyNotes && <div className="text-foreground-500">Pharmacy notes: {item.details.product.pharmacyNotes}</div>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-foreground-500">No details available.</div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={close}>Close</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};


