import { spawnSync } from "node:child_process";

const hasCloudCredentials =
	Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID) &&
	Boolean(process.env.TINA_TOKEN);

if (!hasCloudCredentials) {
	console.warn(
		"Skipping the TinaCMS admin build because TinaCloud credentials are not configured.",
	);
	process.exit(0);
}

const result = spawnSync(
	"pnpm",
	["exec", "tinacms", "build", "--content=local"],
	{
		stdio: "inherit",
		env: process.env,
	},
);

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 1);
