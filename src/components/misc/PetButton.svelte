<script lang="ts">
import { onMount, tick } from "svelte";
import { fade } from "svelte/transition";

let clickCount = 0;
let isAnimating = false;
let reactions = [];

// Load saved count
onMount(() => {
	const saved = localStorage.getItem("pet-count");
	if (saved) {
		clickCount = Number.parseInt(saved, 10);
	}
});

function handlePet() {
	if (isAnimating) return; // Prevent spamming animation overlaps too much

	// Update count
	clickCount++;
	localStorage.setItem("pet-count", clickCount.toString());

	// Trigger animation
	isAnimating = true;
	setTimeout(() => {
		isAnimating = false;
	}, 800); // Animation duration

	// Add reaction
	addReaction();
}

function addReaction() {
	const reactionType = Math.random() > 0.5 ? "❤️" : "🐟";
	const id = Date.now();
	const reaction = {
		id,
		emoji: reactionType,
		x: (Math.random() - 0.5) * 40, // Random X offset
		y: -20, // Initial Y
	};

	reactions = [...reactions, reaction];

	// Remove after animation
	setTimeout(() => {
		reactions = reactions.filter((r) => r.id !== id);
	}, 1000);
}
</script>

<div class="flex flex-col items-center justify-center my-8 relative select-none">
    
    <!-- Floating Reactions -->
    <div class="absolute top-0 w-full h-0 flex justify-center pointer-events-none overflow-visible z-20">
        {#each reactions as r (r.id)}
            <div 
                class="absolute text-2xl animate-float-up"
                style="transform: translate({r.x}px, {r.y}px);"
                transition:fade
            >
                {r.emoji}
            </div>
        {/each}
    </div>

    <!-- Paw Animation Container -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10" style="clip-path: inset(-50px -50px -20px -50px);">
        {#if isAnimating}
             <!-- Paw Image appearing from bottom right -->
            <div class="absolute bottom-[-10px] right-[20%] w-16 h-16 animate-paw-press">
                 <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-lg">
                    <!-- Spacer -->
                    <path d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z" fill="#FFFFFF" fill-opacity="0" />
                    
                    <!-- Paw Pad (_Main) -->
                    <path d="M266.6,346c-54.6,0-99.2,40.6-99.2,90.4s44.6,80.4,99.2,80.4s99.2-30.6,99.2-80.4S321.2,346,266.6,346z" fill="#FFCCBC"/>
                    <path d="M266.6,366c-40,0-72,28-72,64s32,64,72,64s72-28,72-64S306.6,366,266.6,366z" fill="#FFAB91"/>
                    
                    <!-- Fingers -->
                    <ellipse cx="160" cy="260" rx="35" ry="50" transform="rotate(-20 160 260)" fill="#FFCCBC"/>
                    <ellipse cx="230" cy="220" rx="35" ry="50" fill="#FFCCBC"/>
                    <ellipse cx="300" cy="220" rx="35" ry="50" fill="#FFCCBC"/>
                    <ellipse cx="370" cy="260" rx="35" ry="50" transform="rotate(20 370 260)" fill="#FFCCBC"/>
                </svg>
            </div>
        {/if}
    </div>

    <!-- Button -->
    <button 
        on:click={handlePet}
        class="group relative px-6 py-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200 flex items-center gap-3 border border-zinc-200 dark:border-zinc-700 overflow-hidden"
    >
        <span class="text-2xl group-hover:scale-110 transition-transform">🐾</span>
        <div class="flex flex-col items-start">
            <span class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Pet the cat!</span>
            <span class="text-lg font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
                {clickCount.toLocaleString()}
            </span>
        </div>
        
        <!-- Hover Glow Effect -->
        <div class="absolute inset-0 rounded-full ring-2 ring-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
</div>

<style>
    @keyframes float-up {
        0% { transform: translate(var(--_tw_translate_x-x), 0) scale(0.5); opacity: 0; }
        20% { opacity: 1; transform: translate(var(--_tw_translate_x-x), -20px) scale(1.2); }
        100% { transform: translate(var(--_tw_translate_x-x), -60px) scale(1); opacity: 0; }
    }
    
    .animate-float-up {
        animation: float-up 1s ease-out forwards;
    }

    @keyframes paw-press {
        0% { transform: translate(20px, 100%) rotate(20deg); }
        30% { transform: translate(0, -10%) rotate(0deg); } /* Press down */
        50% { transform: translate(0, 0) rotate(0deg); } /* Hold slightly */
        100% { transform: translate(20px, 100%) rotate(20deg); }
    }

    .animate-paw-press {
        animation: paw-press 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
</style>
