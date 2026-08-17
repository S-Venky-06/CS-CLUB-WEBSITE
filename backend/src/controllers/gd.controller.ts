import type { Request, Response } from "express";
import {
  findAllGDResults,
  findAllRound2Shortlist,
  randomizeAndSaveGDTeams,
  clearAllGDTeams,
  assignSupervisorsToGDTeam,
  submitGDEvaluation,
  shortlistCandidateForRound2,
  unshortlistCandidateFromRound2,
} from "../repositories/index.js";
import { HttpStatus } from "../constants/index.js";

/**
 * GET /api/v1/admin/gd/results
 * Fetches all GD results and team assignments.
 */
export async function getGDResultsController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const results = await findAllGDResults();
    res.status(HttpStatus.OK).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch GD results.",
    });
  }
}

/**
 * GET /api/v1/admin/gd/shortlist-round2
 * Fetches all shortlisted Round 2 candidates.
 */
export async function getRound2ShortlistController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const shortlist = await findAllRound2Shortlist();
    res.status(HttpStatus.OK).json({
      success: true,
      data: shortlist,
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch Round 2 shortlist.",
    });
  }
}

/**
 * POST /api/v1/admin/gd/randomize
 * Super Admin only endpoint to shuffle candidates into randomized GD teams.
 */
export async function postRandomizeGDTeamsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser || sessionUser.role !== "super_admin") {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "Only Super Admins can randomize GD teams.",
      });
      return;
    }

    const { targetTeamSize } = req.body || {};
    const size = targetTeamSize ? Number(targetTeamSize) : 4;

    const gdResults = await randomizeAndSaveGDTeams(size);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Successfully randomized ${gdResults.length} registered candidates into GD teams (Target size: ${size})!`,
      data: gdResults,
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to randomize GD teams.",
    });
  }
}

/**
 * POST /api/v1/admin/gd/clear
 * Super Admin only endpoint to clear all generated GD teams and evaluations.
 */
export async function postClearGDTeamsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const sessionUser = req.session?.user;
    if (!sessionUser || sessionUser.role !== "super_admin") {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "Only Super Admins can clear GD teams.",
      });
      return;
    }

    await clearAllGDTeams();
    res.status(HttpStatus.OK).json({
      success: true,
      message: "All GD teams and evaluations cleared successfully.",
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to clear GD teams.",
    });
  }
}

/**
 * POST /api/v1/admin/gd/assign-supervisors
 * Assigns supervisors to a GD Team.
 */
export async function postAssignSupervisorsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { gdTeam, supervisors } = req.body;

    if (!gdTeam || !Array.isArray(supervisors)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid payload. Required: gdTeam and supervisors array.",
      });
      return;
    }

    await assignSupervisorsToGDTeam(gdTeam, supervisors);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Supervisors assigned to ${gdTeam} successfully.`,
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to assign supervisors.",
    });
  }
}

/**
 * POST /api/v1/admin/gd/evaluate
 * Submits 5 criteria scores and comments for a candidate.
 */
export async function postGDEvaluationController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { registrationId, scores, comments } = req.body;

    if (!registrationId || !scores) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Missing required fields: registrationId and scores.",
      });
      return;
    }

    const sessionUser = req.session?.user;
    const userRole = sessionUser?.role;
    const userEmail = sessionUser?.email?.toLowerCase();
    const userName = sessionUser?.name?.toLowerCase();

    if (userRole !== "super_admin") {
      const allResults = await findAllGDResults();
      const targetCandidate = allResults.find((r) => r.registrationId === registrationId);
      if (!targetCandidate) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Candidate registration not found.",
        });
        return;
      }

      const assignedStr = (targetCandidate.assignedSupervisors || "").toLowerCase();
      const isAssigned =
        (userEmail && assignedStr.includes(userEmail)) ||
        (userName && assignedStr.includes(userName));

      if (!isAssigned) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: "Forbidden: You are only permitted to evaluate GD teams assigned to you.",
        });
        return;
      }
    }

    await submitGDEvaluation(registrationId, scores, comments || "");
    res.status(HttpStatus.OK).json({
      success: true,
      message: "GD Evaluation score saved successfully.",
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to save GD evaluation.",
    });
  }
}

/**
 * POST /api/v1/admin/gd/shortlist-round2
 * Shortlists candidate for Round 2.
 */
export async function postShortlistRound2Controller(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "registrationId is required.",
      });
      return;
    }

    await shortlistCandidateForRound2(registrationId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Candidate shortlisted for Round 2 successfully!",
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to shortlist candidate.",
    });
  }
}

/**
 * POST /api/v1/admin/gd/unshortlist-round2
 * Unshortlists candidate from Round 2.
 */
export async function postUnshortlistRound2Controller(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "registrationId is required.",
      });
      return;
    }

    await unshortlistCandidateFromRound2(registrationId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Candidate removed from Round 2 shortlist.",
    });
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to unshortlist candidate.",
    });
  }
}
