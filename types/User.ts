import type { Metadata } from "./Metadata";

export interface User extends Metadata {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  __type: "User";
}
