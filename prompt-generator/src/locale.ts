import type { LocaleDefaults } from "./types.js";

type Region = "US" | "EU" | "UK" | "GCC" | "APAC" | "LATAM" | "UNKNOWN";

const COUNTRY_TO_REGION: Record<string, { region: Region; currency: string; lang: string }> = {
  // GCC
  jordan: { region: "GCC", currency: "JOD", lang: "ar + en" },
  amman: { region: "GCC", currency: "JOD", lang: "ar + en" },
  uae: { region: "GCC", currency: "AED", lang: "ar + en" },
  "united arab emirates": { region: "GCC", currency: "AED", lang: "ar + en" },
  dubai: { region: "GCC", currency: "AED", lang: "ar + en" },
  "abu dhabi": { region: "GCC", currency: "AED", lang: "ar + en" },
  "saudi arabia": { region: "GCC", currency: "SAR", lang: "ar + en" },
  riyadh: { region: "GCC", currency: "SAR", lang: "ar + en" },
  jeddah: { region: "GCC", currency: "SAR", lang: "ar + en" },
  qatar: { region: "GCC", currency: "QAR", lang: "ar + en" },
  doha: { region: "GCC", currency: "QAR", lang: "ar + en" },
  bahrain: { region: "GCC", currency: "BHD", lang: "ar + en" },
  kuwait: { region: "GCC", currency: "KWD", lang: "ar + en" },
  oman: { region: "GCC", currency: "OMR", lang: "ar + en" },
  // EU
  germany: { region: "EU", currency: "EUR", lang: "de-DE" },
  berlin: { region: "EU", currency: "EUR", lang: "de-DE" },
  munich: { region: "EU", currency: "EUR", lang: "de-DE" },
  france: { region: "EU", currency: "EUR", lang: "fr-FR" },
  paris: { region: "EU", currency: "EUR", lang: "fr-FR" },
  spain: { region: "EU", currency: "EUR", lang: "es-ES" },
  madrid: { region: "EU", currency: "EUR", lang: "es-ES" },
  italy: { region: "EU", currency: "EUR", lang: "it-IT" },
  netherlands: { region: "EU", currency: "EUR", lang: "nl-NL" },
  // UK
  uk: { region: "UK", currency: "GBP", lang: "en-GB" },
  "united kingdom": { region: "UK", currency: "GBP", lang: "en-GB" },
  london: { region: "UK", currency: "GBP", lang: "en-GB" },
  britain: { region: "UK", currency: "GBP", lang: "en-GB" },
  // US
  us: { region: "US", currency: "USD", lang: "en-US" },
  usa: { region: "US", currency: "USD", lang: "en-US" },
  "united states": { region: "US", currency: "USD", lang: "en-US" },
  "new york": { region: "US", currency: "USD", lang: "en-US" },
  california: { region: "US", currency: "USD", lang: "en-US" },
  "san francisco": { region: "US", currency: "USD", lang: "en-US" },
  // APAC
  singapore: { region: "APAC", currency: "SGD", lang: "en-SG" },
  japan: { region: "APAC", currency: "JPY", lang: "ja-JP" },
  tokyo: { region: "APAC", currency: "JPY", lang: "ja-JP" },
  china: { region: "APAC", currency: "CNY", lang: "zh-CN" },
  india: { region: "APAC", currency: "INR", lang: "en-IN" },
  australia: { region: "APAC", currency: "AUD", lang: "en-AU" },
  // LATAM
  brazil: { region: "LATAM", currency: "BRL", lang: "pt-BR" },
  mexico: { region: "LATAM", currency: "MXN", lang: "es-MX" },
  argentina: { region: "LATAM", currency: "ARS", lang: "es-AR" },
};

const REGION_DEFAULTS: Record<
  Region,
  { date_format: string; regulatory_pack: string[] }
