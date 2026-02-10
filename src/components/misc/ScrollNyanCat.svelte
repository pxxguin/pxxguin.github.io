<script lang="ts">
import { onMount } from "svelte";

let progress = 0;

function updateProgress() {
	const winScroll =
		document.body.scrollTop || document.documentElement.scrollTop;
	const height =
		document.documentElement.scrollHeight -
		document.documentElement.clientHeight;

	// Avoid division by zero
	if (height > 0) {
		progress = (winScroll / height) * 100;
	}
}

onMount(() => {
	window.addEventListener("scroll", updateProgress, { passive: true });
	updateProgress(); // Initial check

	return () => {
		window.removeEventListener("scroll", updateProgress);
	};
});
</script>

<!-- Only show if page is scrollable (height > 0) -->
<div 
    class="fixed top-0 left-0 w-full h-[4px] z-[9999] pointer-events-none"
    style="display: {progress > 0 ? 'block' : 'none'};"
>
    <!-- Rainbow Trail -->
    <div 
        class="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"
        style="width: {progress}%; transition: width 0.1s linear;"
    ></div>

    <!-- Nyan Cat Icon -->
    <div 
        class="absolute top-[-8px] w-8 h-5"
        style="left: calc({progress}% - 16px); transition: left 0.1s linear;"
    >
        <!-- Simple Pixel Nyan Cat using CSS box-shadow or SVG -->
        <svg viewBox="0 0 34 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
            <!-- Poptart Body -->
            <rect x="7" y="4" width="20" height="14" rx="2" fill="#FFCC99" stroke="black" stroke-width="2"/>
            <rect x="10" y="7" width="14" height="8" rx="1" fill="#FF99CC"/>
            <!-- Dots -->
            <rect x="12" y="9" width="2" height="2" fill="#FF3399"/>
            <rect x="16" y="11" width="2" height="2" fill="#FF3399"/>
            <rect x="20" y="8" width="2" height="2" fill="#FF3399"/>
            <!-- Head -->
            <rect x="22" y="3" width="10" height="8" rx="2" fill="#999999" stroke="black" stroke-width="2"/>
            <rect x="23" y="5" width="2" height="2" fill="black"/> <!-- Eye -->
            <rect x="29" y="5" width="2" height="2" fill="black"/> <!-- Eye -->
            <!-- Feet -->
            <rect x="8" y="18" width="3" height="3" fill="#999999" stroke="black" stroke-width="1"/>
            <rect x="13" y="18" width="3" height="3" fill="#999999" stroke="black" stroke-width="1"/>
            <rect x="23" y="18" width="3" height="3" fill="#999999" stroke="black" stroke-width="1"/>
            <rect x="28" y="18" width="3" height="3" fill="#999999" stroke="black" stroke-width="1"/>
            <!-- Tail -->
            <path d="M4 10C2 10 1 12 1 12S2 14 4 14H7V10H4Z" fill="#999999" stroke="black" stroke-width="2"/>
        </svg>
    </div>
</div>
