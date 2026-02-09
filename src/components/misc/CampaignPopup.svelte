<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { fade, scale } from "svelte/transition";

export let storageKey = "campaign-popup";

let isOpen = false;
let doNotShowToday = false;

// Easter Egg State
let isHacked = false;
const konamiCode = [
    "arrowup",
    "arrowup",
    "arrowdown",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "arrowleft",
    "arrowright",
    "b",
    "a",
];
let inputSequence: string[] = [];

function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;

    // Add key to sequence (case-insensitive)
    const key = e.key.toLowerCase();
    inputSequence = [...inputSequence, key];
    
    // Debugging: Log key presses to help check if they are registering
    console.log("EasterEgg Key:", key);

    // Keep only the last N keys
    if (inputSequence.length > konamiCode.length) {
        inputSequence = inputSequence.slice(-konamiCode.length);
    }

    // Check match
    if (JSON.stringify(inputSequence) === JSON.stringify(konamiCode)) {
        activateEasterEgg();
    }
}

function activateEasterEgg() {
    console.log("Easter Egg Activated!");
    isHacked = true;
    // Optional: Could add a sound effect here
}

onMount(() => {
    const expiry = localStorage.getItem(storageKey);
    const now = Date.now();

    if (expiry && now < Number.parseInt(expiry, 10)) {
        isOpen = false;
    } else {
        isOpen = true; // Show by default if not expired
    }

    window.addEventListener("keydown", handleKeydown);
});

onDestroy(() => {
    if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
    }
});

function closePopup() {
    if (doNotShowToday) {
        const expiryDate = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        localStorage.setItem(storageKey, expiryDate.toString());
    }
    isOpen = false;
}

function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        closePopup();
    }
}
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 font-mono transition-colors duration-500"
    class:bg-red-900-20={isHacked}
    on:click={handleBackdropClick}
    transition:fade={{ duration: 300 }}
  >
    <div
      class="relative w-full max-w-lg bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border transition-all duration-500"
      class:border-gray-700={!isHacked}
      class:border-red-500={isHacked}
      class:shadow-red-500-50={isHacked}
      transition:scale={{ duration: 300, start: 0.95 }}
    >
      <!-- Terminal Header -->
      <div 
        class="px-4 py-3 border-b flex items-center justify-between handle transition-colors duration-500"
        class:bg-[#2d2d2d]={!isHacked}
        class:border-gray-700={!isHacked}
        class:bg-red-900={isHacked}
        class:border-red-500={isHacked}
      >
        <div class="flex items-center gap-2">
          <button on:click={closePopup} class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></button>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div 
            class="text-xs select-none font-bold transition-all duration-300"
            class:text-gray-400={!isHacked}
            class:text-red-200={isHacked}
        >
            {isHacked ? "ROOT_ACCESS_GRANTED.sh — su — 80x24" : "NOTICE.sh — -zsh — 80x24"}
        </div>
        <div class="w-10"></div> <!-- Spacer for centering -->
      </div>

      <!-- Content (Scrollable) -->
      <div class="flex-1 w-full relative overflow-y-auto p-6 space-y-4 transition-colors duration-500">
        <div>
          {#if isHacked}
            <span class="text-red-500 font-bold">root@server</span> <span class="text-white">:</span> <span class="text-blue-400">~</span> <span class="text-gray-100"># whoami</span><br/>
            <span class="text-red-400">root</span>
          {:else}
            <span class="text-blue-400">➜</span> <span class="text-cyan-400">~</span> <span class="text-gray-100">cat NOTICE.md</span>
          {/if}
        </div>
        
        <div class="space-y-2 text-sm md:text-base leading-relaxed text-gray-300">
            {#if isHacked}
                <div class="animate-pulse">
                    <h1 class="text-xl font-bold text-red-500 mb-4">⚠️ SYSTEM OVERRIDE INITIATED</h1>
                    <p class="text-red-300">
                        관리자 권한을 획득하셨습니다.<br>
                        이스터에그를 발견하신 것을 축하합니다! 🎉<br>
                    </p>
                    <br/>
                    <p class="text-red-400 font-bold">// HIDDEN_DATA</p>
                    <ul class="list-none space-y-1 pl-2 border-l-2 border-red-700 ml-1">
                        <li><span class="text-yellow-500">[SECRET]</span> You are awesome.</li>
                        <li><span class="text-yellow-500">[CODE]</span> Keep coding.</li>
                    </ul>
                </div>
            {:else}
                <h1 class="text-xl font-bold text-white mb-4"># 공지사항 업데이트 v2.0</h1>
                
                <p>
                    안녕하세요. 개발자 Hongseo Jang입니다.👋<br>
                    부족하지만 항상 도움이 되는 포스팅을 제공하겠습니다.<br>
                </p>
                
                <br/>
                <p class="text-green-400 font-bold">// 최근 업데이트</p>
                <ul class="list-none space-y-1 pl-2 border-l-2 border-gray-700 ml-1">
                    <li><span class="text-yellow-500">[FIX]</span> PDF 로딩 지연 문제 해결</li>
                    <li><span class="text-blue-500">[FEAT]</span> 다크 모드 네이티브 지원</li>
                    <li><span class="text-blue-500">[FEAT]</span> 모바일 반응형 디자인 적용</li>
                </ul>
                
                <br/>
                <p>
                    계속해서 더 나은 개발 경험을 제공하겠습니다.<br/>
                    감사합니다.
                </p>
            {/if}
        </div>
      </div>

      <!-- Footer: Controls -->
      <div 
        class="px-5 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-500"
        class:bg-[#1e1e1e]={!isHacked}
        class:border-gray-700={!isHacked}
        class:bg-red-950={isHacked}
        class:border-red-900={isHacked}
      >
        <label
          class="flex items-center space-x-2 cursor-pointer text-sm text-gray-400 select-none hover:text-green-400 transition-colors"
        >
          <input
            type="checkbox"
            bind:checked={doNotShowToday}
            class="appearance-none w-4 h-4 border border-gray-500 rounded-sm bg-[#2d2d2d] checked:bg-green-500 checked:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors relative"
          />
          <!-- checkbox checkmark mock since appearance-none removes it, utilizing css or just simple bg change is often enough for custom style or use accent-color -->
          <span>오늘 하루 보지 않기</span>
        </label>

        <button
          on:click={closePopup}
          class="w-full sm:w-auto px-5 py-2 bg-transparent border text-gray-300 rounded font-mono text-sm hover:text-white transition-all uppercase tracking-wide"
          class:border-gray-500={!isHacked}
          class:hover:bg-gray-700={!isHacked}
          class:hover:border-gray-400={!isHacked}
          class:border-red-500={isHacked}
          class:hover:bg-red-900={isHacked}
          class:hover:border-red-400={isHacked}
          class:text-red-300={isHacked}
        >
          {isHacked ? "LOGOUT" : "exit"}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
    /* Custom checkmark for the terminal checkbox if needed, or rely on accent-color */
    input[type="checkbox"]:checked::after {
        content: '✓';
        display: block;
        color: black;
        font-size: 10px;
        text-align: center;
        line-height: 14px;
        font-weight: bold;
    }
</style>