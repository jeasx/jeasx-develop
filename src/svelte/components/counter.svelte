<script>
	let { init = 0 } = $props();
	// svelte-ignore state_referenced_locally
	let count = $state(init);
	let doubled = $derived(count * 2);
	let squared = $derived(count ** 2);
</script>

<div class="counter">
	<div class="stepper">
		<button type="button" onclick={() => (count -= 1)} aria-label="Decrement">−</button>
		<input type="number" bind:value={count} aria-label="Count" />
		<button type="button" onclick={() => (count += 1)} aria-label="Increment">+</button>
	</div>
	<dl aria-live="polite">
		<div><dt>doubled</dt><dd>{doubled}</dd></div>
		<div><dt>squared</dt><dd>{squared}</dd></div>
	</dl>
	<button type="button" class="reset" onclick={() => (count = init)} disabled={count === init}>
		Reset to {init}
	</button>
</div>

<style>
	.counter {
		display: grid;
		justify-items: center;
		gap: 1rem;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.stepper button {
		display: grid;
		place-items: center;
		box-sizing: border-box;
		min-width: 0;
		min-height: 0;
		margin: 0;
		border: 1px solid var(--sv-line);
		border-radius: 50%;
		background: transparent;
		padding: 0;
		width: 2.75rem;
		height: 2.75rem;
		color: inherit;
		font-size: 1.4rem;
		line-height: 1;
	}

	.stepper button:hover {
		border-color: var(--sv-accent);
	}

	input {
		margin: 0;
		border: 0;
		background: transparent;
		width: 6rem;
		color: var(--sv-accent);
		font-weight: 700;
		font-size: 2.5rem;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}

	dl {
		display: flex;
		gap: 2rem;
		margin: 0;
	}

	dl div {
		text-align: center;
	}

	dt {
		color: var(--sv-muted);
		font-size: 0.8rem;
	}

	dd {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.reset {
		margin: 0;
		border: 1px solid var(--sv-line);
		border-radius: 999px;
		background: transparent;
		padding: 0.35rem 1rem;
		color: inherit;
		font-size: 0.85rem;
	}
</style>
