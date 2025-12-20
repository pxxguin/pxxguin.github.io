import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	id: string;
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		id: post.id,
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

export async function getRelatedPosts(
	currentSlug: string,
	tags: string[],
	limit: number = 3,
): Promise<PostForList[]> {
	const allPosts = await getRawSortedPosts();

	// Filter out the current post
	const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

	if (tags.length === 0) {
		// If current post has no tags, return recent posts
		return otherPosts
			.slice(0, limit)
			.map((post) => ({ id: post.id, slug: post.slug, data: post.data }));
	}

	// Calculate relevance score
	const scoredPosts = otherPosts.map((post) => {
		const postTags = post.data.tags || [];
		const matchingTags = postTags.filter((tag) => tags.includes(tag));
		return {
			post,
			score: matchingTags.length,
		};
	});

	// Sort by score desc, then date desc
	scoredPosts.sort((a, b) => {
		if (a.score !== b.score) {
			return b.score - a.score;
		}
		const dateA = new Date(a.post.data.published).getTime();
		const dateB = new Date(b.post.data.published).getTime();
		return dateB - dateA;
	});

	// Return top N
	return scoredPosts
		.filter((item) => item.score > 0) // Only return posts with at least 1 matching tag? Or just fallback? Let's say at least 1 match preferred, but if not enough, maybe we usually want *something*.
		// Actually, let's keep it strictly related for now. If user wants filler, we can adjust.
		// If 0 matches, it returns empty list.
		.slice(0, limit)
		.map((item) => ({ id: item.post.id, slug: item.post.slug, data: item.post.data }));
}
