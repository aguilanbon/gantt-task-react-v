# gantt-task-react-v

Interactive Gantt Chart for React with TypeScript.

## Install

```bash
npm install gantt-task-react-v
```

## Quick Start

```tsx
import { Gantt, Task, ViewMode } from "gantt-task-react-v";
import "gantt-task-react-v/dist/style.css";

const tasks: Task[] = [
  {
    id: "task-1",
    type: "task",
    name: "Design",
    start: new Date(2026, 0, 1),
    end: new Date(2026, 0, 10),
    progress: 60,
    assignees: ["Alice"],
  },
  {
    id: "task-2",
    type: "task",
    name: "Development",
    start: new Date(2026, 0, 11),
    end: new Date(2026, 1, 15),
    progress: 20,
    dependencies: [
      {
        sourceId: "task-1",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask",
      },
    ],
    assignees: ["Bob", "Carol"],
  },
  {
    id: "milestone-1",
    type: "milestone",
    name: "MVP Release",
    start: new Date(2026, 1, 15),
    end: new Date(2026, 1, 15),
    progress: 0,
    dependencies: [
      {
        sourceId: "task-2",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask",
      },
    ],
  },
];

function App() {
  return <Gantt tasks={tasks} viewMode={ViewMode.Day} />;
}
```

## Core Features

### 1. Task List (WBS)

Hierarchical work breakdown structure with expand/collapse, nested numbering, drag-and-drop reordering, and resizable columns.

```tsx
<Gantt
  tasks={tasks}
  taskList={{
    isShowTaskNumbers: true,
    canReorderTasks: true,
    canResizeColumns: true,
    canToggleColumns: true,
  }}
/>
```

### 2. Timeline

Horizontal time scale supporting multiple view modes.

```tsx
<Gantt tasks={tasks} viewMode={ViewMode.Week} viewDate={new Date()} />
```

**ViewMode values:** `Hour`, `QuarterDay`, `HalfDay`, `Day`, `Week`, `Month`, `Year`

### 3. Task Bars

Bars represent duration and are drag-resizable. Hold **Ctrl** to show start/end drag handles.

Progress is displayed as a filled overlay with a percentage label on the bar. The progress drag handle allows interactive editing.

```tsx
<Gantt
  tasks={tasks}
  showProgress={true}
  progressColor="#4dabf7"
  taskBar={{
    isProgressChangeable: task => !task.isDisabled,
    isDateChangeable: task => !task.isDisabled,
    allowMoveTaskBar: (action, task) => true,
  }}
/>
```

### 4. Dependencies (Arrows)

Arrows link tasks to define execution order. Supports four relation kinds.

```tsx
<Gantt
  tasks={tasks}
  authorizedRelations={["endToStart", "startToStart", "endToEnd", "startToEnd"]}
  taskBar={{
    isRelationChangeable: task => true,
    isDeleteDependencyOnDoubleClick: true,
    onArrowDoubleClick: (taskFrom, taskTo, event) => {
      /* handle */
    },
    onArrowClick: (taskFrom, taskTo) => {
      /* handle */
    },
  }}
/>
```

**RelationKind values:** `"startToStart"`, `"startToEnd"`, `"endToStart"`, `"endToEnd"`

### 5. Milestones

Rendered as diamonds. Set `type: "milestone"` on a task.

```tsx
const milestone: Task = {
  id: "m1",
  type: "milestone",
  name: "Go-Live",
  start: new Date(2026, 3, 1),
  end: new Date(2026, 3, 1),
  progress: 0,
};
```

### 6. Progress Tracking

Progress is shown as a filled bar overlay with a percentage label. Tasks have a `progress` field (0–100). The progress drag handle is enabled when `isProgressChangeable` returns true.

```tsx
<Gantt
  tasks={tasks}
  showProgress={true}
  taskBar={{ isProgressChangeable: task => !task.isDisabled }}
/>
```

### 7. Resource Allocation (Assignees)

Tasks support an `assignees` field. Use the built-in `AssigneesColumn` via the columns builder.

```tsx
import { Gantt, useTaskListColumnsBuilder } from "gantt-task-react-v";

function App() {
  const {
    createNameColumn,
    createStartDateColumn,
    createEndDateColumn,
    createAssigneesColumn,
  } = useTaskListColumnsBuilder();

  const columns = [
    createNameColumn("Name", 200),
    createStartDateColumn("Start", 100),
    createEndDateColumn("End", 100),
    createAssigneesColumn("Assignees", 150),
  ];

  return <Gantt tasks={tasks} columns={columns} />;
}
```

