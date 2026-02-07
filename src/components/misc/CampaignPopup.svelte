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
    class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8"
    on:click={handleBackdropClick}
    transition:fade={{ duration: 300 }}
  >
    <div
      class="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      transition:scale={{ duration: 300, start: 0.95 }}
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📢 공지사항
        </h2>
      </div>

      <!-- Content (Scrollable) -->
      <div class="flex-1 w-full relative overflow-y-auto p-6 text-gray-700 dark:text-gray-300 space-y-4">
        <p class="font-medium text-lg text-gray-900 dark:text-white">
          안녕하세요! 개발자 Hongseo Jang입니다.👋
        </p>
        
        <div class="space-y-2">
            <p>
                사이트의 공지사항 시스템이 새롭게 업데이트 되었습니다. <br>
                이제 PDF 로딩 없이 더 빠르고 깔끔하게 내용을 확인하실 수 있습니다.
            </p>
            <ul class="list-disc pl-5 space-y-1 marker:text-blue-500">
                <li>🚀 <strong>더 빠른 로딩</strong>: 이미지/PDF 대신 텍스트 기반으로 변경되었습니다.</li>
                <li>📱 <strong>모바일 최적화</strong>: 작은 화면에서도 보기 편하게 개선되었습니다.</li>
                <li>🌙 <strong>다크 모드 지원</strong>: 시스템 설정에 맞춰 눈이 편안합니다.</li>
            </ul>
            <p class="pt-2">
                앞으로도 더 나은 경험을 제공하기 위해 노력하겠습니다. <br>
                감사합니다!
            </p>
        </div>
      </div>

      <!-- Footer: Controls -->
      <div class="px-5 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <label
          class="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 select-none hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <input
            type="checkbox"
            bind:checked={doNotShowToday}
            class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
          />
          <span>오늘 하루 보지 않기</span>
        </label>

        <button
          on:click={closePopup}
          class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 active:transform active:scale-95 transition-all shadow-sm"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
{/if}