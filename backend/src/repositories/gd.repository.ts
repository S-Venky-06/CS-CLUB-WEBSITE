import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";
import type { GDResult, Round2ShortlistCandidate } from "../types/index.js";
import { findAllRegistrations } from "./registration.repository.js";

/**
 * Ensures "Group Discussion Results" and "Round 2 Shortlist" tabs exist in Google Sheets.
 */
export async function ensureGDWorksheetsExist(): Promise<void> {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: env.GOOGLE_SPREADSHEET_ID });
  const existingTitles = new Set(
    (meta.data.sheets || []).map((s: any) => s.properties?.title).filter(Boolean)
  );

  const addRequests: any[] = [];

  if (!existingTitles.has("Group Discussion Results")) {
    addRequests.push({
      addSheet: {
        properties: { title: "Group Discussion Results" },
      },
    });
  }

  if (!existingTitles.has("Round 2 Shortlist")) {
    addRequests.push({
      addSheet: {
        properties: { title: "Round 2 Shortlist" },
      },
    });
  }

  if (addRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      requestBody: { requests: addRequests },
    });

    // Write Headers
    if (!existingTitles.has("Group Discussion Results")) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        range: "Group Discussion Results!A1:O1",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "registrationId",
              "name",
              "rollNumber",
              "branch",
              "domain",
              "gdTeam",
              "assignedSupervisors",
              "commScore",
              "knowledgeScore",
              "confidenceScore",
              "realtimeScore",
              "attackScore",
              "totalScore",
              "supervisorComments",
              "stageStatus",
            ],
          ],
        },
      });
    }

    if (!existingTitles.has("Round 2 Shortlist")) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        range: "Round 2 Shortlist!A1:I1",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "registrationId",
              "name",
              "rollNumber",
              "email",
              "phone",
              "domain",
              "gdScore",
              "supervisorComments",
              "shortlistedAt",
            ],
          ],
        },
      });
    }
  }
}

/**
 * Fetches all rows from Group Discussion Results worksheet.
 */
export async function findAllGDResults(): Promise<GDResult[]> {
  await ensureGDWorksheetsExist();
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Group Discussion Results!A2:O10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[0]) // Filter out empty rows
    .map((row: any[]) => ({
      registrationId: row[0] || "",
      name: row[1] || "",
      rollNumber: row[2] || "",
      branch: row[3] || "",
      domain: row[4] || "",
      gdTeam: row[5] || "",
      assignedSupervisors: row[6] || "",
      commScore: Number(row[7]) || 0,
      knowledgeScore: Number(row[8]) || 0,
      confidenceScore: Number(row[9]) || 0,
      realtimeScore: Number(row[10]) || 0,
      attackScore: Number(row[11]) || 0,
      totalScore: Number(row[12]) || 0,
      supervisorComments: row[13] || "",
      stageStatus: row[14] || "GD Assigned",
    }));
}

/**
 * Fetches all candidates in the Round 2 Shortlist worksheet.
 */
export async function findAllRound2Shortlist(): Promise<Round2ShortlistCandidate[]> {
  await ensureGDWorksheetsExist();
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Round 2 Shortlist!A2:I10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[0])
    .map((row: any[]) => ({
      registrationId: row[0] || "",
      name: row[1] || "",
      rollNumber: row[2] || "",
      email: row[3] || "",
      phone: row[4] || "",
      domain: row[5] || "",
      gdScore: Number(row[6]) || 0,
      supervisorComments: row[7] || "",
      shortlistedAt: row[8] || "",
    }));
}

/**
 * Dynamic Team Partitioning Algorithm bounded strictly between 3 and 9 members per team.
 */
