import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* Persistent ID for Tistory-style numbering */
		postId: z.number().optional(),

		/* Series */
		series: z.string().optional(),
		seriesOrder: z.number().optional(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const seriesCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		image: z.string().optional(),
		status: z.enum(["ongoing", "completed"]).default("ongoing"),
		tags: z.array(z.string()).optional().default([]),
	}),
});

const specCollection = defineCollection({
	schema: z.object({}),
});

export const collections = {
	posts: postsCollection,
	series: seriesCollection,
	spec: specCollection,
};
