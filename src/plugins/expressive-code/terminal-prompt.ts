/**
 * Prepends a fake shell prompt ("pxxguin@root:~$ ") to each non-empty line of
 * bash/shellsession blocks, so terminal frames read like an actual session
 * instead of a plain code block. The prompt is a sibling of `.code` (grid-area
 * "gutter"), so it's outside what the copy button and manual text selection
 * pick up from `.code`.
 */
import { definePlugin } from "@expressive-code/core";
import type { Element } from "hast";

const TERMINAL_LANGUAGES = new Set(["bash", "shellsession"]);

function hasClass(node: Element, className: string): boolean {
	const classes = node.properties?.className;
	return Array.isArray(classes) && classes.includes(className);
}

function textOf(node: Element): string {
	let text = "";
	for (const child of node.children) {
		if (child.type === "text") text += child.value;
		else if (child.type === "element") text += textOf(child);
	}
	return text;
}

function promptSpan(): Element {
	return {
		type: "element",
		tagName: "span",
		properties: { className: ["gutter", "term-prompt"] },
		children: [
			{
				type: "element",
				tagName: "span",
				properties: { className: ["term-user"] },
				children: [{ type: "text", value: "pxxguin@root" }],
			},
			{
				type: "element",
				tagName: "span",
				properties: { className: ["term-sep"] },
				children: [{ type: "text", value: ":~$ " }],
			},
		],
	};
}

export function pluginTerminalPrompt() {
	return definePlugin({
		name: "Terminal Prompt",
		hooks: {
			postprocessRenderedBlock: (context) => {
				if (!TERMINAL_LANGUAGES.has(context.codeBlock.language)) return;

				function traverse(node: Element) {
					if (hasClass(node, "ec-line")) {
						const codeDiv = node.children.find(
							(child): child is Element => child.type === "element" && hasClass(child, "code"),
						);
						if (codeDiv && textOf(codeDiv).trim()) {
							node.children.unshift(promptSpan());
						}
						return;
					}
					for (const child of node.children) {
						if (child.type === "element") traverse(child);
					}
				}

				traverse(context.renderData.blockAst);
			},
		},
	});
}
