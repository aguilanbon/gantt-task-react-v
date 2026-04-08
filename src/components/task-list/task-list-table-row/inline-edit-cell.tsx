import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ColumnEditType } from "../../../types";

import styles from "./inline-edit-cell.module.css";

export interface InlineEditCellProps {
  value: unknown;
  editType?: ColumnEditType;
  editOptions?: { value: string; label: string }[];
  onCommit: (value: unknown) => void;
  onCancel: () => void;
}

/**
 * Built-in inline editor rendered inside a table cell.
 * Supports text, number, date, and select types.
 */
export const InlineEditCell: React.FC<InlineEditCellProps> = ({
  value,
  editType = "text",
  editOptions,
  onCommit,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const [localValue, setLocalValue] = useState(() =>
    formatForInput(value, editType)
  );

  useEffect(() => {
    // Auto-focus + select all on mount
    const el = inputRef.current;
    if (el) {
      el.focus();
      if ("select" in el && editType !== "select") {
        (el as HTMLInputElement).select();
      }
    }
  }, [editType]);

  const commitValue = useCallback(() => {
    const parsed = parseFromInput(localValue, editType);
    onCommit(parsed);
  }, [localValue, editType, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitValue();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
      // Stop propagation so Gantt keyboard shortcuts don't fire while editing
      e.stopPropagation();
    },
    [commitValue, onCancel]
  );

  const handleBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  // Prevent row-level mousedown from deselecting / scrolling while editing
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (editType === "select") {
    return (
      <div className={styles.inlineEditWrapper} onMouseDown={stopPropagation}>
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          className={styles.inlineEditInput}
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        >
          {editOptions?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={styles.inlineEditWrapper} onMouseDown={stopPropagation}>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className={styles.inlineEditInput}
        type={
          editType === "number"
            ? "number"
            : editType === "date"
              ? "date"
              : "text"
        }
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
};

// --- helpers ----------------------------------------------------------------

function formatForInput(value: unknown, editType: ColumnEditType): string {
  if (value == null) return "";

  if (editType === "date") {
    if (value instanceof Date) {
      // Guard against Invalid Date
      return Number.isNaN(value.getTime())
        ? ""
        : value.toISOString().slice(0, 10);
    }
    if (typeof value === "number") {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    }
    if (typeof value === "string") {
      // Try parsing the string as a date first
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
      }
      return value.slice(0, 10);
    }
    return "";
  }

  if (editType === "number") {
    if (typeof value === "number") {
      return Number.isNaN(value) ? "" : String(value);
    }
    // If the value is a string that looks numeric, keep it as-is
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isNaN(n) ? value : String(n);
    }
    return String(value);
  }

  if (editType === "select") {
    // Coerce to string so it matches <option value="...">
    return String(value);
  }

  return String(value);
}

function parseFromInput(raw: string, editType: ColumnEditType): unknown {
  if (editType === "number") {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (editType === "date") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d;
  }
  return raw;
}
