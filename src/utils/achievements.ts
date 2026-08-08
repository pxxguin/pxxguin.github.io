export interface Trophy {
	id: string;
	title: string;
	hint: string;
	icon: string;
	// The answer a visitor must type to redeem this trophy.
	flag: string;
	// True until the real hiding spot for this trophy is decided — shown as
	// "coming soon" and not redeemable yet.
	pending?: boolean;
}

export const TROPHIES: Trophy[] = [
	{
		id: "system-conf",
		title: "System Cracked",
		hint: "터미널에서 루트 권한으로 system.conf 파일을 열어보세요.",
		icon: "🔑",
		flag: "FLAG{sys73m_c0nf1g_pwned}",
	},
	{
		id: "hidden-file",
		title: "Root Explorer",
		hint: "터미널에서 루트 디렉터리까지 올라가 숨겨진 파일을 찾아보세요.",
		icon: "🗂️",
		flag: "FLAG{hidden_in_plain_root}",
	},
	{
		id: "lucky-cat",
		title: "Lucky Cat",
		hint: "우측 하단 고양이를 계속 눌러보세요. 운이 좋으면...",
		icon: "🐱",
		flag: "FLAG{lucky_cat_purrs_secrets}",
	},
	{
		id: "footer-secret",
		title: "Fine Print",
		hint: "푸터의 저작권 표시에 마우스를 올려보세요.",
		icon: "📜",
		flag: "FLAG{fine_print_reveals_all}",
	},
	{
		id: "console",
		title: "Inspector",
		hint: "개발자 도구(F12)의 콘솔 탭을 열어보세요.",
		icon: "🖥️",
		flag: "FLAG{console_ninja_spotted}",
	},
	{
		id: "notfound",
		title: "Not Really Lost",
		hint: "존재하지 않는 페이지로 가보세요. 404 숫자를 잘 살펴보세요.",
		icon: "🧭",
		flag: "FLAG{404_but_not_really_lost}",
	},
	{
		id: "robots",
		title: "Robots Welcome",
		hint: "robots.txt를 열어본 적 있나요?",
		icon: "🤖",
		flag: "FLAG{robots_txt_always_wins}",
	},
];

const STORAGE_KEY = "redeemed-trophies";

export function getUnlocked(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

export function getFlag(id: string): string {
	return TROPHIES.find((t) => t.id === id)?.flag ?? "";
}

// Compares a visitor's guess against the trophy's flag and persists it on success.
export function redeem(id: string, guess: string): boolean {
	const trophy = TROPHIES.find((t) => t.id === id);
	if (!trophy || trophy.pending || guess.trim() !== trophy.flag) return false;

	const unlocked = getUnlocked();
	if (!unlocked.includes(id)) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked, id]));
	}
	return true;
}
