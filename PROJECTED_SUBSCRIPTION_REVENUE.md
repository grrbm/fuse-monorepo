# Projected Subscription Revenue Feature

## Overview
The "This Month" dashboard view now displays expected revenue from recurring subscriptions for future dates.

## Visual Display

### Chart Lines:
- **Solid Blue Line**: Actual historical revenue (Oct 1 - Oct 16)
- **Dashed Grey Line**: Expected revenue from subscription renewals (Oct 17 - Oct 31)

### Chart Behavior:
- X-axis shows full month in 3-day intervals: Oct 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31
- Y-axis auto-scales to include both historical and projected values
- Grey dashed line continues from where historical data ends
- Tooltip shows "Expected (Subscriptions)" for projected data

## How It Works

### Frontend (`store-analytics.tsx`):
1. Detects "This Month" view
2. Fetches historical data from month start to today
3. Fetches projected revenue for remaining days of month
4. Combines both datasets
5. Aggregates into 3-day intervals
6. Renders two separate lines with different styles

### Backend (`dashboard.service.ts`):
1. `getProjectedRecurringRevenue()` method:
   - Fetches all active subscriptions for the clinic
   - Calculates next billing date for each subscription
   - Projects forward based on 30-day billing cycles
   - Sums expected revenue by date
   - Returns daily projections for remaining month days

### Data Flow:
```
Frontend Request → /dashboard/projected-revenue
                 ↓
Backend: getActiveSubscriptionsForRevenue(clinicId)
                 ↓
Calculate renewal dates within projection window
                 ↓
Return: { date: '2025-10-17', projectedRevenue: 1250.00 }
```

## Subscription Data Used:
- `nextBillingDate`: When subscription will renew
- `amount`: Subscription price
- Assumes 30-day monthly billing cycles
- Only includes active subscriptions

## Benefits:
1. **Revenue Forecasting**: See baseline expected revenue from subscriptions
2. **Trend Analysis**: Compare actual vs expected revenue patterns
3. **Business Planning**: Understand recurring revenue baseline
4. **Customer Retention**: Visualize impact of subscription base

## Notes:
- Only shows for "This Month" view in Revenue mode
- Projections are based on current active subscriptions
- Does not include one-time purchases or new subscriptions
- Grey color indicates projected/estimated data vs actual
- Updates daily as "today" advances through the month

