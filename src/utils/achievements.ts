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
		hint: "가장 오래된 그 커맨드를 기억하는 자에게만, 시스템은 진실을 보여준다.",
		icon: "🔑",
		flag: "FLAG{sys73m_c0nf1g_pwned}",
	},
	{
		id: "hidden-file",
		title: "Root Explorer",
		hint: "집이 전부라고 생각했다면 오산이다. 그보다 더 위에, 남들 눈에 잘 안 띄는 무언가가 있다.",
		icon: "🗂️",
		flag: "FLAG{hidden_in_plain_root}",
	},
	{
		id: "lucky-cat",
		title: "Lucky Cat",
		hint: "가만히 두지 못하는 성격이라면, 그 대가로 뭔가를 얻을지도.",
		icon: "🐱",
		flag: "FLAG{lucky_cat_purrs_secrets}",
	},
	{
		id: "footer-secret",
		title: "Fine Print",
		hint: "아무도 끝까지 읽지 않는 작은 글씨에, 가끔 진심이 숨어있다.",
		icon: "📜",
		flag: "FLAG{fine_print_reveals_all}",
	},
	{
		id: "console",
		title: "Inspector",
		hint: "개발자들만 드나드는 뒷문이 있다.",
		icon: "🖥️",
		flag: "FLAG{console_ninja_spotted}",
	},
	{
		id: "notfound",
		title: "Not Really Lost",
		hint: "길을 잃었다고 느껴질 때, 오히려 답이 정면에 있을 수도.",
		icon: "🧭",
		flag: "FLAG{404_but_not_really_lost}",
	},
	{
		id: "robots",
		title: "Robots Welcome",
		hint: "사람이 아닌 것들을 위한 규칙도, 사람이 읽을 수 있다.",
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
		window.dispatchEvent(new CustomEvent("trophies-updated"));
	}
	return true;
}
