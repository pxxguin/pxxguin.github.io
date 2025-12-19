export interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
}

export const projects: Project[] = [
  {
    title: "Project Alpha",
    description: "A revolutionary AI-powered task management tool that predicts your next move.",
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2940&auto=format&fit=crop",
    tags: ["React", "TypeScript", "OpenAI API"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com",
  },
  {
    title: "Beta Commerce",
    description: "A fully functional e-commerce platform built with modern web technologies.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    tags: ["Next.js", "TailwindCSS", "Stripe"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com",
  },
  {
    title: "Gamma Dashboard",
    description: "Real-time data visualization dashboard for monitoring system metrics.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
    tags: ["Vue.js", "D3.js", "Firebase"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com",
  },
  {
    title: "Delta Social",
    description: "A social networking app focused on privacy and decentralized data ownership.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2940&auto=format&fit=crop",
    tags: ["React Native", "GraphQL", "Node.js"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com",
  },
  {
    title: "Epsilon Finance",
    description: "Personal finance tracker with automated categorization and budgeting tools.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?q=80&w=2940&auto=format&fit=crop",
    tags: ["Flutter", "Dart", "SQLite"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com",
  },
  {
    title: "Zeta Learning",
    description: "An interactive e-learning platform with gamified courses and progress tracking.",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2874&auto=format&fit=crop",
    tags: ["Svelte", "Supabase", "TailwindCSS"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com",
  },
];
