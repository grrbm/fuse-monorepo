# Month View Chart Layout

## Clean X-Axis with Daily Data

All month views ("Last Month" and "This Month") now display **all daily data points** with a **clean x-axis** showing labels every 3 days.

## Data vs Labels Strategy

### Data Points
- **All days included**: Every single day of the month is a data point (28-31 points)
- **Hover to see any day**: Hover over the line to see data for ANY day
- **No aggregation**: Each point represents ONE day's revenue/orders

### X-Axis Labels
- **Every 3rd day + first + last**: Shown to keep x-axis clean
- **10-11 labels total** depending on month length
- **Consistent positioning** across all months

## Examples by Month Length

### 31-Day Month (January, March, May, July, August, October, December)
```
X-axis Labels: Jan 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31
Data Points:   31 individual days (Jan 1 - Jan 31)
Hover:         Any day from Jan 1 to Jan 31 shows that day's data
```
**Result**: 11 x-axis labels, 31 data points to hover over

### 30-Day Month (April, June, September, November)
```
X-axis Labels: Apr 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 30
Data Points:   30 individual days (Apr 1 - Apr 30)
Hover:         Any day from Apr 1 to Apr 30 shows that day's data
```
**Result**: 11 x-axis labels, 30 data points to hover over

### 29-Day Month (February - Leap Year)
```
X-axis Labels: Feb 1, 4, 7, 10, 13, 16, 19, 22, 25, 28
Data Points:   29 individual days (Feb 1 - Feb 29)
Hover:         Any day from Feb 1 to Feb 29 shows that day's data
```
**Result**: 10 x-axis labels, 29 data points to hover over

### 28-Day Month (February - Regular Year)
```
X-axis Labels: Feb 1, 4, 7, 10, 13, 16, 19, 22, 25, 28
Data Points:   28 individual days (Feb 1 - Feb 28)
Hover:         Any day from Feb 1 to Feb 28 shows that day's data
```
**Result**: 10 x-axis labels, 28 data points to hover over

## Benefits

### 1. **Visual Consistency**
- Same x-axis label structure every month
- Easy to compare month-to-month trends
- Predictable label spacing

### 2. **Clean Presentation**
- Clean line with no dots
- 10-11 x-axis labels (never overcrowded)
- Professional, minimal appearance

### 3. **Granular Data Access**
- Hover over ANY day to see exact daily data
- No aggregation - every day is accessible
- Precise daily insights on demand

### 4. **No Data Loss**
- All days preserved as individual data points
- Nothing hidden or combined
- Complete daily breakdown available

## Implementation Details

### Data Structure
```typescript
// All days kept as individual data points
chartData = [
  { date: '2025-10-01', revenue: 1250, orders: 12 },
  { date: '2025-10-02', revenue: 890, orders: 8 },
  { date: '2025-10-03', revenue: 1430, orders: 15 },
  // ... every single day of the month
]
```

### X-Axis Label Strategy
```typescript
// Show labels every 3rd day + first + last
Labels at indices: 0, 3, 6, 9, 12, 15, 18, 21, 24, 27, (last)
Example for Oct: Oct 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31
```

### Hover Behavior
- Hover over any point on the line
- Tooltip shows exact date and value for that specific day
- Large dot appears on hover (6px with white stroke)
- Works even for days not labeled on x-axis

## When This Applies

✅ **Uses clean x-axis label strategy:**
- "Last Month" button (any previous calendar month)
- "This Month" button (current calendar month)  
- Any custom range that is a complete calendar month

✅ **Shows all days on x-axis:**
- "Last 7 Days" - all 7 labels, all 7 data points
- Any date range ≤ 14 days - all labels shown

## Visual Comparison

### Before (Aggregated)
```
Hover on "Oct 4": Shows total for Oct 4-6 combined ($3,570)
Problem: Can't see individual day performance
```

### After (Daily Data)
```
Hover on Oct 4: Shows Oct 4 only ($1,250)
Hover on Oct 5: Shows Oct 5 only ($890)
Hover on Oct 6: Shows Oct 6 only ($1,430)
Benefit: See exact daily performance
```

## User Experience

**What users see:**
- Clean line graph without dots
- X-axis labels every 3rd day for months
- Smooth, professional appearance

**What users can do:**
- Hover anywhere on the line
- See data for that specific day
- Explore daily trends interactively

**"Hover to see daily data"** message in chart subtitle guides users to interact

