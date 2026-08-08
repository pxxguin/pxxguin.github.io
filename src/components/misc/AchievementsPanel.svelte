<script lang="ts">
import { onMount } from "svelte";
import { redeem, TROPHIES, getUnlocked } from "@utils/achievements";

let unlocked: string[] = [];
let openId: string | null = null;
let guesses: Record<string, string> = {};
let errors: Record<string, string> = {};
const flagPlaceholder = "FLAG{...}";

onMount(() => {
	unlocked = getUnlocked();
});

function toggle(id: string, pending?: boolean) {
	if (unlocked.includes(id) || pending) return;
	openId = openId === id ? null : id;
	errors = { ...errors, [id]: "" };
}

function submit(id: string) {
	const guess = guesses[id] ?? "";
	if (redeem(id, guess)) {
		unlocked = [...unlocked, id];
		openId = null;
	} else {
		errors = { ...errors, [id]: "틀렸습니다. 다시 시도해보세요." };
	}
	guesses = { ...guesses, [id]: "" };
}
</script>

<div class="border border-gray-700 rounded bg-black/30 p-4 space-y-3 h-full">
  <p class="text-gray-500 text-xs">// trophy cabinet — flag를 찾아서 입력하세요</p>

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
