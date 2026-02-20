<script>
import * as d3 from "d3";
import { onDestroy, onMount } from "svelte";
import { getPostUrl } from "../utils/url-utils";

let container;
let width;
let height;
let simulation;
let svg;
let nodes = [];
let links = [];

onMount(async () => {
	try {
		const response = await fetch("/graph-data.json");
		const data = await response.json();
		nodes = data.nodes;
		links = data.links;

		if (!container) return;
		initGraph();
		window.addEventListener("resize", resize);
	} catch (e) {
		console.error("Failed to load graph data", e);
	}
});

onDestroy(() => {
	if (simulation) simulation.stop();
	window.removeEventListener("resize", resize);
});

function resize() {
	if (!container) return;
	width = container.clientWidth;
	height = container.clientHeight;

	if (svg) {
		svg.attr("width", width).attr("height", height);
	}

	if (simulation) {
		simulation.force("center", d3.forceCenter(width / 2, height / 2));
		simulation.alpha(0.3).restart();
	}
}

function initGraph() {
	width = container.clientWidth;
	height = container.clientHeight;

	svg = d3
		.select(container)
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	const g = svg.append("g");

	const zoom = d3
		.zoom()
		.scaleExtent([0.1, 4])
		.on("zoom", (event) => {
			g.attr("transform", event.transform);
		});

	svg
		.call(zoom)
		.on("dblclick.zoom", null) // Disable double click zoom
		.call(
			zoom.transform,
			d3.zoomIdentity
				.translate(width / 2, height / 2)
				.scale(1.2)
				.translate(-width / 2, -height / 2),
		);

	simulation = d3
		.forceSimulation(nodes)
		.force(
			"link",
			d3
				.forceLink(links)
				.id((d) => d.id)
				.distance(150),
		)
		.force("charge", d3.forceManyBody().strength(-500))
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force("collide", d3.forceCollide().radius(50))
		.force("x", d3.forceX(width / 2).strength(0.05)) // Weak centering for all
		.force("y", d3.forceY(height / 2).strength(0.05)); // Weak centering for all

	// Custom force to align categories horizontally
	const categories = nodes.filter((d) => d.type === "category");
	const spacing = width / (categories.length + 1);

	categories.forEach((d, i) => {
		d.targetX = spacing * (i + 1);
		d.targetY = height / 2;
	});

	simulation
		.force(
			"categoryX",
			d3
				.forceX((d) => (d.type === "category" ? d.targetX : width / 2))
				.strength((d) => (d.type === "category" ? 0.3 : 0)),
		)
		.force(
			"categoryY",
			d3.forceY(height / 2).strength((d) => (d.type === "category" ? 0.3 : 0)),
		);

	const link = g
		.append("g")
		.attr("stroke", "#999")
		.attr("stroke-opacity", 0.6)
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke-width", 1);

	const node = g
		.append("g")
		.attr("stroke", "#fff")
		.attr("stroke-width", 1.5)
		.selectAll("g") // Group for circle + text
		.data(nodes)
		.join("g")
		.call(drag(simulation));

	// Circles
	node
		.append("circle")
		.attr("r", (d) => (d.type === "post" ? 8 : d.type === "category" ? 12 : 5))
		.attr("fill", (d) => {
			if (d.type === "post") return "var(--primary)"; // Post color
			if (d.type === "category") return "#fbbf24"; // Category color (amber)
			return "#a3a3a3"; // Tag color (neutral)
		})
		.attr("opacity", 0.9)
		.on("click", (_event, d) => {
			if (d.type === "post") {
				window.location.href = `/${d.postId}/`;
			} else if (d.type === "category") {
				window.location.href = `/archive/category/${d.name}/`;
			} else if (d.type === "tag") {
				window.location.href = `/archive/tag/${d.name}/`;
			}
		});

	// Labels
	node
		.append("text")
		.text((d) => d.title || d.name) // Use title for posts, name for tags/categories
		.attr("x", 12)
		.attr("y", 4)
		.attr("fill", "currentColor")
		.attr("stroke", "none")
		.attr("font-size", "12px")
		.attr("pointer-events", "none") // Let clicks pass through to circle
		.attr("class", "dark:fill-white fill-black");

	// Hover effects
	node
		.on("mouseover", function (_event, d) {
			d3.select(this)
				.select("circle")
				.attr("stroke", "#fff")
				.attr("stroke-width", 3);
			node.attr("opacity", 0.1);
			link.attr("opacity", 0.1);

			d3.select(this).attr("opacity", 1);

			// Highlight neighbors
			const neighbors = new Set();
			links.forEach((l) => {
				if (l.source.id === d.id) neighbors.add(l.target.id);
				if (l.target.id === d.id) neighbors.add(l.source.id);
			});

			node.filter((n) => neighbors.has(n.id)).attr("opacity", 1);
			link
				.filter((l) => l.source.id === d.id || l.target.id === d.id)
				.attr("opacity", 1)
				.attr("stroke", "var(--primary)");
		})
		.on("mouseout", function () {
			d3.select(this)
				.select("circle")
				.attr("stroke", "#fff")
				.attr("stroke-width", 1.5);
			node.attr("opacity", 0.9);
			link.attr("opacity", 0.6).attr("stroke", "#999");
		});

	simulation.on("tick", () => {
		link
			.attr("x1", (d) => d.source.x)
			.attr("y1", (d) => d.source.y)
			.attr("x2", (d) => d.target.x)
			.attr("y2", (d) => d.target.y);

		node.attr("transform", (d) => `translate(${d.x},${d.y})`);
	});
}

function drag(simulation) {
	function dragstarted(event) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	return d3
		.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended);
}
</script>

<div class="w-full h-[500px] border border-black/10 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#1e1e1e] overflow-hidden relative cursor-move" bind:this={container}>
    <!-- Controls or Legend can go here -->
    <div class="absolute bottom-4 right-4 bg-white/80 dark:bg-black/80 p-3 rounded-lg text-xs backdrop-blur-sm shadow-sm pointer-events-none">
        <div class="flex items-center gap-2 mb-1"><span class="w-3 h-3 rounded-full bg-[var(--primary)]"></span> Post</div>
        <div class="flex items-center gap-2 mb-1"><span class="w-3 h-3 rounded-full bg-amber-400"></span> Category</div>
        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-neutral-400"></span> Tag</div>
    </div>
</div>
