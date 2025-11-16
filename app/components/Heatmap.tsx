// Rebuilt heatmap: 4-level neon palette; gridInner owns height; month labels inside gridInner; COLUMNS = WEEKS
import React from 'react';
import styles from './Heatmap.module.css';

type HeatmapData = Array<{ date: string; value?: number }>;

interface HeatmapProps {
  data?: HeatmapData;
}

// --- UTC Date Helpers ---
const getWeekdayUTC = (date: Date): number => {
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1; // Monday: 0, Sunday: 6
};

const getWeekIndexUTC = (startOfYear: Date, date: Date): number => {
  const firstDayWeekday = getWeekdayUTC(startOfYear);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.floor((dayOfYear + firstDayWeekday) / 7);
};

/**
 * Generates a deterministic, pseudo-random bucket (0-3) from a date string.
 */
const hashDateToBucket = (isoDate: string): number => {
  let hash = 0;
  for (let i = 0; i < isoDate.length; i++) {
    const char = isoDate.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return (hash % 4 + 4) % 4; // Modulo to get a value in the 0-3 range
};

const getColorForValue = (value: number) => {
    const level = Math.max(0, Math.min(3, Math.round(value)));
    if (level === 1) return 'var(--level-1, #4CEEFF)';
    if (level === 2) return 'var(--level-2, #FF4CE6)';
    if (level === 3) return 'var(--level-3, #FFB84C)';
    return 'var(--level-0, #1A2332)'; // for level 0
};

const Heatmap = ({ data }: HeatmapProps) => {
  const year = new Date().getUTCFullYear();
  const startDate = new Date(Date.UTC(year, 0, 1));
  const endDate = new Date(Date.UTC(year, 11, 31));

  const dataMap = React.useMemo(() => {
    const map = new Map<string, number>();
    const allDays = [];
    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        allDays.push(d.toISOString().split('T')[0]);
    }

    const providedDataMap = data ? new Map(data.map(item => [item.date, item.value])) : null;

    allDays.forEach(isoDate => {
        let value: number | undefined;
        if (providedDataMap && providedDataMap.has(isoDate)) {
            value = providedDataMap.get(isoDate);
        }

        if (value !== undefined) {
            map.set(isoDate, Math.max(0, Math.min(3, value)));
        } else {
            // Per design: if value is absent for a date or no data prop, use hash
            map.set(isoDate, hashDateToBucket(isoDate));
        }
    });
    
    return map;
  }, [data, startDate, endDate]);

  const days = React.useMemo(() => {
    const dayArray = [];
    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      dayArray.push({
        iso: d.toISOString().split('T')[0],
        date: new Date(d),
      });
    }
    return dayArray;
  }, [startDate, endDate]);

  const monthLabels = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const monthDate = new Date(Date.UTC(year, i, 1));
      const weekIndex = getWeekIndexUTC(startDate, monthDate);
      const label = monthDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
      
      const style: React.CSSProperties = {
        left: `calc((var(--cell-size) + var(--gap)) * ${weekIndex} + (var(--cell-size) / 2))`,
        transform: 'translateX(-50%)',
      };

      return { label, style };
    });
  }, [year, startDate]);

  return (
    <div className={styles.container}>
      <div className={styles.gridInner}>
        <div className={styles.monthsContainer}>
          {monthLabels.map(({ label, style }) => (
            <div key={label} className={styles.monthLabel} style={style}>
              {label}
            </div>
          ))}
        </div>
        <div className={styles.heatmapGrid}>
          {days.map((day, index) => {
            const weekIndex = getWeekIndexUTC(startDate, day.date);
            const weekday = getWeekdayUTC(day.date);
            const value = dataMap.get(day.iso) ?? 0;
            
            const cellStyle: React.CSSProperties = {
              gridColumnStart: weekIndex + 1,
              gridRowStart: weekday + 1,
              backgroundColor: getColorForValue(value),
            };

            return <div key={index} className={styles.cell} style={cellStyle} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;

/*
--- Test Checklist ---
1. [ ] No hydration warnings in console after SSR.
2. [ ] No vertical scrollbar appears inside the heatmap card at desktop and mobile widths.
3. [ ] Month labels aligned and separated from cells by --label-gap; cells use 4-level neon palette.
*/