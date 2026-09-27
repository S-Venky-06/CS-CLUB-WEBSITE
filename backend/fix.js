const fs = require('fs');
let code = fs.readFileSync('src/controllers/admin.controller.ts', 'utf8');

// Fix getPublicAnnouncements
code = code.replace(
  /export const getPublicAnnouncements = asyncHandler\([\s\S]*?\n\);/,
  `export const getPublicAnnouncements = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const items = await findActiveAnnouncements();
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    res.setHeader("Vercel-Cache-Tag", "public-announcements");
    sendResponse(res, HttpStatus.OK, "Active announcements retrieved successfully.", items);
  },
);`
);

// Fix getFeaturedEvent
code = code.replace(
  /export const getFeaturedEvent = asyncHandler\([\s\S]*?\n\);/,
  `export const getFeaturedEvent = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const allEvents = await findAllEvents();
    const activeEvent = allEvents.find((e) => e.status === "active");
    if (!activeEvent) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      throw new ApiError(HttpStatus.NOT_FOUND, "No active event is currently configured in Google Sheets.");
    }
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    res.setHeader("Vercel-Cache-Tag", "public-events");
    sendResponse(res, HttpStatus.OK, "Featured event details retrieved successfully.", activeEvent);
  },
);`
);

// Fix getPastEvents
code = code.replace(
  /export const getPastEvents = asyncHandler\([\s\S]*?\n\);/,
  `export const getPastEvents = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const allEvents = await findAllEvents();
    const pastEvents = allEvents.filter(
      (e) => e.status === "completed" || e.status === "cancelled"
    );
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    res.setHeader("Vercel-Cache-Tag", "public-events");
    sendResponse(res, HttpStatus.OK, "Past events retrieved successfully.", pastEvents);
  },
);`
);

fs.writeFileSync('src/controllers/admin.controller.ts', code);
console.log("Controllers fixed");
