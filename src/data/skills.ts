export interface Skill {
  name: string;
  icon: string;
}

export const skills: Skill[] = [
  // Languages
  { name: "TypeScript", icon: "material-symbols:javascript" }, // Using JS icon as TS fallback or specific if available
  { name: "Python", icon: "fa6-brands:python" },
  { name: "Java", icon: "fa6-brands:java" },
  
  // Frontend
  { name: "React", icon: "fa6-brands:react" },
  { name: "Astro", icon: "simple-icons:astro" },
  { name: "TailwindCSS", icon: "simple-icons:tailwindcss" },
  { name: "Svelte", icon: "simple-icons:svelte" },

  // Backend & Tools
  { name: "Node.js", icon: "fa6-brands:node" },
  { name: "Git", icon: "fa6-brands:git-alt" },
  { name: "Linux", icon: "fa6-brands:linux" },
  { name: "AWS", icon: "fa6-brands:aws" },
  { name: "Docker", icon: "fa6-brands:docker" },
];
