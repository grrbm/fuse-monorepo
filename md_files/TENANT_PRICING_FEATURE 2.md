# Tenant Custom Pricing Feature

## Overview
Tenants can now set custom retail prices for products while seeing the pharmacy wholesale cost, enabling them to control their profit margins.

## Feature Components

### 1. Frontend - Product Detail Page
**Location**: `fuse-admin-frontend/pages/products/[id].tsx`

**New Pricing Card Shows**:
- **Pharmacy Wholesale Cost** (blue card)
  - What the tenant pays to the pharmacy
  - Sourced from `Product.pharmacyWholesaleCost`
  - Read-only display

- **Tenant Retail Price** (green card)
  - What customers will be charged at checkout
  - Sourced from `TenantProduct.price`
  - **Editable** with "Edit Price" button

- **Profit Calculation**
  - Automatically calculates: `Profit = Retail Price - Wholesale Cost`
  - Shows profit margin percentage: `Margin = (Profit / Retail Price) × 100%`
  - Updates in real-time as price is edited

- **Suggested Retail Price** (yellow card, optional)
  - Platform recommendation if available
  - Sourced from `Product.suggestedRetailPrice`

### 2. Backend - Pricing API
**Endpoint**: `POST /tenant-products/update`

**Request**:
```json
{
  "tenantProductId": "uuid-here",
  "price": 299.99
}
```

**Response**:
```json
{
  "success": true,
  "tenantProduct": { ... },
  "stripeProductId": "prod_xxx",
  "stripePriceId": "price_xxx"
}
```

**What It Does**:
1. Validates user has permission to update this tenant product
2. Creates or retrieves Stripe Product
3. Creates new Stripe Price (immutable in Stripe API)
4. Updates `TenantProduct.price` in database
5. Updates `TenantProduct.stripePriceId` with new price ID
6. Returns updated tenant product data

**Service**: `TenantProductService.updatePrice()`
**Location**: `patient-api/src/services/tenantProduct.service.ts`

### 3. Checkout Integration
**Endpoint**: `POST /products/create-payment-intent`

**Pricing Flow**:
```typescript
// Line 3045 in main.ts
const unitPrice = tenantProduct.price;  // ✅ Uses custom tenant pricing
const totalAmount = unitPrice;

// Creates Stripe Payment Intent with tenant's custom price
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalAmount * 100), // Custom price in cents
  ...
});
```

**What Happens**:
1. Customer selects product on tenant's portal
2. System fetches `TenantProduct` record
3. Uses `TenantProduct.price` for checkout (NOT `Product.price`)
4. Charges customer the tenant's custom retail price
5. Stripe uses the tenant's `stripePriceId` for subscription

## Database Schema

### Product Table (Global Products)
```sql
Product {
  id: UUID
  name: STRING
  price: FLOAT  -- Base/default price (not used for tenant checkouts)
  pharmacyWholesaleCost: DECIMAL(10,2)  -- What pharmacy charges
  suggestedRetailPrice: DECIMAL(10,2)  -- Optional suggestion
  pharmacyProductId: STRING
  ...
}
```

### TenantProduct Table (Clinic-Specific Product Configuration)
```sql
TenantProduct {
  id: UUID
  clinicId: UUID
  productId: UUID
  price: FLOAT  -- Tenant's custom retail price (used at checkout)
  stripeProductId: STRING  -- Stripe product ID for this tenant
  stripePriceId: STRING  -- Stripe price ID (updated when price changes)
  active: BOOLEAN
}
```

## Pricing Architecture

### Price Hierarchy
1. **Pharmacy Wholesale Cost** (`Product.pharmacyWholesaleCost`)
   - Set by platform admin
   - Read-only for tenants
   - Used for profit calculations

2. **Tenant Retail Price** (`TenantProduct.price`)
   - Set by each tenant individually
   - Used at customer checkout
   - Can be different for each clinic

3. **Suggested Retail Price** (`Product.suggestedRetailPrice`)
   - Optional guidance from platform
   - Not enforced
   - Helps tenants price competitively

### Example Scenario

**Product**: Semaglutide 2.5mg

**Platform Setup**:
- Pharmacy Wholesale Cost: $150.00
- Suggested Retail: $299.00