export function calculateDynamicTeamSizes(N: number, targetSize: number): number[] {
  if (N <= 0) return [];
  const target = Math.max(3, Math.min(9, targetSize));

  if (N <= 9) {
    return [N];
  }

  let numTeams = Math.round(N / target);
  if (numTeams < 1) numTeams = 1;

  // Guarantee maximum team size does not exceed 9
  while (Math.ceil(N / numTeams) > 9) {
    numTeams++;
  }
  // Guarantee minimum team size is at least 3 if N >= 3
  while (Math.floor(N / numTeams) < 3 && numTeams > 1) {
    numTeams--;
  }

  const baseSize = Math.floor(N / numTeams);
  const remainder = N % numTeams;

  const teamSizes: number[] = [];
  for (let i = 0; i < remainder; i++) {
    teamSizes.push(baseSize + 1);
  }
  for (let i = 0; i < numTeams - remainder; i++) {
    teamSizes.push(baseSize);
  }

  return teamSizes;
}

/**
 * Randomizes registered candidates into GD Teams dynamically based on target team size (3-9)
 * and writes to Group Discussion Results worksheet tab.
 */
export async function randomizeAndSaveGDTeams(
  targetTeamSize: number = 4,
): Promise<GDResult[]> {
  await ensureGDWorksheetsExist();
  const registrations = await findAllRegistrations();

  if (registrations.length === 0) {
    return [];
  }

  // Fisher-Yates Shuffle
  const shuffled = [...registrations];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const teamSizes = calculateDynamicTeamSizes(shuffled.length, targetTeamSize);

  // Construct rows and assign teams
  const gdResults: GDResult[] = [];
  const sheetValues: any[][] = [];
  let currentIndex = 0;

  teamSizes.forEach((size, teamIdx) => {
    const teamNum = (teamIdx + 1).toString().padStart(2, "0");
    const teamName = `GD Team ${teamNum}`;

    for (let i = 0; i < size; i++) {
      const reg = shuffled[currentIndex++];
      if (!reg) break;

      const gdItem: GDResult = {
        registrationId: reg.registrationId,
        name: reg.name,
        rollNumber: reg.rollNumber || "N/A",
        branch: reg.branch || "N/A",
        domain: reg.domain || "Technical",
        gdTeam: teamName,
        assignedSupervisors: "",
        commScore: 0,
        knowledgeScore: 0,
        confidenceScore: 0,
        realtimeScore: 0,
        attackScore: 0,
        totalScore: 0,
        supervisorComments: "",
        stageStatus: "GD Assigned",
      };

      gdResults.push(gdItem);
      sheetValues.push([
        gdItem.registrationId,
        gdItem.name,
        gdItem.rollNumber,
        gdItem.branch,
        gdItem.domain,
        gdItem.gdTeam,
        "",
        0,
        0,
        0,
        0,
        0,
        0,
        "",
        "GD Assigned",
      ]);
    }
  });

  const sheets = getSheetsClient();

  // Clear existing sheet rows
  await sheets.spreadsheets.values.clear({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Group Discussion Results!A2:O10000",
  });

  // Write new randomized GD teams
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Group Discussion Results!A2:O${sheetValues.length + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: sheetValues,
    },
  });

  return gdResults;
}

/**
 * Clears all generated teams and evaluations from Group Discussion Results worksheet.
 */
export async function clearAllGDTeams(): Promise<void> {
  await ensureGDWorksheetsExist();
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.clear({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Group Discussion Results!A2:O10000",
  });
}

/**
 * Assigns one or more supervisor emails/names to a specific GD team.
 */
export async function assignSupervisorsToGDTeam(
  teamName: string,
  supervisors: string[],
): Promise<void> {
  await ensureGDWorksheetsExist();
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Group Discussion Results!A2:O10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return;

  const supervisorStr = supervisors.join(", ");

  const updatedValues = rows.map((row: any[]) => {
    if (row[5] === teamName) {
      row[6] = supervisorStr;
    }
    return row;
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Group Discussion Results!A2:O${updatedValues.length + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: updatedValues,
    },
  });
}

/**
 * Submits supervisor scores and comments for a specific candidate.
 */
