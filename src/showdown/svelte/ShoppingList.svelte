<!-- The same list as Svelte component: rendered on the server, then hydrated in the browser. -->
<script>
  import { onMount } from "svelte";
  import { loadSession, saveSession } from "../session";
  import { MAX_ITEMS, MAX_LENGTH, update } from "../shopping";

  let { initial } = $props();

  // The prop only seeds the state. The list is replaced on every change, never mutated,
  // so $state.raw is enough and skips the deep reactive proxies of $state.
  // svelte-ignore state_referenced_locally
  let items = $state.raw(initial);
  let text = $state("");
  const done = $derived(items.filter((item) => item.done).length);

  // Hydrate with the list of the server, then switch to the one saved in this session.
  onMount(() => {
    const saved = loadSession("svelte");
    if (saved) items = saved;
  });

  function change(action, id) {
    items = update(items, { action, id, text });
    saveSession("svelte", items);
  }

  function add(event) {
    event.preventDefault();
    change("add");
    text = "";
  }
</script>

<form class="fw-list" onsubmit={add}>
  <div class="fw-add">
    <input
      bind:value={text}
      placeholder="Add an item"
      maxlength={MAX_LENGTH}
      aria-label="New item"
      disabled={items.length >= MAX_ITEMS}
    />
    <button>Add</button>
  </div>
  <p class="fw-count">{done} of {items.length} done</p>
  <ul>
    {#each items as item (item.id)}
      <li class={{ "fw-done": item.done }}>
        <button
          type="button"
          class="fw-check"
          aria-pressed={item.done}
          onclick={() => change("toggle", item.id)}>{item.text}</button
        >
        <button
          type="button"
          class="fw-remove"
          aria-label="Remove {item.text}"
          onclick={() => change("remove", item.id)}>×</button
        >
      </li>
    {/each}
  </ul>
  <button type="button" class="fw-clear" disabled={done === 0} onclick={() => change("clear")}>
    Clear done
  </button>
</form>
