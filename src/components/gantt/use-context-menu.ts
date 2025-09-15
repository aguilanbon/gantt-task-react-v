import type { RefObject } from "react";
import { useCallback, useState } from "react";

import { ContextMenuType, Task, RenderTask } from "../../types";

export const useContextMenu = (
  wrapperRef: RefObject<HTMLDivElement>,
  scrollToTask: (task: Task) => void
) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuType>({
    task: null,
    x: 0,
    y: 0,
  });

  const handleOpenContextMenu = useCallback(
    (
      task: RenderTask,
      clientX: number,
      clientY: number,
      options?: readonly unknown[]
    ) => {
      const wrapperNode = wrapperRef.current;

      if (!wrapperNode) {
        return;
      }

      // Don't show context menu if no options are provided
      if (options && options.length === 0) {
        return;
      }

      const { top, left } = wrapperNode.getBoundingClientRect();

      setContextMenu({
        task,
        x: clientX - left,
        y: clientY - top,
      });

      if (task.type !== "empty") {
        scrollToTask(task);
      }
    },
    [wrapperRef, scrollToTask]
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({
      task: null,
      x: 0,
      y: 0,
    });
  }, []);

  return {
    contextMenu,
    handleCloseContextMenu,
    handleOpenContextMenu,
  };
};
