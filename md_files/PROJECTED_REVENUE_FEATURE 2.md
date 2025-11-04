# Projected Recurring Revenue Feature

## ✅ Feature Complete

The analytics chart now shows **expected subscription renewal events for the remaining days of the current month** (only in "This Month" view).

## 🎯 What Was Added

### Backend Implementation

#### 1. **Projected Revenue Database Query** (`patient-api/src/services/db/dashboard.ts`)
- Added `getActiveSubscriptionsForRevenue()` function
- Fetches active subscriptions with next billing dates
- Returns subscription data with billing intervals and amounts

#### 2. **Projection Service Method** (`patient-api/src/services/dashboard.service.ts`)
- `getProjectedRecurringRevenue()` - Calculates expected renewal revenue for remaining days
- Maps subscription renewal dates to specific days (shows revenue spikes)
- Tracks when each subscription is expected to renew based on billing cycle
- Shows $0 on days with no renewals, subscription amount on renewal days
- Dynamically handles any number of projection days (typically remaining days of month)
- Includes mock data with 10 subscriptions distributed throughout the month

#### 3. **API Endpoint** (`patient-api/src/main.ts`)
- `GET /dashboard/projected-revenue` endpoint
- Query params: `clinicId`, `endDate`, `daysToProject` (required)
- Returns: `[{ date, projectedRevenue }]`
- Secured with JWT authentication and clinic access validation

### Frontend Implementation

#### 4. **Enhanced Store Analytics Chart** (`fuse-admin-frontend/components/store-analytics.tsx`)
- **Only shows projections in "This Month" view**
- Detects when viewing current month (start of month to end of month)
- **Automatically uses daily interval for full calendar months** (Last Month, This Month)
- Fetches historical data from month start to today
- Fetches projected renewals from tomorrow to end of month
- Displays projected renewal events as a **green dashed line**
- Only shows projections in "Revenue" view mode
- Updated tooltip to distinguish between actual and projected revenue
- Dynamic description showing remaining days: "shows expected subscription renewals (remaining X days of month)"
- Shows "Daily - Full Month" indicator when viewing complete calendar months

#### 5. **Date Range Selector** (`fuse-admin-frontend/components/date-range-selector.tsx`)
- Three presets: "Last 7 Days", "Last Month", "This Month"
- **Last 7 Days**: Shows only historical data (no projections)
- **Last Month**: Shows complete previous month (1st to last day) - historical data only (no projections)
- **This Month**: Shows historical + projected renewal data
- Custom date picker for flexible date selection

## 📊 How It Works

### Calculation Logic

1. **Historical Data**: Shows actual revenue from paid orders (solid blue line)
2. **"This Month" Detection**: Checks if date range is from 1st of current month to end of month
3. **Days Calculation**: Calculates remaining days from today to end of current month
4. **Subscription Tracking**: Fetches all active subscriptions with their next billing dates
5. **Renewal Mapping**: For each subscription, calculates when it will renew in remaining days
6. **Revenue Spikes**: Shows subscription amount on its renewal date (e.g., $450 on day 15, $380 on day 21)
7. **Zero Days**: Days without renewals show $0 (creates realistic spike pattern)
8. **Multiple Renewals**: If multiple subscriptions renew on the same day, amounts are summed

### Visual Design

