import { visit } from "unist-util-visit";

export function remarkNotionCallout() {
	return (tree) => {
		visit(tree, "paragraph", (node, index, parent) => {
			if (!node.children || node.children.length === 0) return;

			// Handle regular text nodes
			const firstChild = node.children[0];
			if (firstChild.type === "text" && firstChild.value.startsWith("=>")) {
				// Optional: Strip any leading =>
				firstChild.value = firstChild.value.replace(/^=>\s*/, "");

				const directiveNode = {
					type: "containerDirective",
					name: "note",
					attributes: {},
					children: [
						{
							type: "paragraph",
							children: node.children,
						},
					],
					data: {
						hName: "note",
					},
				};

				if (parent && typeof index === "number") {
					parent.children[index] = directiveNode;
				}
				return [visit.SKIP, index + 1];
			}
		});
	};
}
