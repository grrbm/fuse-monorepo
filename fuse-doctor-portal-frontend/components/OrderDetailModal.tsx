import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { PendingOrder, ApiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OrderDetailModalProps {
    order: PendingOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove?: (orderId: string) => void;
    onNotesAdded?: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose, onApprove, onNotesAdded }: OrderDetailModalProps) {
    const { authenticatedFetch } = useAuth();
    const apiClient = new ApiClient(authenticatedFetch);

    const [notes, setNotes] = useState('');
    const [submittingNotes, setSubmittingNotes] = useState(false);
    const [approving, setApproving] = useState(false);

    if (!isOpen || !order) return null;

    const handleAddNotes = async () => {
        if (!notes.trim()) {
            toast.error('Please enter a note');
            return;
        }

        setSubmittingNotes(true);
        try {
            await apiClient.addOrderNotes(order.id, notes);
            toast.success('Notes added successfully');
            setNotes('');
            onNotesAdded?.();
        } catch (error) {
            toast.error('Failed to add notes');
        } finally {
            setSubmittingNotes(false);
        }
    };

    const handleApprove = async () => {
        setApproving(true);
        try {
            await apiClient.bulkApproveOrders([order.id]);
            toast.success(`Order ${order.orderNumber} approved successfully`);
            onApprove?.(order.id);
            onClose();
        } catch (error) {
            toast.error('Failed to approve order');
        } finally {
            setApproving(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">Order Details</h2>
                        <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Patient Information */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium">
                                    {order.patient?.firstName} {order.patient?.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{order.patient?.email}</p>
                            </div>
                            {order.patient?.phoneNumber && (
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{order.patient.phoneNumber}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600">Order Date</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Total</p>
                                <p className="font-medium">${order.totalAmount}</p>
                            </div>
                            {order.shippingAddress && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Shipping Address</p>
                                    <p className="font-medium">
                                        {order.shippingAddress.street}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Treatment Information */}
                    {order.treatment && (
                        <section>
                            <h3 className="text-lg font-semibold mb-3">Treatment Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium text-lg">{order.treatment.name}</p>
                                {order.treatment.description && (
                                    <p className="text-sm text-gray-600 mt-2">{order.treatment.description}</p>
                                )}
                                {order.treatment.isCompound && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                        Compound Medication
                                    </span>
                                )}
                            </div>
                        </section>
                    )}

                    {/* MD Prescriptions */}
                    {order.mdPrescriptions && order.mdPrescriptions.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold mb-3">Prescriptions (MD Integrations)</h3>
                            <div className="space-y-2">
                                {order.mdPrescriptions.map((rx: any, idx: number) => (
                                    <div key={idx} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                        <p className="font-medium">{rx.title || rx.name}</p>
                                        {rx.directions && (
                                            <p className="text-sm text-gray-700 mt-1">Directions: {rx.directions}</p>
                                        )}
                                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                                            {rx.quantity && <span>Qty: {rx.quantity}</span>}
                                            {rx.refills !== undefined && <span>Refills: {rx.refills}</span>}
                                            {rx.days_supply && <span>Days: {rx.days_supply}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* MD Offerings */}
                    {order.mdOfferings && order.mdOfferings.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold mb-3">Services/Offerings (MD Integrations)</h3>
                            <div className="space-y-2">
                                {order.mdOfferings.map((offering: any, idx: number) => (
                                    <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                        <p className="font-medium">{offering.title || offering.name}</p>
                                        {offering.directions && (
                                            <p className="text-sm text-gray-700 mt-1">{offering.directions}</p>
                                        )}
                                        {offering.status && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                {offering.status}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Questionnaire Answers */}
                    {(() => {
                        // Parse questionnaire answers and filter for "normal" category only
                        if (!order.questionnaireAnswers) return null;

                        const qa = order.questionnaireAnswers;
                        let normalAnswers: any[] = [];

                        // Try multiple possible formats
                        let allAnswers: any[] = [];

                        // Format 1: Direct answers array
                        if (qa.answers && Array.isArray(qa.answers)) {
                            allAnswers = qa.answers;
                        }
                        // Format 2: Wrapped with format property
                        else if (qa.format === 'structured' && qa.answers && Array.isArray(qa.answers)) {
                            allAnswers = qa.answers;
                        }
                        // Format 3: Legacy format (key-value pairs) - skip as no category info available
                        else if (typeof qa === 'object' && !qa.answers && !qa.format) {
                            return null;
                        }

                        // Filter for only "normal" category questions
                        normalAnswers = allAnswers.filter((answer: any) => answer.stepCategory === 'normal');

                        // If no normal answers found, don't show this section
                        if (normalAnswers.length === 0) {
                            return null;
                        }

                        return (
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Questionnaire Answers</h3>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    {normalAnswers.map((answer: any, index: number) => (
                                        <div key={index} className="bg-white border border-gray-200 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-900">{answer.questionText}</p>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {answer.selectedOptions && answer.selectedOptions.length > 0 ? (
                                                    answer.selectedOptions.map((opt: any) => opt.optionText).join(', ')
                                                ) : (
                                                    String(answer.answer)
                                                )}
                                            </p>
                                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                Product Question
                                            </span>
                                        </div>
                                    ))}
                                    {qa.metadata && (
                                        <div className="text-xs text-gray-500 mt-2">
                                            Completed: {new Date(qa.metadata.completedAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                    {/* Doctor Notes */}
                    {order.doctorNotes && order.doctorNotes.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold mb-3">Doctor Notes</h3>
                            <div className="space-y-2">
                                {order.doctorNotes.map((note: any, idx: number) => (
                                    <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm">{note.note}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {new Date(note.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Add Notes Section */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3">Add Notes</h3>
                        <textarea
                            className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]"
                            placeholder="Enter notes about this order..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <button
                            onClick={handleAddNotes}
                            disabled={submittingNotes}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submittingNotes ? 'Saving...' : 'Add Notes'}
                        </button>
                    </section>

                    {/* Auto Approval Info */}
                    {order.autoApprovedByDoctor && (
                        <section>
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <p className="font-medium text-yellow-900">Auto-Approved</p>
                                {order.autoApprovalReason && (
                                    <p className="text-sm text-yellow-800 mt-1">{order.autoApprovalReason}</p>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={approving}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                        {approving ? 'Approving...' : 'Approve Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}

