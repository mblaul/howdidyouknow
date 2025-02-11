import { redirect, type Actions } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals }) => {
  if (!locals.session) {
    redirect(307, "/login");
  }
};
