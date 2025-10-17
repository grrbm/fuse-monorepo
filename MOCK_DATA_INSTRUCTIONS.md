# Mock Dashboard Data Instructions

## 🎯 Current Status
Mock data is **ENABLED** and working automatically. Your dashboard will show realistic sample data immediately.

## 📊 What You'll See
- **Revenue Metrics**: $45,890.50 total revenue with 127 orders
- **Chart Data**: 8 days of revenue trends
- **Product Breakdown**: 5 sample products with profit margins
- **Recent Orders**: 5 recent customer orders
- **Trends**: Green/red percentage changes showing growth

## 🔧 How to Disable Mock Data (once you have real orders)

### Option 1: Environment Variable (Recommended)
Add to `.env.local` in the root:
```bash
USE_MOCK_DASHBOARD_DATA=false
```

### Option 2: Delete Mock Data Files
Simply delete these files:
```bash
rm patient-api/src/services/mockDashboardData.ts
```

Then remove the imports from `patient-api/src/services/dashboard.service.ts`

## 🧪 Testing Both Mock and Real Data

1. **With Mock Data (default)**: Just use the dashboard - it works immediately
2. **With Real Data**: Set `USE_MOCK_DASHBOARD_DATA=false` in `.env.local`

The system will automatically fall back to mock data if:
- Mock data is enabled via environment variable
- No real orders exist in the database

## 📝 Mock Data Details

### Sample Customers
- Sarah Johnson
- Michael Chen  
- Emily Rodriguez
- David Kim
- Jessica Martinez

### Sample Products
- Semaglutide 2.5mg
- Tirzepatide 5mg
- Minoxidil Solution
- Tadalafil 20mg
- Tretinoin Cream

### Time Range
Mock orders are distributed over the last 8 days with realistic timestamps (15 mins ago, 45 mins ago, 2 hours ago, etc.)

## 🚀 Next Steps

1. **Use the dashboard now** - Mock data is ready
2. **When you get real orders** - They'll automatically replace mock data
3. **To fully switch** - Set `USE_MOCK_DASHBOARD_DATA=false`

The mock data will help you:
- See the complete UI functionality
- Test date range filtering
- Demonstrate the dashboard to stakeholders
- Develop frontend features without waiting for real data

