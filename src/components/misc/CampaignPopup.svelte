<script lang="ts">
import { onDestroy, onMount, tick } from "svelte";
import { fade, scale } from "svelte/transition";
import { getAccessKey } from "@utils/access-key";
import { getFlag } from "@utils/achievements";

export let storageKey = "campaign-popup";

let isOpen = false;
let doNotShowToday = false;

// --- Terminal State ---
type LineType = "user-input" | "system-output" | "component";
interface TerminalLine {
	type: LineType;
	content: string;
	component?: string; // For rendering the complex notice HTML
	prompt?: string; // Snapshot of the prompt label at the time this line was typed
}

let history: TerminalLine[] = [];
let inputValue = "";
let inputElement: HTMLInputElement;
let terminalContainer: HTMLDivElement;
let isAutoTyping = false;
let isShake = false;

// --- Virtual Filesystem State ---
interface FileNode {
	type: "file";
	content: string;
	protected?: boolean; // Cannot be removed (easter-egg files)
	requiresRoot?: boolean; // Requires isHacked to read (system.conf)
	special?: "notice"; // Rendered as a rich component instead of plain text
}
interface DirNode {
	type: "dir";
	children: Record<string, VNode>;
	protected?: boolean;
}
type VNode = FileNode | DirNode;

const HOME = ["home", "guest"];

function createInitialFs(): DirNode {
	return {
		type: "dir",
		children: {
			home: {
				type: "dir",
				children: {
					guest: {
						type: "dir",
						children: {
							"NOTICE.md": {
								type: "file",
								special: "notice",
								protected: true,
								content:
									"# 공지사항 v2.2.0\n\n안녕하세요. 개발자 PXXGUIN 입니다.\n부족하지만, 항상 도움이 되는 포스팅을 제공하겠습니다.\n\n// [26.08.09] 업데이트 내용\n[FEAT] 게시글 이미지 캡션 기능 추가\n[FEAT] 터미널 가상 파일시스템 구현 (cd, mkdir, cat, echo 등)\n[FEAT] /login, /secret 페이지 및 트로피 이스터에그 시스템 추가\n[FEAT] 트로피 전부 획득 시 폭죽 이펙트 추가\n\n유익한 정보로 찾아 뵙겠습니다.\n감사합니다.",
							},
							"secret.txt": {
								type: "file",
								protected: true,
								content: "👀 I don't know what means UUDDLRLRBA!",
							},
							"system.conf": {
								// Content is generated on read (see buildSystemConfContent) so
								// it stays in sync with the session-scoped key from access-key.ts
								type: "file",
								protected: true,
								requiresRoot: true,
								content: "",
							},
						},
					},
				},
			},
			// Hidden dotfile at filesystem root — invisible to plain `ls`,
			// only shows up with `ls -a` (or if you already know the name).
			".flag.txt": {
				type: "file",
				protected: true,
				content: `You found the hidden file outside /home.\n${getFlag("hidden-file")}`,
			},
		},
	};
}

let fsRoot: DirNode = createInitialFs();
let cwd: string[] = [...HOME];

// Resolve an absolute/relative/~-prefixed path against a base cwd into path segments
function resolvePath(base: string[], input: string): string[] {
	if (input === "~") return [...HOME];

	let segments: string[];
	let rest: string;
	if (input.startsWith("~/")) {
		segments = [...HOME];
		rest = input.slice(2);
	} else if (input.startsWith("/")) {
		segments = [];
		rest = input.slice(1);
	} else {
		segments = [...base];
		rest = input;
	}

	for (const seg of rest.split("/").filter((s) => s.length > 0)) {
		if (seg === ".") continue;
		if (seg === "..") {
			if (segments.length > 0) segments.pop();
		} else {
			segments.push(seg);
		}
	}
	return segments;
}

function getNode(path: string[]): VNode | null {
	let node: VNode = fsRoot;
	for (const seg of path) {
		if (node.type !== "dir") return null;
		const next = node.children[seg];
		if (!next) return null;
		node = next;
	}
	return node;
}

function getParentDir(path: string[]): { parent: DirNode | null; name: string } {
	if (path.length === 0) return { parent: null, name: "" };
	const name = path[path.length - 1];
	const parentNode = getNode(path.slice(0, -1));
	if (!parentNode || parentNode.type !== "dir") return { parent: null, name };
	return { parent: parentNode, name };
}

