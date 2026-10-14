<!-- ItemGridItem — the Vue renderer of itemGridItem in recipes/itemgrid.recipe.ts: the cell
     one item of an ItemGrid stands in. ItemGrid.css styles it as the .item part. Plain JS
     on purpose, as Card.vue says. -->
<script setup>
import { useSlots, useAttrs } from "vue";
import "../../../kernel/css/debug.css";
import { itemGridItem } from "../../../recipes/itemgrid.recipe";
import { resolve } from "../../../lib/recipe";

defineOptions({ inheritAttrs: false });

const slots = useSlots();
const r = resolve(itemGridItem, useAttrs(), { hasContent: !!slots.default });
</script>

<template>
  <component v-if="r.mode === 'render'" :is="r.tag" :class="r.className" v-bind="{ ...r.attrs, ...r.rest }">
    <slot />
  </component>
  <div v-else-if="r.mode === 'error'" style="color: var(--debug-ink); border: 2px solid var(--debug-ink); padding: 0.5rem">
    &times; {{ itemGridItem.name }}: {{ r.errorMessage }}
  </div>
</template>
