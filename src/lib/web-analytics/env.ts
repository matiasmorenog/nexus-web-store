export type WebAnalyticsEnv = {
  token: string;
  projectId: string;
  teamId: string | null;
};

/**
 * Server-only credentials for Vercel Web Analytics API.
 * - `VERCEL_WEB_ANALYTICS_TOKEN` (preferred) or `VERCEL_API_TOKEN`
 * - `VERCEL_PROJECT_ID` (auto on Vercel deploys; set per store locally)
 * - `VERCEL_TEAM_ID` optional (team projects)
 */
export function getWebAnalyticsEnv(): WebAnalyticsEnv | null {
  const token =
    process.env.VERCEL_WEB_ANALYTICS_TOKEN?.trim() ||
    process.env.VERCEL_API_TOKEN?.trim() ||
    "";
  const projectId = process.env.VERCEL_PROJECT_ID?.trim() || "";
  if (!token || !projectId) return null;

  const teamId = process.env.VERCEL_TEAM_ID?.trim() || null;
  return { token, projectId, teamId };
}
