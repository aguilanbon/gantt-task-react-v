import { MouseEvent, useEffect } from "react";
import { useCallback, useRef, useState } from "react";

import {
  CheckTaskIdExistsAtLevel,
  RowIndexToTaskMap,
  RenderTask,
  TaskToRowIndexMap,
  TaskId,
} from "../../types";

const initialValue = {};

export const useSelection = (
  taskToRowIndexMap: TaskToRowIndexMap,
  rowIndexToTaskMap: RowIndexToTaskMap,
  checkTaskIdExists: CheckTaskIdExistsAtLevel,
  onSelectTaskIds?: (taskIds: TaskId[]) => void
) => {
  const [cutIdsMirror, setCutIdsMirror] =
    useState<Readonly<Record<string, true>>>(initialValue);
  const [copyIdsMirror, setCopyIdsMirror] =
    useState<Readonly<Record<string, true>>>(initialValue);
  const [selectedIdsMirror, setSelectedIdsMirror] =
    useState<Readonly<Record<string, true>>>(initialValue);
  const lastSelectedIdRef = useRef<string | null>(null);

  const selectTask = useCallback((taskId: string) => {
    setCutIdsMirror(initialValue);
    setSelectedIdsMirror({
      [taskId]: true,
    });

    lastSelectedIdRef.current = taskId;
  }, []);

  const toggleTask = useCallback(
    (taskId?: string | null, singleMode: boolean = false) => {
      setCutIdsMirror(initialValue);
      setSelectedIdsMirror(prevValue => {
        if (!taskId) {
          return {};
        }

        if (singleMode) {
          return {
            [taskId]: true,
          };
        }

        if (prevValue[taskId]) {
          const nextValue = {
            ...prevValue,
          };

          delete nextValue[taskId];

          return nextValue;
        }

        return {
          ...prevValue,
          [taskId]: true,
        };
      });

      lastSelectedIdRef.current = taskId;
    },
    []
  );

  const selectTasksFromLastSelected = useCallback(
    (taskId: string) => {
      const lastSelectedId = lastSelectedIdRef.current;
      if (lastSelectedId === null) {
        toggleTask(taskId);
        return;
      }

      const indexesAtLevel = taskToRowIndexMap.get(1);

      if (!indexesAtLevel) {
        throw new Error("Indexes are not found at level 1");
      }

      const tasksAtLevel = rowIndexToTaskMap.get(1);

      if (!tasksAtLevel) {
        throw new Error("Tasks are not found at level 1");
      }

      const lastSelectedIndex = indexesAtLevel.get(lastSelectedId);

      if (typeof lastSelectedIndex !== "number") {
        toggleTask(taskId);
        return;
      }

      const currentSelectedIndex = indexesAtLevel.get(taskId);

      if (typeof currentSelectedIndex !== "number") {
        throw new Error(`Index is not found for task "${taskId}"`);
      }

      if (lastSelectedIndex === currentSelectedIndex) {
        toggleTask(taskId);
        return;
      }

      setCutIdsMirror(initialValue);

      const minIndex = Math.min(lastSelectedIndex, currentSelectedIndex);
      const maxIndex = Math.max(lastSelectedIndex, currentSelectedIndex);

      setSelectedIdsMirror(prevValue => {
        const nextValue = {
          ...prevValue,
        };

        for (let i = minIndex; i <= maxIndex; ++i) {
          const task = tasksAtLevel.get(i);

          if (task) {
            nextValue[task.id] = true;
          }
        }

        return nextValue;
      });

      lastSelectedIdRef.current = taskId;
    },
    [rowIndexToTaskMap, taskToRowIndexMap, toggleTask]
  );

  const resetSelectedTasks = useCallback(() => {
    setCutIdsMirror(initialValue);
    setSelectedIdsMirror(initialValue);
    lastSelectedIdRef.current = null;
  }, []);

  const selectTaskOnMouseDown = useCallback(
    (taskId: string, event: MouseEvent) => {
      if (event.shiftKey) {
        event.preventDefault();
        selectTasksFromLastSelected(taskId);
        return;
      }

      if (event.ctrlKey) {
        toggleTask(taskId);
        return;
      }

      // Check if task is already selected - if so, deselect it; otherwise select it
      if (selectedIdsMirror[taskId]) {
        toggleTask(taskId); // This will deselect since it's already selected
      } else {
        selectTask(taskId);
      }
    },
    [selectTask, selectTasksFromLastSelected, toggleTask, selectedIdsMirror]
  );

  const cutTask = useCallback((task: RenderTask) => {
    setCutIdsMirror({
      [task.id]: true,
    });
    setSelectedIdsMirror(initialValue);
  }, []);

  const cutSelectedTasks = useCallback(() => {
    setCutIdsMirror(selectedIdsMirror);
    setSelectedIdsMirror(initialValue);
  }, [selectedIdsMirror]);

  const copyTask = useCallback((task: RenderTask) => {
    setCopyIdsMirror({
      [task.id]: true,
    });
  }, []);

  const copySelectedTasks = useCallback(() => {
    setCopyIdsMirror(selectedIdsMirror);
  }, [selectedIdsMirror]);

  const checkHasCopyTasks = useCallback(
    () =>
      Object.keys(copyIdsMirror).some(taskId => checkTaskIdExists(taskId, 1)),
    [checkTaskIdExists, copyIdsMirror]
  );

  const checkHasCutTasks = useCallback(
    () =>
      Object.keys(cutIdsMirror).some(taskId => checkTaskIdExists(taskId, 1)),
    [checkTaskIdExists, cutIdsMirror]
  );

  useEffect(() => {
    if (onSelectTaskIds) {
      const selectedTaskIds = Object.keys(selectedIdsMirror).filter(
        x => selectedIdsMirror[x]
      );
      onSelectTaskIds(selectedTaskIds);
    }
  }, [onSelectTaskIds, selectedIdsMirror]);

  return {
    checkHasCopyTasks,
    checkHasCutTasks,
    copyIdsMirror,
    copySelectedTasks,
    copyTask,
    cutIdsMirror,
    cutSelectedTasks,
    cutTask,
    resetSelectedTasks,
    selectTask,
    selectTaskOnMouseDown,
    selectTasksFromLastSelected,
    selectedIdsMirror,
    toggleTask,
  };
};
