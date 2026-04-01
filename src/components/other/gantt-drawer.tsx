import React, { memo } from "react";

import type { GanttDrawerData, RenderDrawerContent } from "../../types";

import styles from "./gantt-drawer.module.css";

interface GanttDrawerInternalProps {
  data: GanttDrawerData | null;
  width: number;
  onClose: () => void;
  onGoToTask?: (taskId: string) => void;
  renderContent?: RenderDrawerContent;
}

const GanttDrawerInner: React.FC<GanttDrawerInternalProps> = ({
  data,
  width,
  onClose,
  onGoToTask,
  renderContent,
}) => {
  const title =
    data?.type === "task"
      ? data.task.name
      : data?.type === "arrow"
        ? `${data.taskFrom.name} → ${data.taskTo.name}`
        : "";

  const goToTaskIds: string[] = [];
  if (data?.type === "task") {
    goToTaskIds.push(data.task.id);
  } else if (data?.type === "arrow") {
    goToTaskIds.push(data.taskFrom.id, data.taskTo.id);
  }

  return (
    <>
      <div
        className={`${styles.drawer}${data ? ` ${styles.drawer_open}` : ""}`}
        style={{ width }}
      >
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close drawer"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.body}>
          {data && onGoToTask && (
            <div className={styles.goToTaskBar}>
              {data.type === "task" && (
                <button
                  className={styles.goToTaskButton}
                  onClick={() => onGoToTask(data.task.id)}
                  type="button"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Go to Task
                </button>
              )}
              {data.type === "arrow" && (
                <>
                  <button
                    className={styles.goToTaskButton}
                    onClick={() => onGoToTask(data.taskFrom.id)}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 7h10M8 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Go to {data.taskFrom.name}
                  </button>
                  <button
                    className={styles.goToTaskButton}
                    onClick={() => onGoToTask(data.taskTo.id)}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 7h10M8 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Go to {data.taskTo.name}
                  </button>
                </>
              )}
            </div>
          )}
          {data && renderContent
            ? renderContent(data, onGoToTask ?? (() => {}))
            : null}
        </div>
      </div>
    </>
  );
};

export const GanttDrawer = memo(GanttDrawerInner);
