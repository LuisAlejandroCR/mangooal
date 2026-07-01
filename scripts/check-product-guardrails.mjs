import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const readmePath = join(root, "README.md");
const guardrailPath = join(root, "src", "config", "productGuardrails.ts");
const ledgerHookPath = join(root, "src", "hooks", "useMangoalLedger.ts");
const competitionsPath = join(root, "src", "config", "competitions.ts");
const removedModelDoc = join(root, "docs", "minipay-and-web-model.md");

const expectedIds = [
  "MG-CORE-001",
  "MG-UX-001",
  "MG-MINIPAY-001",
  "MG-LAUNCH-001",
  "MG-WEB-001",
  "MG-CAMPAIGN-001",
  "MG-CONTRACT-001",
  "MG-GROWTH-001",
  "MG-COACH-001",
];

const readme = readFileSync(readmePath, "utf8");
const guardrails = readFileSync(guardrailPath, "utf8");
const ledgerHook = readFileSync(ledgerHookPath, "utf8");
const competitions = readFileSync(competitionsPath, "utf8");
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

for (const id of expectedIds) {
  expect(readme.includes(id), `${id} is missing from README.md traceable blocks`);
  expect(guardrails.includes(`id: "${id}"`), `${id} is missing from productGuardrails.ts`);
}

expect(readme.includes("## Mangooal solution"), "README.md is missing the Mangooal solution section");
expect(readme.includes("## Campaign model"), "README.md must describe the campaign model");
expect(readme.includes("### Campaign activation guidelines"), "README.md must include campaign activation guidelines");
expect(readme.includes("### MiniPay launch readiness"), "README.md must include MiniPay launch readiness");
expect(readme.includes("Do not submit a half-built Mini App"), "README.md must warn against half-built MiniPay submissions");
expect(readme.includes("360x640"), "README.md must keep the MiniPay review viewport explicit");
expect(readme.includes("support/terms/privacy"), "README.md must keep visible support, terms, and privacy explicit");
expect(readme.includes("network fee"), "README.md must use MiniPay-safe network fee copy");
expect(readme.includes("deposit") && readme.includes("withdraw"), "README.md must use MiniPay-safe deposit/withdraw copy");
expect(readme.includes("Current campaign"), "README.md must label FIFA as the current campaign, not the only campaign");
expect(readme.includes("UEFA"), "README.md must include UEFA as a campaign family");
expect(readme.includes("CAF"), "README.md must include CAF as a campaign family");
expect(readme.includes("Copa America") || readme.includes("CONMEBOL"), "README.md must include Copa America / CONMEBOL as a campaign family");
expect(readme.includes("Only one current campaign accepts picks"), "README.md must keep one-active-campaign discipline explicit");
expect(readme.includes("Do not hardcode future match data"), "README.md must reject hardcoded future fixtures");
expect(readme.includes("### Traceable product blocks"), "README.md is missing traceable product blocks");
expect(readme.includes("MiniPay users auto-connect"), "README.md must keep the MiniPay auto-connect rule explicit");
expect(readme.includes("Direct user attribution"), "README.md must keep the user-attribution contract rule explicit");
expect(!existsSync(removedModelDoc), "docs/minipay-and-web-model.md should stay removed from the repo");
expect(ledgerHook.includes(`functionName: "submitOrUpdatePick"`), "Primary pick submission must use submitOrUpdatePick");
expect(!ledgerHook.includes(`functionName: "commitPrediction"`), "Primary pick submission must not use legacy commitPrediction");
expect(competitions.includes(`marker: "FIFA"`), "competitions.ts must keep FIFA configured");
expect(competitions.includes(`marker: "UEFA"`), "competitions.ts must keep UEFA configured");
expect(competitions.includes(`marker: "CONMEBOL"`), "competitions.ts must keep Copa America / CONMEBOL configured");
expect(competitions.includes(`marker: "CAF"`), "competitions.ts must keep CAF configured");

const duplicateIds = expectedIds.filter((id, index) => expectedIds.indexOf(id) !== index);
expect(duplicateIds.length === 0, `Duplicate expected guardrail ids: ${duplicateIds.join(", ")}`);

if (failures.length > 0) {
  console.error("Product guardrail check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Product guardrail check passed: ${expectedIds.length} traceable blocks verified.`);
