<script>
	import { flip } from "svelte/animate";
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";

	const [send, receive] = crossfade({
		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			};
		},
	});

	let todos = $state([
		{ id: 1, done: false, description: "write some docs" },
		{ id: 2, done: false, description: "start writing JSConf talk" },
		{ id: 3, done: true, description: "buy some milk" },
		{ id: 4, done: false, description: "mow the lawn" },
		{ id: 5, done: false, description: "feed the turtle" },
		{ id: 6, done: false, description: "fix some bugs" },
	]);

	// svelte-ignore state_referenced_locally
	let uid = todos.length + 1;
	let draft = $state("");

	let open = $derived(todos.filter((t) => !t.done));
	let done = $derived(todos.filter((t) => t.done));

	function add(event) {
		event.preventDefault();
		// Ignore todos without any text, e.g. only spaces.
		if (!draft.trim()) return;
		todos = [{ id: uid++, done: false, description: draft.trim() }, ...todos];
		draft = "";
	}

	function remove(todo) {
		todos = todos.filter((t) => t !== todo);
	}

	function clearDone() {
		todos = todos.filter((t) => !t.done);
	}
</script>

<div class="board">
	<form class="new" onsubmit={add}>
		<input bind:value={draft} placeholder="What needs to be done?" aria-label="New todo" />
		<button type="submit" disabled={!draft.trim()}>Add</button>
	</form>

	{#each [{ title: "To do", list: open, kind: "open" }, { title: "Done", list: done, kind: "done" }] as column (column.kind)}
		<section class={column.kind}>
			<h3>
				{column.title} <span class="count">{column.list.length}</span>
				{#if column.kind === "done" && done.length}
					<button type="button" class="clear" onclick={clearDone}>Clear</button>
				{/if}
			</h3>
			{#each column.list as todo (todo.id)}
				<label in:receive={{ key: todo.id }} out:send={{ key: todo.id }} animate:flip={{ duration: 300 }}>
					<input type="checkbox" bind:checked={todo.done} />
					<span>{todo.description}</span>
					<button type="button" class="remove" onclick={() => remove(todo)} aria-label="Remove {todo.description}">×</button>
				</label>
			{:else}
				<p class="empty">{column.kind === "open" ? "All done. 🎉" : "Nothing done yet."}</p>
			{/each}
		</section>
	{/each}
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1rem;
	}

	.new {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-column: 1 / -1;
		gap: 0.5rem;
		margin: 0;
		width: 100%;
	}

	.new input {
		box-sizing: border-box;
		margin: 0;
		width: 100%;
		min-width: 0;
	}

	.new button {
		margin: 0;
		border: 0;
		border-radius: 999px;
		background: var(--sv-accent);
		padding: 0 1.5rem;
		color: #fff;
	}

	section {
		display: grid;
		align-content: start;
		gap: 0.5rem;
		border-radius: 0.75rem;
		background: var(--sv-soft);
		padding: 0.75rem;
	}

	h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.25rem;
		font-size: 1rem;
	}

	.count {
		border-radius: 999px;
		background: var(--sv-line);
		padding: 0 0.5rem;
		font-size: 0.8rem;
	}

	.clear {
		margin: 0 0 0 auto;
		border: 0;
		background: transparent;
		padding: 0;
		color: var(--sv-muted);
		font-weight: normal;
		font-size: 0.8rem;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0;
		border-left: 3px solid var(--sv-accent);
		border-radius: 0.5rem;
		background: var(--sv-soft);
		padding: 0.55rem 0.75rem;
		cursor: pointer;
	}

	.done label {
		border-left-color: var(--sv-success);
	}

	.done label span {
		opacity: 0.6;
		text-decoration: line-through;
	}

	label input {
		margin: 0;
	}

	label span {
		flex: 1;
	}

	.remove {
		opacity: 0;
		transition: opacity 0.2s;
		margin: 0;
		border: 0;
		background: transparent;
		padding: 0 0.25rem;
		color: var(--sv-error);
		font-size: 1.2rem;
		line-height: 1;
	}

	label:hover .remove,
	.remove:focus-visible {
		opacity: 1;
	}

	/* Touch screens can't hover, so always show the delete buttons there. */
	@media (hover: none) {
		.remove {
			opacity: 1;
		}
	}

	.empty {
		margin: 0;
		padding: 0.5rem;
		color: var(--sv-muted);
		font-size: 0.9rem;
		text-align: center;
	}
</style>