// Renders a path relative to HOME as "~/..." like a real shell prompt
function pathDisplay(path: string[]): string {
	const inHome = HOME.every((h, i) => path[i] === h) && path.length >= HOME.length;
	if (inHome) {
		const rel = path.slice(HOME.length).join("/");
		return rel ? `~/${rel}` : "~";
	}
	return `/${path.join("/")}`;
}

function currentPromptLabel(): string {
	return isHacked
		? `root@server:${pathDisplay(cwd)}#`
		: `➜ ${pathDisplay(cwd)}`;
}

function buildSystemConfContent(): string {
	return `SERVER_KEY=${getAccessKey()}\nADMIN_USER=admin\nDEBUG_MODE=true\n\n[SECRET_NOTE]\nThank you for visiting my blog!\nTry /login with these credentials. This key resets every session.\n\n[TROPHY]\n${getFlag("system-conf")}`;
}

function writeFile(
	pathStr: string,
	content: string,
	append: boolean,
): { ok: boolean; error?: string } {
	const path = resolvePath(cwd, pathStr);
	const { parent, name } = getParentDir(path);
	if (!parent) return { ok: false, error: `bash: ${pathStr}: No such file or directory` };
	const existing = parent.children[name];
	if (existing && existing.type === "dir")
		return { ok: false, error: `bash: ${pathStr}: Is a directory` };
	if (existing?.protected)
		return { ok: false, error: `bash: ${pathStr}: Permission denied` };
	const prevContent = existing?.type === "file" ? existing.content : "";
	parent.children[name] = {
		type: "file",
		content: append && prevContent ? `${prevContent}\n${content}` : content,
	};
	return { ok: true };
}

// Tokenizes a command line, respecting quotes and treating > / >> as standalone tokens
function tokenizeCommand(cmd: string): string[] {
	const tokens: string[] = [];
	const regex = /"([^"]*)"|'([^']*)'|(>>)|(>)|([^\s>]+)/g;
	let match: RegExpExecArray | null = regex.exec(cmd);
	while (match !== null) {
		if (match[1] !== undefined) tokens.push(match[1]);
		else if (match[2] !== undefined) tokens.push(match[2]);
		else if (match[3] !== undefined) tokens.push(">>");
		else if (match[4] !== undefined) tokens.push(">");
		else tokens.push(match[5]);
		match = regex.exec(cmd);
	}
	return tokens;
}

// --- Easter Egg State (Konami) ---
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
	if (inputSequence.length > konamiCode.length)
		inputSequence = inputSequence.slice(-konamiCode.length);
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
		addToHistory("user-input", command, undefined, currentPromptLabel());
		inputValue = "";

		// Process command
		await processCommand(command);
	}
}

function addToHistory(
	type: LineType,
	content: string,
	component?: string,
	prompt?: string,
) {
	history = [...history, { type, content, component, prompt }];
	scrollToBottom();
}

