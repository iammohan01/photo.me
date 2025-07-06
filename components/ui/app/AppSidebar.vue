<script setup lang="ts">
    import {
        Sidebar,
        SidebarContent,
        SidebarFooter,
        SidebarGroup,
        SidebarGroupContent,
        SidebarGroupLabel,
        SidebarHeader,
        SidebarMenu,
        SidebarMenuButton,
        SidebarMenuItem,
        SidebarTrigger,
        SidebarMenuSubButton,
        SidebarMenuSubItem,
        SidebarMenuSub
    } from '@/components/ui/sidebar'
    import {useActiveElement, useEventListener, useColorMode} from '@vueuse/core'

    const activeElement = useActiveElement()


    useEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === DARK_MODE_TOGGLE && (event.metaKey || event.ctrlKey) && event.shiftKey) {
        event.preventDefault()
        mode.value = mode.value === 'dark' ? 'light' : 'dark'
      }
    })

    import { Button } from '@/components/ui/button'
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger
    } from '@/components/ui/dropdown-menu'
    import {
        AudioLines,
        Building,
        FileText,
        Settings2,
        SquareActivity,
        ChevronRight,
        MoonIcon,
        SunIcon
    } from 'lucide-vue-next'
    import useZoho from '@/plugins/medscribe'
    import { computed } from 'vue'
    import {
        Collapsible,
        CollapsibleContent,
        CollapsibleTrigger
    } from '@/components/ui/collapsible'
    import {DARK_MODE_TOGGLE} from "~/components/ui/sidebar/utils";



    // Pass { disableTransition: false } to enable transitions
    const mode = useColorMode()

    const { org } = useZoho()
    const links = computed(() => {
        return [
            // {
            //     title: 'Home',
            //     label: '',
            //     icon: LayoutDashboard,
            //     variant: 'ghost',
            //     href: `/org/${org.value?.org_id}`,
            //     routeName: 'orgHome'
            // },
            {
                title: 'Patient visits',
                label: '',
                icon: SquareActivity,
                // href: `/org/${org.value?.org_id}/patients`,
                href: '/patient/visit',
                variant: 'default',
                routeName: 'patients'
            },
            {
                title: 'Templates',
                label: '',
                icon: FileText,
                // href: `/org/${org.value?.org_id}/patients`,
                href: '/doctor/templates',
                variant: 'default',
                routeName: 'templates'
            }
        ]
    })

    const settings = [
        {
            title: 'organization',
            url: '#',
            icon: Building,
            isActive: true,
            visibility: 'org', // 'admin', 'org', 'user'
            items: [
                {
                    title: 'users',
                    url: `/org/${org.value?.org_id}/settings/organization/users`
                }
            ]
        },
        {
            title: 'transcription',
            url: '#',
            icon: AudioLines,
            isActive: true,
            visibility: 'org', // 'admin', 'org', 'user'
            items: [
                {
                    title: 'models',
                    url: `/org/${org.value?.org_id}/settings/transcription/models`
                }
            ]
        }
    ]
</script>

<template>
    <Sidebar collapsible="icon">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <div class="container flex h-14 items-center">
                        <div class="flex items-center gap-2">
                            <img src="@/assets/product_icon.svg" alt="Health Grid" class="h-8 w-8" />
                            <h1 class="font-semibold text-xl group-data-[collapsible=icon]:hidden">
                                Medscribe
                            </h1>
                        </div>
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent class="aaaa">
            <SidebarGroup class="group-data-[collapsible=icon]:hidden">
                <SidebarGroupContent>
                    <DoctorCard />
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem v-for="item in links" :key="item.title">
                            <SidebarMenuButton as-child :tooltip="item.title">
                                <NuxtLink :to="item.href">
                                    <component :is="item.icon" />
                                    <span>{{ item.title }}</span>
                                </NuxtLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup v-if="false" class="group-data-[collapsible=icon]:visible hidden">
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarMenu>
                    <Collapsible v-for="item in settings" :key="item.title" as-child :default-open="item.isActive"
                        class="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger as-child>
                                <SidebarMenuButton :tooltip="(item.title)">
                                    <component :is="item.icon" v-if="item.icon" />
                                    <span>{{ item.title }}</span>
                                    <ChevronRight
                                        class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                                        <SidebarMenuSubButton as-child>
                                            <NuxtLink :to="subItem.url">
                                                <span>{{ subItem.title }}</span>
                                            </NuxtLink>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>

          <NuxtLink to="/settings">
            <Button variant="ghost" size="icon" class="h-7 w-7">
              <Settings2 />
              <span class="sr-only">Toggle Sidebar</span>
            </Button>
          </NuxtLink>

            <TooltipProvider>
                <Tooltip position="right">
                    <TooltipTrigger as-child class="cursor-pointer">
                        <SidebarTrigger />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>⌘ B</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
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
                <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
                    <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
                    <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
    </Sidebar>
</template>

