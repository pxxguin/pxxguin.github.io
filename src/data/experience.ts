export interface Experience {
  date: string;
  title: string;
  company: string;
  description: string;
  type: "education" | "work" | "award";
}

export const experiences: Experience[] = [
  {
    date: "2024 - Present",
    title: "Senior Frontend Developer",
    company: "Tech Solutions Inc.",
    description: "Leading the frontend team in building scalable web applications using React and TypeScript. Improved site performance by 40%.",
    type: "work",
  },
  {
    date: "2022 - 2024",
    title: "Full Stack Developer",
    company: "StartUp Hub",
    description: "Developed and maintained full-stack applications using Node.js and Vue.js. Implemented CI/CD pipelines and automated testing.",
    type: "work",
  },
  {
    date: "2018 - 2022",
    title: "B.S. in Computer Science",
    company: "University of Technology",
    description: "Graduated with honors. Specialized in Artificial Intelligence and Web Technologies. Capstone project focused on NLP.",
    type: "education",
  },
  {
    date: "2021",
    title: "Best Hackathon Project",
    company: "Global AI Hackathon",
    description: "Won 1st place for creating an innovative accessibility tool using computer vision.",
    type: "award",
  },
];
