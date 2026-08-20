import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/posts");
const OUTPUT_FILE = path.join(process.cwd(), "public/graph-data.json");

function getAllFiles(dirPath) {
	return fs
		.readdirSync(dirPath, { recursive: true })
		.filter((file) => file.endsWith(".md"))
		.map((file) => path.join(dirPath, file));
}

async function generateGraph() {
	console.log("Generating graph data...");

	const files = getAllFiles(CONTENT_DIR);
	const posts = [];
	const tags = new Set();
	const categories = new Set();

	files.forEach((file) => {
		const content = fs.readFileSync(file, "utf-8");
		const { data } = matter(content);

		if (data.draft) return;

		posts.push({
			id: data.title, // Use title as ID for visualization clarity
			title: data.title,
			postId: data.postId,
			slug: data.slug, // Fallback if needed, though we use postId primarily now
			tags: data.tags || [],
			category: data.category,
			type: "post",
			val: 1,
		});

		if (data.tags) {
			data.tags.forEach((tag) => tags.add(tag));
		}
		if (data.category) {
			categories.add(data.category);
		}
	});

	const nodes = [...posts];
	const links = [];

	// Add Tag Nodes
	tags.forEach((tag) => {
		nodes.push({ id: tag, name: tag, type: "tag", val: 5 });
	});

	// Add Category Nodes
	categories.forEach((category) => {
		nodes.push({ id: category, name: category, type: "category", val: 10 });
	});

	// Create Links based on tags and categories
	posts.forEach((post) => {
		// Post -> Tag
		post.tags.forEach((tag) => {
			links.push({ source: post.id, target: tag });
		});

		// Post -> Category
		if (post.category) {
			links.push({ source: post.id, target: post.category });
		}
	});

	const graphData = { nodes, links };

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(graphData, null, 2));
	console.log(
		`Graph data generated with ${nodes.length} nodes and ${links.length} links.`,
	);
}

generateGraph();
