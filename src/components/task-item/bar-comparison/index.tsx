import React, { useMemo } from "react";
import styles from "./bar-comparison.module.css";
import { TaskComparisonDatesCoordinates, Task } from "../../../types";

interface Props extends Omit<TaskComparisonDatesCoordinates, "x" | "y"> {
  barCornerRadius: number;
  borderHeight: number;
  yOffset: number;
  isWarning?: boolean;
  isPlan?: boolean;
  isCritical?: boolean;
  inProgress?: boolean;
  task?: Task;
  onTooltipTask?: (task: Task | null, element: Element | null) => void;
}

export const BarComparison: React.FC<Props> = props => {
  const {
    yOffset,
    borderHeight,
    barCornerRadius,
    isWarning,
    isPlan,
    isCritical,
    width,
    height,
    inProgress,
    task,
    onTooltipTask,
  } = props;
  const lineHeight = useMemo(() => Math.max(height, 4), [height]);

  const barColor = useMemo(() => {
    if (inProgress) {
      return "var(--gantt-bar-comparison-default-color)";
    }
    if (isPlan) {
      return "var(--gantt-bar-comparison-plan-color)";
    }
    if (isCritical) {
      return "var(--gantt-bar-comparison-critical-color)";
    }

    if (isWarning) {
      return "var(--gantt-bar-comparison-warning-color)";
    }
    return "var(--gantt-bar-comparison-default-color)";
  }, [inProgress, isCritical, isPlan, isWarning]);

  return (
    <g
      onMouseEnter={e => {
        e.stopPropagation();
        onTooltipTask && onTooltipTask(task || null, e.currentTarget);
      }}
      onMouseLeave={e => {
        e.stopPropagation();
        onTooltipTask && onTooltipTask(null, null);
      }}
    >
      <rect
        x={0}
        width={width}
        y={borderHeight + yOffset}
        height={lineHeight}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={barColor}
        className={styles.barComparison}
      />
      <rect
        x={0}
        fill={barColor}
        y={yOffset}
        width={height}
        height={borderHeight + lineHeight - yOffset}
      />
      {!inProgress && (
        <rect
          x={width - height}
          fill={barColor}
          y={yOffset}
          width={height}
          height={borderHeight + lineHeight - yOffset}
        />
      )}
    </g>
  );
};