### 8. Critical Path

Highlight the longest chain of dependent tasks that determines project duration.

```tsx
<Gantt tasks={tasks} taskBar={{ isShowCriticalPath: true }} />
```

### 9. Today Line & Data Date Line

Vertical markers for the current date and a custom data date.

```tsx
<Gantt
  tasks={tasks}
  showTodayLine={true}
  todayColor="#ff6b6b"
  todayLabel="Today"
  showDataDateLine={true}
  dataDate={new Date(2026, 2, 15)}
  dataDateColor="#4dabf7"
  dataDateLabel="Data Date"
/>
```

---

## Drawer Panel

A slide-in panel for viewing task/arrow details with built-in "Go to" navigation.

```tsx
<Gantt
  tasks={tasks}
  drawer={{
    enableDrawer: true,
    drawerWidth: 400,
    renderDrawerContent: (data, goToTask) => {
      if (data.type === "task") {
        return (
          <div>
            <h3>{data.task.name}</h3>
            <p>Progress: {data.task.progress}%</p>
            {data.task.dependencies?.map(dep => (
              <button key={dep.sourceId} onClick={() => goToTask(dep.sourceId)}>
                Go to {dep.sourceId}
              </button>
            ))}
          </div>
        );
      }
      if (data.type === "arrow") {
        return (
          <div>
            <button onClick={() => goToTask(data.taskFrom.id)}>
              Go to {data.taskFrom.name}
            </button>
            <button onClick={() => goToTask(data.taskTo.id)}>
              Go to {data.taskTo.name}
            </button>
          </div>
        );
      }
      return null;
    },
  }}
/>
```

The `goToTask(taskId)` function scrolls both horizontally and vertically to center the target task and selects it. Built-in "Go to" buttons also appear automatically in the drawer header for arrow-type panels and task-type panels.

## Scroll To Task

Programmatically scroll to and select any task by id.

```tsx
const [targetId, setTargetId] = useState<string | undefined>();

<Gantt tasks={tasks} scrollToTaskId={targetId} />
<button onClick={() => setTargetId("task-2")}>Go to Task 2</button>
```

---

## Task List Callbacks

Row click and double-click callbacks are inside the `taskList` prop.

```tsx
<Gantt
  tasks={tasks}
  taskList={{
    onClickTaskRow: task => console.log("Clicked:", task.id),
    onDoubleClickTaskRow: task => console.log("Double-clicked:", task.id),
  }}
/>
```

---

## Custom Columns

Build columns with the hook or provide fully custom ones.

```tsx
import {
  Gantt,
  useTaskListColumnsBuilder,
  Column,
  ColumnProps,
} from "gantt-task-react-v";

// Custom column component
const ProgressColumn: React.FC<ColumnProps> = ({ data: { task } }) => {
  if (task.type === "empty") return null;
  return <>{task.progress}%</>;
};

function App() {
  const { createNameColumn, createDeleteActionColumn, createEditActionColumn } =
    useTaskListColumnsBuilder();

  const columns: Column[] = [
    createNameColumn("Task", 200),
    { id: "progress", component: ProgressColumn, width: 80, title: "Progress" },
    createEditActionColumn(40),
    createDeleteActionColumn(40),
  ];

  return <Gantt tasks={tasks} columns={columns} />;
}
```

### Column Pinning

Pin columns so they stay visible while scrolling.

```tsx
const columns: Column[] = [
  { ...createNameColumn("Task", 200), pinned: "left" },
  createStartDateColumn("Start", 100),
  createEndDateColumn("End", 100),
  { ...createDeleteActionColumn(40), pinned: "right" },
];
```

### Column Visibility

Columns can be hidden and toggled by the user.

```tsx
<Gantt
  tasks={tasks}
  columns={[
    createNameColumn("Task", 200),
    { ...createStartDateColumn("Start"), hidden: true },
  ]}
  taskList={{
    canToggleColumns: true,
    onColumnVisibilityChange: columns => console.log(columns),
  }}
/>
```

### Built-in Columns Builder Methods

| Method                                    | Description                    |
| ----------------------------------------- | ------------------------------ |
| `createNameColumn(title, width?)`         | Task name with expand/collapse |
| `createStartDateColumn(title, width?)`    | Start date                     |
| `createEndDateColumn(title, width?)`      | End date                       |
| `createDependenciesColumn(title, width?)` | Dependency names               |
| `createAssigneesColumn(title, width?)`    | Assignees list                 |
| `createEditActionColumn(width?)`          | Edit button                    |
| `createDeleteActionColumn(width?)`        | Delete button                  |
| `createAddActionColumn(width?)`           | Add task button                |

