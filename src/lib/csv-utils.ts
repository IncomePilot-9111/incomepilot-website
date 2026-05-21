/**
 * Pure CSV generation utilities for PolarisPilot data exports.
 *
 * All functions are pure, have no side effects, and return UTF-8 CSV strings.
 * Rows without data produce header-only CSVs (graceful empty state).
 */

// ─── Types (minimal row shapes, matching Supabase column names) ───────────────

export interface IncomeExportRow {
  entry_date:   string
  source:       string | null
  title:        string | null
  gross_amount: number | null
  net_amount:   number | null
  amount:       number | null
  platform:     string | null
  status:       string | null
  notes_text:   string | null
}

export interface ExpenseExportRow {
  expense_date: string
  amount:       number | null
  category:     string | null
  item_name:    string | null
  title:        string | null
  status:       string | null
  notes_text:   string | null
}

export interface GoalExportRow {
  title:        string | null
  target_amount: number | null
  current_amount: number | null
  is_active:    boolean | null
  status:       string | null
  module_type:  string | null
  start_date:   string | null
  end_date:     string | null
  target_date:  string | null
  completed_at: string | null
  created_at:   string | null
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Escape a value for a CSV cell.
 *
 * Two-step protection:
 *   1. Formula injection: values starting with = + - @ (or whitespace variants
 *      like tab/CR that precede a formula trigger) are prefixed with an
 *      apostrophe so spreadsheet apps (Excel, LibreOffice, Google Sheets)
 *      treat the cell as plain text rather than executing a formula.
 *      Ref: https://owasp.org/www-community/attacks/CSV_Injection
 *   2. RFC 4180 quoting: wrap in double-quotes when the value contains a
 *      comma, double-quote, newline, or carriage-return; escape internal
 *      double-quotes by doubling them.
 */
export function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = String(val)

  // Neutralise spreadsheet formula injection triggers.
  // Prefixing with ' causes Excel/Sheets to treat the cell as a text literal.
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str

  if (safe.includes(',') || safe.includes('"') || safe.includes('\n') || safe.includes('\r')) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

function buildCSV(headers: string[], rows: Record<string, unknown>[]): string {
  const lines: string[] = [headers.map(escapeCSV).join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => escapeCSV(row[h])).join(','))
  }
  return lines.join('\n')
}

// ─── Public generators ────────────────────────────────────────────────────────

/** Income entries CSV. Empty rows produce header-only output. */
export function incomeToCSV(rows: IncomeExportRow[]): string {
  const HEADERS = [
    'Date', 'Source', 'Platform', 'Title',
    'Gross Amount (AUD)', 'Net Amount (AUD)', 'Status', 'Notes',
  ]
  const data = rows.map(r => ({
    'Date':               r.entry_date,
    'Source':             r.source        ?? '',
    'Platform':           r.platform      ?? '',
    'Title':              r.title         ?? '',
    'Gross Amount (AUD)': r.gross_amount  ?? r.amount ?? '',
    'Net Amount (AUD)':   r.net_amount    ?? '',
    'Status':             r.status        ?? '',
    'Notes':              r.notes_text    ?? '',
  }))
  return buildCSV(HEADERS, data)
}

/** Expense entries CSV. Empty rows produce header-only output. */
export function expensesToCSV(rows: ExpenseExportRow[]): string {
  const HEADERS = [
    'Date', 'Title', 'Category', 'Item', 'Amount (AUD)', 'Status', 'Notes',
  ]
  const data = rows.map(r => ({
    'Date':          r.expense_date,
    'Title':         r.title     ?? '',
    'Category':      r.category  ?? '',
    'Item':          r.item_name ?? '',
    'Amount (AUD)':  r.amount    ?? '',
    'Status':        r.status    ?? '',
    'Notes':         r.notes_text ?? '',
  }))
  return buildCSV(HEADERS, data)
}

/** Goals summary CSV. */
export function goalsToCSV(rows: GoalExportRow[]): string {
  const HEADERS = [
    'Title', 'Module', 'Target (AUD)', 'Current (AUD)', 'Progress (%)',
    'Status', 'Active', 'Start Date', 'End Date', 'Target Date',
    'Completed At', 'Created At',
  ]
  const data = rows.map(r => {
    const target  = r.target_amount  ?? 0
    const current = r.current_amount ?? 0
    const pct     = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
    return {
      'Title':          r.title         ?? '',
      'Module':         r.module_type   ?? '',
      'Target (AUD)':   target,
      'Current (AUD)':  current,
      'Progress (%)':   pct,
      'Status':         r.status        ?? '',
      'Active':         r.is_active ? 'Yes' : 'No',
      'Start Date':     r.start_date    ?? '',
      'End Date':       r.end_date      ?? '',
      'Target Date':    r.target_date   ?? '',
      'Completed At':   r.completed_at  ?? '',
      'Created At':     r.created_at    ?? '',
    }
  })
  return buildCSV(HEADERS, data)
}

/** Accountant summary: income + expenses + goals in one CSV with section markers. */
export function accountantSummaryToCSV(
  incomeRows:  IncomeExportRow[],
  expenseRows: ExpenseExportRow[],
  goalRows:    GoalExportRow[],
  reportDate:  string,
): string {
  const totalIncome   = incomeRows.reduce((s, r) => s + (r.gross_amount ?? r.amount ?? 0), 0)
  const totalExpenses = expenseRows.reduce((s, r) => s + (r.amount ?? 0), 0)
  const netIncome     = totalIncome - totalExpenses

  const lines: string[] = []

  lines.push('PolarisPilot -- Accountant Summary Export')
  lines.push(`Report Date,${escapeCSV(reportDate)}`)
  lines.push(`Total Income (AUD),${totalIncome.toFixed(2)}`)
  lines.push(`Total Expenses (AUD),${totalExpenses.toFixed(2)}`)
  lines.push(`Net Income (AUD),${netIncome.toFixed(2)}`)
  lines.push('')
  lines.push('--- INCOME ENTRIES ---')
  lines.push(incomeToCSV(incomeRows))
  lines.push('')
  lines.push('--- EXPENSE ENTRIES ---')
  lines.push(expensesToCSV(expenseRows))
  lines.push('')
  lines.push('--- GOALS SUMMARY ---')
  lines.push(goalsToCSV(goalRows))

  return lines.join('\n')
}
