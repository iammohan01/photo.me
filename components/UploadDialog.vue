<script setup lang="ts">
import {uploadFile} from '~/composables/upload'

interface Props {
  eventId?: string
}
const {supabase} = useSupabase()
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'upload-complete': [fileName: string]
}>()

const selectedFiles = ref<File[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const currentFile = ref<string>('')
const isDragOver = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files)
    // Filter for image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    selectedFiles.value = imageFiles
  }
}

const handleUpload = async () => {
  if (!props.eventId) return
  if (selectedFiles.value.length === 0) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    for (const file of selectedFiles.value) {
      currentFile.value = file.name
      const fileName = `${Date.now()}-${file.name}`

      await uploadFile(props.eventId, fileName, file, (progress) => {
        uploadProgress.value = progress
      })

      // const { data, error } = await supabase.storage.from(props.eventId).upload(fileName, file)

      emit('upload-complete', fileName)
    }

    // Reset form
    selectedFiles.value = []
    emit('update:open', false)
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    currentFile.value = ''
  }
}

const closeDialog = () => {
  if (!isUploading.value) {
    selectedFiles.value = []
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <Button
          class="cursor-pointer"
          variant="outline"
      >
        <Icon name="lucide:upload"/>
        Upload
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Photos</DialogTitle>
        <DialogDescription>
          Select photos to upload to this event. Supported formats: JPG, PNG, GIF
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Drag & Drop Zone -->
        <div
            class="relative border-2 border-dashed rounded-lg p-6 transition-colors"
            :class="[
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          ]"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
        >
          <div class="text-center space-y-2">
            <Icon
                name="lucide:upload-cloud"
                class="mx-auto h-12 w-12 text-muted-foreground"
            />
            <div class="text-sm">
              <span class="font-medium text-primary">Click to upload</span> or drag and drop
            </div>
            <p class="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>

          <!-- Hidden file input -->
          <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              :disabled="isUploading"
          />
        </div>

        <!-- Selected Files -->
        <div v-if="selectedFiles.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium">Selected Files:</h4>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div
                v-for="file in selectedFiles"
                :key="file.name"
                class="flex items-center justify-between p-2 bg-secondary rounded-md"
            >
              <div class="flex items-center space-x-2">
                <Icon name="lucide:image" class="h-4 w-4 text-muted-foreground"/>
                <span class="text-sm truncate">{{ file.name }}</span>
              </div>
              <span class="text-xs text-muted-foreground">
                {{ (file.size / 1024 / 1024).toFixed(2) }} MB
              </span>
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Uploading: {{ currentFile }}</span>
            <span>{{ uploadProgress.toFixed(1) }}%</span>
          </div>
          <div class="w-full bg-secondary rounded-full h-2">
            <div
                class="bg-primary h-2 rounded-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
            variant="outline"
            @click="closeDialog"
            :disabled="isUploading"
        >
          Cancel
        </Button>
        <Button
            @click="handleUpload"
            :disabled="selectedFiles.length === 0 || isUploading"
        >
          <Icon v-if="isUploading" name="lucide:loader-2" class="animate-spin mr-2"/>
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template> 