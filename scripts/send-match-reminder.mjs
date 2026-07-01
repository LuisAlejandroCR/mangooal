/**
 * Match countdown notifier — runs from GitHub Actions scheduled workflow.
 *
 * Checks which R32 match has its pick deadline within the next 45 minutes
 * and sends a Telegram message. The 45-minute window (vs the 30-minute
 * cron offset) is intentional: GH Actions scheduled runs can arrive up to
 * 15 minutes late, so this guarantees the notification still fires.
 *
 * Required env vars (set as GitHub Secrets):
 *   TELEGRAM_BOT_TOKEN  — from @BotFather
 *   TELEGRAM_CHAT_ID    — channel/group ID, e.g. -1001234567890
 * Optional:
 *   APP_URL             — defaults to https://mangooal.app
 *   TEST_MODE           — "true" to send a test message immediately
 */

// lockedAt values are Unix seconds (= matches.ts lockedAt ms / 1000)
const MATCHES = [
  // ── June 29, 2026 ──────────────────────────────────────────────────────────
  { id: "wc26-r32-01", home: "Brazil 🇧🇷",       away: "Japan 🇯🇵",        lockedAt: 1782750600 },
  { id: "wc26-r32-02", home: "Germany 🇩🇪",      away: "Paraguay 🇵🇾",     lockedAt: 1782763200 },
  // ── June 30, 2026 ──────────────────────────────────────────────────────────
  { id: "wc26-r32-03", home: "Netherlands 🇳🇱",  away: "Morocco 🇲🇦",      lockedAt: 1782779400 },
  { id: "wc26-r32-04", home: "Ivory Coast 🇨🇮",  away: "Norway 🇳🇴",       lockedAt: 1782837000 },
  { id: "wc26-r32-05", home: "France 🇫🇷",       away: "Sweden 🇸🇪",        lockedAt: 1782851400 },
  // ── July 1, 2026 ───────────────────────────────────────────────────────────
  { id: "wc26-r32-06", home: "Ecuador 🇪🇨",      away: "Mexico 🇲🇽",        lockedAt: 1782865800 },
  { id: "wc26-r32-07", home: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿",      away: "Congo DR 🇨🇩",     lockedAt: 1782919800 },
  { id: "wc26-r32-08", home: "Belgium 🇧🇪",      away: "Senegal 🇸🇳",       lockedAt: 1782934200 },
  { id: "wc26-r32-12", home: "USA 🇺🇸",          away: "Bosnia-Herz 🇧🇦",   lockedAt: 1782948600 },
  // ── July 2, 2026 ───────────────────────────────────────────────────────────
  { id: "wc26-r32-09", home: "Spain 🇪🇸",        away: "Austria 🇦🇹",       lockedAt: 1783017000 },
  { id: "wc26-r32-10", home: "Portugal 🇵🇹",     away: "Croatia 🇭🇷",       lockedAt: 1783031400 },
  // ── July 3, 2026 ───────────────────────────────────────────────────────────
  { id: "wc26-r32-11", home: "Switzerland 🇨🇭",  away: "Algeria 🇩🇿",       lockedAt: 1783045800 },
  { id: "wc26-r32-13", home: "Australia 🇦🇺",    away: "Egypt 🇪🇬",         lockedAt: 1783099800 },
  { id: "wc26-r32-14", home: "Argentina 🇦🇷",    away: "Cape Verde 🇨🇻",    lockedAt: 1783114200 },
  // ── July 4, 2026 ───────────────────────────────────────────────────────────
  { id: "wc26-r32-15", home: "Colombia 🇨🇴",     away: "Ghana 🇬🇭",         lockedAt: 1783126800 },
  { id: "wc26-r32-16", home: "Canada 🇨🇦",       away: "Morocco 🇲🇦",       lockedAt: 1783182600 },
];

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
const APP_URL   = (process.env.APP_URL || "https://mangooal.app").replace(/\/$/, "");
const TEST_MODE = process.env.TEST_MODE === "true";

if (!BOT_TOKEN || !CHAT_ID) {
  console.log("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping.");
  process.exit(0);
}

async function sendMessage(text) {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    }
  );
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram API error: ${json.description}`);
  return json;
}

// ── Test mode: send a verification ping and exit ──────────────────────────────
if (TEST_MODE) {
  await sendMessage(
    "🤖 <b>Mangooal bot check</b>\n" +
    "Reminder workflow is connected and ready.\n" +
    `App: ${APP_URL}`
  );
  console.log("Test message sent.");
  process.exit(0);
}

// ── Normal mode: notify any match locking in the next 45 minutes ─────────────
const now = Math.floor(Date.now() / 1000);
// 45-min window absorbs up to ~15 min of GH Actions scheduling delay
const WINDOW_SECS = 45 * 60;
let sent = 0;

for (const match of MATCHES) {
  const secsUntilLock = match.lockedAt - now;
  if (secsUntilLock <= 0 || secsUntilLock > WINDOW_SECS) continue;

  const mins = Math.round(secsUntilLock / 60);
  const matchUrl = `${APP_URL}/match/${match.id}`;

  const text =
    `⚽ <b>${match.home} vs ${match.away}</b>\n` +
    `FIFA World Cup 2026 · Round of 32\n\n` +
    `🔒 Picks close in <b>~${mins} min</b>\n` +
    `Submit your free score prediction before kickoff!\n\n` +
    `→ ${matchUrl}`;

  await sendMessage(text);
  console.log(`✅ Sent reminder for ${match.id} (${match.home} vs ${match.away}, ${mins} min until lock)`);
  sent++;
}

if (sent === 0) {
  console.log(
    `No matches locking in the next ${WINDOW_SECS / 60} min. ` +
    `(now = ${new Date(now * 1000).toISOString()})`
  );
}
