import React, { CSSProperties, useMemo } from "react";

import style from "./bar.module.css";
import { TaskId } from "../../../types";

type BarDisplayProps = {
  barCornerRadius: number;
  isCritical: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  height: number;
  progressWidth: number;
  /* progress start point */
  progressX: number;
  startMoveFullTask: (clientX: number) => void;
  taskId: TaskId;
  width: number;
  x: number;
  y: number;
  customStyle?: CSSProperties;
  showProgress?: boolean;
  progressColor?: string;
};

export const BarDisplay: React.FC<BarDisplayProps> = ({
  taskId,
  barCornerRadius,
  isCritical,
  isSelected,
  hasChildren,
  height,
  progressWidth,
  progressX,
  startMoveFullTask,
  width,
  x,
  y,
  customStyle,
  showProgress = true,
  progressColor,
}) => {
  const processColor = useMemo(() => {
    if (progressColor) {
      return progressColor;
    }

    if (isCritical) {
      if (hasChildren) {
        if (isSelected) {
          return "var(--gantt-group-progress-selected-critical-color)";
        }

        return "var(--gantt-group-progress-critical-color)";
      }

      if (isSelected) {
        return "var(--gantt-bar-progress-selected-critical-color)";
      }

      return "var(--gantt-bar-progress-critical-color)";
    }

    if (hasChildren) {
      if (isSelected) {
        return "var(--gantt-group-progress-selected-color)";
      }

      return "var(--gantt-group-progress-color)";
    }

    if (isSelected) {
      return "var(--gantt-bar-progress-selected-color)";
    }

    return "var(--gantt-bar-progress-color)";
  }, [isSelected, isCritical, hasChildren, progressColor]);

  const barColor = useMemo(() => {
    if (isCritical) {
      if (hasChildren) {
        if (isSelected) {
          return "var(--gantt-group-background-selected-critical-color)";
        }

        return "var(--gantt-group-background-critical-color)";
      }

      if (isSelected) {
        return "var(--gantt-bar-background-selected-critical-color)";
      }

      return "var(--gantt-bar-background-critical-color)";
    }

    if (hasChildren) {
      if (isSelected) {
        return "var(--gantt-group-background-selected-color)";
      }

      return "var(--gantt-group-background-color)";
    }

    if (isSelected) {
      return "var(--gantt-bar-background-selected-color)";
    }

    return "var(--gantt-bar-background-color)";
  }, [isSelected, isCritical, hasChildren]);

  return (
    <g
      style={customStyle}
      data-testid={`task-bar-${taskId}`}
      onMouseDown={e => {
        e.stopPropagation();
        startMoveFullTask(e.clientX);
      }}
      onTouchStart={e => {
        e.stopPropagation();
        const firstTouch = e.touches[0];
        if (firstTouch) {
          startMoveFullTask(firstTouch.clientX);
        }
      }}
    >
      <rect
        x={x}
        width={width}
        y={y}
        height={height}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={barColor}
        className={style.barBackground}
      />
      {showProgress && (
        <rect
          x={progressX}
          width={progressWidth}
          y={y}
          height={height}
          ry={barCornerRadius}
          rx={barCornerRadius}
          fill={processColor}
        />
      )}
    </g>
  );
};
