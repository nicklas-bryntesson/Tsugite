<!-- Card — the Vue renderer of lib/card.ts. Same recipe, same markup; Vue idioms only
     where the host framework differs (a slot, v-bind for the attributes).
     Plain JS on purpose: a lang="ts" script is stripped through Vite's shared oxc
     transform, which in dev carries the React plugin's Fast Refresh setting and would
     inject $RefreshSig$ into this module (Vite 8 / plugin-vue 6 / plugin-react 5). -->
<script setup>
import { useSlots, useAttrs } from "vue";
import "./Card.css";
import { resolveCard } from "../../lib/card";

const props = defineProps({
  element: { type: String, default: undefined },
  padding: { type: String, default: undefined },
  border: { type: Boolean, default: undefined },
  elevation: { type: String, default: undefined },
});
defineOptions({ inheritAttrs: false });

const slots = useSlots();
const { class: className, ...attrs } = useAttrs();
const card = resolveCard({
  element: props.element,
  padding: props.padding,
  border: props.border,
  elevation: props.elevation,
  class: className,
  hasContent: !!slots.default,
});
</script>

<template>
  <component v-if="card.mode === 'render'" :is="card.tag" :class="card.className" v-bind="{ ...card.attrs, ...attrs }">
    <slot />
  </component>
  <div v-else-if="card.mode === 'error'" style="color: red; border: 2px solid red; padding: 0.5rem">
    &times; Card: {{ card.errorMessage }}
  </div>
</template>
