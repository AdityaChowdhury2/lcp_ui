/** Minimal cardinal → words (legacy-style) for contract-labour counts. Covers 0–999,999. */
const BELOW_20 = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function chunkToWords(n: number): string {
  if (n < 20) return BELOW_20[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? TENS[t] : `${TENS[t]} ${BELOW_20[u]}`;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (rest === 0) return `${BELOW_20[h]} Hundred`;
  return `${BELOW_20[h]} Hundred ${chunkToWords(rest)}`;
}

export function numberToWordsEn(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  if (n === 0) return "Zero";
  if (n < 1000) return chunkToWords(n);
  const thousands = Math.floor(n / 1000);
  const rem = n % 1000;
  const head = `${chunkToWords(thousands)} Thousand`;
  if (rem === 0) return head;
  return `${head} ${chunkToWords(rem)}`;
}
