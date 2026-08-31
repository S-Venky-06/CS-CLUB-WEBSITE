export { getHealth } from "./health.controller.js";
export { googleLogin, getMe, logout } from "./auth.controller.js";
export { postRegistration, getMeRegistrations } from "./registration.controller.js";
export {
  getGDResultsController,
  getRound2ShortlistController,
  postRandomizeGDTeamsController,
  postClearGDTeamsController,
  postAssignSupervisorsController,
  postGDEvaluationController,
  postShortlistRound2Controller,
  postUnshortlistRound2Controller,
} from "./gd.controller.js";
export { createOrder, verifyPayment } from "./payment.controller.js";
