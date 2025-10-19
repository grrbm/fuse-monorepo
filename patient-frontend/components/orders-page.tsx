import React from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Input,
  Skeleton,
  Avatar
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { apiCall } from "../lib/api";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    image?: string;
    description?: string;
  };
}

interface ShippingAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface ShippingOrder {
  id: string;
  status: 'pending' | 'processing' | 'filled' | 'approved' | 'shipped' | 'delivered' | 'cancelled' | 'rejected' | 'problem' | 'completed';
  pharmacyOrderId?: string;
  deliveredAt?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'payment_processing' | 'paid' | 'payment_due' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmount: number;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  orderItems: OrderItem[];
  shippingAddress?: ShippingAddress;
  shippingOrders?: ShippingOrder[];
  treatment?: {
    id: string;
    name: string;
  };
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall<{ data: Order[] }>('/orders');
      
      if (result.success && result.data) {
        setOrders(result.data.data || result.data);
      } else {
        setError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayStatus = (order: Order): string => {
    // Check ShippingOrder status first if available
    if (order.shippingOrders && order.shippingOrders.length > 0) {
      const latestShipping = order.shippingOrders[0];
      if (latestShipping.status === 'shipped') return 'Shipped';
      if (latestShipping.status === 'delivered' || latestShipping.status === 'completed') return 'Delivered';
      if (latestShipping.status === 'filled' || latestShipping.status === 'approved') return 'Approved & Processing';
      if (latestShipping.status === 'rejected') return 'Rejected';
      if (latestShipping.status === 'cancelled') return 'Cancelled';
    }

    // Fall back to Order status
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'shipped') return 'Shipped';
    if (order.status === 'processing') return 'Approved & Processing';
    if (order.status === 'pending' || order.status === 'payment_processing' || order.status === 'paid') return 'Under Review';
    if (order.status === 'cancelled') return 'Cancelled';
    if (order.status === 'refunded') return 'Refunded';
    
    return 'Processing';
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    if (status === 'Delivered') return 'success';
    if (status === 'Shipped') return 'primary';
    if (status === 'Approved & Processing') return 'secondary';
    if (status === 'Under Review') return 'warning';
    if (status === 'Cancelled' || status === 'Rejected') return 'danger';
    return 'default';
  };

  const getExpectedDeliveryDate = (order: Order): string => {
    // If already delivered, show that date
    if (order.deliveredAt) {
      return new Date(order.deliveredAt).toLocaleDateString();
    }

    // If shipped, estimate 5-7 days
    if (order.shippedAt) {
      const shippedDate = new Date(order.shippedAt);
      const estimatedDate = new Date(shippedDate);
      estimatedDate.setDate(estimatedDate.getDate() + 6); // Middle of 5-7 days
      return estimatedDate.toLocaleDateString();
    }

    // Check shipping orders for delivered date
    if (order.shippingOrders && order.shippingOrders.length > 0) {
      const latestShipping = order.shippingOrders[0];
      if (latestShipping.deliveredAt) {
        return new Date(latestShipping.deliveredAt).toLocaleDateString();
      }
    }

    return 'Pending';
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      // Filter by search query
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderItems.some(item => 
          item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      // Filter by status
      const displayStatus = getDisplayStatus(order);
      const matchesFilter = 
        filterStatus === "all" || 
        displayStatus.toLowerCase().includes(filterStatus.toLowerCase());
      
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, filterStatus]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-content3">
              <CardBody className="p-4">
                <div className="space-y-3">
                  <Skeleton className="w-3/4 h-6 rounded-lg" />
                  <Skeleton className="w-1/2 h-4 rounded-lg" />
                  <Skeleton className="w-full h-20 rounded-lg" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <Card className="border border-content3">
          <CardBody className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-danger-50">
                <Icon icon="lucide:alert-circle" className="text-3xl text-danger" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Failed to Load Orders</h3>
            <p className="text-foreground-500 mb-4">{error}</p>
            <Button color="primary" onPress={loadOrders}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-2xl font-semibold"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        My Orders
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border border-content3">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<Icon icon="lucide:search" className="text-foreground-400" />}
                  isClearable
                  onClear={() => setSearchQuery("")}
                  size="sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant={filterStatus === "all" ? "solid" : "flat"}
                  color={filterStatus === "all" ? "primary" : "default"}
                  onPress={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={filterStatus === "review" ? "solid" : "flat"}
                  color={filterStatus === "review" ? "primary" : "default"}
                  onPress={() => setFilterStatus("review")}
                >
                  Under Review
                </Button>
                <Button 
                  size="sm" 
                  variant={filterStatus === "shipped" ? "solid" : "flat"}
                  color={filterStatus === "shipped" ? "primary" : "default"}
                  onPress={() => setFilterStatus("shipped")}
                >
                  Shipped
                </Button>
                <Button 
                  size="sm" 
                  variant={filterStatus === "delivered" ? "solid" : "flat"}
                  color={filterStatus === "delivered" ? "primary" : "default"}
                  onPress={() => setFilterStatus("delivered")}
                >
                  Delivered
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <motion.div key={order.id} variants={item}>
              <Card className="border border-content3">
                <CardBody className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-foreground-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Chip 
                        color={getStatusColor(getDisplayStatus(order))} 
                        variant="flat"
                        size="md"
                      >
                        {getDisplayStatus(order)}
                      </Chip>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-content2">
                            {item.product?.image ? (
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Icon icon="lucide:package" className="text-2xl text-foreground-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-foreground-500">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${Number(item.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Delivery Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-content3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                        {order.shippingAddress ? (
                          <p className="text-sm text-foreground-600">
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                        ) : (
                          <p className="text-sm text-foreground-500">Not available</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Delivery Information</h4>
                        <p className="text-sm text-foreground-600 flex items-center gap-1">
                          <Icon icon="lucide:calendar" className="text-foreground-500" width={16} />
                          Expected: {getExpectedDeliveryDate(order)}
                        </p>
                        <p className="text-sm text-foreground-600 mt-1">
                          Total: ${Number(order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="flat"
                        color="primary"
                        startContent={<Icon icon="lucide:message-square" />}
                        className="flex-1 sm:flex-none"
                      >
                        Contact Doctor
                      </Button>
                      {(getDisplayStatus(order) === 'Shipped' || getDisplayStatus(order) === 'Delivered') && (
                        <Button 
                          size="sm" 
                          variant="light"
                          startContent={<Icon icon="lucide:package-search" />}
                          className="flex-1 sm:flex-none"
                        >
                          Track Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="border border-content3">
            <CardBody className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-content2">
                  <Icon icon="lucide:package-x" className="text-3xl text-foreground-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
              <p className="text-foreground-500">
                {searchQuery || filterStatus !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "You haven't placed any orders yet"}
              </p>
            </CardBody>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

