import React, { memo, useMemo } from "react";
import { getDatesDiff } from "../../helpers/get-dates-diff";
import { Distances, ViewMode } from "../../types";
import styles from "./gantt-today.module.css";
import { getDaysInMonth } from "../../helpers/date-helper";

export type GanttTodayProps = {
  additionalLeftSpace: number;
  distances: Distances;
  ganttFullHeight: number;
  isUnknownDates: boolean;
  startDate: Date;
  rtl: boolean;
  viewMode: ViewMode;
  showTodayLine?: boolean;
  showDataDateLine?: boolean;
  dataDate?: Date | null;
  todayColor?: string | null;
  dataDateColor?: string | null;
  todayLabel?: string;
  dataDateLabel?: string;
};

const GanttTodayInner: React.FC<GanttTodayProps> = ({
  additionalLeftSpace,
  distances: { columnWidth },
  ganttFullHeight,
  isUnknownDates,
  rtl,
  startDate,
  viewMode,
  showTodayLine = true,
  showDataDateLine = false,
  dataDate = null,
  todayColor = null,
  dataDateColor = null,
  todayLabel = "Today",
  dataDateLabel = "Data Date",
}) => {
  const todayElement = useMemo(() => {
    if (isUnknownDates || !showTodayLine) {
      return null;
    }

    const today = new Date();
    const todayIndex = getDatesDiff(today, startDate, viewMode);

    const extraMultiplier = () => {
      switch (viewMode) {
        case ViewMode.Week: {
          const percent = today.getDay() / 7;
          return 1 + percent * 0.2;
        }
        case ViewMode.Month: {
          const dayInMonth = today.getDate();
          const maxDaysInMonth = getDaysInMonth(
            today.getMonth(),
            today.getFullYear()
          );
          const percent = dayInMonth / maxDaysInMonth;
          return 1 + percent * 0.5;
        }
        case ViewMode.Year: {
          const percent = today.getMonth() / 12;
          return 1 + percent * 0.5;
        }
        default:
          return 1;
      }
    };

    const tickX = todayIndex * columnWidth * extraMultiplier();
    const x = rtl ? tickX + columnWidth : tickX;

    const color = todayColor || "var(--gantt-calendar-today-color)";

    return (
      <>
        <rect
          x={additionalLeftSpace + x}
          y={0}
          width={2}
          height={ganttFullHeight}
          fill={color}
        />
        <circle
          className={styles.ganttTodayCircle}
          cx={x + 1}
          cy={6}
          r={6}
          fill={color}
        />
        <text
          x={additionalLeftSpace + x + 8}
          y={10}
          fill={color}
          fontSize={12}
          fontWeight={600}
        >
          {todayLabel}
        </text>
      </>
    );
  }, [
    additionalLeftSpace,
    columnWidth,
    ganttFullHeight,
    isUnknownDates,
    rtl,
    startDate,
    viewMode,
    showTodayLine,
    todayColor,
    todayLabel,
  ]);
  const dataDateElement = useMemo(() => {
    if (!showDataDateLine || !dataDate) {
      return null;
    }

    const dataIndex = getDatesDiff(dataDate, startDate, viewMode);

    const extraMultiplier = () => {
      switch (viewMode) {
        case ViewMode.Week: {
          const percent = dataDate.getDay() / 7;
          return 1 + percent * 0.2;
        }
        case ViewMode.Month: {
          const dayInMonth = dataDate.getDate();
          const maxDaysInMonth = getDaysInMonth(
            dataDate.getMonth(),
            dataDate.getFullYear()
          );
          const percent = dayInMonth / maxDaysInMonth;
          return 1 + percent * 0.5;
        }
        case ViewMode.Year: {
          const percent = dataDate.getMonth() / 12;
          return 1 + percent * 0.5;
        }
        default:
          return 1;
      }
    };

    const tickX = dataIndex * columnWidth * extraMultiplier();
    const x = rtl ? tickX + columnWidth : tickX;

    const color = dataDateColor || "var(--gantt-calendar-today-color)";

    return (
      <>
        <rect
          x={additionalLeftSpace + x}
          y={0}
          width={2}
          height={ganttFullHeight}
          fill={color}
          opacity={0.9}
        />
        <circle
          className={styles.ganttTodayCircle}
          cx={x + 1}
          cy={6}
          r={6}
          fill={color}
        />
        <text
          x={additionalLeftSpace + x + 8}
          y={10}
          fill={color}
          fontSize={12}
          fontWeight={600}
        >
          {dataDateLabel || "Data Date"}
        </text>
      </>
    );
  }, [
    additionalLeftSpace,
    columnWidth,
    ganttFullHeight,
    rtl,
    startDate,
    viewMode,
    showDataDateLine,
    dataDate,
    dataDateColor,
    dataDateLabel,
  ]);

  return (
    <g className="today">
      {dataDateElement}
      {todayElement}
    </g>
  );
};

export const GanttToday = memo(GanttTodayInner);
