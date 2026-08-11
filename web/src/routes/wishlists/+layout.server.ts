import { redirect, type Actions } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, url }) => {
  const token = url.searchParams.get("token");
  if (!locals.session && !token) {
    redirect(307, "/login");
  }
};
