import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async (event) => {
    if (event.locals.user === null) {
      throw fail(401);
    }
    // ...
  },
};
