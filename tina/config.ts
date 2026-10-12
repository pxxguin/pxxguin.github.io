import { defineConfig } from "tinacms";

const branch =
	process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.HEAD || "master";

export default defineConfig({
	branch,
	clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
	token: process.env.TINA_TOKEN || "",
	build: {
		outputFolder: "admin",
		publicFolder: "public",
	},
	media: {
		tina: {
			mediaRoot: "images",
			publicFolder: "public",
		},
	},
	schema: {
		collections: [
			{
				name: "post",
				label: "Posts",
				path: "src/content/posts",
				format: "md",
				match: {
					include: "**/index",
				},
				defaultItem: {
					draft: true,
					description: "",
					tags: [],
				},
				ui: {
					allowedActions: {
						create: true,
						delete: true,
						createNestedFolder: true,
					},
				},
				fields: [
					{
						type: "string",
						name: "title",
						label: "Title",
						isTitle: true,
						required: true,
					},
					{
						type: "datetime",
						name: "published",
						label: "Published",
						required: true,
					},
					{
						type: "datetime",
						name: "updated",
						label: "Updated",
					},
					{
						type: "boolean",
						name: "draft",
						label: "Draft",
					},
					{
						type: "string",
						name: "description",
						label: "Description",
						ui: { component: "textarea" },
					},
					{
						type: "image",
						name: "image",
						label: "Cover image",
					},
					{
						type: "string",
						name: "tags",
						label: "Tags",
						list: true,
						ui: { component: "tags" },
					},
					{
						type: "string",
						name: "category",
						label: "Category",
					},
					{
						type: "string",
						name: "lang",
						label: "Language",
					},
					{
						type: "number",
						name: "postId",
						label: "Post ID",
					},
					{
						type: "string",
						name: "series",
						label: "Series",
					},
					{
						type: "number",
						name: "seriesOrder",
						label: "Series order",
					},
					{
						type: "string",
						name: "github",
						label: "GitHub URL",
					},
					{
						type: "string",
						name: "body",
						label: "Content",
						isBody: true,
						required: true,
						ui: { component: "textarea" },
					},
				],
			},
		],
	},
});
