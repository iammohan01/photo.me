<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import {SidebarProvider} from '@/components/ui/sidebar'

let mode = useColorMode()
</script>

<template>
  <BackgroundProcss>
    <SidebarProvider :default-open="false">
      <AppSidebar/>
      <main class="flex-1 ml-0 m-2 border/ rounded-lg bg-sidebar/ border-sidebar-border">
        <slot/>
      </main>
    </SidebarProvider>
  </BackgroundProcss>
</template>