---

## Context Menu

Right-click context menus for the task list and chart area.

```tsx
import {
  Gantt,
  createCopyOption,
  createCutOption,
  createPasteOption,
  createDeleteOption,
  createEditOption,
} from "gantt-task-react-v";

<Gantt
  tasks={tasks}
  taskList={{
    enableTableListContextMenu: 1, // right-click trigger
    contextMenuOptions: [
      createEditOption(),
      createCopyOption(),
      createCutOption(),
      createPasteOption(),
      createDeleteOption(),
    ],
  }}
  onRowContextMenu={task => console.log("Right-clicked:", task.id)}
/>;
```

---

## Theming

Customize colors, typography, shapes, distances, and date formats.

```tsx
<Gantt
  tasks={tasks}
  theme={{
    rtl: false,
    colors: {
      barProgressColor: "#4dabf7",
      barBackgroundColor: "#e3f2fd",
      barBackgroundSelectedColor: "#bbdefb",
      milestoneBackgroundColor: "#7c4dff",
      arrowColor: "#90a4ae",
      calendarTodayColor: "#ff6b6b",
      tableSelectedTaskBackgroundColor: "#e3f2fd",
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "13px",
    },
    shape: {
      borderRadius: "4px",
    },
    distances: {
      rowHeight: 40,
    },
    dateFormats: {
      dateColumnFormat: "dd/MM/yyyy",
    },
  }}
/>
```

### Color Reference

| Group          | Keys                                                                                                                                                                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bar**        | `barProgressColor`, `barProgressCriticalColor`, `barProgressSelectedColor`, `barProgressSelectedCriticalColor`, `barBackgroundColor`, `barBackgroundCriticalColor`, `barBackgroundSelectedColor`, `barBackgroundSelectedCriticalColor`, `barHandleColor`               |
| **Group**      | `groupProgressColor`, `groupProgressCriticalColor`, `groupProgressSelectedColor`, `groupProgressSelectedCriticalColor`, `groupBackgroundColor`, `groupBackgroundCriticalColor`, `groupBackgroundSelectedColor`, `groupBackgroundSelectedCriticalColor`                 |
| **Project**    | `projectProgressColor`, `projectProgressCriticalColor`, `projectProgressSelectedColor`, `projectProgressSelectedCriticalColor`, `projectBackgroundColor`, `projectBackgroundCriticalColor`, `projectBackgroundSelectedColor`, `projectBackgroundSelectedCriticalColor` |
| **Milestone**  | `milestoneBackgroundColor`, `milestoneBackgroundCriticalColor`, `milestoneBackgroundSelectedColor`, `milestoneBackgroundSelectedCriticalColor`                                                                                                                         |
| **Comparison** | `barComparisonDefaultColor`, `barComparisonPlanColor`, `barComparisonWarningColor`, `barComparisonCriticalColor`                                                                                                                                                       |
| **Arrow**      | `arrowColor`, `arrowCriticalColor`, `arrowRelationColor`, `arrowHoverColor`                                                                                                                                                                                            |
| **Calendar**   | `calendarHolidayColor`, `calendarTodayColor`, `calendarStrokeColor`                                                                                                                                                                                                    |
| **Table**      | `tableDragTaskBackgroundColor`, `tableSelectedTaskBackgroundColor`, `tableActionColor`, `tableDragIndicatorColor`, `tableHoverActionColor`, `tableEvenBackgroundColor`                                                                                                 |
| **UI**         | `backgroundColor`, `dividerColor`, `hoverFilter`, `loadingPrimaryColor`, `loadingSecondaryColor`, `contextMenuBoxShadow`, `contextMenuBgColor`, `contextMenuTextColor`, `tooltipBoxShadow`, `scrollbarThumbColor`, `primaryTextColor`, `secondaryTextColor`            |

---

## Locale

```tsx
import { Gantt, GanttLocale } from "gantt-task-react-v";
import { enUS } from "date-fns/locale";

const locale: GanttLocale = {
  dateLocale: enUS,
  suffix: { days: "days" },
  tooltip: { duration: "Duration", progress: "Progress" },
  table: {
    columns: {
      name: "Task",
      startDate: "Start",
      endDate: "End",
      dependencies: "Dependencies",
      progress: "Progress",
    },
  },
  context: {
    edit: "Edit",
    copy: "Copy",
    cut: "Cut",
    paste: "Paste",
    delete: "Delete",
  },
};

<Gantt tasks={tasks} locale={locale} />;
```

