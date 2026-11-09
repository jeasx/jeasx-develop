<script>
	import { Tween } from "svelte/motion";
	import { cubicOut } from "svelte/easing";

	let { income, categories } = $props();

	// svelte-ignore state_referenced_locally
	let items = $state(categories.map((c) => ({ ...c })));

	let spent = $derived(items.reduce((sum, item) => sum + item.amount, 0));
	let left = $derived(income - spent);

	// Tweens animate the numbers and the ring whenever a slider moves.
	// svelte-ignore state_referenced_locally
	const shown = Tween.of(() => left, { duration: 400, easing: cubicOut });
	// svelte-ignore state_referenced_locally
	const shares = Tween.of(() => items.map((item) => item.amount / income), {
		duration: 400,
		easing: cubicOut,
	});

	const R = 70;
	const C = 2 * Math.PI * R;

	// Each segment starts where the previous one ended.
	let segments = $derived(
		shares.current.map((share, index) => ({
			color: items[index].color,
			length: share * C,
			offset: -shares.current.slice(0, index).reduce((a, b) => a + b, 0) * C,
		})),
	);

	const euro = (value) =>
		Math.round(value).toLocaleString("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
</script>

<div class="budget">
	<svg viewBox="0 0 180 180" role="img" aria-label="{euro(left)} left of {euro(income)}">
		<circle class="track" cx="90" cy="90" r={R} />
		{#each segments as segment}
			<circle
				cx="90"
				cy="90"
				r={R}
				stroke={segment.color}
				stroke-dasharray="{segment.length} {C}"
				stroke-dashoffset={segment.offset}
			/>
		{/each}
		<text x="90" y="86" class:over={left < 0}>{euro(shown.current)}</text>
		<text x="90" y="108" class="label">{left < 0 ? "over budget" : "left"}</text>
	</svg>

	<div class="sliders">
		{#each items as item}
			<label style:--c={item.color}>
				<span><i></i>{item.name}<b>{euro(item.amount)}</b></span>
				<input type="range" min="0" max={item.max} step="10" bind:value={item.amount} />
			</label>
		{/each}
		<p>Monthly income: <b>{euro(income)}</b></p>
	</div>
</div>

<style>
	.budget {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		align-items: center;
		gap: 2rem;
	}

	svg {
		width: 100%;
		max-width: 16rem;
		margin: 0 auto;
		transform: rotate(-90deg);
	}

	circle {
		fill: none;
		stroke-width: 18;
	}

	.track {
		stroke: var(--sv-line);
	}

	text {
		transform: rotate(90deg);
		transform-origin: 90px 90px;
		fill: currentColor;
		font-size: 1.4rem;
		font-weight: 700;
		text-anchor: middle;
		font-variant-numeric: tabular-nums;
	}

	text.over {
		fill: var(--sv-error);
	}

	text.label {
		fill: var(--sv-muted);
		font-size: 0.7rem;
		font-weight: normal;
	}

	.sliders {
		display: grid;
		gap: 0.9rem;
	}

	label {
		display: grid;
		gap: 0.25rem;
		margin: 0;
	}

	label span {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	label i {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
		background: var(--c);
	}

	label b {
		margin-left: auto;
		font-variant-numeric: tabular-nums;
	}

	input[type="range"] {
		margin: 0;
		accent-color: var(--c);
	}

	p {
		margin: 0;
		color: var(--sv-muted);
		font-size: 0.9rem;
	}
</style>
