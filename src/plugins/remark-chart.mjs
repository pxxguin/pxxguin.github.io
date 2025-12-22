import { visit } from "unist-util-visit";

export function remarkChart() {
	return (tree) => {
		visit(tree, "code", (node, index, parent) => {
			if (node.lang === "chart") {
				const value = node.value;
				// Create a container with a canvas and a hidden script to hold the JSON configuration
				const html = `
<div class="chart-container" style="position: relative; width: 100%; margin: 2rem 0;">
    <canvas class="interactive-chart-canvas" style="display: block; width: 100% !important; height: auto !important;"></canvas>
    <script type="application/json" class="chart-data">${value}</script>
</div>`;

				parent.children.splice(index, 1, {
					type: "html",
					value: html,
				});
			}
		});
	};
}
