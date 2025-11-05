import React from "react";
import { Card, CardBody, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface OrderTrackingCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    totalAmount: number;
    orderItems: Array<{
      product: {
        name: string;
        placeholderSig?: string;
      };
      quantity: number;
    }>;
    shippingAddress?: {
      address: string;
      apartment?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    shippingOrders?: Array<{
      status: string;
      pharmacyOrderId?: string;
      deliveredAt?: string;
      shippedAt?: string;
      trackingNumber?: string;
      trackingUrl?: string;
    }>;
  };
}

// AbsoluteRX Order Statuses based on API documentation
const orderStatusConfig: Record<string, {
  color: "default" | "primary" | "success" | "warning" | "danger";
  icon: string;
  label: string;
  description: string;
}> = {
  pending: {
    color: "default",
    icon: "lucide:clock",
    label: "Pending",
    description: "Order is awaiting doctor approval"
  },
  paid: {
    color: "primary",
    icon: "lucide:check-circle",
    label: "Payment Captured",
    description: "Payment has been processed"
  },
  created: {
    color: "primary",
    icon: "lucide:file-text",
    label: "Order Created",
    description: "Order sent to pharmacy"
  },
  assigned: {
    color: "primary",
    icon: "lucide:user-check",
    label: "Assigned",
    description: "Order assigned to pharmacy team"
  },
  approved: {
    color: "primary",
    icon: "lucide:clipboard-check",
    label: "Approved",
    description: "Prescription approved by pharmacist"
  },
  processing: {
    color: "primary",
    icon: "lucide:package",
    label: "Processing",
    description: "Order is being prepared"
  },
  waiting: {
    color: "warning",
    icon: "lucide:pause-circle",
    label: "Waiting",
    description: "Order on hold - awaiting information"
  },
  filled: {
    color: "primary",
    icon: "lucide:package-check",
    label: "Filled",
    description: "Prescription has been filled"
  },
  shipped: {
    color: "success",
    icon: "lucide:truck",
    label: "Shipped",
    description: "Order has been shipped"
  },
  delivered: {
    color: "success",
    icon: "lucide:home",
    label: "Delivered",
    description: "Order has been delivered"
  },
  completed: {
    color: "success",
    icon: "lucide:check-circle-2",
    label: "Completed",
    description: "Order completed successfully"
  },
  cancelled: {
    color: "danger",
    icon: "lucide:x-circle",
    label: "Cancelled",
    description: "Order has been cancelled"
  },
  rejected: {
    color: "danger",
    icon: "lucide:ban",
    label: "Rejected",
    description: "Order was rejected"
  },
  problem: {
    color: "danger",
    icon: "lucide:alert-triangle",
    label: "Issue",
    description: "There is an issue with your order"
  }
};

export const OrderTrackingCard: React.FC<OrderTrackingCardProps> = ({ order }) => {
  // Determine the current status - prefer shipping order status if available
  const shippingOrder = order.shippingOrders?.[0];
  const currentStatus = shippingOrder?.status?.toLowerCase() || order.status?.toLowerCase() || 'pending';
  const statusInfo = orderStatusConfig[currentStatus] || orderStatusConfig.pending;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get progress percentage based on status
  const getProgress = () => {
    const statusOrder = ['pending', 'paid', 'created', 'assigned', 'approved', 'processing', 'filled', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const progress = getProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full">
        <CardBody className="gap-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
              <p className="text-sm text-default-500">
                Ordered on {formatDate(order.createdAt)}
              </p>
            </div>
            <Chip
              color={statusInfo.color}
              variant="flat"
              startContent={<Icon icon={statusInfo.icon} className="text-lg" />}
              size="lg"
            >
              {statusInfo.label}
            </Chip>
          </div>

          {/* Status Description */}
          <p className="text-sm text-default-600">{statusInfo.description}</p>

          {/* Progress Bar */}
          {!['cancelled', 'rejected', 'problem'].includes(currentStatus) && (
            <div className="w-full">
              <div className="h-2 bg-default-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          <Divider />

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Items</h4>
            <div className="space-y-2">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    {item.product.placeholderSig && (
                      <p className="text-xs text-default-500">{item.product.placeholderSig}</p>
                    )}
                  </div>
                  <p className="text-default-500">Qty: {item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Information */}
          {shippingOrder && (
            <>
              <Divider />
              <div>
                <h4 className="text-sm font-semibold mb-2">Tracking Details</h4>

                {shippingOrder.pharmacyOrderId && (
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Icon icon="lucide:package" className="text-default-400" />
                    <span className="text-default-500">Pharmacy Order:</span>
                    <span className="font-medium">{shippingOrder.pharmacyOrderId}</span>
                  </div>
                )}

                {shippingOrder.trackingNumber && (
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Icon icon="lucide:truck" className="text-default-400" />
                    <span className="text-default-500">Tracking:</span>
                    {shippingOrder.trackingUrl ? (
                      <a
                        href={shippingOrder.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {shippingOrder.trackingNumber}
                      </a>
                    ) : (
                      <span className="font-medium">{shippingOrder.trackingNumber}</span>
                    )}
                  </div>
                )}

                {shippingOrder.shippedAt && (
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Icon icon="lucide:calendar" className="text-default-400" />
                    <span className="text-default-500">Shipped:</span>
                    <span className="font-medium">{formatDate(shippingOrder.shippedAt)}</span>
                  </div>
                )}

                {shippingOrder.deliveredAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon="lucide:calendar-check" className="text-default-400" />
                    <span className="text-default-500">Delivered:</span>
                    <span className="font-medium">{formatDate(shippingOrder.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <>
              <Divider />
              <div>
                <h4 className="text-sm font-semibold mb-2">Delivery Address</h4>
                <div className="text-sm text-default-600">
                  <p>{order.shippingAddress.address}</p>
                  {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Amount */}
          <Divider />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Amount</span>
            <span className="text-lg font-bold">
              ${typeof order.totalAmount === 'number'
                ? order.totalAmount.toFixed(2)
                : parseFloat(order.totalAmount || '0').toFixed(2)}
            </span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