export async function submitGDEvaluation(
  registrationId: string,
  scores: {
    comm: number;
    knowledge: number;
    confidence: number;
    realtime: number;
    attack: number;
  },
  comments: string,
): Promise<void> {
  await ensureGDWorksheetsExist();
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Group Discussion Results!A2:O10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) throw new Error("GD results not found.");

  const rowIndex = rows.findIndex((row: any[]) => row[0] === registrationId);
  if (rowIndex === -1) throw new Error("Candidate registration ID not found.");

  const targetRow = rowIndex + 2; // Offset for headers
  const totalScore =
    Number(scores.comm) +
    Number(scores.knowledge) +
    Number(scores.confidence) +
    Number(scores.realtime) +
    Number(scores.attack);

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Group Discussion Results!H${targetRow}:N${targetRow}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          scores.comm,
          scores.knowledge,
          scores.confidence,
          scores.realtime,
          scores.attack,
          totalScore,
          comments,
        ],
      ],
    },
  });
}

/**
 * Shortlists a candidate for Round 2, updates stageStatus in GD Results,
 * and appends a row to Round 2 Shortlist worksheet.
 */
export async function shortlistCandidateForRound2(
  registrationId: string,
): Promise<void> {
  await ensureGDWorksheetsExist();
  const sheets = getSheetsClient();

  // 1. Fetch GD results to update stageStatus
  const gdResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Group Discussion Results!A2:O10000",
  });

  const gdRows = gdResponse.data.values;
  if (!gdRows || gdRows.length === 0) throw new Error("GD Results empty.");

  const gdRowIndex = gdRows.findIndex((row: any[]) => row[0] === registrationId);
  if (gdRowIndex === -1) throw new Error("Candidate not found in GD Results.");

  const targetGDRow = gdRows[gdRowIndex];
  const targetRowIndex = gdRowIndex + 2;

  // Update stageStatus to Shortlisted for Round 2 in Column O
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Group Discussion Results!O${targetRowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [["Shortlisted for Round 2"]],
    },
  });

  // 2. Fetch student contact info from Registrations
  const registrations = await findAllRegistrations();
  const reg = registrations.find((r) => r.registrationId === registrationId);

  const studentEmail = reg?.email || "N/A";
  const studentPhone = reg?.phone || "N/A";

  // 3. Append to Round 2 Shortlist tab
  const shortlistValues = [
    [
      targetGDRow[0], // registrationId
      targetGDRow[1], // name
      targetGDRow[2], // rollNumber
      studentEmail,   // email
      studentPhone,   // phone
      targetGDRow[4], // domain
      targetGDRow[12], // gdScore (totalScore)
      targetGDRow[13], // supervisorComments
      new Date().toISOString(),
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Round 2 Shortlist!A2:I2",
    valueInputOption: "RAW",
    requestBody: {
      values: shortlistValues,
    },
  });
}

/**
 * Unshortlists a candidate from Round 2:
 * Resets stageStatus in Group Discussion Results to "GD Assigned"
 * and removes their entry from the Round 2 Shortlist worksheet tab.
 */
export async function unshortlistCandidateFromRound2(
  registrationId: string,
): Promise<void> {
  await ensureGDWorksheetsExist();
  const sheets = getSheetsClient();

  // 1. Fetch GD results to update stageStatus back to GD Assigned
  const gdResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Group Discussion Results!A2:O10000",
  });

  const gdRows = gdResponse.data.values;
  if (!gdRows || gdRows.length === 0) throw new Error("GD Results empty.");

  const gdRowIndex = gdRows.findIndex((row: any[]) => row[0] === registrationId);
  if (gdRowIndex !== -1) {
    const targetRowIndex = gdRowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: `Group Discussion Results!O${targetRowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["GD Assigned"]],
      },
    });
  }

  // 2. Fetch Round 2 Shortlist to remove candidate row
  const r2Response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Round 2 Shortlist!A2:I10000",
  });

  const r2Rows = r2Response.data.values;
  if (r2Rows && r2Rows.length > 0) {
    const filteredR2Rows = r2Rows.filter((row: any[]) => row[0] !== registrationId);

    // Clear Round 2 Shortlist tab
    await sheets.spreadsheets.values.clear({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Round 2 Shortlist!A2:I10000",
    });

    if (filteredR2Rows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        range: `Round 2 Shortlist!A2:I${filteredR2Rows.length + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: filteredR2Rows,
        },
      });
    }
  }
}
