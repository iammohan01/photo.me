<script setup lang="ts">
import {z} from 'zod'
import {toTypedSchema} from '@vee-validate/zod'
import {useForm} from 'vee-validate'
import type {Database} from '~/types/database.types'

const {supabase} = useSupabase()

const eventSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Event name is required').max(100, 'Event name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  // event_date: z.string().min(1, 'Event date is required'),
  event_date: z.any().refine((a) => {
    return !!a
  }, {message: 'Event date is required'}),
  status: z.enum(['draft', 'active', 'completed', 'cancelled'])
}))

const {handleSubmit, errors} = useForm({
  validationSchema: eventSchema,
  initialValues: {
    name: '',
    description: '',
    event_date: '',
    status: 'draft'
  }
})

const isSubmitting = ref(false)
const showSuccessMessage = ref(false)

const onSubmit = handleSubmit(async (values) => {
  try {
    isSubmitting.value = true

    const {data: {user}} = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const eventData: Database['public']['Tables']['events']['Insert'] = {
      name: values.name,
      description: values.description || null,
      event_date: values.event_date.toDate().toLocaleDateString(),
      organizer_id: user.id,
      status: values.status,
    }
    const {data, error} = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

    if (error) {
      throw error
    }
    const bucketResponse = await supabase.storage.createBucket(data.id)
    console.log(bucketResponse)
    showSuccessMessage.value = true
    emit('event-created', data)
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)

  } catch (error) {
    console.error('Error creating event:', error)
  } finally {
    isSubmitting.value = false
  }
})

const emit = defineEmits<{
  'event-created': [event: Database['public']['Tables']['events']['Row']]
  'form-cancelled': []
}>()

function onCancel() {
  emit('form-cancelled')
}
</script>

<template>
  <Card class="h-full mx-auto max-w-2xl">
    <form @submit.prevent="onSubmit" class="space-y-6 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>
          Fill in the details below to create a new event. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent class="grow">
        <div class="space-y-6">
          <Alert v-if="showSuccessMessage" variant="default"
                 class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <Icon name="lucide:check-circle" class="h-4 w-4 text-green-600 dark:text-green-400"/>
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Event created successfully.
            </AlertDescription>
          </Alert>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Event Name *</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" placeholder="Enter event name"
                         :disabled="isSubmitting"/>
                </FormControl>
                <FormMessage/>
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="event_date">
              <FormItem>
                <FormLabel>Event Date *</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger as-child>
                      <Button
                          variant="outline"
                          :class="[
                                                    'w-full justify-start text-left font-normal',
                                                    !componentField.modelValue && 'text-muted-foreground'
                                                ]"
                          :disabled="isSubmitting"
                      >
                        <Icon name="lucide:calendar" class="mr-2 h-4 w-4"/>
                        {{
                          componentField.modelValue ? new Date(componentField.modelValue).toLocaleDateString() : 'Pick a date'
                        }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0" align="start">
                      <Calendar
                          v-bind="componentField"
                          mode="single"
                          :disabled="isSubmitting"
                          :selected="componentField.modelValue ? new Date(componentField.modelValue) : undefined"
                          @update:selected="(date: Date | undefined) => {
                                                    if (date) {
                                                        componentField.modelValue = date.toISOString().split('T')[0]
                                                    } else {
                                                        componentField.modelValue = ''
                                                    }
                                                }"
                          :disabled-dates="(date: Date) => date < new Date()"
                          initial-focus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage/>
              </FormItem>
            </FormField>
          </div>
          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                                <Textarea v-bind="componentField" placeholder="Enter event description (optional)"
                                          :rows="4" :disabled="isSubmitting"/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="status">
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage/>
            </FormItem>
          </FormField>
        </div>
      </CardContent>
      <CardFooter>
        <div class="flex justify-end space-x-3 pt-6 w-full">
          <Button type="button" variant="outline" @click="onCancel" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <Icon v-if="isSubmitting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin"/>
            <Icon v-else name="lucide:plus" class="mr-2 h-4 w-4"/>
            {{ isSubmitting ? 'Creating...' : 'Create Event' }}
          </Button>
        </div>
      </CardFooter>
    </form>
  </Card>
</template>