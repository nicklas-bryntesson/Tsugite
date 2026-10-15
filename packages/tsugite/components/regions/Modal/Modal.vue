<!-- Modal — the Vue renderer of recipes/modal.recipe.ts. Same table, same markup; Vue idioms
     only where the host differs (a slot, v-bind, every prop arriving as an attr, onMounted
     to install the kernel). The name check reads rendered child markup, which a Vue
     renderer does not have before it renders, so it lives in Modal.astro only. Plain JS on
     purpose, as Card.vue says. -->
<script setup>
import { useSlots, useAttrs, onMounted } from "vue";
import "./Modal.css";
import "../../../kernel/css/region.css";
import "../../../kernel/css/debug.css";
import { modal } from "../../../recipes/modal.recipe";
import { resolve } from "../../../lib/recipe";
import { modalDerive } from "../../../lib/modal";
import { installRegionChannels } from "../../../kernel/js/region-channels";

defineOptions({ inheritAttrs: false });

const slots = useSlots();
const r = resolve(modal, useAttrs(), { hasContent: !!slots.default, derive: modalDerive });

onMounted(() => installRegionChannels());
</script>

<template>
  <component v-if="r.mode === 'render'" :is="r.tag" :class="r.className" v-bind="{ ...r.attrs, ...r.rest }">
    <slot />
  </component>
  <div v-else-if="r.mode === 'error'" style="color: var(--debug-ink); border: 2px solid var(--debug-ink); padding: 0.5rem">
    &times; {{ modal.name }}: {{ r.errorMessage }}
  </div>
</template>
