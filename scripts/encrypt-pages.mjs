import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PBKDF2_ITERATIONS = 100_000;
const DIST_DIR = fileURLToPath(new URL("../dist/", import.meta.url));

function loadEnvFile() {
  const envPath = fileURLToPath(new URL("../.env", import.meta.url));
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const password =
  process.env.SITE_PASSWORD ||
  process.env.PUBLIC_SITE_PASSWORD ||
  "preview";

function walkHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      walkHtmlFiles(fullPath, files);
      continue;
    }
    if (entry.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function extractSiteContent(html) {
  const openRe = /<div\b[^>]*\bid="site-content"[^>]*>/i;
  const match = openRe.exec(html);
  if (!match) return null;

  const contentStart = match.index + match[0].length;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = contentStart;

  let depth = 1;
  let tag;
  while ((tag = tagRe.exec(html))) {
    if (tag[0][1] === "/") depth -= 1;
    else depth += 1;

    if (depth === 0) {
      return {
        fullStart: match.index,
        fullEnd: tag.index + tag[0].length,
        inner: html.slice(contentStart, tag.index),
        openTag: match[0],
      };
    }
  }

  return null;
}

function encryptHtml(plaintext) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const ciphertext = Buffer.concat([encrypted, tag]);

  return {
    v: 1,
    iter: PBKDF2_ITERATIONS,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    data: ciphertext.toString("base64"),
  };
}

function publicEncPath(htmlFile) {
  const rel = relative(DIST_DIR, dirname(htmlFile)).replace(/\\/g, "/");
  return rel ? `/${rel}/content.enc` : "/content.enc";
}

const htmlFiles = walkHtmlFiles(DIST_DIR);
let encryptedCount = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const extracted = extractSiteContent(html);
  if (!extracted || !extracted.inner.trim()) continue;

  const payload = encryptHtml(extracted.inner);
  const encPath = join(dirname(file), "content.enc");
  writeFileSync(encPath, JSON.stringify(payload));

  const meta = JSON.stringify({ src: publicEncPath(file) });
  const replacement = `${extracted.openTag}</div><script type="application/json" id="encrypted-meta">${meta}</script>`;
  const nextHtml =
    html.slice(0, extracted.fullStart) +
    replacement +
    html.slice(extracted.fullEnd);

  writeFileSync(file, nextHtml);
  encryptedCount += 1;
}

console.log(
  `Encrypted #site-content into content.enc for ${encryptedCount} page(s).`,
);
