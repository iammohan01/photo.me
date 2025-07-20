export default defineEventHandler(async (event) => {
    const eventId = getRouterParam(event, 'eventId')

    if (!eventId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Event ID is required'
        })
    }

    return {
        message: 'Hello World id',
        method: 'GET',
        eventId: eventId
    }
})