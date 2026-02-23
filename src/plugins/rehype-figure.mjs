import { h } from "hastscript";
import { visit } from "unist-util-visit";

export default function rehypeFigure(option) {
	const className = option?.className || "rehype-figure";

	function buildFigure({ properties }) {
		const figure = h("figure", { class: className }, [
			h("img", { ...properties }),
			properties.alt && properties.alt.trim().length > 0
				? h("figcaption", properties.alt)
				: "",
		]);
		return figure;
	}

	return (tree) => {
		visit(tree, { tagName: "p" }, (node, index, parent) => {
			const images = node.children
				.filter((n) => n.tagName === "img")
				.map((img) => buildFigure(img));

			if (images.length === 0) return;

			// Replace the <p> node in its actual parent's children array
			if (images.length === 1) {
				parent.children[index] = images[0];
			} else {
				parent.children[index] = h(
					"div",
					{ class: `${className}-container` },
					images,
				);
			}
		});
	};
}
