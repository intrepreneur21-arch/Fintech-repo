/**
 * Client-side constants
 */

export const getLoginUrl = (returnPath?: string) => {
  const baseUrl = window.location.origin;
  const state = btoa(JSON.stringify({ returnPath: returnPath || "/" }));
  return `/auth/login?state=${state}`;
};
