export default defineEventHandler(async (event) => {
    const eventId = getRouterParam(event, 'eventId')
    const fileId = getRouterParam(event, 'id')
    const bucket: R2Bucket = event.context.cloudflare.env.photo_me

    if (!eventId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Event ID is required'
        })
    }

    return bucket.get(`${eventId}/${fileId}/raw`)
})