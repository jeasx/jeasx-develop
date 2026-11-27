<script>
  let { votes } = $props();

  // votes[i] is the number of ratings with i + 1 stars. The prop only seeds the state.
  // svelte-ignore state_referenced_locally
  let counts = $state([...votes]);
  let mine = $state(0);
  let hover = $state(0);

  const total = $derived(counts.reduce((sum, count) => sum + count, 0));
  const average = $derived(counts.reduce((sum, count, i) => sum + count * (i + 1), 0) / total);

  function rate(stars) {
    if (mine) counts[mine - 1]--;
    counts[stars - 1]++;
    mine = stars;
  }
</script>

<div class="rating">
  <p class="rating-average"><strong>{average.toFixed(1)}</strong> / 5 from {total} ratings</p>
  <div
    class="rating-stars"
    role="group"
    aria-label="Your rating"
    onpointerleave={() => (hover = 0)}
  >
    {#each [1, 2, 3, 4, 5] as stars}
      <button
        type="button"
        class:on={stars <= (hover || mine)}
        aria-pressed={stars === mine}
        aria-label="{stars} stars"
        onpointerenter={() => (hover = stars)}
        onclick={() => rate(stars)}>★</button
      >
    {/each}
  </div>
  <p class="rating-note">
    {mine ? `Thanks, you gave ${mine} stars.` : "Rate last year's conference."}
  </p>
</div>
