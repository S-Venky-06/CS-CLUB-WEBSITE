import type { Registration } from "../types/index.js";
import type { TeamMember } from "../types/event.js";

function parseArray(value: unknown): unknown[] {
  try {
    const result: unknown = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

/** A malformed optional cell must not take down every registration listing. */
export function parseRegistrationRow(row: unknown[]): Registration {
  const cell = (index: number) => String(row[index] ?? "");
  const teamMembers = parseArray(row[15]).filter((value): value is TeamMember => {
    if (!value || typeof value !== "object") return false;
    return ["name", "email", "phone", "rollNumber", "branch", "section"].every(
      key => typeof (value as Record<string, unknown>)[key] === "string",
    );
  });
  const attendedMembers = row[11] === "TRUE" || row[11] === true
    ? [cell(9), ...teamMembers.map(member => member.rollNumber)].filter(Boolean)
    : parseArray(row[11]).filter((value): value is string => typeof value === "string");
  const teamSize = Number(row[14]);
  return {
    registrationId: cell(0), eventId: cell(1), email: cell(2), name: cell(3),
    registeredAt: cell(4), phone: cell(5), year: cell(6), section: cell(7),
    branch: cell(8), rollNumber: cell(9), otherComments: cell(10),
    attendedMembers, paymentStatus: cell(12), transactionId: cell(13),
    teamSize: Number.isInteger(teamSize) && teamSize > 0 ? teamSize : teamMembers.length + 1,
    teamMembers, emailStatus: cell(16),
  };
}
