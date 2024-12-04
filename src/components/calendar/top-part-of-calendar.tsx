import React, { useEffect } from "react";
import type { ReactNode } from "react";

import styles from "./calendar.module.css";
import { useTranslation } from "react-i18next";

type TopPartOfCalendarProps = {
  value: ReactNode | null;
  x1Line: number;
  y1Line: number;
  y2Line: number;
  xText: number;
  yText: number;
};

export const TopPartOfCalendar: React.FC<TopPartOfCalendarProps> = ({
  value,
  x1Line,
  y1Line,
  y2Line,
  xText,
  yText,
}) => {
  const storedLanguage = JSON.parse(sessionStorage.getItem("language"));
  const { t, i18n } = useTranslation();
  useEffect(() => {
    if (storedLanguage) {
      const language = JSON.parse(storedLanguage);
      i18n.changeLanguage(language.locale.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedLanguage]);

  return (
    <g className="calendarTop">
      <line
        x1={x1Line}
        y1={y1Line}
        x2={x1Line}
        y2={y2Line}
        className={styles.calendarTopTick}
      />

      {value !== null && (
        <text y={yText - 4} x={xText} className={styles.calendarTopText}>
          {t(value.toString())}
        </text>
      )}
    </g>
  );
};
