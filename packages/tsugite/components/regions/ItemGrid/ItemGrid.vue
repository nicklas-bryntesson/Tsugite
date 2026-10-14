<!-- ItemGrid — the Vue renderer of recipes/itemgrid.recipe.ts. Same table, same markup; Vue
     idioms only where the host differs (a slot, v-bind, every prop arriving as an attr).
     Plain JS on purpose, as Card.vue says. -->
<script setup>
import { useSlots, useAttrs } from "vue";
import "./ItemGrid.css";
import "../../../kernel/css/debug.css";
import { itemGrid } from "../../../recipes/itemgrid.recipe";
import { resolve } from "../../../lib/recipe";
import { itemGridDerive } from "../../../lib/itemgrid";

defineOptions({ inheritAttrs: false });

const slots = useSlots();
const r = resolve(itemGrid, useAttrs(), { hasContent: !!slots.default, derive: itemGridDerive });
</script>

<template>
  <component v-if="r.mode === 'render'" :is="r.tag" :class="r.className" v-bind="{ ...r.attrs, ...r.rest }">
    <slot />
  </component>
  <div v-else-if="r.mode === 'error'" style="color: var(--debug-ink); border: 2px solid var(--debug-ink); padding: 0.5rem">
    &times; {{ itemGrid.name }}: {{ r.errorMessage }}
  </div>
</template>
