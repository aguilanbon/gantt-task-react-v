import type { ReactElement, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

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
  // (floatingRef will be declared later once useFloating() is available)
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
    strategy: "fixed",
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

  const floatingRef = useRef<HTMLDivElement | null>(null);

  const setFloatingRef = useCallback(
    (el: HTMLDivElement | null) => {
      // keep a direct reference for copying CSS variables later
      floatingRef.current = el;
      setFloating(el);
    },
    [setFloating]
  );

  // Copy theme CSS variables from the reference/source element to the
  // floating menu so the portaled element preserves the original look.
  useEffect(() => {
    if (!task) return;

    const cssVars = [
      "--gantt-context-menu-bg-color",
      "--gantt-context-menu-box-shadow",
      "--gantt-shape-border-radius",
      "--gantt-font-family",
      "--gantt-font-size",
      "--gantt-context-menu-empty-color",
    ];

    // Read from the reference element first, fallback to body
    const refEl =
      (refs as unknown as { reference?: { current: HTMLElement | null } })
        ?.reference?.current ?? null;
    const sourceEl =
      refEl || (typeof document !== "undefined" ? document.body : null);
    if (!sourceEl || !floatingRef.current) return;

    const cs = getComputedStyle(sourceEl);
    cssVars.forEach(v => {
      const val = cs.getPropertyValue(v).trim();
      if (val) {
        floatingRef.current!.style.setProperty(v, val);
      }
    });
  }, [task, refs, menuX, menuY]);

  // useOutsideClick(floatingRef as MutableRefObject<HTMLDivElement>, () => {
  //   handleCloseContextMenu();
  // });

  // Render the reference element at the fixed coordinates so Floating UI can compute
  // positions relative to the viewport and avoid ancestor clipping.
  // Convert wrapper-relative coordinates (x,y) to viewport coordinates so
  // the fixed-positioned reference lands at the click origin.
  let viewportX = x;
  let viewportY = y;
  if (typeof document !== "undefined") {
    const ganttWrapper = document.querySelector(
      '[data-testid="gantt"]'
    ) as HTMLElement | null;
    if (ganttWrapper) {
      const rect = ganttWrapper.getBoundingClientRect();
      viewportX = rect.left + x;
      viewportY = rect.top + y;
    }
  }

  const referenceNode = (
    <div
      {...getReferenceProps()}
      style={{
        position: "fixed",
        left: viewportX,
        top: viewportY,
        zIndex: 1,
        pointerEvents: "none",
      }}
      ref={setReference}
    />
  );

  const menuNode = (
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
        // Allow the menu to scroll if it would otherwise overflow the viewport
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
        overflowX: "hidden",
        gap: 6,
        zIndex: 10000,
        pointerEvents: "auto",
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
  );

  return (
    <>
      {referenceNode}
      {task && typeof document !== "undefined"
        ? createPortal(menuNode, document.body)
        : task && menuNode}
    </>
  );
}
