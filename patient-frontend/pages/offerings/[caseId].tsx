import React from "react";
import { useRouter } from "next/router";
import { Card, CardBody, Button, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { fetchWithAuth } from "../../lib/api";

export default function OfferingDetailsPage() {
    const router = useRouter();
    const { caseId } = router.query as { caseId?: string };
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [offerings, setOfferings] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!caseId) return;
        (async () => {
            try {
                setLoading(true);
                const res: any = await fetchWithAuth(`/md/cases/${caseId}/offerings`);
                const data = (res?.data as any[]) || [];
                setOfferings(data);
                setError(null);
            } catch (e) {
                setError("Failed to load offering details");
            } finally {
                setLoading(false);
            }
        })();
    }, [caseId]);

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-3">
                <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />} onPress={() => router.back()}>
                    Back
                </Button>
                <h1 className="text-2xl font-semibold">Offering details</h1>
                {caseId && <span className="text-xs text-foreground-400 font-mono">{caseId}</span>}
            </div>

            {loading ? (
                <Card><CardBody className="h-24 flex items-center justify-center"><Spinner label="Loading..." /></CardBody></Card>
            ) : error ? (
                <Card><CardBody className="text-danger">{error}</CardBody></Card>
            ) : offerings.length === 0 ? (
                <Card><CardBody className="text-foreground-500">No offerings found for this case.</CardBody></Card>
            ) : (
                <div className="space-y-3">
                    {offerings.map((o) => (
                        <Card key={o.case_offering_id || o.id}>
                            <CardBody>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium">{o.title || o.name || 'Offering'}</div>
                                        <div className="text-sm text-foreground-500">{o.product?.title || o.product_id}</div>
                                        <div className="text-xs text-foreground-500 mt-1">{o.product?.description}</div>
                                    </div>
                                    <Chip size="sm" variant="flat" color={String(o.status || '').toLowerCase() === 'completed' ? 'success' as any : 'default' as any}>
                                        {o.status || 'n/a'}
                                    </Chip>
                                </div>
                                {o.directions && <div className="mt-3 text-sm"><span className="text-foreground-500">Directions:</span> {o.directions}</div>}
                                {o.thank_you_note && <div className="mt-2 text-sm"><span className="text-foreground-500">Thank you note:</span> {o.thank_you_note}</div>}
                                {o.clinical_note && <div className="mt-2 text-sm"><span className="text-foreground-500">Clinical note:</span> {o.clinical_note}</div>}
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


