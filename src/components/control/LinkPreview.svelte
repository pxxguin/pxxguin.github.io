<script lang="ts">
import { onMount } from "svelte";

let isVisible = false;
let pos = { x: 0, y: 0 };
let metaData = { title: "", description: "", image: "" };
let cache = new Map();
let currentUrl = "";
let hoverTimeout: NodeJS.Timeout;

interface MetaData {
	title: string;
	description: string;
	image: string;
}

async function fetchMeta(url: string) {
	if (cache.has(url)) return cache.get(url);

	try {
		const response = await fetch(url);
		const html = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		const title =
			doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
			doc.title;
		const description =
			doc
				.querySelector('meta[property="og:description"]')
				?.getAttribute("content") || "";
		const image =
			doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
			"";

		const data = { title, description, image };
		cache.set(url, data);
		return data;
	} catch (e) {
		console.error("Failed to fetch link preview", e);
		return null;
	}
}

function handleMouseOver(e: MouseEvent) {
	const target = (e.target as Element).closest("a");
	if (!target || !target.href) return;

	// Check if it's an internal link and not a hash link
	const url = new URL(target.href);
	const allowedOrigins = [window.location.origin, "https://pxxguin.github.io"];

	if (!allowedOrigins.includes(url.origin) || url.hash) return;

	console.log("Mouseover on internal link:", target.href);

	// Ignore navigation links, sidebar, etc. Only focus on content links if possible
	if (target.closest("#navbar") || target.closest("#sidebar")) {
		return;
	}

	// Explicitly check if inside content area to be safe
	const isContentLink =
		target.closest("#content-wrapper") || target.closest(".prose");
	console.log("Is content link?", isContentLink);

	if (!isContentLink) return;

	currentUrl = target.href;

	clearTimeout(hoverTimeout);
	hoverTimeout = setTimeout(async () => {
		if (currentUrl !== target.href) return;

		const rect = target.getBoundingClientRect();
		const fetchedData = await fetchMeta(currentUrl);
		console.log("Fetched data:", fetchedData);

		if (fetchedData) {
			metaData = fetchedData;
			// Calculate position
			const cardWidth = 300;
			let left = rect.left + rect.width / 2 - cardWidth / 2;
			let top = rect.top - 10; // default above

			// If insufficient space above (150px approx card height + margin), show below
			if (rect.top < 160) {
				top = rect.bottom + 10;
			} else {
				top = rect.top - 160;
			}

			// Boundary checks (horizontal)
			if (left < 10) left = 10;
			if (left + cardWidth > window.innerWidth - 10)
				left = window.innerWidth - cardWidth - 10;

			pos = { x: left, y: top };
			isVisible = true;
		}
	}, 300); // 300ms delay
}

function handleMouseOut() {
	clearTimeout(hoverTimeout);
	isVisible = false;
	currentUrl = "";
}

onMount(() => {
	document.addEventListener("mouseover", handleMouseOver);
	document.addEventListener("mouseout", handleMouseOut);

	return () => {
		document.removeEventListener("mouseover", handleMouseOver);
		document.removeEventListener("mouseout", handleMouseOut);
	};
});
</script>

{#if isVisible}
  <div 
      class="fixed z-[9999] w-[300px] bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden pointer-events-none transition-opacity duration-200 animate-in fade-in slide-in-from-bottom-2"
      style="left: {pos.x}px; top: {pos.y}px;"
  >
      {#if metaData.image}
          <div class="h-32 w-full overflow-hidden">
              <img src={metaData.image} alt="Preview" class="w-full h-full object-cover">
          </div>
      {/if}
      <div class="p-3">
          <h4 class="font-bold text-sm text-black dark:text-white line-clamp-1 mb-1">{metaData.title}</h4>
          <p class="text-xs text-black/60 dark:text-white/60 line-clamp-2">{metaData.description}</p>
      </div>
  </div>
{/if}
