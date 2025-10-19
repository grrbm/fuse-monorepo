import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { UpcomingDates } from "./upcoming-dates";
import { TreatmentsList } from "./treatments-list";
import { ProductRecommendation } from "./product-recommendation";
import { apiCall } from "../lib/api";

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
  }>;
}

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const result = await apiCall<{ data: Order[] }>('/orders');
      if (result.success && result.data) {
        setOrders(result.data.data || result.data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-2xl font-semibold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Dashboard
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <UpcomingDates orders={orders} loadingOrders={loadingOrders} />
          <TreatmentsList />
        </div>
        
        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          <ProductRecommendation />
        </div>
      </div>
    </div>
  );
};