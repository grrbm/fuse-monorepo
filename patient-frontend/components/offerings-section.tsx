import React from "react";
import { Card, CardBody, Chip, Spinner } from "@heroui/react";
import { fetchWithAuth } from "../lib/api";

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
};

export const OfferingsSection: React.FC = () => {
    const [loading, setLoading] = React.useState(true);
    const [approved, setApproved] = React.useState<OfferingItem[]>([]);
    const [pending, setPending] = React.useState<OfferingItem[]>([]);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const res: any = await fetchWithAuth<{ success: boolean; data: OfferingItem[] }>(
                    "/md/offerings"
                );
                const items = (res?.data as any[]) || [];
                if (!mounted) return;
                setApproved(items.filter((i) => i.classification === "approved"));
                setPending(items.filter((i) => i.classification === "pending"));
            } catch (e: any) {
                if (!mounted) return;
                setError("Failed to load offerings");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

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
                            <Card key={`${item.orderId}-${item.offeringId || item.caseOfferingId || "none"}`}>
                                <CardBody>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-sm text-foreground-500">Order {item.orderNumber}</div>
                                            {item.caseId && (
                                                <div className="text-xs text-foreground-400 mt-1">Case: <span className="font-mono">{item.caseId}</span></div>
                                            )}
                                        </div>
                                        <Chip color="success" size="sm" variant="flat">Approved</Chip>
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
                            <Card key={`${item.orderId}-pending-${item.caseId}`}>
                                <CardBody>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-sm text-foreground-500">Order {item.orderNumber}</div>
                                            {item.caseId && (
                                                <div className="text-xs text-foreground-400 mt-1">Case: <span className="font-mono">{item.caseId}</span></div>
                                            )}
                                        </div>
                                        <Chip color="warning" size="sm" variant="flat">Pending review</Chip>
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
        </div>
    );
};