async function processCommand(cmd: string) {
	if (!cmd) return;

	const tokens = tokenizeCommand(cmd);
	if (tokens.length === 0) return;
	const mainCmd = tokens[0].toLowerCase();
	let args = tokens.slice(1);

	// Detect a single `>` / `>>` redirection and split it off the argument list
	let redirect: { append: boolean; target: string } | null = null;
	const redirIdx = args.findIndex((a) => a === ">" || a === ">>");
	if (redirIdx !== -1 && args[redirIdx + 1]) {
		redirect = { append: args[redirIdx] === ">>", target: args[redirIdx + 1] };
		args = args.slice(0, redirIdx);
	}

	// Buffers plain-text output: prints to screen normally, or gets written
	// to the redirection target file when `>` / `>>` was used.
	const outputBuffer: string[] = [];
	function output(text: string) {
		if (redirect) {
			outputBuffer.push(text);
		} else {
			addToHistory("system-output", text);
		}
	}

	await new Promise((r) => setTimeout(r, 100)); // Small delay for "processing" feel

	switch (mainCmd) {
		case "help":
		case "--help":
			output("Available commands:");
			output("  ls [dir]        List directory contents");
			output("  cd [dir]        Change directory");
			output("  pwd             Print working directory");
			output("  mkdir [-p] dir  Create a directory");
			output("  touch [file]    Create an empty file");
			output("  cat [file]      Concatenate and display file content");
			output("  echo [text]     Display text (supports > and >> redirection)");
			output("  rm [-r] [file]  Remove files or directories");
			output("  rmdir [dir]     Remove an empty directory");
			output("  whoami          Print current user");
			output("  clear           Clear terminal screen");
			output("  exit            Close terminal");
			break;
		case "ls": {
			const targetArg = args.find((a) => !a.startsWith("-"));
			const showHidden = args.some((a) => a.startsWith("-") && a.includes("a"));
			const path = targetArg ? resolvePath(cwd, targetArg) : cwd;
			const node = getNode(path);
			if (!node) {
				output(`ls: cannot access '${targetArg}': No such file or directory`);
			} else if (node.type === "file") {
				output(targetArg ?? "");
			} else {
				const names = Object.keys(node.children)
					.filter((n) => showHidden || !n.startsWith("."))
					.sort((a, b) => a.localeCompare(b));
				const display = names.map((n) =>
					node.children[n].type === "dir" ? `${n}/` : n,
				);
				output(display.join("  "));
			}
			break;
		}
		case "cd": {
			const target = args[0] ?? "~";
			const path = resolvePath(cwd, target);
			const node = getNode(path);
			if (!node) {
				output(`cd: no such file or directory: ${target}`);
			} else if (node.type !== "dir") {
				output(`cd: not a directory: ${target}`);
			} else {
				cwd = path;
			}
			break;
		}
		case "pwd":
			output(`/${cwd.join("/")}`);
			break;
		case "mkdir": {
			const targets = args.filter((a) => !a.startsWith("-"));
			const recursive = args.some((a) => a.startsWith("-") && a.includes("p"));
			if (targets.length === 0) {
				output("mkdir: missing operand");
				break;
			}
			for (const t of targets) {
				const path = resolvePath(cwd, t);
				const { parent, name } = getParentDir(path);
				if (!parent) {
					if (recursive) {
						let node: DirNode = fsRoot;
						for (const seg of path) {
							const next = node.children[seg];
							if (!next) {
								node.children[seg] = { type: "dir", children: {} };
							} else if (next.type !== "dir") {
								break;
							}
							node = node.children[seg] as DirNode;
						}
					} else {
						output(`mkdir: cannot create directory '${t}': No such file or directory`);
					}
					continue;
				}
				if (parent.children[name]) {
					output(`mkdir: cannot create directory '${t}': File exists`);
					continue;
				}
				parent.children[name] = { type: "dir", children: {} };
			}
			break;
		}
		case "touch": {
			if (args.length === 0) {
				output("touch: missing file operand");
				break;
			}
			for (const t of args) {
				const path = resolvePath(cwd, t);
				const { parent, name } = getParentDir(path);
				if (!parent) {
					output(`touch: cannot touch '${t}': No such file or directory`);
					continue;
				}
				if (!parent.children[name]) {
					parent.children[name] = { type: "file", content: "" };
				}
			}
			break;
		}
		case "cat":
			if (args.length === 0) {
				output("usage: cat [file]");
			} else {
				for (const a of args) {
					const path = resolvePath(cwd, a);
					const node = getNode(path);
					if (!node) {
						output(`cat: ${a}: No such file or directory`);
					} else if (node.type === "dir") {
						output(`cat: ${a}: Is a directory`);
					} else if (node.requiresRoot && !isHacked) {
						output(`cat: ${a}: Permission denied`);
					} else if (node.requiresRoot && isHacked) {
						output(buildSystemConfContent());
					} else if (node.special === "notice" && !redirect) {
						addToHistory("component", "", "notice");
					} else {
						output(node.content);
					}
				}
			}
			break;
		case "whoami":
			output(isHacked ? "root" : "guest");
			break;
		case "echo":
			output(args.join(" "));
			break;
		case "rm": {
			if (args.includes("-rf") && args.includes("/")) {
				output("PERMISSION DENIED: Nice try. 😉");
				break;
			}
			const recursive = args.some((a) => /^-\w*[rR]\w*$/.test(a));
			const targets = args.filter((a) => !a.startsWith("-"));
			if (targets.length === 0) {
				output("rm: missing operand");
				break;
			}
			for (const t of targets) {
				const path = resolvePath(cwd, t);
				const { parent, name } = getParentDir(path);
				const node = parent?.children[name];
				if (!node) {
					output(`rm: cannot remove '${t}': No such file or directory`);
				} else if (node.protected) {
					output(`rm: cannot remove '${t}': Permission denied`);
				} else if (node.type === "dir" && !recursive) {
					output(`rm: cannot remove '${t}': Is a directory`);
				} else {
					delete (parent as DirNode).children[name];
				}
			}
			break;
		}
		case "rmdir": {
			if (args.length === 0) {
				output("rmdir: missing operand");
				break;
			}
			for (const t of args) {
				const path = resolvePath(cwd, t);
				const { parent, name } = getParentDir(path);
				const node = parent?.children[name];
				if (!node) {
					output(`rmdir: failed to remove '${t}': No such file or directory`);
				} else if (node.type !== "dir") {
					output(`rmdir: failed to remove '${t}': Not a directory`);
				} else if (node.protected) {
					output(`rmdir: failed to remove '${t}': Permission denied`);
				} else if (Object.keys(node.children).length > 0) {
					output(`rmdir: failed to remove '${t}': Directory not empty`);
				} else {
					delete (parent as DirNode).children[name];
				}
			}
			break;
		}
		case "sudo":
			if (isHacked) {
				output("You are already root.");
			} else {
				// Immediate Danger Output
				addToHistory("component", "", "sudo-alert");

				// Trigger shake effect
				isShake = true;
				setTimeout(() => {
					isShake = false;
				}, 500);
			}
			break;
		case "reboot":
			if (isHacked) {
				output("System rebooting...");
				setTimeout(() => {
					history = [];
					isHacked = false;
					fsRoot = createInitialFs();
					cwd = [...HOME];
					addToHistory("system-output", "Reboot complete. Welcome, guest.");
				}, 2000);
			} else {
				output("reboot: Operation not permitted");
			}
			break;
		case "clear":
			history = [];
			break;
		case "exit":
			closePopup();
			break;
		case "beer":
		case "coffee":
			output("☕️ Brewing coffee... [██████████] 100% Done!");
			output("Here is your virtual drink! 🍺");
			break;
		default:
			output(`zsh: command not found: ${mainCmd}`);
	}

	if (redirect) {
		const res = writeFile(redirect.target, outputBuffer.join("\n"), redirect.append);
		if (!res.ok && res.error) addToHistory("system-output", res.error);
	}

	scrollToBottom();
}

