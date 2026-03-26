import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Column } from "../../../types";
import styles from "./column-visibility-toggle.module.css";

interface ColumnVisibilityToggleProps {
  allColumns: readonly Column[];
  onColumnVisibilityChange?: (columnId: string, hidden: boolean) => void;
}

const ColumnsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 3.5h12M2 8h12M2 12.5h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M5 3.5v9M11 3.5v9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="1 2"
    />
  </svg>
);

const ColumnVisibilityToggleInner: React.FC<ColumnVisibilityToggleProps> = ({
  allColumns,
  onColumnVisibilityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleToggle = useCallback(
    (columnId: string, currentlyHidden: boolean) => {
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(columnId, !currentlyHidden);
      }
    },
    [onColumnVisibilityChange]
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: Event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Only show columns that have a title (action columns without titles are excluded)
  const toggleableColumns = allColumns.filter(col => col.title);

  if (toggleableColumns.length === 0) {
    return null;
  }

  return (
    <div className={styles.toggleWrapper} ref={wrapperRef}>
      <button
        className={styles.toggleButton}
        onClick={toggleDropdown}
        title="Toggle column visibility"
        type="button"
      >
        <ColumnsIcon />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownTitle}>Columns</div>
          <div className={styles.divider} />
          {toggleableColumns.map(column => {
            const isVisible = !column.hidden;
            return (
              <label
                key={column.id}
                className={styles.dropdownItem}
                onClick={e => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isVisible}
                  onChange={() => handleToggle(column.id, !!column.hidden)}
                />
                <span className={styles.columnLabel}>
                  {column.title || column.id}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ColumnVisibilityToggle = memo(ColumnVisibilityToggleInner);
