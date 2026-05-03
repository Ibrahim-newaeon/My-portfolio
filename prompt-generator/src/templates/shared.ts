import type { EnrichedInput, Intent } from "../types.js";

export interface IntentTemplate {
  role: (e: EnrichedInput) => string;
  instructions: (e: EnrichedInput) => string[];
  constraints: (e: EnrichedInput) => string[];
  verification: (e: EnrichedInput) => string[];
  example: (e: EnrichedInput) => string;
  deliverable: string;
}

export function geographyClause(e: EnrichedInput): string {
  if (!e.location_provided) return "";
  const reg = e.locale_defaults.regulatory_pack;
  if (reg.length === 0) return ` operating under ${e.locale_defaults.language} locale defaults`;
  return ` operating under ${reg.join(", ")}`;
}

export function intentLabel(intent: Intent): string {
  return intent.replace(/_/g, " ");
}

export function shortGoal(e: EnrichedInput, max = 80): string {
  const g = e.goal.trim();
  return g.length <= max ? g : g.slice(0, max - 1) + "…";
}
