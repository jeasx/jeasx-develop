<script setup>
import { computed, reactive } from "vue";

const props = defineProps({ types: { type: Array, required: true } });

const counts = reactive(Object.fromEntries(props.types.map((type) => [type.id, 0])));
const total = computed(() =>
  props.types.reduce((sum, type) => sum + type.price * counts[type.id], 0),
);

function change(id, delta) {
  counts[id] = Math.min(9, Math.max(0, counts[id] + delta));
}
</script>

<template>
  <div class="tickets">
    <div v-for="type in types" :key="type.id" class="tickets-row">
      <span>
        <strong>{{ type.name }}</strong>
        <small>{{ type.price }} €</small>
      </span>
      <span class="stepper">
        <button type="button" :aria-label="`Fewer ${type.name}`" @click="change(type.id, -1)">
          −
        </button>
        <output>{{ counts[type.id] }}</output>
        <button type="button" :aria-label="`More ${type.name}`" @click="change(type.id, 1)">
          +
        </button>
      </span>
    </div>
    <p class="tickets-total">Total <strong>{{ total }} €</strong></p>
  </div>
</template>
