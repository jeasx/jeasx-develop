<script>
    let { init = 0 } = $props();
    let count = $state((() => init)());
</script>

<input type="number" bind:value={count} />
<button onclick={() => (count += 1)}>count</button>
