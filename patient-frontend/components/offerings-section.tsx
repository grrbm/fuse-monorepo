import React from "react";
import { Card, CardBody, Chip, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { fetchWithAuth, apiCall } from "../lib/api";
import { Icon } from "@iconify/react";

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
};

export const OfferingsSection: React.FC = () => {
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
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-3">Approved offerings</h2>
                {approved.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-foreground-500">No approved offerings yet.</div>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {approved.map((item) => (
                            <Card key={`${item.orderId}-${item.offeringId || item.caseOfferingId || "none"}`} className="cursor-pointer" onClick={() => openDetails(item)}>
                                <CardBody>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-sm text-foreground-500">Order {item.orderNumber}</div>
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
                                    <div className="mt-2 text-xs text-foreground-500">
                                        Updated {new Date(item.updatedAt).toLocaleString()}
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3">Pending offerings</h2>
                {pending.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-foreground-500">No pending offerings.</div>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {pending.map((item) => (
                            <Card key={`${item.orderId}-pending-${item.caseId}`} className="cursor-pointer" onClick={() => openDetails(item)}>
                                <CardBody>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-sm text-foreground-500">Order {item.orderNumber}</div>
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
                                            <Chip color="warning" size="sm" variant="flat">Pending review</Chip>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-foreground-500">
                                        Updated {new Date(item.updatedAt).toLocaleString()}
                                    </div>
                                </CardBody>
                            </Card>
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
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-foreground-500">Order:</span> {item.orderNumber}</div>
                                    {item.caseId && <div><span className="text-foreground-500">Case:</span> <span className="font-mono">{item.caseId}</span></div>}
                                    <div><span className="text-foreground-500">Status:</span> {item.status}</div>
                                    {item.details?.statusDetails && <div><span className="text-foreground-500">Status details:</span> {item.details.statusDetails}</div>}
                                    {item.details?.directions && <div><span className="text-foreground-500">Directions:</span> {item.details.directions}</div>}
                                    {item.details?.thankYouNote && <div><span className="text-foreground-500">Thank you note:</span> {item.details.thankYouNote}</div>}
                                    {item.details?.clinicalNote && <div><span className="text-foreground-500">Clinical note:</span> {item.details.clinicalNote}</div>}
                                    {item.details?.product && (
                                        <div className="mt-2">
                                            <div className="font-medium">Product</div>
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


