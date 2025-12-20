<script>
import { onDestroy, onMount } from "svelte";

let isZenMode = false;
let isPostPage = false;

function setZenMode(value) {
	if (isZenMode === value) return; // Prevent unnecessary reflows
	isZenMode = value;
	if (isZenMode) {
		document.documentElement.classList.add("zen-mode");
	} else {
		document.documentElement.classList.remove("zen-mode");
	}
}

function toggleZenMode() {
	setZenMode(!isZenMode);
}

function checkPage() {
	if (typeof window === "undefined") return;

	let path = window.location.pathname;
	if (path.endsWith("/") && path.length > 1) {
		path = path.slice(0, -1);
	}

	// Enable Zen Mode strictly on sub-paths of /posts, but NOT on /posts itself
	isPostPage = path.startsWith("/posts") && path !== "/posts";

	// If we are NOT on a post page, force disable Zen Mode
	if (!isPostPage && isZenMode) {
		setZenMode(false);
	}
}

onMount(() => {
	checkPage();

	// Listen for various navigation events to ensure we catch the page change
	document.addEventListener("swup:content:replace", checkPage);
	document.addEventListener("swup:page:view", checkPage);
	document.addEventListener("astro:page-load", checkPage); // Fallback if Astro View Transitions are active
	window.addEventListener("popstate", checkPage);
});

onDestroy(() => {
	if (typeof window !== "undefined") {
		document.removeEventListener("swup:content:replace", checkPage);
		document.removeEventListener("swup:page:view", checkPage);
		document.removeEventListener("astro:page-load", checkPage);
		window.removeEventListener("popstate", checkPage);
	}
});
</script>

{#if isPostPage}
    <button
        aria-label={isZenMode ? "Exit Zen Mode" : "Toggle Zen Mode"}
        class="zen-toggle-btn fixed z-[100] bottom-20 right-4 p-3 rounded-full bg-white/80 dark:bg-black/80 shadow-md backdrop-blur-sm border border-black/10 dark:border-white/10 transition-all active:scale-95 group pointer-events-auto"
        on:click={toggleZenMode}
        class:active={isZenMode}
    >
        {#if isZenMode}
            <!-- Icon: Close / X -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-neutral-600 dark:text-neutral-400 group-hover:text-[var(--primary)] transition-colors" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M18 6l-12 12"></path>
                <path d="M6 6l12 12"></path>
            </svg>
        {:else}
            <!-- Icon: Self Improvement / Mediation -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-neutral-600 dark:text-neutral-400 group-hover:text-[var(--primary)] transition-colors" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 4a3.5 3.5 0 0 1 2.449 6.027l.051 .028a7.5 7.5 0 0 1 4.545 4.966l .069 .328l.019 .343c.094 3.737 -3.003 6.308 -6.32 6.308c-3.791 0 -7.213 -3 -7.213 -6.1c0 -.972 .298 -1.867 .817 -2.623l.169 -.229l.068 -.08l.192 -.215a7.502 7.502 0 0 1 5.105 -3.896l.05 -.009a3.5 3.5 0 0 1 2.399 -5.207z" stroke-width="0" fill="currentColor"></path>
            </svg>
        {/if}
        
        {#if isZenMode}
        <div class="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Exit Zen Mode
        </div>
        {:else}
        <div class="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Zen Mode
        </div>
        {/if}
    </button>
{/if}

<style>
    /* Styling for the button */
    .zen-toggle-btn.active {
        background-color: var(--primary);
        color: white;
        box-shadow: 0 0 0 2px var(--primary); /* Ring simulation */
    }
    .zen-toggle-btn.active svg {
        color: white;
    }
</style>
