<script setup lang="ts">
import { buttonVariants } from "~/components/ui/button";
import type { Database } from "~/types/database.types";

const { supabase } = useSupabase()

async function createEvent() {
  const { data: { user } } = await supabase.auth.getUser()
  let res = await supabase.from('events').insert({
    name: 'Development',
    event_date: '05/07/2025',
    organizer_id: user?.id
  })
}

let upcoming = ref<Array<Database['public']['Tables']['events']['Row']>>([]);

onMounted(async () => {
  let resp = (await supabase.from('events').select('*'))
  upcoming.value = resp.data ?? []
})
</script>

<template>
  <Admin>
    <AdminHeader>
      <AdminHeaderTitle>
        <Icon name="lucide:flower"/>
        <h1>Events</h1>
      </AdminHeaderTitle>
      <AdminHeaderActions>
        <NuxtLink to="/admin/events/create">
          <Button class="cursor-pointer">
            <Icon name="lucide:plus" />
            Create
          </Button>
        </NuxtLink>
      </AdminHeaderActions>
    </AdminHeader>
    <AdminPannel>
      <Card class="flex flex-row md:w-[20%] min-w-80 sm:w-full">
        <CardHeader class="min-w-50">
          <card-title>
            Active Events
          </card-title>
          <card-description>
            Current active events
          </card-description>
        </CardHeader>
        <CardContent>
          <h5 class="text-4xl">02</h5>
        </CardContent>
      </Card>
      <separator class="m-2" />
      <div>
        <Tabs default-value="upcoming">
          <TabsList class="grid grid-cols-4">
            <TabsTrigger value="upcoming" class="dark:data-[state=active]:bg-background">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="active" class="dark:data-[state=active]:bg-background">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" class="dark:data-[state=active]:bg-background">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" class="dark:data-[state=active]:bg-background">
              Cancelled
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" class="flex flex-col gap-2">
            <NuxtLink v-for="event in upcoming" :to="`/admin/events/${event.id}`"
              class="rounded-xl focus:border-ring focus:ring-ring/50 focus:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive">
              <Card class="flex-row justify-between">
                <CardHeader class="w- grow">
                  <CardTitle class="flex gap-4">
                    <CardDescription>{{ new Date(event.event_date).toLocaleDateString() }}</CardDescription>
                    <span class="capitalize">{{ event.name }}</span>
                  </CardTitle>
                  <CardDescription class="line-clamp-1">
                    {{ event.description || '-' }}
                  </CardDescription>
                </CardHeader>
                <div class="flex">
                  <CardContent class="flex flex-col min-w-40">
                    <span>Total Assets</span>
                    <span class="text-2xl font-black">10500</span>
                  </CardContent>
                  <CardContent class="flex flex-col">
                    <span>In Queue</span>
                    <span class="text-2xl font-black">105</span>
                  </CardContent>
                  <CardContent class="flex flex-col">
                    <span>Storage Used</span>
                    <span class="text-2xl font-black">900 GB</span>
                  </CardContent>
                </div>
                <CardFooter>
                  <Button variant="secondary" class="cursor-pointer">
                    <Icon name="lucide:chevron-right" />
                  </Button>
                </CardFooter>
              </Card>
            </NuxtLink>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPannel>
  </Admin>
</template>