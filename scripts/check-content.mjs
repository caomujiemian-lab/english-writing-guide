import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const configPath = path.join(rootDir, ".vitepress", "config.mjs");

const markdownFiles = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name);

const markdownSet = new Set(markdownFiles);
const nonContentFiles = new Set(["README.md", "MAINTENANCE.md"]);
const contentMarkdownFiles = markdownFiles.filter((name) => !nonContentFiles.has(name));
const errors = [];

function addError(message) {
  errors.push(message);
}

function pathFromLink(link) {
  const trimmed = link.trim();
  const noHash = trimmed.split("#")[0];
  if (noHash === "/" || noHash === "") return "index.md";
  const clean = noHash.replace(/^\/+/, "");
  return `${clean}.md`;
}

function isExternalLink(link) {
  return /^(https?:|mailto:|tel:)/i.test(link);
}

function isIgnorableLink(link) {
  return link.startsWith("#") || link.startsWith("javascript:");
}

function checkGuideLinks() {
  const config = fs.readFileSync(configPath, "utf8");
  const linkRegex = /link:\s*['"]([^'"]+)['"]/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(config)) !== null) {
    links.push(match[1]);
  }

  for (const link of links) {
    if (isExternalLink(link) || isIgnorableLink(link)) continue;
    const target = pathFromLink(link);
    if (!markdownSet.has(target)) {
      addError(`[config] missing page for link "${link}" -> "${target}"`);
    }
  }
}

function checkInternalMarkdownLinks() {
  const mdLinkRegex = /\[[^\]]*]\(([^)]+)\)/g;

  for (const fileName of contentMarkdownFiles) {
    const filePath = path.join(rootDir, fileName);
    const rawContent = fs.readFileSync(filePath, "utf8");
    const content = rawContent.replace(/```[\s\S]*?```/g, "");
    let match;

    while ((match = mdLinkRegex.exec(content)) !== null) {
      const rawLink = match[1].trim();
      if (isExternalLink(rawLink) || isIgnorableLink(rawLink)) continue;

      const targetPath = rawLink.split("#")[0];
      if (!targetPath) continue;

      if (targetPath.endsWith(".md")) {
        if (!markdownSet.has(targetPath)) {
          addError(`[${fileName}] broken markdown link "${rawLink}"`);
        }
        continue;
      }

      const targetAsMd = pathFromLink(targetPath);
      if (!markdownSet.has(targetAsMd)) {
        addError(`[${fileName}] broken internal link "${rawLink}" -> "${targetAsMd}"`);
      }
    }
  }
}

function checkChapterSequence() {
  const chapterNumbers = markdownFiles
    .map((name) => {
      const match = /^ch(\d+)-.+\.md$/i.exec(name);
      return match ? Number(match[1]) : null;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  if (chapterNumbers.length === 0) return;

  const min = chapterNumbers[0];
  const max = chapterNumbers[chapterNumbers.length - 1];
  for (let i = min; i <= max; i += 1) {
    if (!chapterNumbers.includes(i)) {
      addError(`[chapters] missing chapter file for number ${i}`);
    }
  }
}

checkGuideLinks();
checkInternalMarkdownLinks();
checkChapterSequence();

if (errors.length > 0) {
  console.error("Content checks failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Content checks passed (${contentMarkdownFiles.length} content markdown files scanned).`);
