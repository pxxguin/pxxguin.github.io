import { visit } from "unist-util-visit";

export default function rehypeMark() {
	return transformer;

	function transformer(tree) {
		visit(tree, "text", (node, index, parent) => {
			if (!node || typeof node.value !== "string") return;
			const value = node.value;
			const regex = /==([^=]+)==/g;
			if (!regex.test(value)) return;

			const parts = [];
			let lastIndex = 0;
			value.replace(regex, (match, content, offset) => {
				if (offset > lastIndex) {
					parts.push({ type: "text", value: value.slice(lastIndex, offset) });
				}
				parts.push({
					type: "element",
					tagName: "mark",
					properties: {},
					children: [{ type: "text", value: content }],
				});
				lastIndex = offset + match.length;
			});

			if (lastIndex < value.length) {
				parts.push({ type: "text", value: value.slice(lastIndex) });
			}

			// Replace the original text node with the sequence of new nodes
			if (parent && Array.isArray(parent.children)) {
				parent.children.splice(index, 1, ...parts);
			}
		});
	}
}
