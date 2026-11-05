<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  columns: { type: Array, required: true },
  cards: { type: Array, default: () => [] },
});

let nextId = props.cards.length + 1;
const cards = ref(props.cards.map((card, index) => ({ id: index + 1, ...card })));
const draft = ref("");
const dragged = ref(null);
const over = ref(null);

const byColumn = computed(() =>
  Object.fromEntries(
    props.columns.map((c) => [c, cards.value.filter((card) => card.column === c)]),
  ),
);
const progress = computed(() => {
  const done = byColumn.value[props.columns.at(-1)].length;
  return cards.value.length ? Math.round((done / cards.value.length) * 100) : 0;
});

function add() {
  if (draft.value.trim()) {
    cards.value.push({ id: nextId++, title: draft.value.trim(), column: props.columns[0] });
    draft.value = "";
  }
}

function remove(card) {
  cards.value = cards.value.filter((c) => c !== card);
}

// Moving a card to the end of the list puts it at the bottom of its new column.
function move(card, column) {
  if (card && card.column !== column) {
    cards.value = [...cards.value.filter((c) => c !== card), { ...card, column }];
  }
}

function drop(column) {
  move(dragged.value, column);
  dragged.value = over.value = null;
}

// Keyboard and touch fallback: buttons move a card to the neighboring column.
function step(card, direction) {
  const index = props.columns.indexOf(card.column) + direction;
  if (index >= 0 && index < props.columns.length) {
    move(card, props.columns[index]);
  }
}
</script>

<template>
  <div class="kanban">
    <form class="add" @submit.prevent="add">
      <input v-model="draft" placeholder="New task…" />
      <button :disabled="!draft.trim()">Add</button>
    </form>

    <div
      class="progress"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span :style="{ width: progress + '%' }" />
    </div>
    <p class="summary">{{ progress }}% done</p>

    <div class="columns">
      <section
        v-for="column in columns"
        :key="column"
        class="column"
        :class="{ over: over === column }"
        @dragover.prevent="over = column"
        @dragleave="over = over === column ? null : over"
        @drop.prevent="drop(column)"
      >
        <h3>
          {{ column }} <span class="count">{{ byColumn[column].length }}</span>
        </h3>
        <TransitionGroup name="task" tag="ul">
          <li
            v-for="card in byColumn[column]"
            :key="card.id"
            class="task"
            :class="{ dragging: dragged === card }"
            draggable="true"
            @dragstart="dragged = card"
            @dragend="dragged = over = null"
          >
            <span>{{ card.title }}</span>
            <span class="actions">
              <button
                type="button"
                title="Move left"
                :disabled="column === columns[0]"
                @click="step(card, -1)"
              >
                ←
              </button>
              <button
                type="button"
                title="Move right"
                :disabled="column === columns.at(-1)"
                @click="step(card, 1)"
              >
                →
              </button>
              <button type="button" title="Remove" @click="remove(card)">×</button>
            </span>
          </li>
        </TransitionGroup>
        <p v-if="!byColumn[column].length" class="empty">Drop tasks here</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.add {
  display: flex;
  gap: 0.5rem;
}
.add input {
  flex: 1;
  margin: 0;
}
.add button {
  margin: 0;
}
.progress {
  height: 0.5rem;
  margin-top: 1rem;
  border-radius: 1rem;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 10%, transparent);
}
.progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #42b883, #35495e);
  transition: width 0.5s;
}
.summary {
  opacity: 0.7;
}
.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}
.column {
  position: relative;
  padding: 0.75rem;
  border: 2px dashed transparent;
  border-radius: 0.75rem;
  background: color-mix(in srgb, currentColor 5%, transparent);
  transition:
    border-color 0.2s,
    background 0.2s;
}
.column.over {
  border-color: #42b883;
  background: color-mix(in srgb, #42b883 12%, transparent);
}
h3 {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.75rem;
  font-size: 1rem;
}
.count {
  opacity: 0.6;
}
ul {
  display: grid;
  gap: 0.5rem;
  min-height: 2rem;
  margin: 0;
  padding: 0;
}
.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  list-style: none;
  border-radius: 0.5rem;
  background: Canvas;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
  cursor: grab;
}
.task.dragging {
  opacity: 0.4;
}
.actions {
  display: flex;
  gap: 0.15rem;
  opacity: 0.4;
  transition: opacity 0.2s;
}
.task:hover .actions,
.task:focus-within .actions {
  opacity: 1;
}
.actions button {
  all: unset;
  padding: 0 0.3rem;
  cursor: pointer;
}
.actions button:disabled {
  visibility: hidden;
}
.actions button:focus-visible {
  outline: 2px solid;
}
.empty {
  position: absolute;
  inset: auto 0 0.75rem;
  margin: 0;
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.5;
  pointer-events: none;
}

.task-move,
.task-enter-active,
.task-leave-active {
  transition: all 0.35s ease;
}
.task-enter-from,
.task-leave-to {
  opacity: 0;
  transform: translateX(1.5rem);
}
.task-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .task-move,
  .task-enter-active,
  .task-leave-active,
  .progress span {
    transition: none;
  }
}
</style>
