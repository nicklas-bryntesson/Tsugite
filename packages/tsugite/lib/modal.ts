// Modal — the holes in the table (ADR-0018). `dismiss` is Tsugite's word; `closedby` is the
// platform's, written so the browser does the work where it can (ADR-0029 §7). The region
// marker is always present and carries no value.
import type { View } from "./recipe";

const CLOSEDBY: Record<string, string> = { any: "any", request: "closerequest", none: "none" };

export const modalDerive = {
  closedby: ({ axes }: View) => CLOSEDBY[String(axes.dismiss)] ?? null,
  region: () => "",
};