---

## Task Lifecycle Callbacks

```tsx
<Gantt
  tasks={tasks}
  onCommitTasks={async (nextTasks, action) => {
    // Persist changes — return { tasks } to confirm or throw to revert
    await saveTasks(nextTasks);
    return {};
  }}
  onAddTaskAction={async parentTask => {
    // Return new task data or null to cancel
    return {
      id: "new-1",
      type: "task",
      name: "New",
      start: new Date(),
      end: new Date(),
      progress: 0,
    };
  }}
  onEditTaskAction={async task => {
    // Return edited task or null to cancel
    return { ...task, name: "Edited" };
  }}
  onSelectTaskIds={ids => console.log("Selected:", ids)}
/>
```

---

## Comparison Mode

Overlay plan vs actual dates by providing `comparisonDates` on tasks.

```tsx
const tasks: Task[] = [
  {
    id: "1",
    type: "task",
    name: "Feature A",
    start: new Date(2026, 0, 5), // actual
    end: new Date(2026, 0, 20),
    progress: 50,
    comparisonDates: {
      start: new Date(2026, 0, 1), // planned
      end: new Date(2026, 0, 15),
    },
  },
];

<Gantt tasks={tasks} comparisonLevels={2} />;
```

---

## Full API Reference

### GanttProps

| Prop                              | Type                                    | Default       | Description                     |
| --------------------------------- | --------------------------------------- | ------------- | ------------------------------- |
| `tasks`                           | `RenderTask[]`                          | **required**  | Array of tasks to display       |
| `viewMode`                        | `ViewMode`                              | `Day`         | Time scale                      |
| `viewDate`                        | `Date`                                  | —             | Scroll to this date on mount    |
| `columns`                         | `Column[]`                              | —             | Custom table columns            |
| `language`                        | `string`                                | —             | Language code                   |
| `locale`                          | `GanttLocale`                           | English       | Localization strings            |
| `theme`                           | `GanttPartialTheme`                     | —             | Theme overrides                 |
| `taskBar`                         | `GanttTaskBarProps`                     | —             | Chart bar options               |
| `taskList`                        | `GanttTaskListProps`                    | —             | Task list options               |
| `drawer`                          | `GanttDrawerProps`                      | —             | Drawer panel options            |
| `authorizedRelations`             | `RelationKind[]`                        | all four      | Allowed dependency types        |
| `timeStep`                        | `number`                                | `300000`      | Snap interval in ms             |
| `comparisonLevels`                | `number`                                | `1`           | Number of comparison levels     |
| `rowHeight`                       | `number`                                | theme default | Row height in pixels            |
| `showTodayLine`                   | `boolean`                               | `true`        | Show today marker               |
| `showDataDateLine`                | `boolean`                               | `false`       | Show data-date marker           |
| `dataDate`                        | `Date \| null`                          | `null`        | Data date value                 |
| `todayColor`                      | `string`                                | theme default | Today line color                |
| `dataDateColor`                   | `string`                                | theme default | Data date line color            |
| `todayLabel`                      | `string`                                | `"Today"`     | Today marker label              |
| `dataDateLabel`                   | `string`                                | `"Data Date"` | Data date marker label          |
| `showProgress`                    | `boolean`                               | `true`        | Show progress fill on bars      |
| `progressColor`                   | `string`                                | theme default | Custom progress color           |
| `scrollToTaskId`                  | `TaskId`                                | —             | Scroll to and select this task  |
| `isMoveChildsWithParent`          | `boolean`                               | `true`        | Move children when parent moves |
| `isUpdateDisabledParentsOnChange` | `boolean`                               | `true`        | Recompute parents on commit     |
| `isUnknownDates`                  | `boolean`                               | `false`       | Show offsets instead of dates   |
| `isAdjustToWorkingDates`          | `boolean`                               | `true`        | Snap to working days            |
| `checkIsHoliday`                  | `CheckIsHoliday`                        | —             | Holiday check function          |
| `getCopiedTaskId`                 | `GetCopiedTaskId`                       | —             | ID generator for paste          |
| `roundStartDate`                  | `(date, viewMode) => Date`              | —             | Round start after drag          |
| `roundEndDate`                    | `(date, viewMode) => Date`              | —             | Round end after drag            |
| `onCommitTasks`                   | `OnCommitTasks`                         | —             | Task change callback            |
| `onAddTaskAction`                 | `(task) => Promise<RenderTask \| null>` | —             | Add task handler                |
| `onEditTaskAction`                | `(task) => Promise<RenderTask \| null>` | —             | Edit task handler               |
| `onSelectTaskIds`                 | `(ids: TaskId[]) => void`               | —             | Selection change                |
| `onWheel`                         | `(event: WheelEvent) => void`           | —             | Wheel event                     |
| `onRowContextMenu`                | `(task: RenderTask) => void`            | —             | Row right-click                 |

