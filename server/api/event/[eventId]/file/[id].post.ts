import {validateEvent} from "~/server/validators/events";
import {validateFileUpload} from "~/server/validators/fileupload";
import validateAuth from "~/server/validators/auth";
import {createClient} from '@supabase/supabase-js'
import type {Database} from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const eventId = validateEvent(event)
    const {fileName, file, fileId} = await validateFileUpload(event);
    const user = validateAuth(event)
    const bucket: R2Bucket = event.context.cloudflare.env.photo_me
    const key = `${eventId}/${fileId}/raw`

    // Upload file to R2 bucket
    const res = await bucket.put(key, new Blob([file]), {
        httpMetadata: {
            contentType: getHeader(event, 'content-type'),
            cacheControl: 'public, max-age=31536000, immutable'
        },
        customMetadata: {
            originalName: fileName ?? 'unknown',
            eventId: eventId ?? '',
            uploadedAt: new Date().toISOString(),
            uploadedUserID: user.sub ?? ''
        }
    })
    console.log(res)

    // Add database entry to Supabase using service role key
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
        config.public.supabaseUrl,
        config.supabaseServiceKey // Use service role key to bypass RLS
    )

    try {
        const photoData: Database['public']['Tables']['event_photos']['Insert'] = {
            event_id: eventId,
            file_name: fileName ?? 'unknown',
            file_path: key,
            file_size: file.byteLength,
            processing_status: 'uploaded',
            upload_date: new Date().toISOString()
        }

        const {data: dbData, error: dbError} = await supabase
            .from('event_photos')
            .insert(photoData)
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to save file metadata to database'
            })
        }

        console.log('Database entry created:', dbData)

        // Return both R2 upload result and database entry
        return {
            r2Upload: res,
            databaseEntry: dbData
        }

    } catch (error) {
        console.error('Error creating database entry:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to process file upload'
        })
    }
})  