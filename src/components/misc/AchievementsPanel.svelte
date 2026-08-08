<script lang="ts">
import confetti from "canvas-confetti";
import { onDestroy, onMount } from "svelte";
import { redeem, TROPHIES, getUnlocked } from "@utils/achievements";

let unlocked: string[] = [];
let openId: string | null = null;
let guesses: Record<string, string> = {};
let errors: Record<string, string> = {};
let fireworksInterval: ReturnType<typeof setInterval> | undefined;
const flagPlaceholder = "FLAG{...}";

$: allUnlocked = unlocked.length === TROPHIES.length;

onMount(() => {
	unlocked = getUnlocked();
});

onDestroy(() => {
	clearInterval(fireworksInterval);
});

function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

// Classic canvas-confetti "fireworks" burst pattern — random bursts from both
// bottom corners for a few seconds.
function triggerFireworks() {
	const duration = 3000;
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

function toggle(id: string, pending?: boolean) {
	if (unlocked.includes(id) || pending) return;
	openId = openId === id ? null : id;
	errors = { ...errors, [id]: "" };
}

function submit(id: string) {
	const guess = guesses[id] ?? "";
	if (redeem(id, guess)) {
		const wasComplete = allUnlocked;
		unlocked = [...unlocked, id];
		openId = null;
		if (!wasComplete && unlocked.length === TROPHIES.length) {
			triggerFireworks();
		}
	} else {
		errors = { ...errors, [id]: "틀렸습니다. 다시 시도해보세요." };
	}
	guesses = { ...guesses, [id]: "" };
}
</script>

<div class="border border-gray-700 rounded bg-black/30 p-4 space-y-3 h-full">
  <p class="text-gray-500 text-xs">// trophy cabinet — flag를 찾아서 입력하세요</p>

  {#if allUnlocked}
    <div class="border border-yellow-500 rounded bg-yellow-950/20 p-3 text-center">
      <p class="text-yellow-400 font-bold text-sm">🎉 모든 트로피를 모았습니다!</p>
    </div>
  {/if}

  <div class="space-y-2">
    {#each TROPHIES as trophy (trophy.id)}
      {@const isUnlocked = unlocked.includes(trophy.id)}
      <div
        class="rounded border transition-colors"
        class:border-green-700={isUnlocked}
        class:bg-trophy-unlocked={isUnlocked}
        class:border-gray-800={!isUnlocked}
      >
        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2 text-left disabled:cursor-default"
          on:click={() => toggle(trophy.id, trophy.pending)}
          disabled={isUnlocked || trophy.pending}
        >
          <span class="text-lg leading-none shrink-0" class:opacity-40={trophy.pending}>
            {isUnlocked ? trophy.icon : trophy.pending ? trophy.icon : "🔒"}
          </span>
          <div class="min-w-0 flex-1">
            <p
              class="text-sm font-bold"
              class:text-green-400={isUnlocked}
              class:text-gray-300={!isUnlocked && !trophy.pending}
              class:text-gray-600={trophy.pending}
            >
              {trophy.title}
            </p>
            <p class="text-xs text-gray-500">{isUnlocked ? "달성 완료" : trophy.hint}</p>
          </div>
          {#if !isUnlocked && !trophy.pending}
            <span class="text-gray-600 text-xs shrink-0">{openId === trophy.id ? "▲" : "▼"}</span>
          {/if}
        </button>

        {#if openId === trophy.id && !isUnlocked && !trophy.pending}
          <div class="px-3 pb-3">
            <div class="flex gap-2">
              <input
                type="text"
                bind:value={guesses[trophy.id]}
                placeholder={flagPlaceholder}
                autocomplete="off"
                spellcheck="false"
                class="flex-1 bg-black/40 border border-gray-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-green-500 transition-colors"
                on:keydown={(e) => e.key === "Enter" && submit(trophy.id)}
              />
              <button
                type="button"
                class="px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-xs font-bold transition-colors"
                on:click={() => submit(trophy.id)}
              >
                제출
              </button>
            </div>
            {#if errors[trophy.id]}
              <p class="text-red-500 text-xs mt-1">{errors[trophy.id]}</p>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <p class="text-gray-600 text-xs pt-1">{unlocked.length} / {TROPHIES.length} unlocked — 이 브라우저 기준</p>
</div>

<style>
  .bg-trophy-unlocked {
    background-color: rgba(5, 46, 22, 0.2);
  }
</style>
