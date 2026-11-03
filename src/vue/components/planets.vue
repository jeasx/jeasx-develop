<script setup>
import { computed, ref } from "vue";

const props = defineProps({ planets: { type: Array, required: true } });

const SORTS = {
  distance: { label: "Distance", by: (p) => p.distance },
  diameter: { label: "Size", by: (p) => p.diameter },
  moons: { label: "Moons", by: (p) => p.moons },
  name: { label: "Name", by: (p) => p.name },
};

const query = ref("");
const sort = ref("distance");
const descending = ref(false);
const withMoons = ref(false);
const selected = ref(null);

const largest = Math.max(...props.planets.map((p) => p.diameter));

const visible = computed(() => {
  const by = SORTS[sort.value].by;
  const q = query.value.trim().toLowerCase();
  return props.planets
    .filter((p) => p.name.toLowerCase().includes(q) || p.fact.toLowerCase().includes(q))
    .filter((p) => !withMoons.value || p.moons > 0)
    .toSorted((a, b) => {
      const order = by(a) < by(b) ? -1 : by(a) > by(b) ? 1 : 0;
      return descending.value ? -order : order;
    });
});

const totalMoons = computed(() => visible.value.reduce((sum, p) => sum + p.moons, 0));

function sortBy(key) {
  descending.value = sort.value === key ? !descending.value : false;
  sort.value = key;
}

// Sphere size grows with the square root of the diameter, so small planets stay visible.
function size(planet) {
  return `${2.5 + 5.5 * Math.sqrt(planet.diameter / largest)}rem`;
}
</script>

<template>
  <div class="explorer">
    <div class="toolbar">
      <input v-model="query" type="search" placeholder="Search planets and facts…" />
      <div class="sorts" role="group" aria-label="Sort by">
        <button
          v-for="(option, key) in SORTS"
          :key="key"
          type="button"
          :class="{ active: sort === key }"
          :aria-pressed="sort === key"
          @click="sortBy(key)"
        >
          {{ option.label }}
          <span v-if="sort === key" aria-hidden="true">{{ descending ? "↓" : "↑" }}</span>
        </button>
      </div>
      <label><input v-model="withMoons" type="checkbox" /> Only with moons</label>
    </div>

    <p class="summary">
      {{ visible.length }} of {{ planets.length }} planets · {{ totalMoons }} moons
    </p>

    <TransitionGroup name="card" tag="ul" class="grid">
      <li
        v-for="planet in visible"
        :key="planet.slug"
        class="card"
        :class="{ open: selected === planet.slug }"
      >
        <button
          type="button"
          :aria-expanded="selected === planet.slug"
          @click="selected = selected === planet.slug ? null : planet.slug"
        >
          <span
            class="sphere"
            :style="{
              width: size(planet),
              height: size(planet),
              background: `radial-gradient(circle at 30% 30%, ${planet.colors[0]}, ${planet.colors[1]})`,
            }"
          />
          <strong>{{ planet.name }}</strong>
          <small>{{ planet.diameter.toLocaleString("en") }} km · {{ planet.moons }} moons</small>
        </button>
        <Transition name="fact">
          <p v-if="selected === planet.slug" class="fact">
            {{ planet.fact }} It orbits {{ planet.distance }} AU from the sun.
          </p>
        </Transition>
      </li>
    </TransitionGroup>
    <p v-if="!visible.length">No planet matches “{{ query }}”.</p>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}
.toolbar input[type="search"] {
  flex: 1 1 14rem;
  margin: 0;
}
.sorts {
  display: flex;
  gap: 0.25rem;
}
.sorts button {
  margin: 0;
  padding: 0.4rem 0.8rem;
  opacity: 0.6;
}
.sorts button.active {
  opacity: 1;
}
.summary {
  opacity: 0.7;
}
.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 1rem;
  padding: 0;
  list-style: none;
}
.card {
  list-style: none;
  border-radius: 0.75rem;
  background: color-mix(in srgb, currentColor 6%, transparent);
}
.card button {
  all: unset;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  width: 100%;
  min-height: 12rem;
  padding: 1rem;
  cursor: pointer;
  text-align: center;
}
.card button:focus-visible {
  outline: 2px solid;
  border-radius: 0.75rem;
}
.sphere {
  border-radius: 50%;
  box-shadow: inset -0.6rem -0.6rem 1.2rem rgb(0 0 0 / 0.35);
  transition: transform 0.4s;
}
.card button:hover .sphere,
.card.open .sphere {
  transform: scale(1.08) rotate(-8deg);
}
.fact {
  margin: 0;
  padding: 0 1rem 1rem;
  font-size: 0.9rem;
}

/* Cards glide to their new place when sorting, and fade in and out when filtering. */
.card-move,
.card-enter-active,
.card-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
/* Take leaving cards out of the layout, so the others can move at once. */
.card-leave-active {
  position: absolute;
}

.fact-enter-active,
.fact-leave-active {
  transition: all 0.3s;
}
.fact-enter-from,
.fact-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .card-move,
  .card-enter-active,
  .card-leave-active,
  .fact-enter-active,
  .fact-leave-active,
  .sphere {
    transition: none;
  }
}
</style>
