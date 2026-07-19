import { findAfter } from "unist-util-find-after";
import { visit } from "unist-util-visit";

const MAX_HEADING_DEPTH = 6;

export function remarkSectionize() {
	return (tree) => {
		for (let depth = MAX_HEADING_DEPTH; depth > 0; depth--) {
			visit(
				tree,
				(node) => node.type === "heading" && node.depth === depth,
				(node, index, parent) => {
					const start = node;
					const startIndex = index;

					const isEnd = (n) =>
						(n.type === "heading" && n.depth <= depth) || n.type === "export";
					const end = findAfter(parent, start, isEnd);
					const endIndex = end ? parent.children.indexOf(end) : parent.children.length;

					const between = parent.children.slice(startIndex, endIndex);

					const section = {
						type: "section",
						depth: depth,
						children: between,
						data: {
							hName: "section",
						},
					};

					parent.children.splice(startIndex, between.length, section);

					// Skip entering the newly created section node to prevent infinite loops,
					// and continue at the next sibling index.
					return ["skip", startIndex + 1];
				}
			);
		}
	};
}
