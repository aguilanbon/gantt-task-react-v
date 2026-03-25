import React, { memo, useCallback, useMemo } from "react";

import { Distances, RelationMoveTarget, Task } from "../../types";
import { generateTrianglePoints } from "../../helpers/generate-triangle-points";

import styles from "./arrow.module.css";

type ArrowProps = {
  distances: Distances;
  taskFrom: Task;
  targetFrom: RelationMoveTarget;
  fromX1: number;
  fromX2: number;
  fromY: number;
  taskTo: Task;
  targetTo: RelationMoveTarget;
  toX1: number;
  toX2: number;
  toY: number;
  fullRowHeight: number;
  taskHeight: number;
  isCritical: boolean;
  rtl: boolean;
  onArrowDoubleClick?: (taskFrom: Task, taskTo: Task) => void;
  onArrowClick?: (taskFrom: Task, taskTo: Task) => void;
  isActive?: boolean;
  fromConnectionIndex?: number;
  fromTotalConnections?: number;
  toConnectionIndex?: number;
  toTotalConnections?: number;
};

const ArrowInner: React.FC<ArrowProps> = props => {
  const {
    distances: { arrowIndent },
    taskFrom,
    targetFrom,
    fromX1,
    fromX2,
    fromY,
    taskTo,
    targetTo,
    toX1,
    toX2,
    toY,
    fullRowHeight,
    taskHeight,
    isCritical,
    rtl,
    onArrowDoubleClick = undefined,
    onArrowClick = undefined,
    isActive = false,
    fromConnectionIndex = 0,
    fromTotalConnections = 1,
    toConnectionIndex = 0,
    toTotalConnections = 1,
  } = props;
  const indexFrom = useMemo(
    () => Math.floor(fromY / fullRowHeight),
    [fromY, fullRowHeight]
  );
  const indexTo = useMemo(
    () => Math.floor(toY / fullRowHeight),
    [toY, fullRowHeight]
  );

  const onDoubleClick = useCallback(() => {
    if (onArrowDoubleClick) {
      onArrowDoubleClick(taskFrom, taskTo);
    }
  }, [taskFrom, taskTo, onArrowDoubleClick]);

  const handleClick = useCallback(() => {
    if (onArrowClick) {
      onArrowClick(taskFrom, taskTo);
    }
  }, [taskFrom, taskTo, onArrowClick]);

  const [path, trianglePoints] = useMemo(
    () =>
      drownPathAndTriangle(
        indexFrom,
        fromX1,
        fromX2,
        fromY,
        (targetFrom === "startOfTask") !== rtl,
        indexTo,
        toX1,
        toX2,
        toY,
        (targetTo === "startOfTask") !== rtl,
        fullRowHeight,
        taskHeight,
        arrowIndent,
        fromConnectionIndex,
        fromTotalConnections,
        toConnectionIndex,
        toTotalConnections
      ),
    [
      indexFrom,
      fromX1,
      fromX2,
      fromY,
      targetFrom,
      indexTo,
      toX1,
      toX2,
      toY,
      targetTo,
      rtl,
      fullRowHeight,
      taskHeight,
      arrowIndent,
      fromConnectionIndex,
      fromTotalConnections,
      toConnectionIndex,
      toTotalConnections,
    ]
  );

  const color = useMemo(() => {
    if (isCritical) {
      return "var(--gantt-arrow-critical-color)";
    }

    return "var(--gantt-arrow-color)";
  }, [isCritical]);

  return (
    <g fill={color} stroke={color}>
      <g
        data-testid={`task-arrow-${targetFrom}-${taskFrom.name}-${targetTo}-${taskTo.name}`}
        className={`arrow ${styles.arrow_clickable}${isActive ? ` ${styles.arrow_active}` : ""}`}
        onDoubleClick={onDoubleClick}
        onClick={handleClick}
      >
        {(onArrowDoubleClick || onArrowClick) && (
          <path d={path} className={styles.clickZone} />
        )}

        <path className={styles.mainPath} d={path} />

        <polygon className={"polygon"} points={trianglePoints} />
      </g>
    </g>
  );
};

export const Arrow = memo(ArrowInner);

/**
 * Build an SVG path string with rounded corners from a list of orthogonal waypoints.
 */
