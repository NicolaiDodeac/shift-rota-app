import { google } from "googleapis";

export function calendarClient(accessToken: string, refreshToken?: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.calendar({ version: "v3", auth: client });
}
// NEW: find a calendar by its displayed name (summary) without creating one
export async function findCalendarIdBySummary(
  cal: ReturnType<typeof calendarClient>,
  summary: string
) {
  let pageToken: string | undefined = undefined;
  do {
    const res: any = await cal.calendarList.list({
      maxResults: 250,
      pageToken,
    });
    const items = res.data.items || [];
    const hit = items.find((i: any) => i.summary === summary);
    if (hit?.id) return hit.id;
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  return null;
}

// NEW: ensure a calendar exists; create if missing; optionally set color
export async function ensureCalendarId(
  cal: ReturnType<typeof calendarClient>,
  summary = "Shift Rota",
  colorId = "11" // arbitrary Google colorId; you can change
) {
  const existing = await findCalendarIdBySummary(cal, summary);
  if (existing) return existing;

  // Create the calendar
  const created = await cal.calendars.insert({ requestBody: { summary } });
  const id = created.data.id!;
  // Try set color (silently ignore if not supported)
  try {
    await cal.calendarList.update({ calendarId: id, requestBody: { colorId } });
  } catch {}
  return id;
}
