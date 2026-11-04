<script>
	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let people = $state(data);

	let prefix = $state("");
	let first = $state("");
	let last = $state("");
	let i = $state(0);

	let filteredPeople = $derived(
		prefix
			? people.filter((person) => {
					const name = `${person.last}, ${person.first}`;
					return name.toLowerCase().startsWith(prefix.toLowerCase());
				})
			: people,
	);
	let selected = $derived(filteredPeople[i]);
	let isComplete = $derived(first.trim() !== "" && last.trim() !== "");

	$effect(() => {
		reset_inputs(selected);
	});

	function create() {
		people = people.concat({ first: first.trim(), last: last.trim() });
		// i is an index into the filtered list (-1 if the filter hides the new person).
		i = filteredPeople.indexOf(people[people.length - 1]);
		if (i === -1) first = last = "";
	}

	function update() {
		selected.first = first.trim();
		selected.last = last.trim();
	}

	function remove() {
		// Remove selected person from the source array (people), not the filtered array.
		// filteredPeople is derived, so it already reflects the removal below.
		const index = people.indexOf(selected);
		people = [...people.slice(0, index), ...people.slice(index + 1)];

		first = last = "";
		i = Math.min(i, filteredPeople.length - 1);
	}

	function reset_inputs(person) {
		first = person ? person.first : "";
		last = person ? person.last : "";
	}
</script>

<div class="crud">
	<div class="list">
		<input type="search" placeholder="Filter by last name…" bind:value={prefix} aria-label="Filter by last name" />
		<select bind:value={i} size={6} aria-label="People">
			{#each filteredPeople as person, i}
				<option value={i}>{person.last}, {person.first}</option>
			{/each}
		</select>
		<small>{filteredPeople.length} of {people.length} people</small>
	</div>

	<div class="form">
		<label>First name <input bind:value={first} placeholder="e.g. Ada" /></label>
		<label>Last name <input bind:value={last} placeholder="e.g. Lovelace" /></label>
		<div class="buttons">
			<button type="button" class="primary" onclick={create} disabled={!isComplete}>Create</button>
			<button type="button" onclick={update} disabled={!isComplete || !selected}>Update</button>
			<button type="button" class="danger" onclick={remove} disabled={!selected}>Delete</button>
		</div>
	</div>
</div>

<style>
	.crud {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1.5rem;
	}

	.list,
	.form {
		display: grid;
		align-content: start;
		gap: 0.75rem;
	}

	input,
	select {
		margin: 0;
		width: 100%;
	}

	select {
		height: auto;
		padding: 0.25rem;
	}

	small {
		color: var(--sv-muted);
	}

	label {
		display: grid;
		gap: 0.25rem;
		margin: 0;
		color: var(--sv-muted);
		font-size: 0.85rem;
	}

	label input {
		font-size: 1rem;
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	button {
		margin: 0;
		border: 1px solid var(--sv-line);
		border-radius: 999px;
		background: transparent;
		padding: 0.4rem 1.1rem;
		color: inherit;
	}

	button.primary {
		border-color: transparent;
		background: var(--sv-accent);
		color: #fff;
	}

	button.danger:not(:disabled) {
		border-color: var(--sv-error);
		color: var(--sv-error);
	}
</style>
