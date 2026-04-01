import React from "react";

import { ColumnProps } from "../../../types";

export const AssigneesColumn: React.FC<ColumnProps> = ({ data: { task } }) => {
  if (task.type === "empty") {
    return null;
  }

  const assignees = task.assignees;
  if (!assignees || assignees.length === 0) {
    return null;
  }

  return <>{assignees.join(", ")}</>;
};
