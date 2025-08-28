import React, { useState } from "react";
import { ViewMode, Task } from "../src";
import { Gantt } from "../src";

const data: Task[] = [
  {
    start: new Date(2023, 0, 1),
    end: new Date(2023, 0, 3),
    name: "Task 1",
    id: "1",
    type: "task" as const,
    progress: 45,
    isDisabled: false,
    dependencies: [],
    assignees: [],
    style: {},
    comparisonDates: {
      // comparison finished earlier than main task
      start: new Date(2022, 11, 31),
      end: new Date(2023, 0, 2),
    },
  },
  {
    start: new Date(2023, 0, 4),
    end: new Date(2023, 0, 8),
    name: "Task 2",
    id: "2",
    type: "task" as const,
    progress: 25,
    isDisabled: false,
    dependencies: [
      {
        sourceId: "1",
        sourceTarget: "endOfTask" as const,
        ownTarget: "startOfTask" as const,
      },
    ],
    assignees: [],
    style: {},
    comparisonDates: {
      // comparison aligns with main task (plan)
      start: new Date(2023, 0, 4),
      end: new Date(2023, 0, 7),
    },
  },
  {
    start: new Date(2023, 0, 9),
    end: new Date(2023, 0, 12),
    name: "Task 3",
    id: "3",
    type: "task" as const,
    progress: 10,
    isDisabled: false,
    dependencies: [
      {
        sourceId: "2",
        sourceTarget: "endOfTask" as const,
        ownTarget: "startOfTask" as const,
      },
    ],
    assignees: [],
    style: {},
    comparisonDates: {
      // comparison ends after main task (warning)
      start: new Date(2023, 0, 11),
      end: new Date(2023, 0, 13),
    },
  },
  {
    start: new Date(2023, 0, 13),
    end: new Date(2023, 0, 15),
    name: "Task 4",
    id: "4",
    type: "task" as const,
    progress: 80,
    isDisabled: false,
    dependencies: [
      {
        sourceId: "3",
        sourceTarget: "endOfTask" as const,
        ownTarget: "startOfTask" as const,
      },
    ],
    assignees: [],
    style: {},
    comparisonDates: {
      // in-progress comparison (no end yet)
      start: new Date(2023, 0, 14),
      end: null,
    },
  },
  {
    start: new Date(2023, 0, 16),
    end: new Date(2023, 0, 18),
    name: "Task 5",
    id: "5",
    type: "task" as const,
    progress: 90,
    isDisabled: false,
    dependencies: [
      {
        sourceId: "4",
        sourceTarget: "endOfTask" as const,
        ownTarget: "startOfTask" as const,
      },
    ],
    assignees: [],
    style: {},
    comparisonDates: {
      // comparison that slightly exceeds the main task
      start: new Date(2023, 0, 16),
      end: new Date(2023, 0, 19),
    },
  },
];

// Generate more tasks for scrolling demonstration
const generateMoreTasks = (): Task[] => {
  const moreTasks: Task[] = [];
  for (let i = 6; i <= 50; i++) {
    const startDay = Math.floor(i / 5) + 10; // Spread tasks across more days
    const taskStart = new Date(2023, 0, startDay);
    const taskEnd = new Date(
      2023,
      0,
      startDay + Math.floor(Math.random() * 5) + 1
    );

    // Randomly add comparison dates to some generated tasks to demo comparison bars
    const addComparison = Math.random() < 0.25;
    const comparisonDates = addComparison
      ? {
          start: new Date(2023, 0, startDay - Math.floor(Math.random() * 3)),
          end:
            Math.random() < 0.2
              ? null
              : new Date(2023, 0, startDay + Math.floor(Math.random() * 4) + 1),
        }
      : undefined;

    moreTasks.push({
      start: taskStart,
      end: taskEnd,
      name: `Task ${i}`,
      id: `${i}`,
      type: "task" as const,
      progress: Math.floor(Math.random() * 100),
      isDisabled: false,
      dependencies: [],
      assignees: [],
      style: {},
      ...(comparisonDates ? { comparisonDates } : {}),
    });
  }
  return moreTasks;
};

export const FlexibleHeight = () => {
  const [containerHeight, setContainerHeight] = useState(400);
  const [allTasks] = useState([...data, ...generateMoreTasks()]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Flexible Height Gantt Chart Demo</h2>
      <p>
        This demonstrates how the Gantt chart adapts to different container
        heights.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Container Height:
          <input
            type="range"
            min="200"
            max="800"
            value={containerHeight}
            onChange={e => setContainerHeight(Number(e.target.value))}
            style={{ marginLeft: "10px", marginRight: "10px" }}
          />
          {containerHeight}px
        </label>
      </div>

      <div
        style={{
          height: containerHeight,
          border: "2px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Gantt tasks={allTasks} viewMode={ViewMode.Day} rowHeight={50} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>✅ Gantt chart adapts to container height</li>
          <li>✅ Vertical scrollbar appears when content overflows</li>
          <li>✅ Horizontal scrollbar for wide content</li>
          <li>✅ Responsive behavior when container size changes</li>
          <li>✅ Maintains proper aspect ratios</li>
        </ul>
      </div>
    </div>
  );
};
