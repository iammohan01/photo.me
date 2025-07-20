<script setup lang="ts">
import type {Database} from "~/types/database.types";

const {supabase} = useSupabase()
const route = useRoute()

const event = ref<Database['public']['Tables']['events']['Row']>();
const photo = ref<Database['public']['Tables']['event_photos']['Row']>();

onMounted(async () => {

  if (route.params.event_id && route.params.photo_id) {
    // Fetch event details
    const {data: eventData, error: eventError} = await supabase
      .from('events')
      .select('*')
      .eq('id', route.params.event_id as string)
      .single()
    
    if (!eventError && eventData) {
      event.value = eventData
    }

    // Fetch photo details
    const {data: photoData, error: photoError} = await supabase
      .from('event_photos')
      .select('*')
      .eq('id', route.params.photo_id as string)
      .single()
    
    if (!photoError && photoData) {
      photo.value = photoData
    }
  }
})

const getImageUrl = (filePath: string) => {
  const id = filePath.split('/')[1]
  return `/api/event/${event.value?.id}/file/${id}`
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isDeleting = ref(false)

const deletePhoto = async () => {
  if (!photo.value || !event.value) return
  
  // Simple confirmation dialog
  if (!confirm(`Are you sure you want to delete "${photo.value.file_name}"? This action cannot be undone.`)) {
    return
  }
  
  isDeleting.value = true
  
  try {
    const fileId = photo.value.file_path.split('/')[1]
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }
    
    await $fetch(`/api/event/${event.value.id}/file/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    // Navigate back to event page
    await navigateTo(`/admin/events/${event.value.id}`)
    
  } catch (error) {
    console.error('Error deleting photo:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Admin>
    <AdminHeader>
      <AdminHeaderTitle>
        <Icon name="lucide:image"/>
        <NuxtLink :to="`/admin/events/${event?.id}`">{{ event?.name || 'Event' }}</NuxtLink>
        <span class="text-muted-foreground">/</span>
        <span>{{ photo?.file_name || 'Photo' }}</span>
      </AdminHeaderTitle>
      <AdminHeaderActions>
        <NuxtLink :to="`/admin/events/${event?.id}`">
          <Button variant="outline">
            <Icon name="lucide:arrow-left"/>
            Back to Event
          </Button>
        </NuxtLink>
      </AdminHeaderActions>
    </AdminHeader>
    
    <AdminPannel>
      <div v-if="photo" class="flex gap-6 h-[calc(100vh-150px)]">
        <!-- Main Image Area -->
        <div class="flex-1 flex flex-col">
          <!-- Image Display -->
          <div class="flex-1 flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
            <img
              :src="getImageUrl(photo.file_path)"
              :alt="photo.file_name"
              class="max-w-full max-h-full object-contain"
              @error="(event) => { const target = event.target as HTMLImageElement; if (target) target.style.display = 'none'; }"
            />
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4 mt-4">
            <Button variant="outline" @click="() => photo && navigateTo(getImageUrl(photo.file_path), { external: true })">
              <Icon name="lucide:external-link" class="w-4 h-4 mr-2"/>
              Open in New Tab
            </Button>
            <Button variant="outline">
              <Icon name="lucide:download" class="w-4 h-4 mr-2"/>
              Download
            </Button>
            <Button 
              variant="destructive" 
              @click="deletePhoto"
              :disabled="isDeleting"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4 mr-2"/>
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete Photo</span>
            </Button>
          </div>
        </div>

        <!-- Side Panel with Photo Details -->
        <div class="w-80 flex-shrink-0 h-full">
          <Card class="h-full">
            <CardHeader>
              <CardTitle>Photo Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label>File Name</Label>
                  <p class="text-sm text-muted-foreground break-all">{{ photo.file_name }}</p>
                </div>
                
                <div class="space-y-2">
                  <Label>File Size</Label>
                  <p class="text-sm text-muted-foreground">{{ formatFileSize(photo.file_size) }}</p>
                </div>
                
                <div class="space-y-2">
                  <Label>Upload Date</Label>
                  <p class="text-sm text-muted-foreground">
                    {{ photo.upload_date ? new Date(photo.upload_date).toLocaleDateString() : 'N/A' }}
                  </p>
                </div>
                
                <div class="space-y-2">
                  <Label>Processing Status</Label>
                  <Badge :variant="photo.processing_status === 'completed' ? 'default' : 'secondary'">
                    {{ photo.processing_status || 'pending' }}
                  </Badge>
                </div>
                
                <div v-if="photo.face_count" class="space-y-2">
                  <Label>Face Count</Label>
                  <Badge variant="outline">
                    <Icon name="lucide:users" class="w-3 h-3 mr-1"/>
                    {{ photo.face_count }} faces
                  </Badge>
                </div>
                
                <div class="space-y-2">
                  <Label>Photo ID</Label>
                  <p class="text-sm text-muted-foreground font-mono break-all">{{ photo.id }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="flex items-center justify-center py-12">
        <div class="text-center">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto mb-4"/>
          <p class="text-muted-foreground">Loading photo details...</p>
        </div>
      </div>
    </AdminPannel>
  </Admin>
</template>