# AbsoluteRX Pharmacy Tracking - Implementation Plan

## Current State ✅

### Backend - Fully Implemented

- ✅ Payment capture flow
- ✅ Pharmacy order creation
- ✅ Physician sync with AbsoluteRX
- ✅ Patient sync with AbsoluteRX
- ✅ ShippingOrder model with status tracking
- ✅ Webhook handlers for all AbsoluteRX events

### What Works

1. Doctor approves order → Payment captured
2. Order sent to AbsoluteRX pharmacy
3. ShippingOrder record created
4. Webhooks update ShippingOrder status
5. Recurring subscriptions also send to pharmacy (Stripe invoice.paid webhook)

## What's Missing ❌

### 1. Patient API Endpoint

**Need:** `GET /orders/my-orders` or `GET /shipping/my-shipments`

**Should return:**

```typescript
{
  success: true,
  data: [
    {
      id: "order-uuid",
      orderNumber: "ORD-20251028-123456",
      status: "paid", // Order status
      shippingStatus: "shipped", // ShippingOrder.status
      pharmacyOrderId: "12345",
      product: {
        name: "Ozempic",
        dosage: "0.5mg"
      },
      shippingAddress: {
        address: "123 Main St",
        city: "Nashville",
        state: "TN",
        zipCode: "37204"
      },
      createdAt: "2025-10-28",
      estimatedDelivery: "2025-11-02",
      trackingNumber: null // If available
    }
  ]
}
```

**Implementation:**

```typescript
// patient-api/src/main.ts or endpoints/orders.ts
app.get("/orders/my-orders", authenticateJWT, async (req, res) => {
  const currentUser = getCurrentUser(req);

  const orders = await Order.findAll({
    where: { userId: currentUser.id },
    include: [
      {
        model: ShippingOrder,
        as: "shippingOrders",
        include: [{ model: ShippingAddress, as: "shippingAddress" }],
      },
      {
        model: OrderItem,
        as: "orderItems",
        include: [{ model: Product, as: "product" }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json({ success: true, data: orders });
});
```

### 2. Frontend - Treatments Tab Enhancement

**Current:** Shows static treatment list  
**Need:** Show active orders with shipping tracking

**Update `patient-frontend/components/treatments-page.tsx`:**

Add order tracking section:

```typescript
// Fetch orders
const fetchOrders = async () => {
  const response = await apiCall('/orders/my-orders');
  if (response.success) {
    setOrders(response.data);
  }
};

// Display order cards with status
{orders.map(order => (
  <Card key={order.id}>
    <CardBody>
      <div className="flex items-center justify-between">
        <div>
          <h3>{order.product.name}</h3>
          <p>{order.orderNumber}</p>
        </div>
        <Chip color={getStatusColor(order.shippingStatus)}>
          {getStatusLabel(order.shippingStatus)}
        </Chip>
      </div>

      <div className="mt-4">
        <OrderTimeline status={order.shippingStatus} />
      </div>

      <div className="mt-2">
        <p className="text-sm">Ship to: {order.shippingAddress.address}</p>
        {order.estimatedDelivery && (
          <p className="text-sm">Est. Delivery: {order.estimatedDelivery}</p>
        )}
      </div>
    </CardBody>
  </Card>
))}
```

### 3. Order Status Timeline Component

Create visual timeline showing:

- ✅ Order Placed
- ✅ Doctor Approved
- ✅ Sent to Pharmacy
- 🔄 Processing
- 📦 Shipped
- ✅ Delivered

### 4. Real-time Updates (Optional)

Use WebSocket to push status updates:

```typescript
// When webhook updates ShippingOrder
socket.to(order.userId).emit("order:status_updated", {
  orderId: order.id,
  status: shippingOrder.status,
});
```

## Implementation Priority

1. **HIGH:** Backend endpoint `/orders/my-orders`
2. **HIGH:** Update TreatmentsPage to show orders
3. **MEDIUM:** Add OrderTimeline component
4. **LOW:** Real-time WebSocket updates

## Testing Checklist

- [ ] Patient can see their orders
- [ ] Shipping status updates correctly
- [ ] Webhook events properly update UI
- [ ] Order details are accurate
- [ ] Multiple orders display correctly
- [ ] Empty state shows when no orders
