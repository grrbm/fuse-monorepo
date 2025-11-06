# Customer Journey & Order Status Tracking

## Overview
This document outlines the customer journey stages and how they map to our Order and User status tracking system.

## Customer Journey Stages

### 1. **Account Created** (User exists, no order yet)
- **Trigger**: User completes "Create Your Account" step in questionnaire
- **Status**: User record created in database
- **Data Captured**: firstName, lastName, email, phoneNumber
- **Next Actions**: Continue questionnaire → Payment

---

### 2. **Abandoned Cart** (Order created but not paid)
- **Trigger**: User creates account but doesn't complete payment
- **Order Status**: `PENDING` or `PAYMENT_DUE`
- **Payment Status**: `idle` or `pending`
- **Tracking**: Can identify by orders with userId but no payment success
- **Recovery**: Send abandoned cart emails

---

### 3. **Order Placed / Payment Received** 
- **Trigger**: Payment successfully processed
- **Order Status**: `PAID`
- **Payment Status**: `succeeded` (Payment.status = 'completed')
- **Subscription**: Created with appropriate billing interval
- **Next Stage**: Pending Doctor Review

---

### 4. **Pending Doctor Review**
- **Order Status**: `PAID` or `PROCESSING`
- **Order Fields**: 
  - `approvedByDoctor` = false
  - `autoApprovedByDoctor` = can be true if auto-approved
- **Waiting For**: Doctor to review questionnaire answers and approve prescription
- **Display**: "Pending Doctor Approval" in patient dashboard

---

### 5. **Approved by Doctor**
- **Order Status**: `PAID` → `PROCESSING`
- **Order Fields**:
  - `approvedByDoctor` = true
  - `autoApprovedByDoctor` = true/false
  - `doctorNotes` = optional notes from doctor
  - `autoApprovalReason` = reason if auto-approved
- **Next Action**: Submit to pharmacy

---

### 6. **Rejected by Doctor**
- **Order Status**: `CANCELLED`
- **Order Fields**:
  - `approvedByDoctor` = false
  - `doctorNotes` = rejection reason
- **Customer Notification**: Email with rejection reason
- **Refund**: Process refund if applicable

---

### 7. **Submitted to Pharmacy**
- **Order Status**: `PROCESSING`
- **ShippingOrder Status**: `PENDING` → `PROCESSING` → `FILLED`
- **External System**: Order sent to pharmacy via API (AbsoluteRX/IronSail)
- **Tracking**: `mdCaseId` populated if using MD Integrations

---

### 8. **Pharmacy Approved**
- **ShippingOrder Status**: `APPROVED`
- **External**: Pharmacy confirms they can fill the prescription
- **Next**: Pharmacy fills and ships order

---

### 9. **Shipped**
- **Order Status**: `SHIPPED`
- **ShippingOrder Status**: `SHIPPED`
- **Order Fields**:
  - `shippedAt` = timestamp
  - Tracking number from pharmacy
- **Customer Notification**: Shipping confirmation email with tracking

---

### 10. **Delivered**
- **Order Status**: `DELIVERED`
- **ShippingOrder Status**: `DELIVERED`
- **Order Fields**:
  - `deliveredAt` = timestamp
- **Customer Notification**: Delivery confirmation
- **Next**: Patient can request refills

---

## Order Status Enum Values

```typescript
export enum OrderStatus {
  PENDING = 'pending',                    // Order created, awaiting payment
  PAYMENT_PROCESSING = 'payment_processing', // Payment in progress
  PAID = 'paid',                         // Payment received, awaiting doctor approval
  PAYMENT_DUE = 'payment_due',           // Payment failed/requires action
  PROCESSING = 'processing',              // Doctor approved, being processed
  SHIPPED = 'shipped',                    // Shipped to customer
  DELIVERED = 'delivered',                // Delivered to customer
  CANCELLED = 'cancelled',                // Order cancelled (rejected/refunded)
  REFUNDED = 'refunded'                   // Payment refunded
}
```

## ShippingOrder Status Values

```typescript
export enum OrderShippingStatus {
  PENDING = 'pending',       // Awaiting submission to pharmacy
  PROCESSING = 'processing', // Submitted to pharmacy
  FILLED = 'filled',         // Pharmacy filled prescription
  APPROVED = 'approved',     // Pharmacy approved order
  SHIPPED = 'shipped',       // Shipped from pharmacy
  DELIVERED = 'delivered',   // Delivered to patient
  CANCELLED = 'cancelled',   // Order cancelled
  REJECTED = 'rejected',     // Pharmacy rejected order
  PROBLEM = 'problem',       // Issue with order
  COMPLETED = 'completed',   // Order fully completed
}
```

## Payment/Subscription Status

```typescript
export enum PaymentStatus {
  PENDING = 'pending',           // Payment not started
  PROCESSING = 'processing',     // Payment being processed
  PAID = 'paid',                 // Payment successful
  PAYMENT_DUE = 'payment_due',   // Payment failed/retry needed
  CANCELLED = 'cancelled',       // Payment cancelled
  SUBSCRIPTION_DELETED = 'deleted' // Subscription deleted
}
```

## Key Order Fields for Tracking

- **userId**: Patient ID (captured immediately after account creation)
- **status**: Main order status (see OrderStatus enum)
- **approvedByDoctor**: Boolean - doctor approval status
- **autoApprovedByDoctor**: Boolean - was it auto-approved
- **doctorNotes**: Text - notes from doctor
- **shippedAt**: Timestamp - when shipped
- **deliveredAt**: Timestamp - when delivered
- **questionnaireAnswers**: JSONB - all questionnaire responses
- **mdCaseId**: External case tracking ID

## Implementation Notes

### Real-Time Data Capture
1. **Account Creation**: Happens immediately after "Create Your Account" step completion
2. **Order Creation**: Happens when payment intent is created (before payment success)
3. **Status Updates**: Tracked through Order.status and ShippingOrder.status fields
4. **No Redundancies**: Single source of truth per stage in appropriate tables

### Status Transition Flow
```
User fills form
  ↓
Account Created (User record) 
  ↓
Order Created with status=PENDING
  ↓
Payment Attempted → PAYMENT_PROCESSING
  ↓
  ├─ Success → PAID (awaiting doctor)
  ├─ Failed → PAYMENT_DUE (retry)
  └─ Abandoned → PENDING (abandoned cart)
      ↓
Doctor Reviews
  ↓
  ├─ Approved → PROCESSING
  └─ Rejected → CANCELLED
      ↓
Submit to Pharmacy (ShippingOrder created)
  ↓
SHIPPED (shippedAt timestamp)
  ↓
DELIVERED (deliveredAt timestamp)
```

## Analytics & Reporting

Track conversion funnel:
1. Forms Started (questionnaire loaded)
2. Accounts Created (User records with questionnaire data)
3. Orders Created (Order records)
4. Payments Completed (Order.status = PAID)
5. Doctor Approved (approvedByDoctor = true)
6. Shipped (Order.status = SHIPPED)
7. Delivered (Order.status = DELIVERED)

Calculate drop-off rates at each stage to optimize conversion.

