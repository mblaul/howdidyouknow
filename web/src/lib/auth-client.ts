import { createAuthClient } from "better-auth/svelte";
export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: "http://localhost:3000", // the base url of your auth server
});
