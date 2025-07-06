<script setup lang="ts">
import type {Database} from "~/types/database.types";

const {supabase} = useSupabase()
const route = useRoute()

let event = ref<Database['public']['Tables']['events']['Row']>();
const showUploadDialog = ref(false)

onMounted(async () => {
  if (route.params.event_id) {
    let {data, error} = (await supabase.from('events').select('*').eq('id', route.params.event_id as string).single())
    if (!error && data) {
      event.value = data
    }
  }
})

const handleUploadComplete = (fileName: string) => {
  console.log('Upload completed:', fileName)
}
</script>

<template>
  <Admin>
    <AdminHeader>
      <AdminHeaderTitle>
        <Icon name="lucide:flower"/>
        <NuxtLink :to="`/admin/events/${event?.id}`">{{ event?.name || 'Event' }}</NuxtLink>
      </AdminHeaderTitle>
      <AdminHeaderActions>
        <NuxtLink :to="`/admin/events/${event?.id}/edit`">
          <Button class="cursor-pointer" variant="outline">
            <Icon name="lucide:sliders-vertical"/>
            Edit
          </Button>
        </NuxtLink>
        <UploadDialog
            :event-id="event?.id"
            @upload-complete="handleUploadComplete"
        />
      </AdminHeaderActions>
    </AdminHeader>
    <AdminPannel>
      <div class="flex">
        <Card class="flex-row justify-between">
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
        </Card>
      </div>
      <separator class="m-2"/>
      <div>

      </div>
    </AdminPannel>
  </Admin>
</template>