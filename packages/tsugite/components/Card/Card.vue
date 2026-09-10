<!-- Card — the Vue renderer of lib/card.ts. Same recipe, same markup; Vue idioms only
     where the host framework differs (a slot, v-bind for the attributes). -->
<script setup lang="ts">
import { useSlots } from "vue";
import "./Card.css";
import { resolveCard } from "../../lib/card";

const props = defineProps<{
  element?: string;
  padding?: string;
  border?: boolean;
  elevation?: string;
  class?: string;
}>();
defineOptions({ inheritAttrs: false });

const slots = useSlots();
const card = resolveCard({
  element: props.element,
  padding: props.padding,
  border: props.border,
  elevation: props.elevation,
  class: props.class,
  hasContent: !!slots.default,
});
</script>

<template>
  <component v-if="card.mode === 'render'" :is="card.tag" :class="card.className" v-bind="{ ...card.attrs, ...$attrs }">
    <slot />
  </component>
  <div v-else-if="card.mode === 'error'" style="color: red; border: 2px solid red; padding: 0.5rem">
    &times; Card: {{ card.errorMessage }}
  </div>
</template>
