<script lang="ts">
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrl } from "../utils/url-utils";

export let tags: string[];
export let categories: string[];
export let sortedPosts: Post[] = [];

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string;
		published: Date;
		postId?: number;
		image?: string;
		description?: string;
	};
}

interface Group {
	year: number;
	posts: Post[];
}

let groups: Group[] = [];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

onMount(async () => {
	let filteredPosts: Post[] = sortedPosts;

	if (tags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => tags.includes(tag)),
		);
	}

	if (categories.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) => post.data.category && categories.includes(post.data.category),
		);
	}

	if (uncategorized) {
		filteredPosts = filteredPosts.filter((post) => !post.data.category);
	}

	const grouped = filteredPosts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: grouped[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);

	groups = groupedPostsArray;
});
</script>

<div class="px-4 py-4 md:px-0">
    {#each groups as group}
        <div class="mb-12">
            <div class="flex flex-row w-full items-center mb-6 pl-4 md:pl-0">
                <div class="text-3xl font-bold text-75">
                    {group.year}
                </div>
                <div class="ml-4 transition text-50 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-sm">
                    {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each group.posts as post}
                    <div class="card-base flex flex-col w-full rounded-[var(--radius-large)] overflow-hidden relative group">
                        
                        {#if post.data.image}
                            <a href={getPostUrl(post)} aria-label={post.data.title} class="relative w-full overflow-hidden shrink-0" style="aspect-ratio: 16/9;">
                                <div class="absolute pointer-events-none z-10 w-full h-full group-hover:bg-black/30 group-active:bg-black/50 transition"></div>
                                <img src={post.data.image} alt={post.data.title} class="w-full h-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                            </a>
                        {:else}
                            <a href={getPostUrl(post)} aria-label={post.data.title} class="relative w-full overflow-hidden shrink-0 bg-black/5 dark:bg-white/5 flex items-center justify-center" style="aspect-ratio: 16/9;">
                                <div class="absolute pointer-events-none z-10 w-full h-full group-hover:bg-black/10 group-active:bg-black/20 transition"></div>
                                <div class="text-6xl font-black text-black/10 dark:text-white/10 uppercase italic">
                                    {post.data.title.substring(0, 1)}
                                </div>
                            </a>
                        {/if}

                        <div class="p-6 flex flex-col flex-grow relative bg-transparent">
                            <a href={getPostUrl(post)}
                               class="transition w-full block font-bold mb-3 text-2xl text-90
                                hover:text-[var(--primary)] dark:hover:text-[var(--primary)]
                                active:text-[var(--title-active)] dark:active:text-[var(--title-active)]
                                line-clamp-2 text-left"
                            >
                                {post.data.title}
                            </a>

                            <div class="flex flex-wrap items-center gap-2 mb-4 text-sm text-50">
                                {#if post.data.category}
                                    <span class="bg-[var(--primary)]/10 text-[var(--primary)] font-medium rounded-md px-2 py-0.5">{post.data.category}</span>
                                {/if}
                                {#each post.data.tags || [] as tag}
                                    <span class="bg-black/5 dark:bg-white/5 rounded-md px-2 py-0.5 lg:whitespace-nowrap">#{tag}</span>
                                {/each}
                            </div>

                            {#if post.data.description}
                                <div class="transition text-75 mb-4 line-clamp-3 md:line-clamp-2 text-sm flex-grow text-left">
                                    {post.data.description}
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>
