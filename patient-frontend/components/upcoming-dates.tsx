import React from "react";
import { Card, CardBody, Button, Chip, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingOrders?: Array<{
    status: string;
    deliveredAt?: string;
  }>;
}

interface UpcomingDatesProps {
  orders: Order[];
  loadingOrders: boolean;
}

export const UpcomingDates: React.FC<UpcomingDatesProps> = ({ orders, loadingOrders }) => {
  const getExpectedDeliveryDate = (order: Order): Date | null => {
    // If already delivered, return that date
    if (order.deliveredAt) {
      return new Date(order.deliveredAt);
    }

    // Check shipping orders for delivered date
    if (order.shippingOrders && order.shippingOrders.length > 0) {
      const latestShipping = order.shippingOrders[0];
      if (latestShipping.deliveredAt) {
        return new Date(latestShipping.deliveredAt);
      }
    }

    // If shipped, estimate 5-7 days
    if (order.shippedAt) {
      const shippedDate = new Date(order.shippedAt);
      const estimatedDate = new Date(shippedDate);
      estimatedDate.setDate(estimatedDate.getDate() + 6); // Middle of 5-7 days
      return estimatedDate;
    }

    return null;
  };

  const getOrderStatus = (order: Order): string => {
    if (order.shippingOrders && order.shippingOrders.length > 0) {
      const latestShipping = order.shippingOrders[0];
      if (latestShipping.status === 'shipped') return 'Shipped';
      if (latestShipping.status === 'delivered' || latestShipping.status === 'completed') return 'Delivered';
    }
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'shipped') return 'Shipped';
    return 'Processing';
  };

  // Get orders with expected delivery dates (shipped or delivered)
  const deliveryOrders = orders
    .map(order => ({
      ...order,
      expectedDate: getExpectedDeliveryDate(order),
      displayStatus: getOrderStatus(order)
    }))
    .filter(order => order.expectedDate !== null && (order.displayStatus === 'Shipped' || order.displayStatus === 'Delivered'))
    .sort((a, b) => {
      if (!a.expectedDate || !b.expectedDate) return 0;
      return a.expectedDate.getTime() - b.expectedDate.getTime();
    })
    .slice(0, 3); // Show max 3 deliveries

  if (loadingOrders) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="border border-content3">
          <CardBody className="p-6">
            <h2 className="text-lg font-medium mb-4">Expected Deliveries</h2>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="w-full h-16 rounded-lg" />
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border border-content3">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Expected Deliveries</h2>
          </div>
          
          {deliveryOrders.length > 0 ? (
            <div className="space-y-3">
              {deliveryOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-content2 hover:bg-content3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary-100">
                      <Icon icon="lucide:package" className="text-lg text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-foreground-500 flex items-center gap-1">
                        <Icon icon="lucide:calendar" width={14} />
                        {order.expectedDate?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Chip 
                    color={order.displayStatus === 'Delivered' ? 'success' : 'primary'} 
                    variant="flat"
                    size="sm"
                  >
                    {order.displayStatus}
                  </Chip>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-content2 p-4 rounded-full mb-4">
                <Icon icon="lucide:calendar" className="text-2xl text-foreground-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No upcoming deliveries</h3>
              <p className="text-foreground-500 text-sm mb-0">You have no orders in transit at the moment.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};