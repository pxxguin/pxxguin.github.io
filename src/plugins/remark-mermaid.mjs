import { visit } from "unist-util-visit";

export function remarkMermaid() {
	return (tree) => {
		visit(tree, "code", (node, index, parent) => {
			if (node.lang === "mermaid") {
				const value = node.value;
				parent.children.splice(index, 1, {
					type: "html",
					value: `<div class="mermaid flex justify-center">${value}</div>`,
				});
			}
		});
	};
}
