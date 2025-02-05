import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ cookies }) => {
  const sessionId = cookies.get("sessionId");
  return {
    sessionId,
  };
};
