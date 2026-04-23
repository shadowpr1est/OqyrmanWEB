// Encoded form lives in `notes.position` (free-form string in DB).
// New format:  "<kind>:<value>@<label>"  e.g. "cfi:epubcfi(/6/14!/4/2)@45%"
// Old format:  "45%"  — still rendered as-is, kind="percent".

export type PositionKind = "cfi" | "page" | "percent";

export interface ParsedPosition {
  kind: PositionKind;
  value: string;
  label: string;
}

export function formatPosition(
  kind: PositionKind,
  value: string,
  label: string,
): string {
  if (kind === "percent") return label;
  return `${kind}:${value}@${label}`;
}

export function parsePosition(raw: string): ParsedPosition {
  const at = raw.lastIndexOf("@");
  const main = at >= 0 ? raw.slice(0, at) : raw;
  const label = at >= 0 ? raw.slice(at + 1) : raw;
  const colon = main.indexOf(":");
  if (colon < 0) {
    return { kind: "percent", value: main, label: main };
  }
  const kind = main.slice(0, colon);
  if (kind !== "cfi" && kind !== "page") {
    return { kind: "percent", value: main, label: main };
  }
  return { kind, value: main.slice(colon + 1), label };
}
