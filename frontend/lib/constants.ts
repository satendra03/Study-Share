// ─────────────────────────────────────────────────────────────
// Shared constants used across the app:
//   • Complete Profile page (student registration)
//   • Dashboard filters
//   • Upload form
//   • Admin page (future)
//
// Keep this file as the SINGLE SOURCE OF TRUTH so every
// dropdown / filter stays consistent.
// ─────────────────────────────────────────────────────────────

/** Semester options (1–8) */
export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

/** Branch / department options */
export const BRANCHES = [
  "CSE",
  "IT",
  "AI",
  "ECE",
  "ME",
  "CE",
  "EE",
  "MT",
  "IP"
] as const;

/** Academic year options (generated dynamically, most recent first) */
export const YEARS = (() => {
  const current = new Date().getFullYear();
  const list: string[] = [];
  for (let y = current; y >= current - 5; y--) {
    list.push(y.toString());
  }
  return list;
})();

/** Material file-type options */
export const FILE_TYPES = [
  { value: "Other", label: "Other Material (Notes, Books, etc)" },
  { value: "PYQ", label: "PYQ (Previous Year Question Paper)" },
] as const;

// ── Helper mappers for <FilterDropdown /> / <select> ────────

export const semesterOptions = SEMESTERS.map((s) => ({
  value: s,
  label: `Sem ${s}`,
}));

export const branchOptions = BRANCHES.map((b) => ({
  value: b,
  label: b,
}));

export const yearOptions = YEARS.map((y) => ({
  value: y,
  label: y,
}));