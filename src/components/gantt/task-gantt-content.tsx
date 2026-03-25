import React, { memo, MouseEvent, ReactNode, useMemo } from "react";

import {
  ChildByLevelMap,
  CriticalPaths,
  DependencyMap,
  DependentMap,
  Distances,
  GanttRelationEvent,
  GanttTaskBarActions,
  GlobalRowIndexToTaskMap,
  RelationKind,
  RelationMoveTarget,
  RenderCustomLabel,
  RenderTask,
  Task,
  TaskBarMoveAction,
  TaskCoordinates,
  ViewMode,
} from "../../types";
import { Arrow } from "../other/arrow";
import { RelationLine } from "../other/relation-line";
import { TaskItem } from "../task-item/task-item";
import styles from "./task-gantt-content.module.css";
import { checkHasChildren } from "../../helpers/check-has-children";
import type { OptimizedListParams } from "../../helpers/use-optimized-list";
import { BarComparison } from "../task-item/bar-comparison";

const DELTA_RELATION_WIDTH = 100;

export interface TaskGanttContentProps extends GanttTaskBarActions {
  authorizedRelations: RelationKind[];
  additionalLeftSpace: number;
  additionalRightSpace: number;
  checkIsHoliday: (date: Date) => boolean;
  childTasksMap: ChildByLevelMap;
  comparisonLevels: number;
  criticalPaths: CriticalPaths | null;
  dependencyMap: DependencyMap;
  dependentMap: DependentMap;
  distances: Distances;
  endColumnIndex: number;
  fullRowHeight: number;
  ganttRelationEvent: GanttRelationEvent | null;
  getDate: (index: number) => Date;
  getTaskCoordinates: (task: Task) => TaskCoordinates;
  onTaskBarRelationStart: (target: RelationMoveTarget, task: Task) => void;
  onDeleteTask: (task: RenderTask) => void;
  onTaskBarDragStart: (
    action: TaskBarMoveAction,
    task: Task,
    clientX: number,
    taskRootNode: Element
  ) => void;
  mapGlobalRowIndexToTask: GlobalRowIndexToTaskMap;
  onArrowDoubleClick: (taskFrom: Task, taskTo: Task) => void;
  onClick?: (task: Task, event: React.MouseEvent<SVGElement>) => void;
  onDoubleClick?: (task: Task) => void;
  renderedRowIndexes: OptimizedListParams | null;
  rtl: boolean;
  waitCommitTasks?: boolean;
  selectTaskOnMouseDown: (taskId: string, event: MouseEvent) => void;
  selectedIdsMirror: Readonly<Record<string, true>>;
  onTooltipTask: (task: Task | null, element: Element | null) => void;
  startColumnIndex: number;
  taskYOffset: number;
  visibleTasksMirror: Readonly<Record<string, true>>;
  taskHeight: number;
  taskHalfHeight: number;
  renderCustomLabel?: RenderCustomLabel;
  isProgressChangeable?: (task: Task) => boolean;
  isDateChangeable?: (task: Task) => boolean;
  isRelationChangeable?: (task: Task) => boolean;
  taskBarMovingAction: (task: RenderTask) => TaskBarMoveAction | null;
  viewMode: ViewMode;
  showProgress?: boolean;
  progressColor?: string;
}

