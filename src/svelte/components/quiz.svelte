<script>
	import { fly, scale } from "svelte/transition";
	import { backOut } from "svelte/easing";

	let { questions } = $props();

	let index = $state(0);
	let picked = $state(null);
	let score = $state(0);

	let question = $derived(questions[index]);
	let finished = $derived(index >= questions.length);

	function pick(option) {
		if (picked !== null) return;
		picked = option;
		if (option === question.answer) score += 1;
	}

	function next() {
		picked = null;
		index += 1;
	}

	function restart() {
		index = 0;
		score = 0;
		picked = null;
	}
</script>

<div class="quiz">
	<div class="progress" aria-hidden="true">
		{#each questions as _, i}
			<span class:done={i < index} class:current={i === index}></span>
		{/each}
	</div>

	<!-- {#key} recreates its content on every change, so each question flies in fresh. -->
	{#key index}
		<div class="slide" in:fly={{ x: 60, duration: 350, delay: 150 }} out:fly={{ x: -60, duration: 150 }}>
			{#if finished}
				<div class="result" in:scale={{ start: 0.6, easing: backOut, delay: 200 }}>
					<span class="trophy">{score === questions.length ? "🏆" : score > 0 ? "⭐" : "🙈"}</span>
					<strong>{score} of {questions.length} correct</strong>
					<button type="button" class="next" onclick={restart}>Play again</button>
				</div>
			{:else}
				<p class="count">Question {index + 1} of {questions.length}</p>
				<h3>{question.text}</h3>
				<div class="options">
					{#each question.options as option}
						<button
							type="button"
							onclick={() => pick(option)}
							disabled={picked !== null}
							class:right={picked !== null && option === question.answer}
							class:wrong={picked === option && option !== question.answer}
						>
							{option}
						</button>
					{/each}
				</div>
				{#if picked !== null}
					<div class="feedback" in:fly={{ y: 10, duration: 250 }}>
						<span>{picked === question.answer ? "✅ Correct!" : `❌ It's ${question.answer}.`}</span>
						<button type="button" class="next" onclick={next}>
							{index + 1 < questions.length ? "Next →" : "See result"}
						</button>
					</div>
				{/if}
			{/if}
		</div>
	{/key}
</div>

<style>
	.quiz {
		display: grid;
		gap: 1.25rem;
		overflow: hidden;
	}

	.progress {
		display: flex;
		gap: 0.35rem;
	}

	.progress span {
		flex: 1;
		height: 0.35rem;
		border-radius: 999px;
		background: var(--sv-line);
		transition: background 0.3s;
	}

	.progress .done {
		background: var(--sv-accent);
	}

	.progress .current {
		background: var(--sv-accent-2);
	}

	/* Old and new slide share one cell, so they cross over instead of stacking. */
	.quiz > .slide {
		grid-area: 2 / 1;
	}

	.count {
		margin: 0;
		color: var(--sv-muted);
		font-size: 0.85rem;
	}

	h3 {
		margin: 0.25rem 0 1rem;
	}

	.options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 0.6rem;
	}

	.options button {
		margin: 0;
		border: 2px solid var(--sv-line);
		border-radius: 0.75rem;
		background: transparent;
		padding: 0.8rem;
		color: inherit;
		transition: border-color 0.2s, background 0.2s, transform 0.2s;
	}

	.options button:hover:not(:disabled) {
		border-color: var(--sv-accent);
		transform: translateY(-2px);
	}

	.options button:disabled {
		opacity: 0.6;
	}

	.options .right {
		opacity: 1 !important;
		border-color: var(--sv-success);
		background: color-mix(in srgb, var(--sv-success) 18%, transparent);
	}

	.options .wrong {
		opacity: 1 !important;
		border-color: var(--sv-error);
		background: color-mix(in srgb, var(--sv-error) 18%, transparent);
	}

	.feedback {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
	}

	.next {
		margin: 0;
		width: auto;
		border: 0;
		border-radius: 999px;
		background: linear-gradient(120deg, var(--sv-accent), var(--sv-accent-2));
		padding: 0.6rem 1.4rem;
		color: #fff;
		font-weight: 600;
	}

	.result {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		padding: 1rem 0;
	}

	.trophy {
		font-size: 4rem;
	}

	.result strong {
		font-size: 1.4rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.progress span,
		.options button {
			transition: none;
		}
	}
</style>
