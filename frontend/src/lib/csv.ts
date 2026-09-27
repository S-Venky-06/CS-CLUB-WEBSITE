export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // Spreadsheet applications interpret these prefixes as formulas, even in quoted CSV cells.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
