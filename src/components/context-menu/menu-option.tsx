import type { ReactElement } from "react";
import { MouseEvent, useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import type { ContextMenuOptionType, Distances } from "../../types";

import styles from "./menu-option.module.css";

type MenuOptionProps = {
  distances: Distances;
  handleAction: (option: ContextMenuOptionType) => void;
  option: ContextMenuOptionType;
  onClose?: () => void;
};

export function MenuOption(props: MenuOptionProps): ReactElement {
  const {
    onClose,
    distances: {
      contextMenuIconWidth,
      contextMenuOptionHeight,
      contextMenuSidePadding,
    },
    handleAction,
    option,
    option: { icon, label, disabled, children },
  } = props;

  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    parentWidth?: number;
  } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const nestedRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const onClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (disabled) {
        // ignore clicks on disabled options
        return;
      }

      // If this option has children, clicking shouldn't immediately trigger action.
      if (children && children.length > 0) {
        // let hover behavior handle showing submenu; do not close parent menu
        setHovered(true);
        return;
      }

      handleAction(option);
      onClose?.();
    },
    [onClose, handleAction, option, disabled, children]
  );

  useEffect(() => {
    if (!hovered || !nestedRef.current) return;

    const cssVars = [
      "--gantt-context-menu-bg-color",
      "--gantt-context-menu-box-shadow",
      "--gantt-shape-border-radius",
      "--gantt-font-family",
      "--gantt-font-size",
      "--gantt-context-menu-empty-color",
    ];

    // Read from the button element first, fallback to body
    const sourceEl =
      btnRef.current ||
      (typeof document !== "undefined" ? document.body : null);
    if (!sourceEl) return;

    const cs = getComputedStyle(sourceEl);
    cssVars.forEach(v => {
      const val = cs.getPropertyValue(v).trim();
      if (val) {
        nestedRef.current!.style.setProperty(v, val);
      }
    });
  }, [hovered, coords]);

  return (
    <div
      onMouseEnter={() => {
        // cancel pending close
        if (closeTimeoutRef.current) {
          window.clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setHovered(true);
        // compute coords for portaled submenu, prefer parent menu element so submenu
        // aligns and inherits CSS from the parent menu
        const rect = btnRef.current?.getBoundingClientRect();
        const parentMenu = btnRef.current?.closest(
          '[role="menu"]'
        ) as HTMLElement | null;
        const parentRect = parentMenu?.getBoundingClientRect() ?? null;
        if (rect) {
          setCoords({
            left: parentRect ? parentRect.right : rect.right,
            top: rect.top,
            parentWidth: parentRect ? Math.round(parentRect.width) : undefined,
          });
        }
      }}
      onMouseLeave={() => {
        // delay closing so pointer can move to portaled submenu
        closeTimeoutRef.current = window.setTimeout(() => {
          setHovered(false);
          setCoords(null);
          closeTimeoutRef.current = null;
        }, 200) as unknown as number;
      }}
      style={{ position: "relative", width: "100%" }}
    >
      <button
        className={styles.menuOption}
        aria-disabled={disabled}
        disabled={disabled}
        style={{
          height: contextMenuOptionHeight,
          paddingLeft: contextMenuSidePadding,
          paddingRight: contextMenuSidePadding,
          color: "var(--gantt-context-menu-text-color)",
        }}
        onClick={onClick}
        ref={btnRef}
      >
        <div
          className={styles.icon}
          style={{
            width: contextMenuIconWidth,
            color: "var(--gantt-context-menu-text-color)",
            opacity: disabled ? 0.3 : 0.5,
          }}
        >
          {icon}
        </div>

        <div className={styles.label}>{label}</div>
        {children && children.length > 0 && (
          <div
            style={{
              marginLeft: 8,
              opacity: 0.6,
              pointerEvents: "none",
            }}
          >
            {/* simple chevron indicating submenu */}
            <span style={{ fontSize: "14px" }}>▶</span>
          </div>
        )}
      </button>

      {/* Nested submenu */}
      {children &&
        children.length > 0 &&
        hovered &&
        typeof document !== "undefined" &&
        coords &&
        createPortal(
          <div
            role="menu"
            ref={nestedRef}
            onMouseEnter={() => {
              if (closeTimeoutRef.current) {
                window.clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setHovered(true);
            }}
            onMouseLeave={() => {
              // small delay so quick mouse movements don't immediately close the menu
              closeTimeoutRef.current = window.setTimeout(() => {
                setHovered(false);
                setCoords(null);
                closeTimeoutRef.current = null;
              }, 200) as unknown as number;
            }}
            style={{
              position: "fixed",
              // place submenu just to the right of parent menu
              left: (coords.left ?? 0) + 8,
              top: coords.top,
              // match the parent menu container look & behavior
              backgroundColor: "var(--gantt-context-menu-bg-color)",
              boxShadow: "var(--gantt-context-menu-box-shadow)",
              borderRadius: "var(--gantt-shape-border-radius)",
              fontFamily: "var(--gantt-font-family)",
              display: "flex",
              flexDirection: "column",
              width: "max-content",
              minWidth: coords && coords.parentWidth ? coords.parentWidth : 140,
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
              overflowX: "hidden",
              gap: 6,
              zIndex: 10000,
              pointerEvents: "auto",
            }}
          >
            {children.map((child, index) => (
              <MenuOption
                key={index}
                distances={props.distances}
                handleAction={handleAction}
                option={child}
                onClose={onClose}
              />
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
