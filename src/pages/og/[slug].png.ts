import { getCollection } from "astro:content";
import fs from "node:fs/promises";
import path from "node:path";
import type { APIContext } from "astro";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";
import { formatDateToYYYYMMDD } from "../../utils/date-utils";

// Function to get font buffer
async function _getFontData() {
	// Try to find the font file in node_modules
	// We are looking for regular and bold fonts.
	// Using process.cwd() to ensure we are at the root
	const fontPathRegular = path.join(
		process.cwd(),
		"node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff",
	);
	const fontPathBold = path.join(
		process.cwd(),
		"node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff",
	);

	const regular = await fs.readFile(fontPathRegular);
	const bold = await fs.readFile(fontPathBold);

	return { regular, bold };
}

export async function getStaticPaths() {
	const posts = await getCollection("posts");
	return posts.map((post) => ({
		params: { slug: post.slug },
		props: { post },
	}));
}

export async function GET({ props }: APIContext) {
	const { post } = props as { post: any }; // Type assertion for custom props
	const { title, description, published, category } = post.data;
	const date = formatDateToYYYYMMDD(published);

	const { regular, bold } = await _getFontData();

	// Design Template
	// 1200x630 is standard OG size
	const markup = html`
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: #f3f4f6; padding: 40px; font-family: 'Roboto';">
             <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: white; border-radius: 20px; padding: 60px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); justify-content: space-between;">
                
                <div style="display: flex; flex-direction: column;">
                    <!-- Category Pill -->
                    <div style="display: flex; align-items: center; margin-bottom: 24px;">
                        <span style="background-color: #3b82f6; color: white; padding: 8px 20px; border-radius: 50px; font-size: 24px; font-weight: bold;">
                            ${category || "Blog"}
                        </span>
                    </div>

                    <!-- Title -->
                    <h1 style="font-size: 64px; font-weight: bold; color: #111827; margin: 0; margin-bottom: 24px; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${title}
                    </h1>

                    <!-- Description -->
                    <p style="font-size: 32px; color: #6b7280; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${description}
                    </p>
                </div>

                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #e5e7eb; padding-top: 40px; margin-top: auto;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 28px; font-weight: bold; color: #111827;">Hong's Dev</span>
                        <span style="font-size: 24px; color: #9ca3af; margin-top: 8px;">pxxguin.github.io</span>
                    </div>
                    <div style="font-size: 28px; color: #6b7280; font-weight: 500;">
                        ${date}
                    </div>
                </div>

             </div>
        </div>
    `;

	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: "Roboto",
				data: regular,
				weight: 400,
				style: "normal",
			},
			{
				name: "Roboto",
				data: bold,
				weight: 700,
				style: "normal",
			},
		],
	});

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	// @ts-expect-error
	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
		},
	});
}
