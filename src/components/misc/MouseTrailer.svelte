
<script lang="ts">
import { onMount } from "svelte";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;
let animationFrameId: number;

// Optimization constants
const MAX_PARTICLES = 50;
const MIN_DISTANCE = 10; // Pixels

let particles: Particle[] = [];
let lastX = 0;
let lastY = 0;

const colors = [
	"#00ffff", // Cyan
	"#ff00ff", // Pink
	"#ffffff", // White
];

class Particle {
	x: number;
	y: number;
	size: number;
	speedX: number;
	speedY: number;
	color: string;
	life: number;

	constructor(x: number, y: number) {
		this.reset(x, y);
	}

	reset(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.size = Math.random() * 2 + 1; // 1-3px
		this.speedX = Math.random() * 2 - 1;
		this.speedY = Math.random() * 2 - 1;
		this.color = colors[Math.floor(Math.random() * colors.length)];
		this.life = 1.0;
	}

	update() {
		this.x += this.speedX;
		this.y += this.speedY;
		this.life -= 0.03; // Faster fade out
		if (this.size > 0.1) this.size -= 0.05;
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = this.color;
		context.globalAlpha = Math.max(0, this.life);
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		context.fill();
		context.globalAlpha = 1.0;
	}
}

function handleMouseMove(e: MouseEvent) {
	const x = e.clientX;
	const y = e.clientY;

	// Optimization: Throttle based on distance
	const dist = Math.hypot(x - lastX, y - lastY);
	if (dist < MIN_DISTANCE) return;

	lastX = x;
	lastY = y;

	// Add new particle
	particles.push(new Particle(x, y));

	// Hard limit on particles
	if (particles.length > MAX_PARTICLES) {
		particles.shift(); // Remove oldest
	}
}

function animate() {
	if (canvas && ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < particles.length; i++) {
			particles[i].update();
			particles[i].draw(ctx);

			if (particles[i].life <= 0 || particles[i].size <= 0) {
				particles.splice(i, 1);
				i--;
			}
		}
	}
	animationFrameId = requestAnimationFrame(animate);
}

function resize() {
	if (canvas) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
}

onMount(() => {
	ctx = canvas.getContext("2d");
	resize();

	window.addEventListener("resize", resize);
	window.addEventListener("mousemove", handleMouseMove);

	animate();

	return () => {
		window.removeEventListener("resize", resize);
		window.removeEventListener("mousemove", handleMouseMove);
		cancelAnimationFrame(animationFrameId);
	};
});
</script>

<canvas
	bind:this={canvas}
	class="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]"
/>

