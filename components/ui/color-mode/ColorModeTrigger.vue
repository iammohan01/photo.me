<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {
  MoonIcon,
  SunIcon
} from 'lucide-vue-next'
import {DARK_MODE_TOGGLE} from "~/components/ui/sidebar/utils";
import {useEventListener} from "@vueuse/core";

const mode = useColorMode()
useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === DARK_MODE_TOGGLE && (event.metaKey || event.ctrlKey) && event.shiftKey) {
    event.preventDefault()
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon" class="dark:border-muted h-7 w-7">
        <MoonIcon
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <SunIcon
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="m-4 mb-2" side="right">
      <DropdownMenuItem @click="mode.value = 'light'"> Light</DropdownMenuItem>
      <DropdownMenuItem @click="mode.value = 'dark'"> Dark</DropdownMenuItem>
      <DropdownMenuItem @click="mode.value = 'auto'"> System</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
