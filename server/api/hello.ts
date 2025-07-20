export default defineEventHandler(async (event) => {

    const body = await readRawBody(event, false);
    const headers = getHeaders(event);
    console.log(headers)
    const fileName = headers['x-file-name']
    const eventId = headers['x-event-id']
    const bucket: R2Bucket = event.context.cloudflare.env.photo_me
    if (!fileName) {
        return {
            status: 'error',
            message: 'x-file-name header missing'
        }
    }
    if (!body) {
        return {
            status: 'error',
            message: 'req file missing'
        }
    }

    const res = await bucket.put(fileName, new Blob([body]), {
        httpMetadata: {
            contentType: getHeader(event, 'content-type'),
            cacheControl: 'public, max-age=31536000, immutable'
        },
        customMetadata: {
            originalName: fileName ?? 'unknown',
            eventId : eventId ?? '',
            uploadedAt: new Date().toISOString(),
        }
    })

    console.log(res.httpMetadata)
    setHeader(event, "content-type", res.httpMetadata?.contentType)
    setHeader(event, "etag", res.etag)
    return bucket.get(fileName);
});
