<script setup lang="ts">
import {Toaster, toast} from 'vue-sonner'
import 'vue-sonner/style.css'
import publishProcess, {ProcesserState} from "./background";
import type {Process} from "./background";

let list = ref<Process[]>([])
let unsubscribe = ProcesserState.subscribe((process) => {
  list.value.push(process)
})

onMounted(() => {
  publishProcess(() => {
    return "HELLO";
  });
})
onUnmounted(() => {
  unsubscribe();
})
</script>


<template>
  <Toaster/>
  <slot/>
  <Teleport to="body">
    <div class="absolute right-0 bottom-0 m-2">
      <button v-for="i in list">
        {{ i }}
      </button>
    </div>
  </Teleport>
</template>