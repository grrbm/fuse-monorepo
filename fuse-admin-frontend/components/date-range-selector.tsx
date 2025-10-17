import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

/**
 * DateRangeSelector Component
 * 
 * Presets:
 * - Last 7 Days: 7 days ago to today
 * - Last Month: ALWAYS shows complete calendar month (1st to last day of previous month)
 *               Example: If today is Oct 16, shows Sept 1 - Sept 30
 *               Automatically updates when a new month starts
 * - This Month: ALWAYS shows complete calendar month (1st to last day of current month)
 *               Example: If today is Oct 16, shows Oct 1 - Oct 31 (with future days at $0)
 * - Custom: User-selected date range
 */

export type DatePreset = '7days' | 'lastmonth' | 'month' | 'custom';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (startDate: Date, endDate: Date) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateChange
}) => {
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activePreset, setActivePreset] = useState<DatePreset>('month');
  const [customStart, setCustomStart] = useState<string>(
    formatDateForInput(startDate)
  );
  const [customEnd, setCustomEnd] = useState<string>(
    formatDateForInput(endDate)
  );

  // Sync input fields when props change
  useEffect(() => {
    setCustomStart(formatDateForInput(startDate));
    setCustomEnd(formatDateForInput(endDate));
  }, [startDate, endDate]);

  const handlePresetClick = (preset: DatePreset) => {
    setActivePreset(preset);
    const now = new Date();
    
    let newStart: Date;
    let newEnd: Date;

    switch (preset) {
      case '7days':
        newStart = new Date(now);
        newStart.setDate(now.getDate() - 7);
        newStart.setHours(0, 0, 0, 0);
        newEnd = new Date(now);
        newEnd.setHours(23, 59, 59, 999);
        break;
      case 'lastmonth':
        // Previous month: Always start on 1st and end on last day of previous month
        // This ensures we always show the COMPLETE calendar month
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // First day of previous month (Sept 1)
        newStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
        
        // Last day of previous month (Sept 30)
        newEnd = new Date(year, month, 0, 23, 59, 59, 999);
        break;
      case 'month':
        // Current month: 1st to last day of current month (full month view)
        newStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        // Last day of current month
        newEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default:
        return;
    }

    // Update the custom date inputs to reflect the preset dates
    setCustomStart(formatDateForInput(newStart));
    setCustomEnd(formatDateForInput(newEnd));

    onDateChange(newStart, newEnd);
  };

  const handleCustomDateChange = () => {
    if (customStart && customEnd) {
      // Parse dates from YYYY-MM-DD format
      const [startYear, startMonth, startDay] = customStart.split('-').map(Number);
      const [endYear, endMonth, endDay] = customEnd.split('-').map(Number);
      
      // Create dates with explicit time to avoid timezone issues
      const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
      
      if (start <= end) {
        setActivePreset('custom');
        onDateChange(start, end);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handlePresetClick('7days')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activePreset === '7days'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => handlePresetClick('lastmonth')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activePreset === 'lastmonth'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => handlePresetClick('month')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activePreset === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This Month
        </button>
      </div>

      {/* Custom Date Range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
          onBlur={handleCustomDateChange}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
          onBlur={handleCustomDateChange}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {activePreset === 'custom' && (
          <button
            onClick={handleCustomDateChange}
            className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;

