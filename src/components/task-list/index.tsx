import type { MouseEvent, RefObject } from "react";
import React, { memo, useCallback } from "react";

import {
  AllowReorderTask,
  ChildByLevelMap,
  Column,
  DateSetup,
  DependencyMap,
  Distances,
  GanttRenderIconsProps,
  MapTaskToNestedIndex,
  OnResizeColumn,
  Task,
  TaskListTableRowProps,
  RenderTask,
  TableRenderBottomProps,
} from "../../types";

import { useOptimizedList } from "../../helpers/use-optimized-list";
import { useTableListResize } from "../gantt/use-tablelist-resize";
import { TaskListTableHeaders } from "./task-list-table-headers";
import { TaskListSortableTable } from "./task-list-sortable-table";
import { TaskListTable } from "./task-list-table";
import styles from "./task-list.module.css";
import { checkHasChildren } from "../../helpers/check-has-children";

export type TaskListProps = {
  ganttRef: RefObject<HTMLDivElement>;
  /** Ref to the horizontal scroll wrapper (used for containing popups) */
  taskListHorizontalScrollRef?: RefObject<HTMLDivElement>;
  allowReorderTask?: AllowReorderTask;
  canReorderTasks?: boolean;
  canResizeColumns?: boolean;
  childTasksMap: ChildByLevelMap;
  columnsProp: readonly Column[];
  cutIdsMirror: Readonly<Record<string, true>>;
  dateSetup: DateSetup;
  dependencyMap: DependencyMap;
  distances: Distances;
  fullRowHeight: number;
  ganttFullHeight: number;
  ganttHeight: number;
  getTaskCurrentState: (task: Task) => Task;
  handleAddTask: (task: Task | null) => void;
  handleDeleteTasks: (task: RenderTask[]) => void;
  handleEditTask: (task: RenderTask) => void;
  handleMoveTaskBefore: (target: RenderTask, taskForMove: RenderTask) => void;
  handleMoveTaskAfter: (target: RenderTask, taskForMove: RenderTask) => void;
  handleMoveTasksInside: (parent: Task, childs: readonly RenderTask[]) => void;
  handleOpenContextMenu: (
    task: RenderTask,
    clientX: number,
    clientY: number
  ) => void;
  icons?: Partial<GanttRenderIconsProps>;
  isShowTaskNumbers?: boolean;
  mapTaskToNestedIndex: MapTaskToNestedIndex;
  onClick?: (task: RenderTask) => void;
  onExpanderClick: (task: Task) => void;
  scrollToBottomStep: () => void;
  scrollToTask: (task: Task) => void;
  scrollToTopStep: () => void;
  selectTaskOnMouseDown: (taskId: string, event: MouseEvent) => void;
  selectedIdsMirror: Readonly<Record<string, true>>;
  taskListContainerRef: RefObject<HTMLDivElement>;
  taskListRef: RefObject<HTMLDivElement>;
  tasks: readonly RenderTask[];
  onResizeColumn?: OnResizeColumn;
  tableBottom?: TableRenderBottomProps;
};

