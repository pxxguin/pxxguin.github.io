<script lang="ts">
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getTagColor } from "../utils/color-utils";
import { getPostUrl } from "../utils/url-utils";

export let tags: string[] = [];
export let excludeTags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
excludeTags = params.has("tag!") ? params.getAll("tag!") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");
const isFiltered =
	categories.length > 0 ||
	tags.length > 0 ||
	excludeTags.length > 0 ||
	!!uncategorized;

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

	if (excludeTags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				!Array.isArray(post.data.tags) ||
				!post.data.tags.some((tag) => excludeTags.includes(tag)),
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
    {#if isFiltered}
        <div class="flex flex-wrap items-center gap-2 mb-8 pl-4 md:pl-0">
            {#if categories.length > 0}
                {#each categories as cat}
                    <span class="inline-flex items-center gap-1.5 bg-[var(--primary)] text-white text-sm font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/>
                        </svg>
                        {cat}
                    </span>
                {/each}
            {/if}
            {#if tags.length > 0}
                {#each tags as tag}
                    <span class="inline-flex items-center gap-1.5 bg-black/10 dark:bg-white/10 text-75 text-sm font-medium px-3.5 py-1.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        #{tag}
                    </span>
                {/each}
            {/if}
            {#if excludeTags.length > 0}
                {#each excludeTags as tag}
                    <span class="inline-flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium px-3.5 py-1.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        -{tag}
                    </span>
                {/each}
            {/if}
            <span class="text-50 text-sm ml-1">
                · {groups.reduce((sum, g) => sum + g.posts.length, 0)} {i18n(groups.reduce((sum, g) => sum + g.posts.length, 0) === 1 ? I18nKey.postCount : I18nKey.postsCount)}
            </span>
        </div>
    {/if}

    {#each groups as group (group.year)}
        <div class="mb-12">
            {#if !isFiltered}
            <div class="flex flex-row w-full items-center mb-6 pl-4 md:pl-0">
                <div class="text-3xl font-bold text-75">
                    {group.year}
                </div>
                <div class="ml-4 transition text-50 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-sm">
                    {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
                </div>
            </div>
            {/if}

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each group.posts as post (post.slug)}
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
                                    <div class="inline-flex items-center gap-1.5 bg-[var(--primary)]/10 text-[var(--primary)] font-semibold rounded-md px-2 py-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        <span>{post.data.category}</span>
                                    </div>
                                {/if}
                                {#each post.data.tags || [] as tag}
                                    <span class={`rounded-md px-2 py-0.5 lg:whitespace-nowrap ${getTagColor(tag)}`}>#{tag}</span>
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
