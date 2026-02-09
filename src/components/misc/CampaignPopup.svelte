<script lang="ts">
import { onMount, onDestroy, tick } from "svelte";
import { fade, scale } from "svelte/transition";

export let storageKey = "campaign-popup";

let isOpen = false;
let doNotShowToday = false;

// --- Terminal State ---
type LineType = "user-input" | "system-output" | "component";
interface TerminalLine {
    type: LineType;
    content: string;
    component?: string; // For rendering the complex notice HTML
}

let history: TerminalLine[] = [];
let inputValue = "";
let inputElement: HTMLInputElement;
let terminalContainer: HTMLDivElement;
let isAutoTyping = false;

// --- Easter Egg State (Konami) ---
let isHacked = false;
const konamiCode = [
    "arrowup", "arrowup", "arrowdown", "arrowdown",
    "arrowleft", "arrowright", "arrowleft", "arrowright",
    "b", "a",
];
let inputSequence: string[] = [];

// --- Lifecycle ---
onMount(async () => {
    const expiry = localStorage.getItem(storageKey);
    const now = Date.now();

    if (expiry && now < Number.parseInt(expiry, 10)) {
        isOpen = false;
    } else {
        isOpen = true;
        // Start auto-typing --help sequence
        await tick();
        startAutoTypeSequence();
    }

    window.addEventListener("keydown", handleGlobalKeydown);
});

onDestroy(() => {
    if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleGlobalKeydown);
    }
});

// --- Logic ---

function closePopup() {
    if (doNotShowToday) {
        const expiryDate = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(storageKey, expiryDate.toString());
    }
    isOpen = false;
}

function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        closePopup();
    }
}

// Focus input when clicking anywhere in the terminal body
function focusInput() {
    inputElement?.focus();
}

// Scroll to bottom
async function scrollToBottom() {
    await tick();
    if (terminalContainer) {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }
}

// Global keydown for Konami code (works even if input not focused, though input usually is)
function handleGlobalKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    
    // Konami detection
    const key = e.key.toLowerCase();
    inputSequence = [...inputSequence, key];
    if (inputSequence.length > konamiCode.length) inputSequence = inputSequence.slice(-konamiCode.length);
    if (JSON.stringify(inputSequence) === JSON.stringify(konamiCode)) {
        isHacked = true;
        addToHistory("system-output", "ROOT_ACCESS_GRANTED... SYSTEM OVERRIDE.");
    }
}

// Terminal Input Handler
async function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !isAutoTyping) {
        const command = inputValue.trim();
        
        // Add user input to history
        addToHistory("user-input", command);
        inputValue = "";

        // Process command
        await processCommand(command);
    }
}

function addToHistory(type: LineType, content: string, component?: string) {
    history = [...history, { type, content, component }];
    scrollToBottom();
}

