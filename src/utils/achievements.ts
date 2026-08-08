export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
	{
		id: "notice",
		title: "Welcome Aboard",
		description: "터미널에서 공지사항(NOTICE.md)을 확인했다",
		icon: "📋",
	},
	{
		id: "konami",
		title: "Konami Master",
		description: "코나미 커맨드로 루트 권한을 얻었다",
		icon: "🕹️",
	},
	{
		id: "system-conf",
		title: "System Cracked",
		description: "system.conf에서 접속 키를 확인했다",
		icon: "🔑",
	},
	{
		id: "nice-try",
		title: "Nice Try",
		description: "rm -rf / 를 시도했다",
		icon: "💣",
	},
	{
		id: "filesystem",
		title: "File Wizard",
		description: "터미널에서 파일이나 폴더를 직접 만들었다",
		icon: "🗂️",
	},
	{
		id: "login",
		title: "Root Access",
		description: "/login에서 인증에 성공했다",
		icon: "🔓",
	},
	{
		id: "secret",
		title: "Into the Vault",
		description: "/secret 페이지에 도달했다",
		icon: "🏴",
	},
];

const STORAGE_KEY = "unlocked-achievements";

export function getUnlocked(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

export function unlock(id: string): void {
	if (typeof window === "undefined") return;
	const unlocked = getUnlocked();
	if (!unlocked.includes(id)) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked, id]));
	}
}
