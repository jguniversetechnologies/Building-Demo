"use client";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function yearOptions(selectedYear: string) {
  const now = new Date().getFullYear();
  const set = new Set<string>();
  for (let y = now - 3; y <= now + 2; y++) set.add(String(y));
  if (/^\d{4}$/.test(selectedYear)) set.add(selectedYear);
  // Demo seed months often sit in 2025 even when the machine clock is later.
  set.add("2025");
  set.add("2026");
  return [...set].sort();
}

function parseYm(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return { year: String(new Date().getFullYear()), month: "01" };
  }
  const [year, month] = value.split("-");
  return { year, month };
}

export function MonthYearPicker({
  value,
  onChange,
  yearLabel = "Year",
  monthLabel = "Month",
  className = "",
}: {
  value: string;
  onChange: (ym: string) => void;
  yearLabel?: string;
  monthLabel?: string;
  className?: string;
}) {
  const { year, month } = parseYm(value);
  const years = yearOptions(year);

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">
          {yearLabel}
        </label>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={year}
          onChange={(e) => onChange(`${e.target.value}-${month}`)}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">
          {monthLabel}
        </label>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={month}
          onChange={(e) => onChange(`${year}-${e.target.value}`)}
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
