<!-- Card — the Vue renderer of recipes/card.recipe.ts. Same table, same markup; Vue idioms
     only where the host differs (a slot, v-bind, every prop arriving as an attr).
     Plain JS on purpose: a lang="ts" script is stripped through Vite's shared oxc
     transform, which in dev carries the React plugin's Fast Refresh setting and would
     inject $RefreshSig$ into this module (Vite 8 / plugin-vue 6 / plugin-react 5). -->
<script setup>
import { useSlots, useAttrs } from "vue";
import "./Card.css";
import "../../../kernel/css/debug.css";
import { card } from "../../../recipes/card.recipe";
import { resolve } from "../../../lib/recipe";

defineOptions({ inheritAttrs: false });

const slots = useSlots();
const r = resolve(card, useAttrs(), { hasContent: !!slots.default });
</script>

<template>
  <component v-if="r.mode === 'render'" :is="r.tag" :class="r.className" v-bind="{ ...r.attrs, ...r.rest }">
    <slot />
  </component>
  <div v-else-if="r.mode === 'error'" style="color: var(--debug-ink); border: 2px solid var(--debug-ink); padding: 0.5rem">
    &times; {{ card.name }}: {{ r.errorMessage }}
  </div>
</template>
