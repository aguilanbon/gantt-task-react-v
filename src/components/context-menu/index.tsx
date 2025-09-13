import type { ReactElement, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { autoUpdate, flip, shift } from "@floating-ui/dom";
import {
  useDismiss,
  useFloating,
  useFocus,
  useInteractions,
  useRole,
} from "@floating-ui/react";

import type {
  ActionMetaType,
  CheckIsAvailableMetaType,
  ContextMenuOptionType,
  ContextMenuType,
  Distances,
  RenderTask,
} from "../../types";

import { MenuOption } from "./menu-option";

type ContextMenuProps = {
  checkHasCopyTasks: () => boolean;
  checkHasCutTasks: () => boolean;
  contextMenu: ContextMenuType;
  distances: Distances;
  handleAction: (
    task: RenderTask,
    action: (meta: ActionMetaType) => void
  ) => void;
  handleCloseContextMenu: () => void;
  options: ContextMenuOptionType[];
  /** Optional boundary element to contain the context menu (like tooltips) */
  boundaryElement?: RefObject<HTMLElement>;
};

export function ContextMenu(props: ContextMenuProps): ReactElement {
  const {
    checkHasCopyTasks,
    checkHasCutTasks,
    contextMenu: { task, x, y },
    distances,
    handleAction,
    handleCloseContextMenu,
    options,
  } = props;
  const optionsForRender = useMemo(() => {
    if (!task) {
      return [];
    }

    const meta: CheckIsAvailableMetaType = {
      task,
      checkHasCopyTasks,
      checkHasCutTasks,
    };

    return options.filter(({ checkIsAvailable }) => {
      if (!checkIsAvailable) {
        return true;
      }

      return checkIsAvailable(meta);
    });
  }, [task, checkHasCopyTasks, checkHasCutTasks, options]);

  const handleOptionAction = useCallback(
    (option: ContextMenuOptionType) => {
      handleCloseContextMenu();

      if (!task) {
        return;
      }

      handleAction(task, option.action);
    },
    [handleAction, handleCloseContextMenu, task]
  );

  const {
    x: menuX,
    y: menuY,
    strategy,
    refs,
    context,
  } = useFloating({
    open: Boolean(task),
    onOpenChange: isOpen => {
      if (!isOpen) {
        handleCloseContextMenu();
      }
    },
    strategy: "absolute",
    placement: "bottom-start",
    middleware: [
      flip(),
      shift({
        boundary: props.boundaryElement?.current || undefined,
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { setFloating, setReference } = refs;

  useEffect(() => {
    if (task) {
      context.update();
    }
  }, [context, task, x, y]);

  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    focus,
    dismiss,
    role,
  ]);

  const floatingRef = useRef<HTMLDivElement>();

  const setFloatingRef = useCallback(
    (el: HTMLDivElement | null) => {
      floatingRef.current = el || undefined;
      setFloating(el);
    },
    [setFloating]
  );

  // useOutsideClick(floatingRef as MutableRefObject<HTMLDivElement>, () => {
  //   handleCloseContextMenu();
  // });

  return (
    <>
      <div
        {...getReferenceProps()}
        style={{
          position: "absolute",
          left: x,
          top: y,
          zIndex: 1,
        }}
        ref={setReference}
      />

      {task && (
        <div
          ref={setFloatingRef}
          style={{
            position: strategy,
            top: menuY ?? 0,
            left: menuX ?? 0,
            width: "max-content",
            backgroundColor: "var(--gantt-context-menu-bg-color)",
            boxShadow: "var(--gantt-context-menu-box-shadow)",
            borderRadius: "var(--gantt-shape-border-radius)",
            fontFamily: "var(--gantt-font-family)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            gap: 6,
            zIndex: 10,
          }}
          {...getFloatingProps()}
        >
          {/* NOTE: Previously project tasks rendered only a single hard-coded option (index 2).
              This caused the context menu to appear empty (and thus look broken) if that index
              wasn't present or available. We now render all filtered options for every task type.
              If in the future certain options should be hidden for projects, add per-option
              checkIsAvailable logic instead of hard-coded indexes. */}
          {optionsForRender.map((option, index) => (
            <MenuOption
              onClose={handleCloseContextMenu}
              distances={distances}
              handleAction={handleOptionAction}
              option={option}
              key={index}
            />
          ))}
          {optionsForRender.length === 0 && (
            <div
              style={{
                padding: "6px 12px",
                color: "var(--gantt-context-menu-empty-color, #666)",
                fontSize: "var(--gantt-font-size)",
              }}
            >
              —
            </div>
          )}
        </div>
      )}
    </>
  );
}