const roundedPath = (points: [number, number][], radius: number): string => {
  if (points.length < 2) return "";

  let d = `M ${points[0]![0]} ${points[0]![1]}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;

    const dx1 = prev[0] - curr[0];
    const dy1 = prev[1] - curr[1];
    const len1 = Math.abs(dx1) + Math.abs(dy1);

    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];
    const len2 = Math.abs(dx2) + Math.abs(dy2);

    const r = Math.min(radius, len1 / 2, len2 / 2);

    if (r <= 0 || len1 === 0 || len2 === 0) {
      d += ` L ${curr[0]} ${curr[1]}`;
      continue;
    }

    const ux1 = dx1 === 0 ? 0 : dx1 / Math.abs(dx1);
    const uy1 = dy1 === 0 ? 0 : dy1 / Math.abs(dy1);
    const ux2 = dx2 === 0 ? 0 : dx2 / Math.abs(dx2);
    const uy2 = dy2 === 0 ? 0 : dy2 / Math.abs(dy2);

    d += ` L ${curr[0] + ux1 * r} ${curr[1] + uy1 * r}`;
    d += ` Q ${curr[0]} ${curr[1]} ${curr[0] + ux2 * r} ${curr[1] + uy2 * r}`;
  }

  const last = points[points.length - 1]!;
  d += ` L ${last[0]} ${last[1]}`;

  return d;
};

const ARROW_CORNER_RADIUS = 5;

/**
 * Compute a normalized position (0..1) for distributing connections evenly.
 * For a single connection → 0.5 (center).
 * For multiple → evenly spaced from 0 to 1.
 */
const connectionPosition = (index: number, total: number): number => {
  if (total <= 1) return 0.5;
  return index / (total - 1);
};

const drownPathAndTriangle = (
  indexForm: number,
  fromX1: number,
  fromX2: number,
  fromY: number,
  isTaskFromLeftSide: boolean,
  indexTo: number,
  toX1: number,
  toX2: number,
  toY: number,
  isTaskToLeftSide: boolean,
  fullRowHeight: number,
  taskHeight: number,
  arrowIndent: number,
  fromConnectionIndex: number,
  fromTotalConnections: number,
  toConnectionIndex: number,
  toTotalConnections: number
) => {
  const isDownDirected = indexTo > indexForm;
  const isSameRow = indexForm === indexTo;

  // --- Vertical distribution on task bars ---
  // Spread connection points across 80% of the task height
  const vertSpreadRange = taskHeight * 0.8;
  const fromPos = connectionPosition(fromConnectionIndex, fromTotalConnections);
  const toPos = connectionPosition(toConnectionIndex, toTotalConnections);
  const fromVertOffset = (fromPos - 0.5) * vertSpreadRange;
  const toVertOffset = (toPos - 0.5) * vertSpreadRange;

  const startX = isTaskFromLeftSide ? fromX1 : fromX2;
  const startY = fromY + taskHeight / 2 + fromVertOffset;
  const endX = isTaskToLeftSide ? toX1 : toX2;
  const endY = toY + taskHeight / 2 + toVertOffset;

  // --- Horizontal indent: stagger each connection by 8px ---
  const fromIndent = arrowIndent + fromConnectionIndex * 8;
  const toIndent = arrowIndent + toConnectionIndex * 8;

  const taskFromEndPositionX = isTaskFromLeftSide
    ? fromX1 - fromIndent
    : fromX2 + fromIndent;

  const taskToEndPositionX = isTaskToLeftSide
    ? toX1 - toIndent
    : toX2 + toIndent;

  // --- Corridor: distribute horizontal docking lanes across the row gap ---
  // Use the combined connection index to assign unique corridor lanes
  const totalArrowsInCorridor = Math.max(
    fromTotalConnections,
    toTotalConnections,
    1
  );
  const corridorIndex =
    (fromConnectionIndex + toConnectionIndex) %
    Math.max(totalArrowsInCorridor, 1);
  const corridorPos = connectionPosition(corridorIndex, totalArrowsInCorridor);
  // Use 70% of the row gap for corridor lanes, centered
  const corridorRange = fullRowHeight * 0.7;
  const corridorBase = isDownDirected
    ? (indexForm + 1) * fullRowHeight - corridorRange * 0.15
    : indexForm * fullRowHeight + corridorRange * 0.15;
  const corridorOffset = (corridorPos - 0.5) * corridorRange;

  let horizontalDockingY: number;
  if (isSameRow) {
    // Same row: route above or below the task bar
    horizontalDockingY = isTaskFromLeftSide
      ? fromY + taskHeight + 6 + fromConnectionIndex * 4
      : fromY - 6 - fromConnectionIndex * 4;
  } else {
    horizontalDockingY = corridorBase + corridorOffset;
  }

  // --- Build path waypoints ---
  const rawWaypoints: [number, number][] = [
    [startX, startY],
    [taskFromEndPositionX, startY],
    [taskFromEndPositionX, horizontalDockingY],
    [taskToEndPositionX, horizontalDockingY],
    [taskToEndPositionX, endY],
    [endX, endY],
  ];

  // Filter out near-duplicate consecutive points
  const waypoints: [number, number][] = [rawWaypoints[0]!];
  for (let i = 1; i < rawWaypoints.length; i++) {
    const prev = waypoints[waypoints.length - 1]!;
    const curr = rawWaypoints[i]!;
    if (
      Math.abs(curr[0] - prev[0]) > 0.5 ||
      Math.abs(curr[1] - prev[1]) > 0.5
    ) {
      waypoints.push(curr);
    }
  }

  const path = roundedPath(waypoints, ARROW_CORNER_RADIUS);

  const trianglePoints = isTaskToLeftSide
    ? generateTrianglePoints(toX1, endY, 5, false)
    : generateTrianglePoints(toX2, endY, 5, true);

  return [path, trianglePoints];
};
