<script lang="ts">
import { onMount } from "svelte";
import { ACHIEVEMENTS, getUnlocked } from "@utils/achievements";

let unlocked: string[] = [];

onMount(() => {
	unlocked = getUnlocked();
});
</script>

<div class="border border-gray-700 rounded bg-black/30 p-4 space-y-3">
  <p class="text-gray-500 text-xs">// achievements unlocked in this browser</p>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {#each ACHIEVEMENTS as ach (ach.id)}
      {@const isUnlocked = unlocked.includes(ach.id)}
      <div
        class="flex items-start gap-2 rounded px-3 py-2 border transition-colors"
        class:border-green-700={isUnlocked}
        class:bg-green-950-20={isUnlocked}
        class:border-gray-800={!isUnlocked}
        class:opacity-50={!isUnlocked}
      >
        <span class="text-lg leading-none">{isUnlocked ? ach.icon : "🔒"}</span>
        <div class="min-w-0">
          <p class="text-sm font-bold" class:text-green-400={isUnlocked} class:text-gray-500={!isUnlocked}>
            {isUnlocked ? ach.title : "???"}
          </p>
          <p class="text-xs text-gray-500">
            {isUnlocked ? ach.description : "아직 잠겨 있음"}
          </p>
        </div>
      </div>
    {/each}
  </div>

  <p class="text-gray-600 text-xs pt-1">{unlocked.length} / {ACHIEVEMENTS.length} unlocked — 이 브라우저 기준</p>
</div>

<style>
  .bg-green-950-20 {
    background-color: rgba(5, 46, 22, 0.2);
  }
</style>