### Task

| Field             | Type                                 | Description                   |
| ----------------- | ------------------------------------ | ----------------------------- |
| `id`              | `string`                             | Unique identifier             |
| `type`            | `"task" \| "milestone" \| "project"` | Task type                     |
| `name`            | `string`                             | Display name                  |
| `start`           | `Date`                               | Start date                    |
| `end`             | `Date`                               | End date                      |
| `progress`        | `number`                             | Completion percentage (0–100) |
| `assignees`       | `string[]`                           | Assigned resources            |
| `parent`          | `string`                             | Parent task id for hierarchy  |
| `dependencies`    | `Dependency[]`                       | Task dependencies             |
| `comparisonDates` | `{ start, end }`                     | Plan dates for comparison     |
| `hideChildren`    | `boolean`                            | Collapse children             |
| `isDisabled`      | `boolean`                            | Disable interactions          |
| `displayOrder`    | `number`                             | Sort order                    |
| `comparisonLevel` | `number`                             | Comparison level index        |
| `style`           | `CSSProperties`                      | Custom bar styles             |
| `payload`         | `Record<string, string>`             | Custom data                   |

### GanttTaskListProps

| Prop                         | Type                             | Default      | Description                   |
| ---------------------------- | -------------------------------- | ------------ | ----------------------------- |
| `isShowTaskNumbers`          | `boolean`                        | `true`       | Show row numbers              |
| `canReorderTasks`            | `boolean`                        | `true`       | Enable drag reorder           |
| `canResizeColumns`           | `boolean`                        | `true`       | Enable column resize          |
| `canToggleColumns`           | `boolean`                        | `false`      | Show column visibility toggle |
| `allowReorderTask`           | `AllowReorderTask`               | `() => true` | Per-task reorder guard        |
| `enableTableListContextMenu` | `number`                         | `1`          | Context menu trigger          |
| `contextMenuOptions`         | `ContextMenuOptionType[]`        | —            | Menu options                  |
| `icons`                      | `Partial<GanttRenderIconsProps>` | —            | Custom icons                  |
| `onResizeColumn`             | `OnResizeColumn`                 | —            | Column resize callback        |
| `onColumnVisibilityChange`   | `OnColumnVisibilityChange`       | —            | Visibility change callback    |
| `tableBottom`                | `TableRenderBottomProps`         | —            | Footer render                 |
| `onClickTaskRow`             | `(task: RenderTask) => void`     | —            | Row click                     |
| `onDoubleClickTaskRow`       | `(task: RenderTask) => void`     | —            | Row double-click              |

### GanttTaskBarProps

| Prop                              | Type                         | Default            | Description                     |
| --------------------------------- | ---------------------------- | ------------------ | ------------------------------- |
| `isShowCriticalPath`              | `boolean`                    | `false`            | Show critical path              |
| `isProgressChangeable`            | `(task) => boolean`          | `!task.isDisabled` | Allow progress drag             |
| `isDateChangeable`                | `(task) => boolean`          | `!task.isDisabled` | Allow date drag                 |
| `isRelationChangeable`            | `(task) => boolean`          | —                  | Allow relation draw             |
| `isDeleteDependencyOnDoubleClick` | `boolean`                    | `true`             | Delete deps on dblclick         |
| `preStepsCount`                   | `number`                     | `1`                | Empty columns before first task |
| `allowMoveTaskBar`                | `(action, task) => boolean`  | —                  | Per-action move guard           |
| `renderBottomHeader`              | `RenderBottomHeader`         | —                  | Custom bottom header            |
| `renderTopHeader`                 | `RenderTopHeader`            | —                  | Custom top header               |
| `renderCustomLabel`               | `RenderCustomLabel`          | —                  | Custom bar label                |
| `TooltipContent`                  | `ComponentType<{ task }>`    | built-in           | Custom tooltip                  |
| `taskGanttContextMenuOption`      | `ContextMenuOptionType[]`    | —                  | Chart context menu              |
| `onClick`                         | `(task: RenderTask) => void` | —                  | Bar click                       |
| `onDoubleClick`                   | `(task: Task) => void`       | —                  | Bar double-click                |
| `onArrowClick`                    | `(from, to) => void`         | —                  | Arrow click                     |
| `onArrowDoubleClick`              | `OnArrowDoubleClick`         | —                  | Arrow double-click              |

