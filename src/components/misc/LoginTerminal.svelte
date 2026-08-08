<script lang="ts">
import { getAccessKey, grantAccess } from "@utils/access-key";

let username = "";
let password = "";
let error = "";
let isShake = false;
let isSubmitting = false;
let usernameEl: HTMLInputElement;

function handleSubmit(e: SubmitEvent) {
	e.preventDefault();
	if (isSubmitting) return;
	isSubmitting = true;
	error = "";

	setTimeout(() => {
		const validKey = getAccessKey();
		if (username.trim() === "admin" && password === validKey && validKey) {
			grantAccess();
			window.location.href = "/secret/";
			return;
		}

		error = "Access denied: invalid credentials.";
		isShake = true;
		password = "";
		setTimeout(() => {
			isShake = false;
		}, 500);
		isSubmitting = false;
	}, 300);
}
</script>

<form
  class="w-full max-w-md mx-auto bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden border border-gray-700 font-mono transition-transform duration-300"
  class:animate-shake={isShake}
  on:submit={handleSubmit}
>
  <div class="px-4 py-3 border-b border-gray-700 bg-[#2d2d2d] flex items-center gap-2">
    <div class="w-3 h-3 rounded-full bg-red-500"></div>
    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
    <div class="w-3 h-3 rounded-full bg-green-500"></div>
    <div class="flex-1 text-center text-xs text-gray-400 select-none">login.sh — -zsh — 80x24</div>
  </div>

  <div class="p-6 space-y-4 text-sm md:text-base">
    <p class="text-gray-400"># Restricted area. Authorized personnel only.</p>

    <label class="block">
      <span class="text-blue-400">username:</span>
      <input
        bind:this={usernameEl}
        bind:value={username}
        type="text"
        autocomplete="off"
        spellcheck="false"
        class="w-full mt-1 bg-black/40 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-400 transition-colors"
      />
    </label>

    <label class="block">
      <span class="text-blue-400">password:</span>
      <input
        bind:value={password}
        type="password"
        autocomplete="off"
        spellcheck="false"
        class="w-full mt-1 bg-black/40 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-400 transition-colors"
      />
    </label>

    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}

    <button
      type="submit"
      disabled={isSubmitting}
      class="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold tracking-wide transition-colors"
    >
      {isSubmitting ? "authenticating..." : "login"}
    </button>

    <p class="text-xs text-gray-600">hint: the key rotates every browser session — find it in the terminal popup.</p>
  </div>
</form>

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
  }
  .animate-shake {
    animation: shake 0.4s ease-in-out;
  }
</style>