async function processCommand(cmd: string) {
    if (!cmd) return;
    
    const parts = cmd.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    await new Promise(r => setTimeout(r, 100)); // Small delay for "processing" feel

    switch (mainCmd) {
        case "help":
        case "--help":
            addToHistory("system-output", "Available commands:");
            addToHistory("system-output", "  ls              List directory contents");
            addToHistory("system-output", "  cat [file]      Concatenate and display file content");
            addToHistory("system-output", "  whoami          Print current user");
            addToHistory("system-output", "  clear           Clear terminal screen");
            addToHistory("system-output", "  exit            Close terminal");
            break;
        case "ls":
            addToHistory("system-output", "NOTICE.md  secret.txt  system.conf");
            break;
        case "cat":
            if (args.length === 0) {
                addToHistory("system-output", "usage: cat [file]");
            } else if (args[0] === "NOTICE.md") {
                addToHistory("component", "", "notice");
            } else if (args[0] === "secret.txt") {
                addToHistory("system-output", "👀 I don't know what means UUDDLRLRBA!");
            } else if (args[0] === "system.conf") {
                if (isHacked) {
                    addToHistory("system-output", "SERVER_KEY=8f9a2b3c\nADMIN_USER=hong\nDEBUG_MODE=true\n\n[SECRET_NOTE]\nThank you for visiting my blog!");
                } else {
                    addToHistory("system-output", "cat: system.conf: Permission denied");
                }
            } else {
                addToHistory("system-output", `cat: ${args[0]}: No such file or directory`);
            }
            break;
        case "whoami":
            addToHistory("system-output", isHacked ? "root" : "guest");
            break;
        case "sudo":
            if (isHacked) {
                addToHistory("system-output", "You are already root.");
            } else {
                // Immediate Danger Output
                addToHistory("component", "", "sudo-alert");
                
                // Trigger shake effect
                isShake = true;
                setTimeout(() => isShake = false, 500);
            }
            break;
        case "reboot":
            if (isHacked) {
                addToHistory("system-output", "System rebooting...");
                setTimeout(() => {
                    history = [];
                    isHacked = false;
                    addToHistory("system-output", "Reboot complete. Welcome, guest.");
                }, 2000);
            } else {
                addToHistory("system-output", "reboot: Operation not permitted");
            }
            break;
        case "clear":
            history = [];
            break;
        case "exit":
            closePopup();
            break;
        case "rm":
            if (args.includes("-rf") && args.includes("/")) {
                 addToHistory("system-output", "PERMISSION DENIED: Nice try. 😉");
            } else {
                 addToHistory("system-output", "rm: cannot remove '" + (args[0] || "") + "': Permission denied");
            }
            break;
        default:
            addToHistory("system-output", `zsh: command not found: ${mainCmd}`);
    }
    scrollToBottom();
}

