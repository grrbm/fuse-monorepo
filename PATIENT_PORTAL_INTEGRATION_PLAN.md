# Patient Portal Backend Integration Plan

## Overview

Transform the patient portal from static UI to a fully functional interface by connecting to existing backend APIs. Focus on order tracking, doctor messaging, and strategic product upsells.

## Current State Analysis

**What Works:**
- `components/treatments-page.tsx` - Already connected to `/treatments` API
- `lib/api.ts` - Centralized API utility with JWT auth
- Backend has complete APIs for orders, messaging, and products

**What Needs Connection:**
- Dashboard shows mock/placeholder data
- Messenger page uses hardcoded mock messages
- No order tracking interface exists
- Product recommendations are static

**Key Backend APIs Available:**
- `GET /orders` - User's orders with full details (OrderItems, Payment, ShippingAddress, Treatment)
- `GET /messages` - MD Integrations messaging (patient-doctor communication)
- `POST /messages` - Send messages to doctor
- `GET /tenant-products` - Clinic's available products for upsells

## Implementation Steps

### 1. Create My Orders Page

**New file:** `patient-frontend/components/orders-page.tsx`

Connect to `GET /orders` API which returns:
- Order status (pending → paid → processing → shipped → delivered)
- ShippingOrder status (pending → filled → approved → shipped → delivered)
- Order items with products
- Shipping address and expected delivery
- Payment information

Display order cards with:
- Order number and date
- Product images and names
- Status badges with colors (pending=warning, shipped=primary, delivered=success)
- Expected delivery date (calculated from shippedAt + estimated days)
- "Track Order" and "Contact Doctor" buttons

**Status Mapping:**
- "Under Review" = pending, payment_processing, paid
- "Approved & Processing" = processing, or ShippingOrder.status = filled/approved
- "Shipped" = shipped, or ShippingOrder.status = shipped  
- "Delivered" = delivered

### 2. Add Order Widgets to Dashboard

**Update:** `patient-frontend/components/dashboard.tsx`

Replace `UpcomingDates` placeholder with:
- **Recent Orders Widget** - Show 2-3 most recent orders with status
- **Expected Deliveries** - Orders with status=shipped showing delivery dates
- Fetch from same `GET /orders` API, filter/sort on frontend

### 3. Connect Messenger to Real API

**Update:** `patient-frontend/components/messenger-page.tsx`

Replace mock data with real API calls:
- `GET /messages?page=1&per_page=15` - Load message history
- `POST /messages` with `{ text, channel: 'patient' }` - Send messages
- Handle MD Integrations message format (id, user_type, content, created_at)
- Show clinician messages vs patient messages
- Handle pagination for message history

**Key Changes:**
- Use `apiCall('/messages')` from lib/api.ts
- Map MD Integration response to component's Message interface
- Implement real message sending (remove mock state)
- Add error handling for failed sends

### 4. Add Product Upsells (Organic UX)

**Update:** `patient-frontend/components/product-recommendation.tsx` and create new component

**Strategy:**
- Show 1-2 products at a time (not overwhelming)
- Smart recommendations based on:
  - Patient's active treatments (e.g., if on NAD+, suggest Glutathione)
  - Clinic's popular products
  - Dismissible cards (local storage to track dismissed items)

**New component:** `patient-frontend/components/product-upsells.tsx`
- Fetch `GET /tenant-products` for clinic products
- Carousel/slider format for multiple products
- Each card shows: image, name, brief description, price, "Learn More" CTA
- Links to product detail or opens questionnaire modal

**Dashboard Integration:**
- Replace static `ProductRecommendation` with dynamic version
- Add second upsell section after Treatments list (if patient has few active treatments)

### 5. Navigation Updates

**Update:** `patient-frontend/pages/index.tsx` and `patient-frontend/components/sidebar.tsx`

Add "Orders" tab to sidebar and mobile navigation:
- Icon: `lucide:package`
- Label: "My Orders"
- Route to `<OrdersPage />` component

Update mobile bottom nav to include Orders (5 items may need adjustment for space).

## Technical Details

**API Integration Pattern:**
```typescript
// Use existing apiCall utility
const { success, data, error } = await apiCall<OrdersResponse>('/orders');
if (success && data) {
  setOrders(data);
} else {
  // Show error toast/message
}
```

**Loading States:**
- Show skeleton loaders while fetching
- Use Hero UI Skeleton component

**Error Handling:**
- Display friendly error messages
- Retry buttons for failed requests
- Empty states when no data

