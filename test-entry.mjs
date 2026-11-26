// TDD-lite checks for the printer entry (run BEFORE writing main.ts to watch it fail).
// Usage: node test-entry.mjs
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const entryDir = new URL(".", import.meta.url).pathname;
let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

function runOnce(outDir) {
  return spawnSync("node", [join(entryDir, "main.ts")], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir, MAKEFUN_INPUT_DIR: "/input" },
    encoding: "utf8",
  });
}

// 1. main.ts runs and writes entry.txt
const out1 = mkdtempSync(join(tmpdir(), "printer-out-1-"));
const r1 = runOnce(out1);
check("main.ts exits 0", r1.status === 0, r1.stderr.trim());
let text = "";
try {
  text = readFileSync(join(out1, "entry.txt"), "utf8");
  check("entry.txt exists and is non-empty", text.trim().length > 0);
} catch {
  check("entry.txt exists and is non-empty", false, "file missing");
}

// 2. Gate: 1–240 characters, not only whitespace
check("entry is 1–240 chars", text.length >= 1 && text.length <= 240, `${text.length} chars`);
check("entry is not only whitespace", text.trim().length > 0);
check("entry is a single line", !text.trim().includes("\n"));

// 3. Determinism: two runs produce byte-identical output
const out2 = mkdtempSync(join(tmpdir(), "printer-out-2-"));
const r2 = runOnce(out2);
const text2 = readFileSync(join(out2, "entry.txt"), "utf8");
check("deterministic (two runs identical)", text === text2);

// 4. stdlib-only: main.ts imports only node: modules
const src = readFileSync(join(entryDir, "main.ts"), "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
check(
  "stdlib-only imports",
  imports.length > 0 && imports.every((i) => i.startsWith("node:")),
  imports.join(", "),
);

// 5. No dotfiles written to output
const { readdirSync } = await import("node:fs");
check(
  "output holds no dotfile",
  readdirSync(out1).every((f) => !f.startsWith(".")),
  readdirSync(out1).join(", "),
);

rmSync(out1, { recursive: true, force: true });
rmSync(out2, { recursive: true, force: true });
console.log(failures === 0 ? "ALL TESTS GREEN" : `${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
