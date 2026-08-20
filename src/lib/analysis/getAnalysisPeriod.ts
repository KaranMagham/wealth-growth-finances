import {
  ANALYSIS_PERIOD_KEYS,
  type AnalysisPeriod,
  type AnalysisPeriodKey,
} from "./analysisTypes";

export class AnalysisPeriodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisPeriodError";
  }
}

function createUtcDate(
  year: number,
  monthIndex: number,
  day: number
) {
  return new Date(
    Date.UTC(year, monthIndex, day, 0, 0, 0, 0)
  );
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function parseDateInput(
  value: string | null,
  fieldName: string
) {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new AnalysisPeriodError(
      `${fieldName} must use YYYY-MM-DD format.`
    );
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    formatDate(date) !== value
  ) {
    throw new AnalysisPeriodError(
      `${fieldName} is not a valid date.`
    );
  }

  return date;
}

function createPeriod(
  key: AnalysisPeriodKey,
  label: string,
  start: Date,
  endExclusive: Date
): AnalysisPeriod {
  const finalDay = new Date(
    endExclusive.getTime() - 1
  );

  return {
    key,
    label,
    from: formatDate(start),
    to: formatDate(finalDay),
    start,
    endExclusive,
  };
}

export function getAnalysisPeriod(
  periodValue: string | null,
  fromValue: string | null,
  toValue: string | null,
  now = new Date()
): AnalysisPeriod {
  const key =
    (periodValue || "this-month") as AnalysisPeriodKey;

  if (!ANALYSIS_PERIOD_KEYS.includes(key)) {
    throw new AnalysisPeriodError(
      "Invalid analysis period."
    );
  }

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  if (key === "this-month") {
    const start = createUtcDate(year, month, 1);
    const endExclusive = createUtcDate(
      year,
      month + 1,
      1
    );

    return createPeriod(
      key,
      "This Month",
      start,
      endExclusive
    );
  }

  if (key === "last-3-months") {
    const start = createUtcDate(year, month - 2, 1);
    const endExclusive = createUtcDate(
      year,
      month + 1,
      1
    );

    return createPeriod(
      key,
      "Last 3 Months",
      start,
      endExclusive
    );
  }

  if (key === "last-6-months") {
    const start = createUtcDate(year, month - 5, 1);
    const endExclusive = createUtcDate(
      year,
      month + 1,
      1
    );

    return createPeriod(
      key,
      "Last 6 Months",
      start,
      endExclusive
    );
  }

  if (key === "this-year") {
    const start = createUtcDate(year, 0, 1);
    const endExclusive = createUtcDate(
      year + 1,
      0,
      1
    );

    return createPeriod(
      key,
      "This Year",
      start,
      endExclusive
    );
  }

  const start = parseDateInput(fromValue, "from");
  const end = parseDateInput(toValue, "to");

  if (end < start) {
    throw new AnalysisPeriodError(
      "The end date must be after the start date."
    );
  }

  const endExclusive = new Date(
    end.getTime() + 24 * 60 * 60 * 1000
  );

  return createPeriod(
    "custom",
    `${formatDate(start)} to ${formatDate(end)}`,
    start,
    endExclusive
  );
}

export function getMonthsInPeriod(
  period: AnalysisPeriod
) {
  const months: Array<{
    month: number;
    year: number;
    key: string;
    label: string;
  }> = [];

  const cursor = createUtcDate(
    period.start.getUTCFullYear(),
    period.start.getUTCMonth(),
    1
  );

  while (cursor < period.endExclusive) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;

    months.push({
      year,
      month,
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: formatMonthLabel(cursor),
    });

    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
}