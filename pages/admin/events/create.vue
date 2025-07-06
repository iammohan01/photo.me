<script setup lang="ts">
import type { Database } from '~/types/database.types'
import EventCreationForm from "~/components/admin/EventCreationForm.vue";

// Handle form events
function onEventCreated(event: Database['public']['Tables']['events']['Row']) {
    // Navigate to the event detail page
    navigateTo(`/admin/events/${event.id}`)
}

function onFormCancelled() {
    // Navigate back to events list
    navigateTo('/admin/events')
}
</script>

<template>
    <Admin>
        <AdminHeader>
            <AdminHeaderTitle>
                <Icon name="lucide:flower" class="rotate-45" />
                <h1>Create Event</h1>
            </AdminHeaderTitle>
            <AdminHeaderActions>
                <NuxtLink to="/admin/events">
                    <Button variant="outline" class="cursor-pointer">
                        <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
                        Back to Events
                    </Button>
                </NuxtLink>
            </AdminHeaderActions>
        </AdminHeader>

        <AdminPannel>
            <EventCreationForm @event-created="onEventCreated" @form-cancelled="onFormCancelled" />
        </AdminPannel>
    </Admin>
</template>