**Date Formatting:**
- Use `new Date().toLocaleDateString()` for consistency
- Calculate estimated delivery (shippedAt + 5-7 days if not provided)

## Backend API Reference

### Orders API
```
GET /orders
Authentication: Required (JWT)
Returns: Array of Order objects with includes:
  - orderItems (with product details)
  - payment
  - shippingAddress
  - treatment
  - shippingOrders (array with status and pharmacyOrderId)
```

### Messages API
```
GET /messages?page=1&per_page=15
Authentication: Required (JWT)
Returns: MD Integrations message response with:
  - data: Array of messages
  - meta: Pagination info

POST /messages
Authentication: Required (JWT)
Body: { text: string, channel: 'patient', reference_message_id?: string }
Returns: Created message object
```

### Products API
```
GET /tenant-products
Authentication: Required (JWT)
Returns: Array of TenantProduct objects for user's clinic with:
  - id, name, description, price
  - images
  - product metadata
```

## Files to Modify

1. `patient-frontend/components/orders-page.tsx` - **CREATE**
2. `patient-frontend/components/product-upsells.tsx` - **CREATE**  
3. `patient-frontend/components/dashboard.tsx` - **UPDATE** (add order widgets)
4. `patient-frontend/components/upcoming-dates.tsx` - **UPDATE** (show delivery dates)
5. `patient-frontend/components/messenger-page.tsx` - **UPDATE** (connect to API)
6. `patient-frontend/components/product-recommendation.tsx` - **UPDATE** (dynamic products)
7. `patient-frontend/pages/index.tsx` - **UPDATE** (add Orders routing)
8. `patient-frontend/components/sidebar.tsx` - **UPDATE** (add Orders nav item)

## Implementation Checklist

- [ ] **Step 1: Create My Orders Page**
  - [ ] Create `orders-page.tsx` component
  - [ ] Integrate with `GET /orders` API
  - [ ] Implement order status mapping and display logic
  - [ ] Add order cards with all required information
  - [ ] Handle loading states and errors
  - [ ] Make responsive for mobile

- [ ] **Step 2: Dashboard Order Widgets**
  - [ ] Update `dashboard.tsx` to fetch orders
  - [ ] Create Recent Orders widget (2-3 most recent)
  - [ ] Update `upcoming-dates.tsx` for delivery tracking
  - [ ] Add "View All Orders" link to new Orders page

- [ ] **Step 3: Connect Messenger**
  - [ ] Update `messenger-page.tsx` to use real API
  - [ ] Implement `GET /messages` integration
  - [ ] Implement `POST /messages` for sending
  - [ ] Map MD Integrations format to UI format
  - [ ] Add pagination support
  - [ ] Handle loading/error states

- [ ] **Step 4: Dynamic Product Upsells**
  - [ ] Create `product-upsells.tsx` component
  - [ ] Integrate with `GET /tenant-products` API
  - [ ] Implement smart recommendation logic
  - [ ] Add dismissible functionality (localStorage)
  - [ ] Update `product-recommendation.tsx` to use dynamic data
  - [ ] Add carousel/slider for multiple products

- [ ] **Step 5: Navigation Updates**
  - [ ] Add Orders to `sidebar.tsx`
  - [ ] Add Orders to mobile bottom nav in `index.tsx`
  - [ ] Update routing logic to show `<OrdersPage />`
  - [ ] Test navigation on mobile and desktop

- [ ] **Step 6: Testing & Polish**
  - [ ] Test all API integrations
  - [ ] Verify loading states work correctly
  - [ ] Test error handling and empty states
  - [ ] Verify mobile responsiveness
  - [ ] Check authentication handling
  - [ ] Test with real data from backend

## Success Criteria

- ✅ Patients can view all their orders with real-time statuses
- ✅ Order tracking shows clear progression (review → approved → shipped → delivered)
- ✅ Messenger connects to real doctor communication via MD Integrations
- ✅ Product recommendations are dynamic based on clinic and treatments
- ✅ All data loads from backend APIs (no mock data)
- ✅ Loading states and error handling provide good UX
- ✅ Mobile-responsive throughout

## Notes for Implementation

- All backend APIs are already built and tested
- Use existing `apiCall()` utility from `lib/api.ts` for consistency
- Follow Hero UI patterns from existing components
- Maintain HIPAA compliance (no logging of PHI)
- Keep components performant with proper React hooks usage
- Add TypeScript interfaces for API responses

