<script>
	import { Spring } from "svelte/motion";

	let { title, subtitle, emoji } = $props();

	// Springs ease every change, so the card glides after the pointer instead of jumping.
	const tilt = new Spring({ x: 0, y: 0 }, { stiffness: 0.08, damping: 0.25 });
	const glare = new Spring({ x: 50, y: 50, o: 0 }, { stiffness: 0.08, damping: 0.25 });

	function move(event) {
		const rect = event.currentTarget.getBoundingClientRect();
		const px = (event.clientX - rect.left) / rect.width;
		const py = (event.clientY - rect.top) / rect.height;
		tilt.target = { x: (py - 0.5) * -24, y: (px - 0.5) * 24 };
		glare.target = { x: px * 100, y: py * 100, o: 1 };
	}

	function leave() {
		tilt.target = { x: 0, y: 0 };
		glare.target = { x: 50, y: 50, o: 0 };
	}
</script>

<div class="stage">
	<div
		class="card"
		role="img"
		aria-label="{title}: {subtitle}"
		onpointermove={move}
		onpointerleave={leave}
		style:transform="rotateX({tilt.current.x}deg) rotateY({tilt.current.y}deg)"
		style:--gx="{glare.current.x}%"
		style:--gy="{glare.current.y}%"
		style:--go={glare.current.o}
	>
		<span class="emoji">{emoji}</span>
		<strong>{title}</strong>
		<span class="sub">{subtitle}</span>
	</div>
</div>

<style>
	.stage {
		display: grid;
		place-items: center;
		perspective: 900px;
		padding: 1rem 0;
	}

	.card {
		position: relative;
		display: grid;
		place-items: center;
		align-content: center;
		gap: 0.5rem;
		width: min(18rem, 100%);
		aspect-ratio: 5 / 7;
		border-radius: 1.25rem;
		overflow: hidden;
		background:
			radial-gradient(circle at 30% 20%, #ff8a00 0%, transparent 50%),
			radial-gradient(circle at 80% 90%, #ff3e00 0%, transparent 55%),
			linear-gradient(160deg, #2a1440, #120a1f);
		box-shadow: 0 1.5rem 3rem rgb(0 0 0 / 0.45);
		color: #fff;
		transform-style: preserve-3d;
		touch-action: none;
		user-select: none;
	}

	/* Rainbow foil and a light spot that follow the pointer. */
	.card::after {
		content: "";
		position: absolute;
		inset: 0;
		opacity: var(--go);
		background:
			radial-gradient(circle at var(--gx) var(--gy), rgb(255 255 255 / 0.45), transparent 40%),
			linear-gradient(
				115deg,
				transparent 20%,
				rgb(255 0 128 / 0.25) 35%,
				rgb(0 200 255 / 0.25) 50%,
				rgb(120 255 0 / 0.25) 65%,
				transparent 80%
			);
		background-size: 100% 100%, 200% 200%;
		background-position: center, var(--gx) var(--gy);
		mix-blend-mode: color-dodge;
		pointer-events: none;
	}

	.emoji {
		font-size: 5rem;
		transform: translateZ(40px);
		filter: drop-shadow(0 0.5rem 1rem rgb(0 0 0 / 0.4));
	}

	strong {
		font-size: 1.5rem;
		transform: translateZ(30px);
	}

	.sub {
		opacity: 0.75;
		font-size: 0.9rem;
		transform: translateZ(20px);
	}
</style>
