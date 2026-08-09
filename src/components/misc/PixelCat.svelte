<script lang="ts">
import { fade } from "svelte/transition";
import { getFlag } from "@utils/achievements";
import { TERMINAL_OPEN_EVENT } from "@utils/terminal-events";

let state: "sleeping" | "awake" | "meowing" = "sleeping";
let meowTimeout: ReturnType<typeof setTimeout>;

const messages = [
	"Meow! 🐟",
	"Prrr...",
	"Feed me?",
	"Zzz...",
	"Bug found? 🐛",
	"Don't touch me! 😡",
];
let currentMessage = "Meow! 🐟";

const LUCKY_CHANCE = 0.15;

function wakeUp() {
	if (state === "sleeping") {
		state = "awake";
	}
}

function sleep() {
	if (state === "awake") {
		state = "sleeping";
	}
}

function meow() {
	if (state === "meowing") return;

	if (Math.random() < LUCKY_CHANCE) {
		const flag = getFlag("lucky-cat");
		navigator.clipboard?.writeText(flag).then(() => {
			currentMessage = "🍀 복사되었습니다!";
		});
	} else {
		// Pick random message
		currentMessage = messages[Math.floor(Math.random() * messages.length)];
	}

	state = "meowing";
	clearTimeout(meowTimeout);
	meowTimeout = setTimeout(() => {
		state = "awake"; // Go back to awake (hover logic usually keeps it awake)
	}, 2000);
}

// Opens the terminal easter-egg popup on demand. It only auto-opens on the
// home page, so this is how it's reachable from every other page.
function openTerminal(event: MouseEvent) {
	event.stopPropagation();
	window.dispatchEvent(new CustomEvent(TERMINAL_OPEN_EVENT));
}
</script>

<!-- Fixed Bottom Right Container -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class="pixel-cat-container fixed bottom-4 right-4 z-50 flex flex-col items-end cursor-pointer"
  on:mouseenter={wakeUp}
  on:mouseleave={sleep}
  on:click={meow}
>
  
  <!-- Terminal Toggle Button -->
  <button
    type="button"
    on:click={openTerminal}
    title="터미널 열기"
    aria-label="터미널 열기"
    class="terminal-btn mb-2 mr-1 w-12 h-12 rounded-full bg-zinc-800 dark:bg-zinc-200 border-2 border-black dark:border-white shadow-lg flex items-center justify-center text-emerald-400 dark:text-emerald-600 hover:scale-110 active:scale-95 transition-transform"
  >
    <span class="text-base font-mono font-bold leading-none">&gt;_</span>
  </button>

  <!-- Speech Bubble -->
  {#if state === 'meowing'}
    <div 
        transition:fade={{ duration: 200 }} 
        class="bubble mb-2 mr-2 bg-white text-black dark:bg-zinc-800 dark:text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg border-2 border-black dark:border-white relative"
    >
        {currentMessage}
        <!-- Tail of bubble -->
        <div class="absolute bottom-[-6px] right-4 w-3 h-3 bg-white dark:bg-zinc-800 border-r-2 border-b-2 border-black dark:border-white transform rotate-45"></div>
    </div>
  {/if}

  <!-- Cat SVG -->
  <!-- Simple Black Cat Pixel Art style using SVG rects -->
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="cat-svg">
    <!-- Body (Black) -->
    <path 
        d="M6 24h20v8H6z" 
        class="fill-zinc-800 dark:fill-zinc-200 transition-colors" 
    />
    <!-- Head -->
    <path 
        d="M10 16h12v8H10z" 
        class="fill-zinc-800 dark:fill-zinc-200 transition-colors" 
    />
    <!-- Ears -->
    <path 
        d="M10 13h3v3h-3zM19 13h3v3h-3z" 
        class="fill-zinc-800 dark:fill-zinc-200 transition-colors" 
    />
    
    <!-- Tail (Animated) -->
    <rect x="26" y="26" width="4" height="2" class="fill-zinc-800 dark:fill-zinc-200 tail" />

    <!-- Face Elements based on state -->
    {#if state === 'sleeping'}
        <!-- Sleeping Eyes ( -- -- ) -->
        <rect x="13" y="19" width="2" height="1" class="fill-white dark:fill-zinc-900" />
        <rect x="17" y="19" width="2" height="1" class="fill-white dark:fill-zinc-900" />
        <!-- Zzz animation could be added here -->
    {:else}
        <!-- Awake Eyes ( [] [] ) -->
        <rect x="13" y="18" width="2" height="2" class="fill-white dark:fill-zinc-900" />
        <rect x="17" y="18" width="2" height="2" class="fill-white dark:fill-zinc-900" />
        
        <!-- Pupils -->
        <rect x="14" y="19" width="1" height="1" class="fill-emerald-400" />
        <rect x="18" y="19" width="1" height="1" class="fill-emerald-400" />
    {/if}

    <!-- Mouth -->
    {#if state === 'meowing'}
        <rect x="15" y="22" width="2" height="2" class="fill-pink-400" />
    {/if}

  </svg>
</div>

<style>
  .pixel-cat-container {
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    transition: transform 0.1s;
  }
  .pixel-cat-container:active {
    transform: scale(0.95);
  }
  
  /* Simple breathing animation */
  .cat-svg {
    animation: breathe 3s infinite ease-in-out;
  }
  
  @keyframes breathe {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-1px); }
  }

  /* Tail wag */
  .tail {
      transform-origin: 26px 27px;
      animation: tail-wag 2s infinite ease-in-out;
  }

  @keyframes tail-wag {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-10deg); }
  }
</style>