**Clinic A (Limitless Health)**:
- Custom Retail Price: $299.00
- Profit: $149.00 (49.8% margin)
- Customer pays: $299.00

**Clinic B (Another Clinic)**:
- Custom Retail Price: $349.00
- Profit: $199.00 (57.0% margin)
- Customer pays: $349.00

## User Flow

### Setting Custom Price
1. Tenant navigates to Products page
2. Clicks on a product to view details
3. Sees "Pharmacy Wholesale Cost" card
4. Clicks "Edit Price" on "Your Retail Price" card
5. Enters desired retail price
6. Sees real-time profit calculation
7. Clicks "Save"
8. Price updates in database and Stripe
9. New price applies to all future customer checkouts

### Customer Checkout
1. Customer visits `{clinic}.fuse.health/my-products/{product-slug}`
2. Fills out product form
3. Proceeds to checkout
4. **Charged tenant's custom retail price** (from TenantProduct)
5. Stripe subscription created with tenant's stripePriceId
6. Revenue flows to tenant's Stripe account

## Stripe Integration

### Price Management
- Each price change creates a **new** Stripe Price (prices are immutable)
- Old stripePriceId is replaced with new one
- Existing subscriptions continue using old price
- New subscriptions use updated price
- Stripe Product remains the same (only Price changes)

### Subscription Renewals
- Subscriptions renew at the price they were created with
- Changing `TenantProduct.price` only affects NEW subscriptions
- Existing subscribers keep their original price

## Profit Tracking

### Real-Time Margin Calculation
```typescript
const profit = retailPrice - wholesaleCost
const margin = (profit / retailPrice) × 100
```

**Example**:
- Wholesale Cost: $150
- Retail Price: $299
- Profit: $149 per unit
- Margin: 49.8%

### Dashboard Integration
This pricing data can be used for:
- Revenue reports
- Profit margin analytics
- Product performance tracking
- Pricing optimization insights

## Security & Validation

### Backend Validation
- ✅ Verifies user owns the clinic
- ✅ Validates tenantProductId belongs to user's clinic
- ✅ Requires positive price (> $0)
- ✅ Type validation (must be number)

### Frontend Validation
- ✅ Requires price > $0
- ✅ Shows real-time profit calculation
- ✅ Confirms save with visual feedback
- ✅ Error handling for failed updates

## Benefits

### For Tenants
1. **Pricing Control**: Set their own retail prices
2. **Transparency**: See exact costs and profit margins
3. **Flexibility**: Different clinics can have different pricing strategies
4. **Easy Updates**: Change prices anytime with instant effect

### For Platform
1. **Scalability**: Each clinic manages their own pricing
2. **Compliance**: Wholesale costs managed centrally
3. **Revenue Share**: Can implement platform fees based on margins
4. **Analytics**: Track pricing strategies across clinics

### For Customers
1. **Competitive Pricing**: Clinics compete on price
2. **Transparent**: Clinics set honest, competitive rates
3. **Simple Checkout**: One price, no hidden fees

## Future Enhancements

### Possible Features
- Bulk price updates across multiple products
- Price change history/audit log
- Automated pricing suggestions based on market data
- Discount codes and promotional pricing
- Volume-based pricing tiers
- Seasonal pricing adjustments
- A/B testing different price points

### Analytics Additions
- Compare pricing across similar clinics
- Conversion rate by price point
- Optimal pricing recommendations
- Competitor price monitoring

## Testing

### Manual Test Flow
1. Enable a product for your clinic
2. Go to product detail page
3. Verify pharmacy cost displays correctly
4. Click "Edit Price"
5. Enter new retail price (e.g., $299)
6. Verify profit calculation shows correctly
7. Click "Save"
8. Verify success message
9. Refresh page - verify price persists
10. Make test purchase - verify charged custom price

### API Test
```bash
curl -X POST http://localhost:3001/tenant-products/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantProductId": "uuid-here",
    "price": 299.99
  }'
```

## Migration Notes

### Existing Data
- Existing `TenantProduct` records may have `price: 0`
- Tenants should update prices before enabling products for customers
- Consider migration script to set default prices from `Product.suggestedRetailPrice` or `Product.price`

### Backward Compatibility
- If `TenantProduct.price` is 0 or null, could fall back to `Product.price`
- Current implementation requires explicit price setting
- Prevents accidental $0 checkouts