// Auto-type animation
async function startAutoTypeSequence() {
    isAutoTyping = true;
    const cmd = "--help";
    
    // Delay before starting
    await new Promise(r => setTimeout(r, 800));

    // Type characters
    for (const char of cmd) {
        inputValue += char;
        await new Promise(r => setTimeout(r, 100)); // typing speed
    }

    await new Promise(r => setTimeout(r, 300));
    
    // Simulate Enter
    addToHistory("user-input", inputValue);
    inputValue = "";
    await processCommand("--help");
    
    isAutoTyping = false;
    
    // Focus input after auto-type
    tick().then(() => inputElement?.focus());
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
      class="relative w-full max-w-lg bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden flex flex-col h-[60vh] md:h-[500px] border transition-all duration-500"
      class:border-gray-700={!isHacked}
      class:border-red-500={isHacked}
      class:shadow-red-500-50={isHacked}
      transition:scale={{ duration: 300, start: 0.95 }}
    >
      <!-- Terminal Header -->
      <div 
        class="px-4 py-3 border-b flex items-center justify-between handle transition-colors duration-500 shrink-0"
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
        <div class="w-10"></div>
      </div>

      <!-- Terminal Body -->
      <div 
        class="flex-1 w-full relative overflow-y-auto p-4 md:p-6 text-sm md:text-base font-mono space-y-2 cursor-text"
        bind:this={terminalContainer}
        on:click={focusInput}
      >
        <!-- History -->
        {#each history as line}
            <div class="break-words">
                {#if line.type === "user-input"}
                    <div class="flex flex-row items-start">
                         <span class="mr-2 shrink-0 font-bold" class:text-blue-400={!isHacked} class:text-red-500={isHacked}>
                            {isHacked ? "root@server:~#" : "➜ ~"}
                        </span>
                        <span class="text-white break-all">{line.content}</span>
                    </div>
                {:else if line.type === "system-output"}
                    <div class="text-gray-300 whitespace-pre-wrap">{line.content}</div>
                {:else if line.type === "component" && line.component === "notice"}
                     <!-- The HTML Notice Content -->
                     <div class="my-4 p-4 border border-dashed border-gray-600 rounded bg-black/20 text-gray-200">
                        <h1 class="text-xl font-bold text-white mb-4"># 공지사항 업데이트 v2.0</h1>
                        <p class="mb-4 text-gray-300">
                            안녕하세요. 개발자 Hongseo Jang입니다.👋<br>
                            부족하지만 항상 도움이 되는 포스팅을 제공하겠습니다.
                        </p>
                        <p class="text-green-400 font-bold text-sm mb-2">// 최근 업데이트</p>
                        <ul class="list-none space-y-1 pl-2 border-l-2 border-gray-700 ml-1 text-sm">
                            <li><span class="text-blue-500">[FEAT]</span> 공지사항 디자인 변경</li>
                            <li><span class="text-blue-500">[FEAT]</span> 공지사항 이스터에그 추가</li>
                            <li><span class="text-yellow-500">[FIX]</span> 오늘의 추천 논문 알고리즘 수정</li>
                        </ul>
                        <div class="mt-4 text-sm text-gray-500">
                            계속해서 더 나은 개발 경험을 제공하겠습니다.<br/>
                            감사합니다.
                        </div>
                     </div>
                {:else if line.type === "component" && line.component === "sudo-alert"}
                    <div class="my-2 p-3 border-l-4 border-red-600 bg-red-950/40 text-red-500">
                        <h3 class="font-bold text-lg mb-1">🚫 DANGER: RESTRICTED ACCESS</h3>
                        <p class="text-sm font-bold text-red-400">Attempting to access root privileges is dangerous.</p>
                        <p class="text-xs mt-2 opacity-80">This incident will be reported to the administrator.</p>
                    </div>
                {/if}
            </div>
        {/each}

        <!-- Input Line -->
        <div class="flex flex-row items-center">
            <span class="mr-2 shrink-0 font-bold transition-colors" class:text-blue-400={!isHacked} class:text-red-500={isHacked}>
                {isHacked ? "root@server:~#" : "➜ ~"}
            </span>
            <input
                bind:this={inputElement}
                type="text"
                class="bg-transparent border-none outline-none text-white w-full caret-gray-400 p-0 m-0"
                bind:value={inputValue}
                on:keydown={handleInputKeydown}
                autocomplete="off"
                spellcheck="false"
                disabled={isAutoTyping}
            />
        </div>
      </div>

      <!-- Footer: Controls -->
      <div 
        class="px-5 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-500 shrink-0"
        class:bg-[#1e1e1e]={!isHacked}
        class:border-gray-700={!isHacked}
        class:bg-red-950={isHacked}
        class:border-red-900={isHacked}
      >
        <label
          class="flex items-center space-x-2 cursor-pointer text-xs text-gray-500 select-none hover:text-green-400 transition-colors"
        >
          <input
            type="checkbox"
            bind:checked={doNotShowToday}
            class="appearance-none w-3 h-3 border border-gray-600 rounded-sm bg-[#2d2d2d] checked:bg-green-500 checked:border-green-500 focus:outline-none transition-colors"
          />
          <span>오늘 하루 보지 않기</span>
        </label>

        <button
          on:click={closePopup}
          class="px-3 py-1 bg-transparent border text-gray-500 rounded font-mono text-xs hover:text-white transition-all uppercase tracking-wide"
          class:border-gray-600={!isHacked}
          class:hover:bg-gray-800={!isHacked}
          class:border-red-800={isHacked}
          class:hover:bg-red-900={isHacked}
        >
          {isHacked ? "LOGOUT" : "close"}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
    /* Handful of custom styles */
    input:disabled {
        cursor: not-allowed;
        opacity: 0.8;
    }
    input[type="checkbox"]:checked::after {
        content: '✓';
        display: block;
        color: black;
        font-size: 8px;
        text-align: center;
        line-height: 10px;
        font-weight: bold;
    }

    /* Terminal Scrollbar */
    ::-webkit-scrollbar {
        width: 10px;
        background: #1e1e1e;
    }
    ::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 2px;
        border: 2px solid #1e1e1e; /* Padding effect */
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #666;
    }
</style>