// The Printer Finally Answers — make.fun entry
// Writes the printer's one-line comeback to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22+, stdlib-only, deterministic: the same run always writes the same line.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY =
  "Error 41: jam on page 3 of 47. I've fed this office 12,847 sheets since 2019 without a single thank-you — thump me once more and I'll print your search history in color, double-sided.";

const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir;

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
