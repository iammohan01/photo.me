import type {H3Event} from "h3";


export const validateEvent = (event: H3Event) => {
    const eventId = getRouterParam(event, 'eventId')
    if (!eventId) {
        const error = {
            statusCode: 400,
            statusMessage: 'Event ID is required'
        }
        throw createError(error)
    }
    event.context.eventId = eventId
    return eventId;
}