### GanttDrawerProps

| Prop                  | Type                  | Default | Description             |
| --------------------- | --------------------- | ------- | ----------------------- |
| `enableDrawer`        | `boolean`             | `false` | Enable drawer panel     |
| `drawerWidth`         | `number`              | `360`   | Panel width in px       |
| `renderDrawerContent` | `RenderDrawerContent` | —       | Custom content renderer |

`RenderDrawerContent = (data: GanttDrawerData, goToTask: (taskId: string) => void) => ReactNode`

### Column

| Field       | Type                         | Description        |
| ----------- | ---------------------------- | ------------------ |
| `id`        | `string`                     | Unique column id   |
| `component` | `ComponentType<ColumnProps>` | Render component   |
| `width`     | `number`                     | Column width in px |
| `title`     | `ReactNode`                  | Header text        |
| `canResize` | `boolean`                    | Allow resize       |
| `pinned`    | `"left" \| "right"`          | Sticky pinning     |
| `hidden`    | `boolean`                    | Hide column        |

---

## Running Storybook

```bash
npm run storybook
```

## License

MIT
| barProgressColor | string | Specifies the taskbar progress fill color globally. |
| barProgressSelectedColor | string | Specifies the taskbar progress fill color globally on select. |
| barBackgroundColor | string | Specifies the taskbar background fill color globally. |
| barBackgroundSelectedColor | string | Specifies the taskbar background fill color globally on select. |
| arrowColor | string | Specifies the relationship arrow fill color. |
| arrowIndent | number | Specifies the relationship arrow right indent. Sets in px |
| todayColor | string | Specifies the current period column fill color. |
| TooltipContent | | Specifies the Tooltip view for selected taskbar. |
| TaskListHeader | | Specifies the task list Header view |
| TaskListTable | | Specifies the task list Table view |

- TooltipContent: [`React.FC<{ task: Task; fontSize: string; fontFamily: string; }>;`](https://github.com/MaTeMaTuK/gantt-task-react/blob/main/src/components/other/tooltip.tsx#L56)
- TaskListHeader: `React.FC<{ headerHeight: number; rowWidth: string; fontFamily: string; fontSize: string;}>;`
- TaskListTable: `React.FC<{ rowHeight: number; rowWidth: string; fontFamily: string; fontSize: string; locale: string; tasks: Task[]; selectedTaskId: string; setSelectedTask: (taskId: string) => void; }>;`

### Task

| Parameter Name | Type     | Description                                                                                           |
| :------------- | :------- | :---------------------------------------------------------------------------------------------------- |
| id\*           | string   | Task id.                                                                                              |
| name\*         | string   | Task display name.                                                                                    |
| type\*         | string   | Task display type: **task**, **milestone**, **project**                                               |
| start\*        | Date     | Task start date.                                                                                      |
| end\*          | Date     | Task end date.                                                                                        |
| progress\*     | number   | Task progress. Sets in percent from 0 to 100.                                                         |
| assignees\*    | string[] | List of people assigned to the task                                                                   |
| dependencies   | string[] | Specifies the parent dependencies ids.                                                                |
| styles         | object   | Specifies the taskbar styling settings locally. Object is passed with the following attributes:       |
|                |          | - **backgroundColor**: String. Specifies the taskbar background fill color locally.                   |
|                |          | - **backgroundSelectedColor**: String. Specifies the taskbar background fill color locally on select. |
|                |          | - **progressColor**: String. Specifies the taskbar progress fill color locally.                       |
|                |          | - **progressSelectedColor**: String. Specifies the taskbar progress fill color globally on select.    |
| isDisabled     | bool     | Disables all action for current task.                                                                 |
| fontSize       | string   | Specifies the taskbar font size locally.                                                              |
| project        | string   | Task project name                                                                                     |
| hideChildren   | bool     | Hide children items. Parameter works with project type only                                           |

\*Required

## License

[MIT](./LICENSE)