- **Historical Revenue**: Solid blue line with dots (actual paid orders)
- **Projected Renewals**: Dashed green line (#10b981) showing subscription renewal events
- **Spike Pattern**: Green line shows spikes on renewal dates, $0 on non-renewal days
- **Separation**: Clear visual distinction between actual and expected renewals
- **Tooltip**: Shows "Projected Revenue" label with renewal amount on hover

## 🚀 How to Use

### View Projected Revenue

1. Navigate to the dashboard at http://localhost:3002
2. **Select "This Month" date range** (required for projections to show)
3. The analytics chart will show:
   - **Historical period**: From 1st of month to today (solid blue line)
   - **Projection period**: From tomorrow to end of month showing subscription renewal dates (dashed green line with spikes)
4. Hover over the green spikes to see which subscriptions are renewing and when
5. Toggle to "Orders" view to hide projections (only applies to revenue)
6. Projections **won't show** in "Last 7 Days", "Last Month", or custom date ranges

### Date Range Behavior

- **Last 7 Days**: Historical data only (no projections)
- **Last Month**: Complete previous month (1st to last day) - Historical data only (no projections)
- **This Month**: Historical data (month start to today) + Projected renewals (tomorrow to month end)
- **Custom Range**: Historical data only (no projections)

### Examples

**"Last Month" (viewing on October 16th):**
- Shows: September 1-30 (complete previous month, historical only)

**"This Month" (viewing on October 16th):**
- Historical: October 1-16 (actual orders)
- Projected: October 17-31 (expected subscription renewals)

**"Last 7 Days" (viewing on October 16th):**
- Shows: October 9-16 (historical only)

## 📝 Mock Data Included

The feature includes mock subscription renewal data for immediate testing:
- **10 mock subscriptions** with staggered billing dates throughout the month:
  - $450 subscription renews on day 3
  - $380 subscription renews on day 5
  - $520 subscription renews on day 7
  - $290 subscription renews on day 10
  - $410 subscription renews on day 12
  - $350 subscription renews on day 15
  - $480 subscription renews on day 18
  - $320 subscription renews on day 21
  - $390 subscription renews on day 25
  - $440 subscription renews on day 28
- Shows realistic spike pattern distributed across the entire month
- Automatically enabled when no real subscription data exists

**To use real data**: Set `USE_MOCK_DASHBOARD_DATA=false` in `.env.local`

## 🔧 Technical Details

### API Request Example
```javascript
// If today is October 16th, request projections for remaining 15 days of October
GET /dashboard/projected-revenue?clinicId=123&endDate=2024-10-16T00:00:00Z&daysToProject=15
```

### Response Format
```json
{
  "success": true,
  "data": [
    { "date": "2024-10-17", "projectedRevenue": 0 },
    { "date": "2024-10-18", "projectedRevenue": 480.00 },  // Subscription renewal on day 18
    { "date": "2024-10-19", "projectedRevenue": 0 },
    { "date": "2024-10-20", "projectedRevenue": 0 },
    { "date": "2024-10-21", "projectedRevenue": 320.00 },  // Subscription renewal on day 21
    { "date": "2024-10-22", "projectedRevenue": 0 },
    { "date": "2024-10-23", "projectedRevenue": 0 },
    { "date": "2024-10-24", "projectedRevenue": 0 },
    { "date": "2024-10-25", "projectedRevenue": 390.00 },  // Subscription renewal on day 25
    { "date": "2024-10-26", "projectedRevenue": 0 },
    { "date": "2024-10-27", "projectedRevenue": 0 },
    { "date": "2024-10-28", "projectedRevenue": 440.00 },  // Subscription renewal on day 28
    { "date": "2024-10-29", "projectedRevenue": 0 },
    { "date": "2024-10-30", "projectedRevenue": 0 },
    { "date": "2024-10-31", "projectedRevenue": 0 }
  ]
}
```

### Chart Data Structure
```typescript
interface ChartDataPoint {
  date: string;
  revenue: number;              // Historical
  orders: number;               // Historical
  projectedRevenue?: number;    // Forecast
  isProjection?: boolean;       // Flag
}
```

## 💡 Business Value

### Benefits
- **Renewal Visibility**: See exactly when subscriptions are expected to renew
- **Cash Flow Planning**: Know which days will have revenue from renewals
- **Subscription Tracking**: Monitor active subscriptions and their billing cycles
- **Revenue Spikes**: Anticipate high-revenue days from multiple renewals
- **Business Intelligence**: Understand subscription renewal patterns over 14 days

### Use Cases
- Identify days with expected subscription renewals
- Plan for revenue fluctuations based on renewal dates
- Track subscription billing cycles at a glance
- Monitor subscription health and renewal timing
- Forecast short-term cash flow from recurring revenue

## 🔄 Future Enhancements

### Recommended Improvements
1. **Actual Subscription Model**: Replace estimation with real subscription data
2. **Multiple Date Ranges**: Show projections in 7-day and custom ranges
3. **Configurable Period**: Let users choose 7, 14, or 30 day projections
4. **Scenario Planning**: Show best/worst case scenarios
5. **Prescription Integration**: Link to actual prescription expiry dates
6. **Renewal Predictions**: Use ML to predict renewal probability

### Current Limitations
- **Only shows in 30-day view** (not visible in 7-day or custom ranges)
- Uses order-based subscription estimation (not actual subscription records with billing dates)
- Fixed 14-day projection period
- Assumes 30-day billing cycles for all subscriptions
- Mock data approximates next billing date from subscription creation

## 🎉 Feature Complete!

The projected revenue feature is fully functional and ready to use. The chart shows **subscription renewal events** for the next 14 days **when viewing the 30-day range**.

### Key Points
- ✅ Shows subscription renewals as revenue spikes on specific days
- ✅ Only displays in 30-day view (Last 30 Days preset)
- ✅ Maps each subscription to its next billing date
- ✅ Shows $0 on days without renewals, subscription amount on renewal days
- ✅ Sums multiple subscriptions that renew on the same day
- ✅ Includes mock data with 5 staggered renewal dates for testing

**Note**: For production use, implement actual subscription tracking with real billing dates and cycles stored in the database for accurate renewal projections.

