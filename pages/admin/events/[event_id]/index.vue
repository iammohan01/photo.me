<script setup lang="ts">
import type {Database} from "~/types/database.types";

const {supabase} = useSupabase()
const route = useRoute()

const event = ref<Database['public']['Tables']['events']['Row']>();
const eventPhotos = ref<Database['public']['Tables']['event_photos']['Row'][]>([]);
const assetsInfo = ref({
  totalAssets: 0,
  inQueue: 0,
  storageUsed: 0
})
onMounted(async () => {
  if (route.params.event_id) {
    const {data, error} = (await supabase.from('events').select('*').eq('id', route.params.event_id as string).single())
    if (!error && data) {
      event.value = data
    }
    const {
      data: dataa,
      error: errorr
    } = (await supabase.from('event_photos').select('*').eq('event_id', route.params.event_id as string))
    if (!errorr && dataa) {
      eventPhotos.value = dataa
      console.log(eventPhotos.value)
    }
    // Fetch assets information
    // TODO: I have to change strategy
    const {data: photosData, error: photosError} = await supabase
        .from('event_photos')
        .select('*')
        .eq('event_id', route.params.event_id as string)

    if (!photosError && photosData) {
      assetsInfo.value.totalAssets = photosData.length
      assetsInfo.value.inQueue = photosData.filter(p => p.processing_status === 'uploaded').length
      assetsInfo.value.storageUsed = photosData.reduce((total, p) => total + (p.file_size || 0), 0)
    }
  }
})

const handleUploadComplete = (fileName: string) => {
  console.log('Upload completed:', fileName)
  refreshPhotos()
}

const refreshPhotos = async () => {
  if (route.params.event_id) {
    const {
      data,
      error
    } = (await supabase.from('event_photos').select('*').eq('event_id', route.params.event_id as string))
    if (!error && data) {
      eventPhotos.value = data
    }
  }
}

const getImageUrl = (filePath: string) => {
  const id = filePath.split('/')[1]
  // I have to implement direct access with r2 using some signed or other ways
  return `/api/event/${event.value?.id}/file/${id}?thumb`
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const openImageDetails = (photo: Database['public']['Tables']['event_photos']['Row']) => {
  if (!event.value?.id || !photo.id) {
    console.error('Missing event ID or photo ID')
    return
  }

  try {
    const url = `/admin/events/${event.value.id}/photos/${photo.id}`
    console.log('Navigating to:', url)
    navigateTo(url)
  } catch (error) {
    console.error('Navigation error:', error)
  }
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
              <span class="text-2xl font-black">{{ assetsInfo.totalAssets }}</span>
            </CardContent>
            <CardContent class="flex flex-col">
              <span>In Queue</span>
              <span class="text-2xl font-black">{{ assetsInfo.inQueue }}</span>
            </CardContent>
            <CardContent class="flex flex-col">
              <span>Storage Used</span>
              <span class="text-2xl font-black">{{ formatFileSize(assetsInfo.storageUsed) }}</span>
            </CardContent>
          </div>
        </Card>
      </div>
      <separator class="m-2"/>
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold tracking-tight">Event Photos</h2>
            <p class="text-muted-foreground">
              {{ eventPhotos.length }} photos uploaded
            </p>
          </div>
        </div>

        <!-- Image Grid -->
        <div
            v-if="eventPhotos.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <Card
              v-for="photo in eventPhotos"
              :key="photo.id"
              class="group overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
              @click="openImageDetails(photo)"
          >
            <div class="aspect-square relative overflow-hidden">
              <img
                  :src="getImageUrl(photo.file_path)"
                  :alt="photo.file_name"
                  class="w-full h-full object-cover transition-transform duration-200"
                  @error="(event) => { const target = event.target as HTMLImageElement; if (target) target.style.display = 'none'; }"
              >
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"/>

              <!-- Status Badge -->
              <div class="absolute top-2 right-2">
                <Badge
                    :variant="photo.processing_status === 'completed' ? 'default' : 'secondary'"
                    class="text-xs"
                >
                  {{ photo.processing_status || 'pending' }}
                </Badge>
              </div>

              <!-- Face Count Badge -->
              <div v-if="photo.face_count" class="absolute bottom-2 left-2">
                <Badge variant="outline" class="text-xs bg-white/90">
                  <Icon name="lucide:users" class="w-3 h-3 mr-1"/>
                  {{ photo.face_count }} faces
                </Badge>
              </div>
            </div>

            <CardContent class="p-3" @click.stop>
              <div class="space-y-1">
                <p class="text-sm font-medium truncate" :title="photo.file_name">
                  {{ photo.file_name }}
                </p>
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{{ formatFileSize(photo.file_size) }}</span>
                  <span v-if="photo.upload_date">
                    {{ new Date(photo.upload_date).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Icon name="lucide:image" class="w-12 h-12 text-muted-foreground"/>
          </div>
          <h3 class="text-lg font-semibold mb-2">No photos yet</h3>
          <p class="text-muted-foreground mb-4">
            Upload photos to this event to see them here
          </p>
          <UploadDialog
              :event-id="event?.id"
              @upload-complete="handleUploadComplete"
          />
        </div>
      </div>
    </AdminPannel>
  </Admin>
</template>