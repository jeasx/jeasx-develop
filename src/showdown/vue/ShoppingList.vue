<!-- The same list as Vue component: rendered on the server, then hydrated in the browser. -->
<script setup>
import { computed, onMounted, ref, shallowRef } from "vue";
import { loadSession, saveSession } from "../session";
import { MAX_ITEMS, MAX_LENGTH, update } from "../shopping";

const props = defineProps({ initial: { type: Array, required: true } });

// The prop only seeds the state. The list is replaced on every change, never mutated,
// so a shallowRef is enough and skips the deep reactive proxies of ref.
const items = shallowRef(props.initial);
const text = ref("");
const done = computed(() => items.value.filter((item) => item.done).length);

// Hydrate with the list of the server, then switch to the one saved in this session.
onMounted(() => {
  const saved = loadSession("vue");
  if (saved) items.value = saved;
});

function change(action, id) {
  items.value = update(items.value, { action, id, text: text.value });
  saveSession("vue", items.value);
}

function add() {
  change("add");
  text.value = "";
}
</script>

<template>
  <form class="fw-list" @submit.prevent="add">
    <div class="fw-add">
      <input
        v-model="text"
        placeholder="Add an item"
        :maxlength="MAX_LENGTH"
        aria-label="New item"
        :disabled="items.length >= MAX_ITEMS"
      />
      <button>Add</button>
    </div>
    <p class="fw-count">{{ done }} of {{ items.length }} done</p>
    <ul>
      <li v-for="item in items" :key="item.id" :class="{ 'fw-done': item.done }">
        <button
          type="button"
          class="fw-check"
          :aria-pressed="String(item.done)"
          @click="change('toggle', item.id)"
        >
          {{ item.text }}
        </button>
        <button
          type="button"
          class="fw-remove"
          :aria-label="`Remove ${item.text}`"
          @click="change('remove', item.id)"
        >
          ×
        </button>
      </li>
    </ul>
    <button type="button" class="fw-clear" :disabled="done === 0" @click="change('clear')">
      Clear done
    </button>
  </form>
</template>
