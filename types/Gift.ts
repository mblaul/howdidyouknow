import type { Metadata } from "./Metadata";

export interface Gift extends Metadata {
  id: string;
  wantedByUserId: string;
  purchasedByUserId?: string;
  __type: "Gift";
}
