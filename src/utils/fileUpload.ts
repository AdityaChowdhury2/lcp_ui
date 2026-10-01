/**
 * Client-side mirror of the API's DynamicFileInterceptor rule
 * (lcp_api/src/common/file-upload/file-upload.interceptor.ts).
 *
 * This is UX only — the server is still the enforcing side.
 */

export const ANY_FILE_TYPE = "ALL" as const;
export const ANY_FILE_SIZE = "ANY" as const;

export interface FileUploadRule {
  /** Mime types ('application/pdf'), wildcards ('image/*') or extensions ('.pdf'). */
  allowedTypes?: string[] | typeof ANY_FILE_TYPE;
  /** Max size in MB, or ANY_FILE_SIZE for no limit. */
  maxSizeMb?: number | typeof ANY_FILE_SIZE;
  /** Max size in KB. Takes precedence over maxSizeMb when both are set. */
  maxSizeKb?: number | typeof ANY_FILE_SIZE;
}

const KB = 1024;
const MB = 1024 * 1024;

/** Resolve a rule's size limit to bytes, or null when unlimited. */
function resolveMaxBytes(rule: FileUploadRule): number | null {
  const { maxSizeKb, maxSizeMb = ANY_FILE_SIZE } = rule;

  const [value, unit] =
    maxSizeKb !== undefined ? [maxSizeKb, KB] : [maxSizeMb, MB];

  if (value === ANY_FILE_SIZE || typeof value !== "number" || value <= 0) {
    return null;
  }
  return Math.floor(value * unit);
}

/** "200 KB" / "2 MB" / "any size" */
function describeSize(rule: FileUploadRule): string {
  const bytes = resolveMaxBytes(rule);
  if (bytes === null) return "any size";
  return bytes < MB
    ? `up to ${Math.round(bytes / KB)} KB`
    : `up to ${bytes / MB} MB`;
}

/** Default for registration / amendment documents — keep in sync with DOCUMENT_UPLOAD_RULE. */
export const DOCUMENT_UPLOAD_RULE: FileUploadRule = {
  allowedTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
  ],
  maxSizeMb: 2,
};

/** Accepts every type at any size. */
export const UNRESTRICTED_UPLOAD_RULE: FileUploadRule = {
  allowedTypes: ANY_FILE_TYPE,
  maxSizeMb: ANY_FILE_SIZE,
};

/** CLRA-PE amendment "Documents Uploaded" section: PDF only, 200 KB. */
export const CLRA_AMENDMENT_DOCUMENT_RULE: FileUploadRule = {
  allowedTypes: ["application/pdf", ".pdf"],
  maxSizeKb: 200,
};

/** BOCWA amendment "Upload Supporting Documents": PDF only, 200 KB. */
export const BOCWA_AMENDMENT_DOCUMENT_RULE: FileUploadRule = {
  allowedTypes: ["application/pdf", ".pdf"],
  maxSizeKb: 200,
};

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function matchesType(file: File, allowed: string[]): boolean {
  const mime = (file.type ?? "").toLowerCase();
  const ext = extensionOf(file.name ?? "");

  return allowed.some((raw) => {
    const entry = raw.trim().toLowerCase();
    if (!entry) return false;
    if (entry === "*" || entry === "*/*") return true;
    if (entry.startsWith(".")) return ext === entry;
    if (entry.endsWith("/*")) return mime.startsWith(entry.slice(0, -1));
    if (entry.includes("/")) return mime === entry;
    return ext === `.${entry}`;
  });
}

/** Value for an <input type="file"> accept attribute, or undefined when unrestricted. */
export function toAcceptAttribute(rule: FileUploadRule): string | undefined {
  const { allowedTypes = ANY_FILE_TYPE } = rule;
  if (allowedTypes === ANY_FILE_TYPE || allowedTypes.length === 0) return undefined;
  return allowedTypes.join(",");
}

/** Short label such as "PDF up to 200 KB" for helper text. */
export function describeRule(rule: FileUploadRule): string {
  const { allowedTypes = ANY_FILE_TYPE } = rule;

  const types =
    allowedTypes === ANY_FILE_TYPE || allowedTypes.length === 0
      ? "Any file type"
      : Array.from(
          new Set(
            allowedTypes.map((t) =>
              (t.includes("/") ? t.split("/")[1] : t.replace(/^\./, "")).toUpperCase()
            )
          )
        ).join(", ");

  return `${types} ${describeSize(rule)}`;
}

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(file: File, rule: FileUploadRule): string | null {
  const { allowedTypes = ANY_FILE_TYPE } = rule;

  if (allowedTypes !== ANY_FILE_TYPE && allowedTypes.length > 0) {
    if (!matchesType(file, allowedTypes)) {
      return `"${file.name}" is not an accepted file type. Allowed: ${describeRule(rule)}`;
    }
  }

  const maxBytes = resolveMaxBytes(rule);
  if (maxBytes !== null && file.size > maxBytes) {
    const actual =
      file.size < MB
        ? `${Math.round(file.size / KB)} KB`
        : `${(file.size / MB).toFixed(2)} MB`;
    return `"${file.name}" is ${actual}. Maximum allowed is ${describeSize(rule).replace("up to ", "")}.`;
  }

  return null;
}
