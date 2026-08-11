// 빌드된 사이트(dist/)를 실제로 띄워 핵심 페이지에서 콘솔 에러/네트워크 실패가 없는지 확인하는 스모크 테스트.
// 로컬 수동 점검용이던 playwright-check.js를 일반화 + 다중 페이지 검사로 확장한 버전.
// CI에서는 .github/workflows/deploy.yml의 smoke-test job이 dist를 서빙한 뒤 이 스크립트를 실행한다.
//
// 사용법: node scripts/smoke-check.mjs
// 환경변수: SMOKE_BASE_URL (기본값 http://localhost:4321)

import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:4321";

const staticPaths = [
	"/",
	"/archive/",
	"/about/",
	"/portfolio/",
	"/guestbook/",
	"/privacy/",
	"/secret/",
	"/login/",
];

// rss.xml에서 실제 존재하는 포스트 하나를 동적으로 뽑아 검사 대상에 포함한다.
// 슬러그를 하드코딩하면 그 포스트가 삭제/이동될 때 테스트가 함께 깨지므로 피한다.
function findSamplePostPath() {
	try {
		const rss = readFileSync("./dist/rss.xml", "utf-8");
		const match = rss.match(/<item>[\s\S]*?<link>(.*?)<\/link>/);
		if (!match) return null;
		return new URL(match[1]).pathname;
	} catch {
		return null;
	}
}

const samplePost = findSamplePostPath();
const paths = samplePost ? [...staticPaths, samplePost] : staticPaths;

const browser = await chromium.launch();
let hasFailures = false;

for (const path of paths) {
	const page = await browser.newPage();
	const issues = [];

	page.on("console", (msg) => {
		if (msg.type() === "error") issues.push(`console: ${msg.text()}`);
	});
	page.on("pageerror", (err) => issues.push(`pageerror: ${err}`));
	page.on("requestfailed", (req) => {
		issues.push(`requestfailed: ${req.url()} — ${req.failure()?.errorText}`);
	});

	const url = `${BASE_URL}${path}`;
	try {
		await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
		await page.waitForTimeout(1500); // Svelte island hydration 대기
	} catch (e) {
		issues.push(`navigation failed: ${e}`);
	}

	if (issues.length > 0) {
		hasFailures = true;
		console.error(`FAIL ${path}`);
		for (const issue of issues) console.error(`  - ${issue}`);
	} else {
		console.log(`PASS ${path}`);
	}

	await page.close();
}

await browser.close();

if (hasFailures) {
	console.error("\n스모크 테스트 실패 — 위 FAIL 항목을 확인하세요.");
	process.exit(1);
}
console.log("\n모든 페이지 스모크 테스트 통과.");
