import React, { Fragment, memo, useMemo } from "react";

import { TaskListHeaderProps } from "../../../types";

import styles from "./task-list-header.module.css";

const TaskListTableHeadersDefaultInner: React.FC<TaskListHeaderProps> = ({
  headerHeight,
  columns,
  canResizeColumns,
  canMoveTasks,
  onColumnResizeStart,
}) => {
  // Compute sticky offsets for pinned columns
  const pinnedStyles = useMemo(() => {
    const result: Record<number, React.CSSProperties> = {};
    // Left pinned: accumulate from left
    let leftOffset = 0;
    if (canMoveTasks) {
      // account for the drag handle column width (~24px via CSS var)
      leftOffset = 24;
    }
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].pinned === "left") {
        result[i] = {
          position: "sticky",
          left: leftOffset,
          zIndex: 2,
          backgroundColor: "var(--gantt-table-header-background-color, #fff)",
        };
        leftOffset += columns[i].width;
      }
    }
    // Right pinned: accumulate from right
    let rightOffset = 0;
    for (let i = columns.length - 1; i >= 0; i--) {
      if (columns[i].pinned === "right") {
        result[i] = {
          position: "sticky",
          right: rightOffset,
          zIndex: 2,
          backgroundColor: "var(--gantt-table-header-background-color, #fff)",
        };
        rightOffset += columns[i].width;
      }
    }
    return result;
  }, [columns, canMoveTasks]);

  return (
    <div
      className={styles.ganttTable}
      style={{
        fontFamily: "var(--gantt-font-family)",
        fontSize: "var(--gantt-font-size)",
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2,
        }}
      >
        {canMoveTasks && <div className={styles.ganttTable_HeaderMoveTask} />}

        {columns.map(({ title, width, canResize }, index) => {
          return (
            <Fragment key={index}>
              {index > 0 && !!title && (
                <div
                  className={styles.ganttTable_HeaderSeparator}
                  style={{
                    height: headerHeight * 0.5,
                    marginTop: headerHeight * 0.2,
                  }}
                />
              )}

              <div
                data-testid={`table-column-header-${title}`}
                className={styles.ganttTable_HeaderItem}
                style={{
                  minWidth: width,
                  maxWidth: width,
                  ...pinnedStyles[index],
                }}
              >
                {title}

                {canResizeColumns && canResize !== false && !!title && (
                  <div
                    data-testid={`table-column-header-resize-handle-${title}`}
                    className={styles.resizer}
                    onMouseDown={event => {
                      onColumnResizeStart(index, event.clientX);
                    }}
                    onTouchStart={event => {
                      const firstTouch = event.touches[0];

                      if (firstTouch) {
                        onColumnResizeStart(index, firstTouch.clientX);
                      }
                    }}
                  />
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const TaskListTableHeaders = memo(TaskListTableHeadersDefaultInner);
