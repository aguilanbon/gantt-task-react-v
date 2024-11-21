import { GanttTheme } from "../../types";

export const DEFAULT_THEME: GanttTheme = {
  rtl: false,
  shape: {
    borderRadius: "8px",
  },
  colors: {
    backgroundColor: "white",
    arrowColor: "#90A4AE",
    arrowRelationColor: "#90A4AE",
    arrowHoverColor: "#03A9F4",
    loadingPrimaryColor: "rgba(233, 30, 99, 1)",
    loadingSecondaryColor: "rgba(233, 30, 99, 0.3)",

    dividerColor: "#E0E0E0",
    primaryTextColor: "#555",
    secondaryTextColor: "#757575",
    hoverFilter: "inherit",
    // hoverFilter: "drop-shadow(0px 0px 2px rgba(0, 0, 0, .7))",

    calendarTodayColor: "rgba(233, 30, 99, 1)",
    calendarHolidayColor: "rgba(233, 233, 233, 0.3)",
    calendarStrokeColor: "#e0e0e0",
    scrollbarThumbColor: "#B0BEC5",

    tableHoverActionColor: "#03A9F4",
    tableActionColor: "#9E9E9E",
    tableDragIndicatorColor: "#9E9E9E",
    tableEvenBackgroundColor: "#f8f9fa",
    tableSelectedTaskBackgroundColor: "rgba(3, 169, 244, 0.2)",
    tableDragTaskBackgroundColor: "#fff",

    contextMenuBoxShadow:
      "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
    contextMenuBgColor: "var(--gantt-background-color)",
    contextMenuTextColor: "inherit",
    tooltipBoxShadow:
      "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",

    arrowCriticalColor: "#F44336",

    barComparisonDefaultColor: "#BDBDBD",
    barComparisonPlanColor: "#66BB6A",
    barComparisonWarningColor: "#FFA726",
    barComparisonCriticalColor: "#F44336",

    barBackgroundColor: "#BDBDBD",
    barBackgroundSelectedColor: "#9E9E9E",
    barBackgroundCriticalColor: "#757575",
    barBackgroundSelectedCriticalColor: "#616161",

    barProgressColor: "#a3a3ff",
    barHandleColor: "#ddd",
    barProgressCriticalColor: "#ff1919",
    barProgressSelectedColor: "#8282f5",
    barProgressSelectedCriticalColor: "#ff0000",

    groupProgressColor: "#66BB6A",
    groupProgressSelectedColor: "#388E3C",
    groupProgressCriticalColor: "#2E7D32",
    groupProgressSelectedCriticalColor: "#1B5E20",

    groupBackgroundColor: "#29B6F6",
    groupBackgroundSelectedColor: "#0288D1",
    groupBackgroundCriticalColor: "#0277BD",
    groupBackgroundSelectedCriticalColor: "#01579B",

    projectProgressColor: "#26C6DA",
    projectProgressSelectedColor: "#0097A7",
    projectProgressCriticalColor: "#00838F",
    projectProgressSelectedCriticalColor: "#006064",

    projectBackgroundColor: "#FFA726",
    projectBackgroundSelectedColor: "#F57C00",
    projectBackgroundCriticalColor: "#EF6C00",
    projectBackgroundSelectedCriticalColor: "#E65100",

    milestoneBackgroundColor: "#FF7043",
    milestoneBackgroundSelectedColor: "#E64A19",
    milestoneBackgroundCriticalColor: "#D84315",
    milestoneBackgroundSelectedCriticalColor: "#BF360C",
  },
  typography: {
    fontSize: "14px",
    fontFamily:
      "Roboto, Arial, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  },
  distances: {
    actionColumnWidth: 40,
    arrowIndent: 20,
    barCornerRadius: 3,
    barComparisonTaskHeight: 6,
    barComparisonTaskBorderHeight: 4,
    barComparisonTaskYOffset: 1,
    barFill: 50,
    columnWidth: 60,
    contextMenuIconWidth: 20,
    contextMenuOptionHeight: 25,
    contextMenuSidePadding: 10,
    dateCellWidth: 220,
    dependenciesCellWidth: 120,
    expandIconWidth: 20,
    handleWidth: 8,
    headerHeight: 50,
    ganttHeight: 600,
    minimumRowDisplayed: 4,
    nestedTaskNameOffset: 20,
    relationCircleOffset: 10,
    relationCircleRadius: 5,
    rowHeight: 64,
    titleCellWidth: 220,

    viewModeYearOffsetYears: 2,
    viewModeMonthOffsetMonths: 2,
    viewModeWeekOffsetWeeks: 2,
    viewModeDayOffsetDays: 2,
    viewModeHourOffsetHours: 66,
  },
  dateFormats: {
    dateColumnFormat: "E, d MMMM yyyy",
    dayBottomHeaderFormat: "E, d",
    dayTopHeaderFormat: "E, d",
    hourBottomHeaderFormat: "HH",
    monthBottomHeaderFormat: "LLL",
    monthTopHeaderFormat: "LLLL",
    weekBottomHeader: (_, weekNumber) => {
      if (weekNumber < 10) {
        return `W0${weekNumber}`;
      } else {
        return `W${weekNumber.toString()}`;
      }
    },
  },
};
