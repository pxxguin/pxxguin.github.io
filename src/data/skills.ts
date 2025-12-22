export interface Skill {
	name: string;
	icon: string;
	color: string;
	level: "High" | "Medium" | "Low";
}

export const skills: Skill[] = [
	// Languages
	{
		name: "TypeScript",
		icon: "material-symbols:javascript",
		color: "#3178C6",
		level: "High",
	},
	{
		name: "Python",
		icon: "fa6-brands:python",
		color: "#3776AB",
		level: "High",
	},
	{ name: "Java", icon: "fa6-brands:java", color: "#007396", level: "Medium" },

	// Frontend
	{ name: "React", icon: "fa6-brands:react", color: "#61DAFB", level: "High" },
	{
		name: "Astro",
		icon: "simple-icons:astro",
		color: "#FF5D01",
		level: "High",
	},
	{
		name: "TailwindCSS",
		icon: "simple-icons:tailwindcss",
		color: "#06B6D4",
		level: "High",
	},
	{
		name: "Svelte",
		icon: "simple-icons:svelte",
		color: "#FF3E00",
		level: "Medium",
	},

	// Backend & Tools
	{
		name: "Node.js",
		icon: "fa6-brands:node",
		color: "#339933",
		level: "Medium",
	},
	{
		name: "Git",
		icon: "fa6-brands:git-alt",
		color: "#F05032",
		level: "Medium",
	},
	{ name: "Linux", icon: "fa6-brands:linux", color: "#FCC624", level: "Low" },
	{ name: "AWS", icon: "fa6-brands:aws", color: "#FF9900", level: "Low" },
	{ name: "Docker", icon: "fa6-brands:docker", color: "#2496ED", level: "Low" },
];