const TaskListInner: React.FC<TaskListProps> = ({
  allowReorderTask,
  canResizeColumns,
  childTasksMap,
  columnsProp,
  cutIdsMirror,
  dateSetup,
  dependencyMap,
  distances,
  fullRowHeight,
  ganttFullHeight,
  ganttHeight,
  getTaskCurrentState,
  handleAddTask,
  handleDeleteTasks,
  handleEditTask,
  handleMoveTaskBefore,
  handleMoveTaskAfter,
  handleMoveTasksInside,
  handleOpenContextMenu,
  icons,
  isShowTaskNumbers,
  mapTaskToNestedIndex,
  onExpanderClick,
  onClick,
  scrollToTask,
  selectTaskOnMouseDown,
  selectedIdsMirror,
  ganttRef,
  taskListContainerRef,
  taskListHorizontalScrollRef,
  taskListRef,
  tasks,
  onResizeColumn,
  canReorderTasks,
  tableBottom,
}) => {
  // Manage the column and list table resizing
  const [
    columns,
    taskListWidth,
    tableWidth,
    onTableResizeStart,
    onColumnResizeStart,
  ] = useTableListResize(
    columnsProp,
    canReorderTasks,
    onResizeColumn,
    ganttRef
  );

  const renderedIndexes = useOptimizedList(
    taskListContainerRef,
    "scrollTop",
    fullRowHeight
  );

  const getTableRowProps = useCallback(
    (task: RenderTask, index: number) => {
      const { id, comparisonLevel = 1 } = task;
      const indexesOnLevel = mapTaskToNestedIndex.get(comparisonLevel);
      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }

      const taskIndex = indexesOnLevel.get(id);

      if (!taskIndex) {
        throw new Error(`Index is not found for task ${id}`);
      }

      const [depth, indexStr] = taskIndex;

      return {
        columns: columns,
        dateSetup: dateSetup,
        dependencyMap: dependencyMap,
        distances: distances,
        fullRowHeight: fullRowHeight,
        getTaskCurrentState: getTaskCurrentState,
        handleAddTask: handleAddTask,
        handleDeleteTasks: handleDeleteTasks,
        handleEditTask: handleEditTask,
        handleOpenContextMenu: handleOpenContextMenu,
        hasChildren: checkHasChildren(task, childTasksMap),
        icons: icons,
        indexStr: indexStr,
        isClosed: Boolean((task as Task)?.hideChildren),
        isCut: cutIdsMirror[id],
        isEven: index % 2 === 1,
        isSelected: selectedIdsMirror[id],
        isShowTaskNumbers: isShowTaskNumbers,
        onClick: onClick,
        onExpanderClick: onExpanderClick,
        scrollToTask: scrollToTask,
        selectTaskOnMouseDown: selectTaskOnMouseDown,
        task: task,
        depth: depth,
      } as TaskListTableRowProps;
    },
    [
      childTasksMap,
      columns,
      cutIdsMirror,
      dateSetup,
      dependencyMap,
      distances,
      fullRowHeight,
      getTaskCurrentState,
      handleAddTask,
      handleDeleteTasks,
      handleEditTask,
      handleOpenContextMenu,
      icons,
      isShowTaskNumbers,
      mapTaskToNestedIndex,
      onClick,
      onExpanderClick,
      scrollToTask,
      selectTaskOnMouseDown,
      selectedIdsMirror,
    ]
  );

  const RenderTaskListTable = canReorderTasks
    ? TaskListSortableTable
    : TaskListTable;

  return (
    <div className={styles.taskListRoot} ref={taskListRef}>
      <div
        ref={taskListHorizontalScrollRef}
        className={styles.taskListHorizontalScroll}
        style={{
          width: tableWidth,
        }}
      >
        <TaskListTableHeaders
          canMoveTasks={canReorderTasks}
          headerHeight={distances.headerHeight}
          columns={columns}
          onColumnResizeStart={onColumnResizeStart}
          canResizeColumns={canResizeColumns}
        />

        <div className={styles.tableWrapper}>
          <div
            ref={taskListContainerRef}
            className={styles.horizontalContainer}
            style={{
              height: Math.max(
                ganttHeight - (tableBottom?.height || 0),
                distances.minimumRowDisplayed * distances.rowHeight
              ),
              width: taskListWidth,
            }}
          >
            <div
              style={{
                height: Math.max(
                  ganttFullHeight,
                  distances.minimumRowDisplayed * distances.rowHeight
                ),
                backgroundSize: `100% ${fullRowHeight * 2}px`,
                backgroundImage: `linear-gradient(to bottom, transparent ${fullRowHeight}px, #f5f5f5 ${fullRowHeight}px)`,
              }}
            >
              <RenderTaskListTable
                ganttRef={ganttRef}
                getTableRowProps={getTableRowProps}
                canMoveTasks={canReorderTasks}
                allowMoveTask={allowReorderTask}
                childTasksMap={childTasksMap}
                columns={columns}
                cutIdsMirror={cutIdsMirror}
                dateSetup={dateSetup}
                dependencyMap={dependencyMap}
                distances={distances}
                fullRowHeight={fullRowHeight}
                ganttFullHeight={ganttFullHeight}
                getTaskCurrentState={getTaskCurrentState}
                handleAddTask={handleAddTask}
                handleDeleteTasks={handleDeleteTasks}
                handleEditTask={handleEditTask}
                handleMoveTaskBefore={handleMoveTaskBefore}
                handleMoveTaskAfter={handleMoveTaskAfter}
                handleMoveTasksInside={handleMoveTasksInside}
                handleOpenContextMenu={handleOpenContextMenu}
                icons={icons}
                isShowTaskNumbers={isShowTaskNumbers}
                mapTaskToNestedIndex={mapTaskToNestedIndex}
                onClick={onClick}
                onExpanderClick={onExpanderClick}
                renderedIndexes={renderedIndexes}
                scrollToTask={scrollToTask}
                selectTaskOnMouseDown={selectTaskOnMouseDown}
                selectedIdsMirror={selectedIdsMirror}
                taskListWidth={taskListWidth}
                tasks={tasks}
              />
            </div>
          </div>

          <div
            className={`${styles.scrollToTop} ${
              !renderedIndexes || renderedIndexes[2] ? styles.hidden : ""
            }`}
          />

          <div
            className={`${styles.scrollToBottom} ${
              !renderedIndexes || renderedIndexes[3] ? styles.hidden : ""
            }`}
          />
        </div>

        {tableBottom?.renderContent && tableBottom?.height && (
          <div style={{ height: tableBottom.height, width: "100%" }}>
            {tableBottom.renderContent()}
          </div>
        )}
      </div>

      <div
        className={styles.taskListResizer}
        onMouseDown={event => {
          onTableResizeStart(event.clientX);
        }}
        onTouchStart={event => {
          const firstTouch = event.touches[0];

          if (firstTouch) {
            onTableResizeStart(firstTouch.clientX);
          }
        }}
      />
    </div>
  );
};

export const TaskList = memo(TaskListInner);
