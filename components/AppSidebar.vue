<script setup lang="ts">
import {Calendar, Flower, Home, Inbox, Search, Settings} from "lucide-vue-next"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem, SidebarTrigger,
} from "@/components/ui/sidebar"
import {SidebarFooter} from "~/components/ui/sidebar";
import ColorModeTrigger from "~/components/ui/color-mode/ColorModeTrigger.vue";

// Menu items.
const items = [
  {
    title: "Events",
    url: "/admin/events",
    icon: Flower,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];
</script>

<template>
  <Sidebar collapsible="icon" variant="floating">
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton asChild :is-active="$route.path.startsWith(item.url)">
                <NuxtLink :to="item.url">
                  <component :is="item.icon"/>
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <ColorModeTrigger/>
      <SidebarTrigger/>
    </SidebarFooter>
  </Sidebar>
</template>