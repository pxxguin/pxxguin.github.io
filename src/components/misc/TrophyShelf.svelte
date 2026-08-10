<script lang="ts">
import confetti from "canvas-confetti";
import { onDestroy, onMount } from "svelte";
import { getUnlocked, TROPHIES } from "@utils/achievements";

const TOTAL = TROPHIES.length;

interface Slot {
	threshold: number;
	icon: string;
	size: "sm" | "lg";
	label: string;
	unlockedFlavor: string;
}

// Ordered left-to-right as displayed: bronze (1st), gold (biggest, middle), silver (3rd).
const slots: Slot[] = [
	{
		threshold: 3,
		icon: "🥉",
		size: "sm",
		label: "3개 해금",
		unlockedFlavor: "이스터에그 3개 발견! 시작이 반입니다.",
	},
	{
		threshold: TOTAL,
		icon: "🏆",
		size: "lg",
		label: `전체 ${TOTAL}개 해금`,
		unlockedFlavor: "전부 다 찾으셨네요. 진짜 해커시네요 🎉",
	},
	{
		threshold: 5,
		icon: "🥈",
		size: "sm",
		label: "5개 해금",
		unlockedFlavor: "벌써 5개나! 얼마 안 남았어요.",
	},
];

let count = 0;
let openIndex: number | null = null;
let fireworksInterval: ReturnType<typeof setInterval> | undefined;

function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function burstFireworks() {
	const duration = 2500;
	const animationEnd = Date.now() + duration;
	const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

	clearInterval(fireworksInterval);
	fireworksInterval = setInterval(() => {
		const timeLeft = animationEnd - Date.now();
		if (timeLeft <= 0) {
			clearInterval(fireworksInterval);
			return;
		}
		const particleCount = 50 * (timeLeft / duration);
		confetti({
			...defaults,
			particleCount,
			origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
		});
		confetti({
			...defaults,
			particleCount,
			origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
		});
	}, 250);
}

function refresh() {
	const wasComplete = count >= TOTAL;
	count = getUnlocked().length;
	if (!wasComplete && count >= TOTAL) {
		burstFireworks();
	}
}

function toggle(i: number) {
	const slot = slots[i];
	const isUnlocked = count >= slot.threshold;
	openIndex = openIndex === i ? null : i;
	if (isUnlocked && slot.size === "lg" && openIndex === i) {
		burstFireworks();
	}
}

onMount(() => {
	count = getUnlocked().length;
	window.addEventListener("trophies-updated", refresh);
});

onDestroy(() => {
	if (typeof window !== "undefined") {
		window.removeEventListener("trophies-updated", refresh);
	}
	clearInterval(fireworksInterval);
});
</script>

<div class="flex flex-col items-center gap-3 h-full">
	<p class="text-[#3ef07f]/50 text-xs self-start">$ ls -la /trophies/</p>

	<div class="flex items-end justify-center gap-6 flex-1">
		{#each slots as slot, i}
			{@const isUnlocked = count >= slot.threshold}
			<button
				type="button"
				class="flex flex-col items-center gap-1 transition-transform hover:scale-110 focus:outline-none"
				on:click={() => toggle(i)}
				aria-label={`${slot.label} 트로피, ${isUnlocked ? "달성 완료" : "잠김"}`}
			>
				<span
					class="leading-none transition-all {slot.size === 'lg' ? 'text-7xl' : 'text-5xl'} {isUnlocked ? 'glow' : 'grayscale opacity-30'}"
				>
					{slot.icon}
				</span>
				<span class="text-[10px] text-[#3ef07f]/50">{slot.label}</span>
			</button>
		{/each}
	</div>

	{#if openIndex !== null}
		{@const slot = slots[openIndex]}
		{@const isUnlocked = count >= slot.threshold}
		<p class="text-xs text-center text-[#c9ffdb]/80 border-t border-[#3ef07f]/20 pt-2 w-full">
			{#if isUnlocked}
				{slot.unlockedFlavor}
			{:else}
				🔒 {count} / {slot.threshold}개 해금 시 열립니다.
			{/if}
		</p>
	{/if}
</div>

<style>
	.glow {
		filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.65));
	}
</style>
