<!--
  The same list as Svelte component: rendered on the server from the cookie, then hydrated.
  Without JavaScript, the form posts to the server like the Jeasx version.
-->
<script>
  import { submitForm } from "../form";
  import { MAX_ITEMS, MAX_LENGTH, reduceForm } from "../shopping";

  let { initial } = $props();

  // The prop only seeds the state. The list is replaced on every change, never mutated,
  // so $state.raw is enough and skips the deep reactive proxies of $state.
  // svelte-ignore state_referenced_locally
  let items = $state.raw(initial);
  const done = $derived(items.filter((item) => item.done).length);

  function submit(event) {
    items = reduceForm(items, submitForm(event));
  }
</script>

<form class="fw-list" method="post" action="/showdown/list" onsubmit={submit}>
  <input type="hidden" name="framework" value="svelte" />
  <div class="fw-add">
    <input
      name="text"
      placeholder="Add an item"
      maxlength={MAX_LENGTH}
      aria-label="New item"
      disabled={items.length >= MAX_ITEMS}
    />
    <button name="add" value="1">Add</button>
  </div>
  <p class="fw-count">{done} of {items.length} done</p>
  <ul>
    {#each items as item (item.id)}
      <li class={{ "fw-done": item.done }}>
        <button name="toggle" value={item.id} class="fw-check" aria-pressed={item.done}
          >{item.text}</button
        >
        <button name="remove" value={item.id} class="fw-remove" aria-label="Remove {item.text}"
          >×</button
        >
      </li>
    {/each}
  </ul>
  <button name="clear" value="1" class="fw-clear" disabled={done === 0}>Clear done</button>
</form>