const TaskGanttContentInner: React.FC<TaskGanttContentProps> = props => {
  const {
    authorizedRelations,
    additionalLeftSpace,
    checkIsHoliday,
    childTasksMap,
    comparisonLevels,
    criticalPaths,
    dependencyMap,
    dependentMap,
    distances,
    endColumnIndex,
    fullRowHeight,
    ganttRelationEvent,
    getDate,
    getTaskCoordinates,
    onTaskBarRelationStart,
    onDeleteTask,
    onTaskBarDragStart,
    mapGlobalRowIndexToTask,
    onArrowDoubleClick,
    onDoubleClick,
    onClick,
    renderedRowIndexes,
    rtl,
    selectTaskOnMouseDown,
    selectedIdsMirror,
    onTooltipTask,
    startColumnIndex,
    taskYOffset,
    taskHeight,
    taskHalfHeight,
    visibleTasksMirror,
    isProgressChangeable = task => !task.isDisabled,
    isDateChangeable = task => !task.isDisabled,
    isRelationChangeable = task => !task.isDisabled,
    allowMoveTaskBar,
    renderCustomLabel,
    taskBarMovingAction,
    waitCommitTasks,
    viewMode,
    showProgress = true,
    progressColor,
  } = props;

  const renderedHolidays = useMemo(() => {
    const { columnWidth } = distances;

    const res: ReactNode[] = [];

    for (let i = startColumnIndex; i <= endColumnIndex; ++i) {
      const date = getDate(i);

      if (checkIsHoliday(date)) {
        res.push(
          <rect
            height="100%"
            width={columnWidth}
            x={additionalLeftSpace + i * columnWidth}
            y={0}
            fill={"var(--gantt-calendar-holiday-color)"}
            key={i}
            pointerEvents={"none"}
          />
        );
      }
    }

    return res;
  }, [
    additionalLeftSpace,
    checkIsHoliday,
    distances,
    endColumnIndex,
    getDate,
    startColumnIndex,
  ]);

  const [renderedTasks, renderedArrows, renderedSelectedTasks] = useMemo(() => {
    if (!renderedRowIndexes) {
      return [null, null, null];
    }

    const [start, end] = renderedRowIndexes;

    const tasksRes: ReactNode[] = [];
    const arrowsRes: ReactNode[] = [];
    const selectedTasksRes: ReactNode[] = [];

    // Build a task-by-ID lookup for the cross-viewport arrow pass
    const taskById = new Map<string, Task>();
    mapGlobalRowIndexToTask.forEach(task => {
      if (task.type !== "empty") {
        taskById.set(task.id, task as Task);
      }
    });

    // task id -> true
    const addedSelectedTasks: Record<string, true> = {};

    // avoid duplicates
    // comparison level -> task from id -> task to id -> true
    const addedDependencies: Record<
      string,
      Record<string, Record<string, true>>
    > = {};

    for (let index = start; index <= end; ++index) {
      const task = mapGlobalRowIndexToTask.get(index);

      if (!task) {
        continue;
      }

      const { comparisonLevel = 1, id: taskId } = task;

      if (selectedIdsMirror[taskId] && !addedSelectedTasks[taskId]) {
        addedSelectedTasks[taskId] = true;

        selectedTasksRes.push(
          <rect
            x={0}
            y={Math.floor(index / comparisonLevels) * fullRowHeight}
            width="100%"
            height={fullRowHeight}
            fill={"var(--gantt-table-selected-task-background-color)"}
            key={taskId}
            pointerEvents={"none"}
          />
        );
      }

      if (comparisonLevel > comparisonLevels) {
        continue;
      }

      if (task.type === "empty") {
        continue;
      }

      const key = `${comparisonLevel}_${task.id}`;

      const criticalPathOnLevel = criticalPaths
        ? criticalPaths.get(comparisonLevel)
        : undefined;

      const isCritical = criticalPathOnLevel
        ? criticalPathOnLevel.tasks.has(task.id)
        : false;

      const {
        containerX,
        containerWidth,
        innerX1,
        innerX2,
        width,
        levelY,
        progressWidth,
        x1: taskX1,
        x2: taskX2,
        comparisonDates,
      } = getTaskCoordinates(task);

      // Ensure all coordinates are valid numbers
      const safeContainerX =
        isNaN(containerX) || !isFinite(containerX) ? 0 : containerX;
      const safeContainerWidth =
        isNaN(containerWidth) || !isFinite(containerWidth)
          ? 0
          : Math.max(containerWidth, 0);
      const safeWidth =
        isNaN(width) || !isFinite(width) ? 10 : Math.max(width, 1);
      const safeLevelY = isNaN(levelY) || !isFinite(levelY) ? 0 : levelY;
      const safeProgressWidth =
        isNaN(progressWidth) || !isFinite(progressWidth)
          ? 0
          : Math.max(progressWidth, 0);
      const safeInnerX1 = isNaN(innerX1) || !isFinite(innerX1) ? 0 : innerX1;
      const safeInnerX2 =
        isNaN(innerX2) || !isFinite(innerX2)
          ? safeInnerX1 + safeWidth
          : innerX2;

      tasksRes.push(
        <svg
          id={task.id}
          className={`${styles.TaskItemWrapper} TaskItemWrapper`}
          x={Math.max(safeContainerX + (additionalLeftSpace || 0), 0)}
          y={safeLevelY}
          width={Math.max(safeContainerWidth, 0)}
          height={fullRowHeight}
          key={key}
        >
          <TaskItem
            movingAction={taskBarMovingAction(task)}
            allowMoveTaskBar={allowMoveTaskBar}
            hasChildren={checkHasChildren(task, childTasksMap)}
            progressWidth={safeProgressWidth}
            progressX={rtl ? safeInnerX2 : safeInnerX1}
            onSelectTaskOnMouseDown={selectTaskOnMouseDown}
            task={task}
            taskYOffset={taskYOffset}
            width={safeWidth}
            x1={safeInnerX1}
            x2={safeInnerX2}
            distances={distances}
            taskHeight={taskHeight}
            taskHalfHeight={taskHalfHeight}
            isProgressChangeable={t =>
              isProgressChangeable(t) && !waitCommitTasks
            }
            isDateChangeable={t => isDateChangeable(t) && !waitCommitTasks}
            isRelationChangeable={t =>
              isRelationChangeable(t) && !waitCommitTasks
            }
            authorizedRelations={authorizedRelations}
            ganttRelationEvent={ganttRelationEvent}
            canDelete={!task.isDisabled && !waitCommitTasks}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            onEventStart={onTaskBarDragStart}
            onTooltipTask={onTooltipTask}
            onRelationStart={onTaskBarRelationStart}
            isSelected={Boolean(selectedIdsMirror[taskId])}
            isCritical={isCritical}
            rtl={rtl}
            onDeleteTask={onDeleteTask}
            renderCustomLabel={renderCustomLabel}
            viewMode={viewMode}
            showProgress={showProgress}
            progressColor={progressColor}
          />
        </svg>
      );

      if (task.comparisonDates && comparisonDates) {
        // Validate comparison dates coordinates
        const safeComparisonX =
          isNaN(comparisonDates.x) || !isFinite(comparisonDates.x)
            ? 0
            : comparisonDates.x;
        const safeComparisonY =
          isNaN(comparisonDates.y) || !isFinite(comparisonDates.y)
            ? safeLevelY
            : comparisonDates.y;
        const safeComparisonWidth =
          isNaN(comparisonDates.width) || !isFinite(comparisonDates.width)
            ? 0
            : Math.max(comparisonDates.width, 0);
        const safeComparisonHeight =
          isNaN(comparisonDates.height) || !isFinite(comparisonDates.height)
            ? 0
            : Math.max(comparisonDates.height, 0);

        tasksRes.push(
          <svg
            id={task.id + "_comparison"}
            key={key + "_comparison"}
            className={"TaskItemWrapperComparison"}
            x={Math.max(safeComparisonX + (additionalLeftSpace || 0), 0)}
            y={safeComparisonY}
            width={safeComparisonWidth}
            height={safeComparisonHeight * 2}
          >
            <BarComparison
              inProgress={!task.comparisonDates.end}
              isPlan={
                (task.comparisonDates.start.getTime() >= task.start.getTime() &&
                  !!task.comparisonDates.end &&
                  task.comparisonDates.end.getTime() <= task.end.getTime()) ||
                (task.comparisonDates.start.getTime() <= task.start.getTime() &&
                  !!task.comparisonDates.end &&
                  task.comparisonDates.end.getTime() <= task.start.getTime())
              }
              isWarning={
                !!task.comparisonDates.end &&
                task.comparisonDates.end.getTime() >= task.end.getTime()
              }
              isCritical={
                task.comparisonDates.start.getTime() > task.start.getTime()
              }
              barCornerRadius={distances.barCornerRadius}
              height={safeComparisonHeight}
              width={safeComparisonWidth}
              borderHeight={distances.barComparisonTaskBorderHeight}
              yOffset={distances.barComparisonTaskYOffset}
              task={task}
              onTooltipTask={onTooltipTask}
            />
          </svg>
        );
      }

      const addedDependenciesAtLevel = addedDependencies[comparisonLevel] || {};
      if (!addedDependencies[comparisonLevel]) {
        addedDependencies[comparisonLevel] = addedDependenciesAtLevel;
      }

      const addedDependenciesAtTask = addedDependenciesAtLevel[taskId] || {};
      if (!addedDependenciesAtLevel[taskId]) {
        addedDependenciesAtLevel[taskId] = addedDependenciesAtTask;
      }

      const dependenciesAtLevel = dependencyMap.get(comparisonLevel);

      if (!dependenciesAtLevel) {
        continue;
      }

      const dependenciesByTask = dependenciesAtLevel.get(taskId);

      if (dependenciesByTask) {
        const criticalPathForTask = criticalPathOnLevel
          ? criticalPathOnLevel.dependencies.get(task.id)
          : undefined;

        dependenciesByTask
          .filter(({ source }) => visibleTasksMirror[source.id])
          .forEach(
            ({
              containerHeight,
              containerY,
              innerFromY,
              innerToY,
              ownTarget,
              source,
              sourceTarget,
            }) => {
              if (addedDependenciesAtTask[source.id]) {
                return;
              }

              addedDependenciesAtTask[source.id] = true;

              const isCritical = criticalPathForTask
                ? criticalPathForTask.has(source.id)
                : false;

              const { x1: fromX1, x2: fromX2 } = getTaskCoordinates(source);

              // Ensure arrow coordinates are valid
              const safeFromX1 =
                isNaN(fromX1) || !isFinite(fromX1) ? 0 : fromX1;
              const safeFromX2 =
                isNaN(fromX2) || !isFinite(fromX2) ? safeFromX1 + 10 : fromX2;
              const safeTaskX1 =
                isNaN(taskX1) || !isFinite(taskX1) ? 0 : taskX1;
              const safeTaskX2 =
                isNaN(taskX2) || !isFinite(taskX2) ? safeTaskX1 + 10 : taskX2;

              const containerX =
                Math.min(safeFromX1, safeTaskX1) - DELTA_RELATION_WIDTH;
              const containerWidth =
                Math.max(safeFromX2, safeTaskX2) -
                containerX +
                DELTA_RELATION_WIDTH;

              // Ensure container dimensions are valid
              const safeArrowContainerX =
                isNaN(containerX) || !isFinite(containerX) ? 0 : containerX;
              const safeArrowContainerWidth =
                isNaN(containerWidth) || !isFinite(containerWidth)
                  ? 100
                  : Math.max(containerWidth, 0);

              arrowsRes.push(
                <svg
                  x={Math.max(
                    safeArrowContainerX + (additionalLeftSpace || 0),
                    0
                  )}
                  y={containerY}
                  width={safeArrowContainerWidth}
                  height={containerHeight}
                  key={`Arrow from ${source.id} to ${taskId} on ${comparisonLevel}`}
                >
                  <Arrow
                    distances={distances}
                    taskFrom={source}
                    targetFrom={sourceTarget}
                    fromX1={safeFromX1 - safeArrowContainerX}
                    fromX2={safeFromX2 - safeArrowContainerX}
                    fromY={innerFromY}
                    taskTo={task}
                    targetTo={ownTarget}
                    toX1={safeTaskX1 - safeArrowContainerX}
                    toX2={safeTaskX2 - safeArrowContainerX}
                    toY={innerToY}
                    fullRowHeight={fullRowHeight}
                    taskHeight={taskHeight}
                    isCritical={isCritical}
                    rtl={rtl}
                    onArrowDoubleClick={onArrowDoubleClick}
                  />
                </svg>
              );
            }
          );
      }

      const dependentsAtLevel = dependentMap.get(comparisonLevel);

      if (!dependentsAtLevel) {
        continue;
      }

      const dependentsByTask = dependentsAtLevel.get(taskId);

      if (dependentsByTask) {
        dependentsByTask
          .filter(({ dependent }) => visibleTasksMirror[dependent.id])
          .forEach(
            ({
              containerHeight,
              containerY,
              innerFromY,
              innerToY,
              ownTarget,
              dependent,
              dependentTarget,
            }) => {
              const addedDependenciesAtDependent =
                addedDependenciesAtLevel[dependent.id] || {};
              if (!addedDependenciesAtLevel[dependent.id]) {
                addedDependenciesAtLevel[dependent.id] =
                  addedDependenciesAtDependent;
              }

              if (addedDependenciesAtDependent[taskId]) {
                return;
              }

              addedDependenciesAtDependent[taskId] = true;

              const criticalPathForTask = criticalPathOnLevel
                ? criticalPathOnLevel.dependencies.get(dependent.id)
                : undefined;

              const isCritical = criticalPathForTask
                ? criticalPathForTask.has(task.id)
                : false;

              const { x1: toX1, x2: toX2 } = getTaskCoordinates(dependent);

              // Ensure arrow coordinates are valid
              const safeToX1 = isNaN(toX1) || !isFinite(toX1) ? 0 : toX1;
              const safeToX2 =
                isNaN(toX2) || !isFinite(toX2) ? safeToX1 + 10 : toX2;
              const safeTaskX1 =
                isNaN(taskX1) || !isFinite(taskX1) ? 0 : taskX1;
              const safeTaskX2 =
                isNaN(taskX2) || !isFinite(taskX2) ? safeTaskX1 + 10 : taskX2;

              const containerX =
                Math.min(safeToX1, safeTaskX1) - DELTA_RELATION_WIDTH;
              const containerWidth =
                Math.max(safeToX2, safeTaskX2) -
                containerX +
                DELTA_RELATION_WIDTH;

              // Ensure container dimensions are valid
              const safeArrowContainerX =
                isNaN(containerX) || !isFinite(containerX) ? 0 : containerX;
              const safeArrowContainerWidth =
                isNaN(containerWidth) || !isFinite(containerWidth)
                  ? 100
                  : Math.max(containerWidth, 0);

              arrowsRes.push(
                <svg
                  x={Math.max(
                    safeArrowContainerX + (additionalLeftSpace || 0),
                    0
                  )}
                  y={containerY}
                  width={safeArrowContainerWidth}
                  height={containerHeight}
                  key={`Arrow from ${taskId} to ${dependent.id} on ${comparisonLevel}`}
                >
                  <Arrow
                    distances={distances}
                    taskFrom={task}
                    targetFrom={ownTarget}
                    fromX1={safeTaskX1 - safeArrowContainerX}
                    fromX2={safeTaskX2 - safeArrowContainerX}
                    fromY={innerFromY}
                    taskTo={dependent}
                    targetTo={dependentTarget}
                    toX1={safeToX1 - safeArrowContainerX}
                    toX2={safeToX2 - safeArrowContainerX}
                    toY={innerToY}
                    fullRowHeight={fullRowHeight}
                    taskHeight={taskHeight}
                    isCritical={isCritical}
                    rtl={rtl}
                    onArrowDoubleClick={onArrowDoubleClick}
                  />
                </svg>
              );
            }
          );
      }
    }

    // Second pass: render arrows for long-spanning dependencies where both
    // endpoints are outside the rendered row range but the arrow line crosses
    // through the visible viewport.
    const renderedTop = start * fullRowHeight;
    const renderedBottom = (end + 1) * fullRowHeight;

    for (const [comparisonLevel, dependenciesByLevel] of dependencyMap) {
      let addedDependenciesAtLevel = addedDependencies[comparisonLevel];
      if (!addedDependenciesAtLevel) {
        addedDependenciesAtLevel = {};
        addedDependencies[comparisonLevel] = addedDependenciesAtLevel;
      }

      const criticalPathOnLevel = criticalPaths
        ? criticalPaths.get(comparisonLevel)
        : undefined;

      for (const [taskId, dependencies] of dependenciesByLevel) {
        let addedDependenciesAtTask = addedDependenciesAtLevel[taskId];
        if (!addedDependenciesAtTask) {
          addedDependenciesAtTask = {};
          addedDependenciesAtLevel[taskId] = addedDependenciesAtTask;
        }

        const targetTask = taskById.get(taskId);
        if (!targetTask) continue;

        const criticalPathForTask = criticalPathOnLevel
          ? criticalPathOnLevel.dependencies.get(taskId)
          : undefined;

        dependencies
          .filter(({ source }) => {
            if (addedDependenciesAtTask[source.id]) return false;
            if (!visibleTasksMirror[source.id]) return false;
            return true;
          })
          .forEach(
            ({
              containerHeight,
              containerY,
              innerFromY,
              innerToY,
              ownTarget,
              source,
              sourceTarget,
            }) => {
              // Skip arrows entirely outside the rendered vertical range
              if (
                containerY + containerHeight < renderedTop ||
                containerY > renderedBottom
              ) {
                return;
              }

              addedDependenciesAtTask[source.id] = true;

              const isCritical = criticalPathForTask
                ? criticalPathForTask.has(source.id)
                : false;

              const { x1: fromX1, x2: fromX2 } = getTaskCoordinates(source);
              const { x1: targetX1, x2: targetX2 } =
                getTaskCoordinates(targetTask);

              const safeFromX1 =
                isNaN(fromX1) || !isFinite(fromX1) ? 0 : fromX1;
              const safeFromX2 =
                isNaN(fromX2) || !isFinite(fromX2) ? safeFromX1 + 10 : fromX2;
              const safeTargetX1 =
                isNaN(targetX1) || !isFinite(targetX1) ? 0 : targetX1;
              const safeTargetX2 =
                isNaN(targetX2) || !isFinite(targetX2)
                  ? safeTargetX1 + 10
                  : targetX2;

              const cX =
                Math.min(safeFromX1, safeTargetX1) - DELTA_RELATION_WIDTH;
              const cW =
                Math.max(safeFromX2, safeTargetX2) - cX + DELTA_RELATION_WIDTH;

              const safeCX = isNaN(cX) || !isFinite(cX) ? 0 : cX;
              const safeCW = isNaN(cW) || !isFinite(cW) ? 100 : Math.max(cW, 0);

              arrowsRes.push(
                <svg
                  x={Math.max(safeCX + (additionalLeftSpace || 0), 0)}
                  y={containerY}
                  width={safeCW}
                  height={containerHeight}
                  key={`Arrow from ${source.id} to ${taskId} on ${comparisonLevel}`}
                >
                  <Arrow
                    distances={distances}
                    taskFrom={source}
                    targetFrom={sourceTarget}
                    fromX1={safeFromX1 - safeCX}
                    fromX2={safeFromX2 - safeCX}
                    fromY={innerFromY}
                    taskTo={targetTask}
                    targetTo={ownTarget}
                    toX1={safeTargetX1 - safeCX}
                    toX2={safeTargetX2 - safeCX}
                    toY={innerToY}
                    fullRowHeight={fullRowHeight}
                    taskHeight={taskHeight}
                    isCritical={isCritical}
                    rtl={rtl}
                    onArrowDoubleClick={onArrowDoubleClick}
                  />
                </svg>
              );
            }
          );
      }
    }

    return [tasksRes, arrowsRes, selectedTasksRes];
  }, [
    viewMode,
    renderedRowIndexes,
    mapGlobalRowIndexToTask,
    selectedIdsMirror,
    comparisonLevels,
    criticalPaths,
    getTaskCoordinates,
    additionalLeftSpace,
    fullRowHeight,
    taskBarMovingAction,
    allowMoveTaskBar,
    childTasksMap,
    rtl,
    selectTaskOnMouseDown,
    taskYOffset,
    distances,
    taskHeight,
    taskHalfHeight,
    authorizedRelations,
    ganttRelationEvent,
    waitCommitTasks,
    onDoubleClick,
    onClick,
    onTaskBarDragStart,
    onTooltipTask,
    onTaskBarRelationStart,
    onDeleteTask,
    renderCustomLabel,
    dependencyMap,
    dependentMap,
    isProgressChangeable,
    isDateChangeable,
    isRelationChangeable,
    visibleTasksMirror,
    onArrowDoubleClick,
    showProgress,
    progressColor,
  ]);

  return (
    <g className="content">
      {renderedSelectedTasks}

      <g>{renderedHolidays}</g>

      <g
        className="arrows"
        fill={"var(--gantt-arrow-color)"}
        stroke={"var(--gantt-arrow-color)"}
      >
        {renderedArrows}
      </g>

      <g
        className="bar"
        fontFamily={"var(--gantt-font-family)"}
        fontSize={"var(--gantt-font-size)"}
      >
        {renderedTasks}
      </g>

      {ganttRelationEvent && (
        <RelationLine
          x1={ganttRelationEvent.startX}
          x2={ganttRelationEvent.endX}
          y1={ganttRelationEvent.startY}
          y2={ganttRelationEvent.endY}
        />
      )}
    </g>
  );
};

export const TaskGanttContent = memo(TaskGanttContentInner);
