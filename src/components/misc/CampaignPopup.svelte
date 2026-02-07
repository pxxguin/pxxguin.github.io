<script lang="ts">
import { onMount } from "svelte";
import { fade, scale } from "svelte/transition";

export let storageKey = "campaign-popup";

let isOpen = false;
let doNotShowToday = false;

onMount(() => {
	const expiry = localStorage.getItem(storageKey);
	const now = Date.now();

	if (expiry && now < Number.parseInt(expiry, 10)) {
		isOpen = false;
	} else {
		isOpen = true; // Show by default if not expired
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
    class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 font-mono"
    on:click={handleBackdropClick}
    transition:fade={{ duration: 300 }}
  >
    <div
      class="relative w-full max-w-lg bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-gray-700"
      transition:scale={{ duration: 300, start: 0.95 }}
    >
      <!-- Terminal Header -->
      <div class="px-4 py-3 bg-[#2d2d2d] border-b border-gray-700 flex items-center justify-between handle">
        <div class="flex items-center gap-2">
          <button on:click={closePopup} class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></button>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div class="text-gray-400 text-xs select-none">NOTICE.sh — -zsh — 80x24</div>
        <div class="w-10"></div> <!-- Spacer for centering -->
      </div>

      <!-- Content (Scrollable) -->
      <div class="flex-1 w-full relative overflow-y-auto p-6 text-green-400 space-y-4">
        <div>
          <span class="text-blue-400">➜</span> <span class="text-cyan-400">~</span> <span class="text-gray-100">cat NOTICE.md</span>
        </div>
        
        <div class="space-y-2 text-sm md:text-base leading-relaxed text-gray-300">
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
        </div>
      </div>

      <!-- Footer: Controls -->
      <div class="px-5 py-4 bg-[#1e1e1e] border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
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
          class="w-full sm:w-auto px-5 py-2 bg-transparent border border-gray-500 text-gray-300 rounded font-mono text-sm hover:bg-gray-700 hover:text-white hover:border-gray-400 transition-all uppercase tracking-wide"
        >
          exit
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