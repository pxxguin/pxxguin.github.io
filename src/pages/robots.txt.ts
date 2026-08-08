import type { APIRoute } from "astro";
import { getFlag } from "../utils/achievements";

const robotsTxt = `
User-agent: *
Disallow: /_astro/
Disallow: /login/
Disallow: /secret/

# ${getFlag("robots")}

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
