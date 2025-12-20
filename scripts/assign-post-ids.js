import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

// Recursive function to get all markdown files
function getMarkdownFiles(dir) {
	let results = [];
	const list = fs.readdirSync(dir);
	list.forEach((file) => {
		file = path.join(dir, file);
		const stat = fs.statSync(file);
		if (stat?.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(getMarkdownFiles(file));
		} else {
			/* Is a file */
			if (file.endsWith(".md") || file.endsWith(".mdx")) {
				results.push(file);
			}
		}
	});
	return results;
}

function assignPostIds() {
	if (!fs.existsSync(POSTS_DIR)) {
		console.log("No posts directory found.");
		return;
	}

	const files = getMarkdownFiles(POSTS_DIR);
	let maxId = 0;
	const postsWithoutId = [];

	// First pass: find max existing ID
	files.forEach((file) => {
		const content = fs.readFileSync(file, "utf8");
		const parsed = matter(content);
		if (parsed.data.postId) {
			if (typeof parsed.data.postId === "number") {
				maxId = Math.max(maxId, parsed.data.postId);
			}
		} else {
			postsWithoutId.push({
				file,
				content,
				data: parsed.data,
				date: parsed.data.published
					? new Date(parsed.data.published)
					: new Date(0), // Default to epoch if no date
			});
		}
	});

	if (postsWithoutId.length === 0) {
		console.log("All posts already have IDs.");
		return;
	}

	// Sort posts without ID by date (ascending) so older posts get smaller numbers if possible?
	// Actually, Tistory usually assigns ID by creation order.
	// If we are retroactively assigning, sorting by published date makes the most sense.
	postsWithoutId.sort((a, b) => a.date - b.date);

	console.log(
		`Found ${postsWithoutId.length} posts without IDs. Assigning starting from ${maxId + 1}...`,
	);

	postsWithoutId.forEach((post) => {
		maxId++;
		const newContent = matter.stringify(post.content, {
			...post.data,
			postId: maxId,
		});

		// matter.stringify sometimes messes up formatting or quotes, but it's usually reliable for standard frontmatter.
		// However, it might rewrite the whole file.
		// A safer approach for existing files is to append the field if it parses cleanly,
		// but using gray-matter's stringify is the standard way.
		// Note: gray-matter stringify might change indentation or quote style.
		// Let's stick to standard gray-matter for now as it's robust.

		fs.writeFileSync(post.file, newContent);
		console.log(`Assigned ID ${maxId} to ${path.basename(post.file)}`);
	});

	console.log("ID assignment complete.");
}

assignPostIds();