> = {
  US: { date_format: "MM/DD/YYYY", regulatory_pack: ["PCI-DSS", "state sales tax"] },
  EU: { date_format: "DD/MM/YYYY", regulatory_pack: ["GDPR", "PCI-DSS"] },
  UK: { date_format: "DD/MM/YYYY", regulatory_pack: ["UK-GDPR", "PCI-DSS"] },
  GCC: {
    date_format: "DD/MM/YYYY",
    regulatory_pack: ["PCI-DSS", "VAT", "e-invoicing", "local data residency"],
  },
  APAC: { date_format: "varies", regulatory_pack: ["PCI-DSS"] },
  LATAM: { date_format: "DD/MM/YYYY", regulatory_pack: ["PCI-DSS"] },
  UNKNOWN: { date_format: "ISO-8601", regulatory_pack: [] },
};

const INDUSTRY_OVERLAYS: Record<string, { overlay: string[]; extra_reg: Partial<Record<Region, string[]>> }> = {
  retail: {
    overlay: ["POS / inventory standards", "returns policy framing"],
    extra_reg: {},
  },
  fintech: {
    overlay: ["KYC/AML", "transaction logging"],
    extra_reg: { EU: ["PSD2"], UK: ["FCA"], US: ["state money-transmitter rules"] },
  },
  finance: {
    overlay: ["KYC/AML", "transaction logging"],
    extra_reg: { EU: ["PSD2"], UK: ["FCA"] },
  },
  healthtech: {
    overlay: ["PHI handling", "audit logging"],
    extra_reg: { US: ["HIPAA"], EU: ["MDR"] },
  },
  health: {
    overlay: ["PHI handling", "audit logging"],
    extra_reg: { US: ["HIPAA"], EU: ["MDR"] },
  },
  edtech: {
    overlay: ["age verification"],
    extra_reg: { US: ["COPPA"] },
  },
  govtech: {
    overlay: ["accessibility (Section 508 / EN 301 549)"],
    extra_reg: { US: ["FedRAMP", "FIPS"] },
  },
};

export function deriveLocaleDefaults(opts: {
  location?: string | undefined;
  industry?: string | undefined;
  language?: string | undefined;
}): { defaults: LocaleDefaults; assumption: string | undefined } {
  const loc = (opts.location ?? "").toLowerCase().trim();
  let region: Region = "UNKNOWN";
  let currency = "USD";
  let language = opts.language?.trim() || "en-US";
  let assumption: string | undefined;

  if (loc) {
    const match = findLocationMatch(loc);
    if (match) {
      region = match.region;
      currency = match.currency;
      if (!opts.language) language = match.lang;
    } else {
      region = "UNKNOWN";
      assumption = `[ASSUMPTION] Unrecognized location "${opts.location}"; defaulting to UNKNOWN region — review.`;
    }
  }

  const regionDefaults = REGION_DEFAULTS[region];
  const regulatory = [...regionDefaults.regulatory_pack];
  const overlay: string[] = [];

  const industry = (opts.industry ?? "").toLowerCase().trim();
  if (industry && INDUSTRY_OVERLAYS[industry]) {
    const ind = INDUSTRY_OVERLAYS[industry];
    overlay.push(...ind.overlay);
    const extra = ind.extra_reg[region];
    if (extra) regulatory.push(...extra);
  }

  const currency_format = formatCurrencySpec(currency, region);

  const defaults: LocaleDefaults = {
    currency,
    currency_format,
    date_format: regionDefaults.date_format,
    language,
    regulatory_pack: dedupSorted(regulatory),
    industry_overlay: dedupSorted(overlay),
  };

  return { defaults, assumption };
}

function findLocationMatch(loc: string): { region: Region; currency: string; lang: string } | null {
  const exact = COUNTRY_TO_REGION[loc];
  if (exact) return exact;
  for (const key of Object.keys(COUNTRY_TO_REGION)) {
    if (loc.includes(key)) {
      const m = COUNTRY_TO_REGION[key];
      if (m) return m;
    }
  }
  return null;
}

function formatCurrencySpec(currency: string, region: Region): string {
  if (region === "EU") return `1.234,56 ${currency}`;
  if (region === "UK") return `£1,234.56`;
  if (region === "US") return `$1,234.56`;
  if (region === "GCC") return `${currency} 1,234.560`;
  return `${currency} 1,234.56`;
}

function dedupSorted(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
}
