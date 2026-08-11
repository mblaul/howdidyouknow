import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, cookies }) => {
  const sessionId = cookies.get("session");
  return {
    sessionId,
    user: locals.user,
  };
};
