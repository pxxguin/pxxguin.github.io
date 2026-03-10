const colors = [
	{
		name: "red",
		class: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
	},
	{
		name: "orange",
		class:
			"bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
	},
	{
		name: "amber",
		class:
			"bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
	},
	{
		name: "green",
		class:
			"bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300",
	},
	{
		name: "emerald",
		class:
			"bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
	},
	{
		name: "cyan",
		class: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300",
	},
	{
		name: "blue",
		class: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
	},
	{
		name: "indigo",
		class:
			"bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
	},
	{
		name: "violet",
		class:
			"bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
	},
	{
		name: "purple",
		class:
			"bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
	},
	{
		name: "fuchsia",
		class:
			"bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
	},
	{
		name: "rose",
		class: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300",
	},
];

export function getTagColor(tag: string): string {
	let hash = 0;
	for (let i = 0; i < tag.length; i++) {
		hash = tag.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % colors.length;
	return colors[index].class;
}
