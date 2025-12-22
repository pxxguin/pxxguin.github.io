<script>
import Icon from "@iconify/svelte";
import confetti from "canvas-confetti";
import { onDestroy, onMount } from "svelte";

let isMenuOpen = false;
let isZenMode = false;
let isPostPage = false;

// Reaction Logic
let clapCount = 0;
let currentPostId = "";

function setZenMode(value) {
	if (isZenMode === value) return;
	isZenMode = value;
	if (isZenMode) {
		document.documentElement.classList.add("zen-mode");
	} else {
		document.documentElement.classList.remove("zen-mode");
	}
}

function toggleMenu() {
	isMenuOpen = !isMenuOpen;
}

function handleClap(event) {
	// Increment count
	clapCount += 1;
	if (currentPostId) {
		localStorage.setItem(
			`reaction-count-${currentPostId}`,
			clapCount.toString(),
		);
	}

	// Confetti Effect
	const rect = event.target.getBoundingClientRect();
	const x = (rect.left + rect.width / 2) / window.innerWidth;
	const y = (rect.top + rect.height / 2) / window.innerHeight;

	confetti({
		particleCount: 30,
		spread: 70,
		origin: { x, y },
		colors: ["#FFC700", "#FF0000", "#2E3192", "#41BBC7"],
		zIndex: 9999,
	});
}

function updatePostId() {
	const path = window.location.pathname;
	let cleanPath =
		path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
	currentPostId = cleanPath.split("/").pop() || "";

	// Load saved count
	if (currentPostId) {
		const saved = localStorage.getItem(`reaction-count-${currentPostId}`);
		if (saved) clapCount = Number.parseInt(saved, 10);
		else clapCount = 0;
	}
}

function checkPage() {
	if (typeof window === "undefined") return;

	let path = window.location.pathname;
	if (path.endsWith("/") && path.length > 1) {
		path = path.slice(0, -1);
	}

	// Enable strictly on sub-paths of /posts, but NOT on /posts itself
	isPostPage = path.startsWith("/posts") && path !== "/posts";

	// Update ID for reactions if on post page
	if (isPostPage) {
		updatePostId();
	} else {
		// Force disable things if not on post page
		if (isZenMode) setZenMode(false);
		isMenuOpen = false;
	}
}

onMount(() => {
	checkPage();

	document.addEventListener("swup:content:replace", checkPage);
	document.addEventListener("swup:page:view", checkPage);
	document.addEventListener("astro:page-load", checkPage);
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
    <div class="fixed z-[100] bottom-20 right-4 flex flex-col items-end gap-3 pointer-events-auto">
        
        <!-- Menu Items -->
        {#if isMenuOpen}
            <!-- Zen Mode Toggle -->
            <button 
                on:click={() => setZenMode(!isZenMode)}
                class="flex items-center gap-3 pr-1 group transition-all duration-300 origin-bottom-right animate-in fade-in slide-in-from-bottom-4"
            >
                 <div class="text-xs font-bold bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {isZenMode ? "Exit Zen Mode" : "Zen Mode"}
                </div>
                <div class={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-sm transition-all active:scale-95 ${
                    isZenMode ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white/80 dark:bg-black/80 border-black/10 dark:border-white/10"
                }`}>
                    {#if isZenMode}
                        <Icon icon="material-symbols:close-rounded" class="text-xl" />
                    {:else}
                        <Icon icon="material-symbols:self-improvement-rounded" class="text-xl text-neutral-600 dark:text-neutral-400 group-hover:text-[var(--primary)]" />
                    {/if}
                </div>
            </button>

            <!-- Copy Link -->
            <button 
                on:click={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // Optional: Show toast or feedback
                    const btn = document.getElementById('copy-link-btn');
                    if(btn) {
                        btn.classList.add('bg-green-500', 'text-white');
                        setTimeout(() => btn.classList.remove('bg-green-500', 'text-white'), 2000);
                    }
                }}
                class="flex items-center gap-3 pr-1 group transition-all duration-300 delay-[50ms] origin-bottom-right animate-in fade-in slide-in-from-bottom-4"
            >
                <div class="text-xs font-bold bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    Copy Link
                </div>
                <div id="copy-link-btn" class="w-12 h-12 rounded-full bg-white/80 dark:bg-black/80 flex items-center justify-center shadow-lg border border-black/10 dark:border-white/10 backdrop-blur-sm transition-all active:scale-95 hover:scale-105">
                     <Icon icon="material-symbols:link-rounded" class="text-xl text-neutral-600 dark:text-neutral-400" />
                </div>
            </button>

            <!-- LinkedIn Share -->
            <button 
                on:click={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                class="flex items-center gap-3 pr-1 group transition-all duration-300 delay-[100ms] origin-bottom-right animate-in fade-in slide-in-from-bottom-4"
            >
                <div class="text-xs font-bold bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    Share on LinkedIn
                </div>
                <div class="w-12 h-12 rounded-full bg-[#0077b5] flex items-center justify-center shadow-lg border border-black/10 backdrop-blur-sm transition-all active:scale-95 hover:scale-105">
                     <Icon icon="fa6-brands:linkedin-in" class="text-xl text-white" />
                </div>
            </button>

             <!-- X (Twitter) Share -->
            <button 
                on:click={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                class="flex items-center gap-3 pr-1 group transition-all duration-300 delay-[150ms] origin-bottom-right animate-in fade-in slide-in-from-bottom-4"
            >
                <div class="text-xs font-bold bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    Share on X
                </div>
                <div class="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg border border-black/10 backdrop-blur-sm transition-all active:scale-95 hover:scale-105">
                     <Icon icon="fa6-brands:x-twitter" class="text-xl text-white dark:text-black" />
                </div>
            </button>

            <!-- Clap Button -->
            <button 
                on:click={handleClap}
                class="flex items-center gap-3 pr-1 group transition-all duration-300 delay-[200ms] origin-bottom-right animate-in fade-in slide-in-from-bottom-4"
            >
                <div class="text-xs font-bold bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    Clap ({clapCount})
                </div>
                <div class="w-12 h-12 rounded-full bg-white/80 dark:bg-black/80 flex items-center justify-center shadow-lg border border-black/10 dark:border-white/10 backdrop-blur-sm transition-all active:scale-95 hover:scale-105">
                     <span class="text-xl">👏</span>
                </div>
            </button>
        {/if}

        <!-- Main Trigger Button -->
        <button
            on:click={toggleMenu}
            aria-label="Toggle Actions"
            class={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-sm transition-all active:scale-95 z-10 ${
                isMenuOpen ? "bg-black/90 dark:bg-white/90 text-white dark:text-black border-transparent" : "bg-black/90 dark:bg-white/90 text-white dark:text-black border-white/10 dark:border-black/10"
            }`}
        >
            <Icon icon="material-symbols:add-rounded" class={`text-2xl transition-transform duration-300 ${isMenuOpen ? "rotate-45" : ""}`} />
        </button>
    </div>
{/if}