// Auto-type animation
async function startAutoTypeSequence() {
	isAutoTyping = true;
	const cmd = "cat NOTICE.md";

	// Delay before starting
	await new Promise((r) => setTimeout(r, 800));

	// Type characters
	const chars = cmd.split("");
	for (let i = 0; i < chars.length; i++) {
		inputValue += chars[i];
		await new Promise((r) => setTimeout(r, 100)); // typing speed
	}

	await new Promise((r) => setTimeout(r, 300));

	// Simulate Enter
	addToHistory("user-input", inputValue, undefined, currentPromptLabel());
	inputValue = "";
	await processCommand(cmd);

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
                            {line.prompt ?? currentPromptLabel()}
                        </span>
                        <span class="text-white break-all">{line.content}</span>
                    </div>
                {:else if line.type === "system-output"}
                    <div class="text-gray-300 whitespace-pre-wrap">{line.content}</div>
                {:else if line.type === "component" && line.component === "notice"}
                     <!-- The HTML Notice Content -->
                     <div class="my-4 p-4 border border-dashed border-gray-600 rounded bg-black/20 text-gray-200">
                        <h1 class="text-xl font-bold text-white mb-4"># 공지사항 v2.2.0</h1>
                        <p class="mb-4 text-gray-300">
                            안녕하세요. 개발자 PXXGUIN 입니다.👋<br>
                            부족하지만, 항상 도움이 되는 포스팅을 제공하겠습니다.
                        </p>
                        <p class="text-green-400 font-bold text-sm mb-2">// [26.08.09] 업데이트 내용</p>
                        <ul class="list-none space-y-1 pl-2 border-l-2 border-gray-700 ml-1 text-sm">
                            <li><span class="text-emerald-500">[FEAT]</span> 게시글 이미지 캡션 기능 추가</li>
                            <li><span class="text-emerald-500">[FEAT]</span> 터미널 가상 파일시스템 구현 (cd, mkdir, cat, echo 등)</li>
                            <li><span class="text-emerald-500">[FEAT]</span> /login, /secret 페이지 및 트로피 이스터에그 시스템 추가</li>
                            <li><span class="text-emerald-500">[FEAT]</span> 트로피 전부 획득 시 폭죽 이펙트 추가</li>
                        </ul>
                        <div class="mt-4 text-sm text-gray-500">
                            유익한 정보로 찾아 뵙겠습니다.<br/>
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
                {currentPromptLabel()}
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