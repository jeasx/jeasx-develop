<script setup>
import { computed, ref } from "vue";

const props = defineProps({ celsius: { type: Number, default: 20 } });

const celsius = ref(props.celsius);
// A writable computed: typing into either field updates the other one.
const fahrenheit = computed({
  get: () => round((celsius.value * 9) / 5 + 32),
  set: (value) => (celsius.value = round(((value - 32) * 5) / 9)),
});

function round(value) {
  return Math.round(value * 10) / 10;
}
</script>

<template>
  <form class="converter" @submit.prevent>
    <label>
      Celsius
      <input v-model.number="celsius" type="number" step="0.1" />
    </label>
    <span aria-hidden="true">⇄</span>
    <label>
      Fahrenheit
      <input v-model.number="fahrenheit" type="number" step="0.1" />
    </label>
  </form>
</template>

<style scoped>
.converter {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 1rem;
}
label {
  flex: 1 1 10rem;
}
input {
  margin: 0;
}
span {
  padding-bottom: 0.6rem;
  font-size: 1.5rem;
  opacity: 0.6;
}
</style>
