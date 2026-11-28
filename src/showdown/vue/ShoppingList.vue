<!--
  The same list as Vue component: rendered on the server from the cookie, then hydrated.
  Without JavaScript, the form posts to the server like the Jeasx version.
-->
<script setup>
import { computed, shallowRef } from "vue";
import { submitForm } from "../form";
import { MAX_ITEMS, MAX_LENGTH, reduceForm } from "../shopping";

const props = defineProps({ initial: { type: Array, required: true } });

// The prop only seeds the state. The list is replaced on every change, never mutated,
// so a shallowRef is enough and skips the deep reactive proxies of ref.
const items = shallowRef(props.initial);
const done = computed(() => items.value.filter((item) => item.done).length);

function submit(event) {
  items.value = reduceForm(items.value, submitForm(event));
}
</script>

<template>
  <form class="fw-list" method="post" action="/showdown/list" @submit="submit">
    <input type="hidden" name="framework" value="vue" />
    <div class="fw-add">
      <input
        name="text"
        placeholder="Add an item"
        :maxlength="MAX_LENGTH"
        aria-label="New item"
        :disabled="items.length >= MAX_ITEMS"
      />
      <button name="add" value="1">Add</button>
    </div>
    <p class="fw-count">{{ done }} of {{ items.length }} done</p>
    <ul>
      <li v-for="item in items" :key="item.id" :class="{ 'fw-done': item.done }">
        <button name="toggle" :value="item.id" class="fw-check" :aria-pressed="String(item.done)">
          {{ item.text }}
        </button>
        <button
          name="remove"
          :value="item.id"
          class="fw-remove"
          :aria-label="`Remove ${item.text}`"
        >
          ×
        </button>
      </li>
    </ul>
    <button name="clear" value="1" class="fw-clear" :disabled="done === 0">Clear done</button>
  </form>
</template>
