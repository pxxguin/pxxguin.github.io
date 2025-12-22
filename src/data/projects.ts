export interface Project {
	title: string;
	description: string;
	detailDescription?: string; // Longer description for the detail view
	image: string; // Keep for thumbnail
	tags: string[];
	demoUrl?: string;
	repoUrl?: string;
	video?: string; // Keep for backward compatibility or single video
	media?: { type: "image" | "video"; url: string }[]; // New field for carousel
}

export const projects: Project[] = [
	{
		title: "Project Alpha",
		description:
			"A revolutionary AI-powered task management tool that predicts your next move.",
		detailDescription:
			"Project Alpha is a cutting-edge task management solution designed to anticipate user needs using advanced machine learning algorithms. \n\nIt features:\n- Predictive task scheduling based on user habits.\n- Natural language processing for easy task entry.\n- Seamless integration with popular calendar apps.\n\nBuilt with performance and scalability in mind, Project Alpha helps users reclaim their time and focus on what truly matters.",
		image:
			"https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2940&auto=format&fit=crop",
		tags: ["React", "TypeScript", "OpenAI API"],
		demoUrl: "https://example.com",
		repoUrl: "https://github.com",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
		media: [
			{
				type: "video",
				url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2940&auto=format&fit=crop",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop",
			},
		],
	},
	{
		title: "Beta Commerce",
		description:
			"A fully functional e-commerce platform built with modern web technologies.",
		detailDescription:
			"Beta Commerce is a robust e-commerce platform that provides a seamless shopping experience. \n\nKey features include:\n- Real-time inventory management.\n- Secure payment processing with Stripe.\n- A responsive, mobile-first design.\n- Comprehensive admin dashboard for analytics and order management.\n\nThis project demonstrates the power of Next.js for server-side rendering and static site generation.",
		image:
			"https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
		tags: ["Next.js", "TailwindCSS", "Stripe"],
		demoUrl: "https://example.com",
		repoUrl: "https://github.com",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
		media: [
			{
				type: "video",
				url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2940&auto=format&fit=crop",
			},
		],
	},
	{
		title: "Gamma Dashboard",
		description:
			"Real-time data visualization dashboard for monitoring system metrics.",
		detailDescription:
			"Gamma Dashboard offers real-time insights into system performance through interactive visualizations. \n\nUsers can monitor:\n- Server CPU and memory usage.\n- Network traffic analysis.\n- Application error rates.\n\nLeveraging D3.js for complex charts and Firebase for real-time data syncing, Gamma Dashboard ensures you never miss a critical system event.",
		image:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
		tags: ["Vue.js", "D3.js", "Firebase"],
		demoUrl: "https://example.com",
		repoUrl: "https://github.com",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
		media: [
			{
				type: "video",
				url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
			},
		],
	},
	{
		title: "Delta Social",
		description:
			"A social networking app focused on privacy and decentralized data ownership.",
		detailDescription:
			"Delta Social reimagines social networking with a privacy-first approach. \n\nUnlike traditional platforms, Delta Social gives users complete ownership of their data. \n\nFeatures:\n- End-to-end encrypted messaging.\n- Decentralized content storage.\n- No tracking or invasive ads.\n\nBuilt with React Native for a native mobile experience and GraphQL for efficient data fetching.",
		image:
			"https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2940&auto=format&fit=crop",
		tags: ["React Native", "GraphQL", "Node.js"],
		demoUrl: "https://example.com",
		repoUrl: "https://github.com",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
		media: [
			{
				type: "video",
				url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2940&auto=format&fit=crop",
			},
		],
	},
	{
		title: "Epsilon Finance",
		description:
			"Personal finance tracker with automated categorization and budgeting tools.",
		detailDescription:
			"Epsilon Finance simplifies personal financial management. \n\nIt automatically categorizes transactions, tracks spending habits, and helps users set and stick to budgets. \n\nWith a clean, intuitive interface built in Flutter, Epsilon Finance makes managing money effortless and secure.",
		image:
			"https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?q=80&w=2940&auto=format&fit=crop",
		tags: ["Flutter", "Dart", "SQLite"],
		demoUrl: "https://example.com",
		repoUrl: "https://github.com",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
		media: [
			{
				type: "video",
				url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?q=80&w=2940&auto=format&fit=crop",
			},
		],
	},
	{
		title: "Zeta Learning",
		description:
			"An interactive e-learning platform with gamified courses and progress tracking.",
		detailDescription:
			"Zeta Learning makes education engaging through gamification. \n\nStudents can earn badges, compete on leaderboards, and track their progress through interactive courses. \n\nThe platform supports various media types, including video lectures, quizzes, and coding exercises, providing a comprehensive learning environment.",
		image:
			"https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2874&auto=format&fit=crop",
		tags: ["Svelte", "Supabase", "TailwindCSS"],
		demoUrl: "https://example.com",
		repoUrl: "https://github.com",
		video: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
		media: [
			{
				type: "video",
				url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=adP4t_k7o4V6ZJ9j",
			},
			{
				type: "image",
				url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2874&auto=format&fit=crop",
			},
		],
	},
];
