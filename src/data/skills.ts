export interface Skill {
  name: string;
  icon: string;
  color: string;
}

export const skills: Skill[] = [
  // Languages
  { name: "TypeScript", icon: "material-symbols:javascript", color: "#3178C6" },
  { name: "Python", icon: "fa6-brands:python", color: "#3776AB" },
  { name: "Java", icon: "fa6-brands:java", color: "#007396" },
  
  // Frontend
  { name: "React", icon: "fa6-brands:react", color: "#61DAFB" },
  { name: "Astro", icon: "simple-icons:astro", color: "#FF5D01" },
  { name: "TailwindCSS", icon: "simple-icons:tailwindcss", color: "#06B6D4" },
  { name: "Svelte", icon: "simple-icons:svelte", color: "#FF3E00" },

  // Backend & Tools
  { name: "Node.js", icon: "fa6-brands:node", color: "#339933" },
  { name: "Git", icon: "fa6-brands:git-alt", color: "#F05032" },
  { name: "Linux", icon: "fa6-brands:linux", color: "#FCC624" },
  { name: "AWS", icon: "fa6-brands:aws", color: "#FF9900" },
  { name: "Docker", icon: "fa6-brands:docker", color: "#2496ED" },
];
