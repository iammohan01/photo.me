import {validateEvent} from "~/server/validators/events";
import validateAuth from "~/server/validators/auth";
import {createClient} from '@supabase/supabase-js'
import type {Database} from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const eventId = validateEvent(event)
    const fileId = getRouterParam(event, 'id')
    const user = validateAuth(event)
    const bucket: R2Bucket = event.context.cloudflare.env.photo_me
    
    if (!fileId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'File ID is required'
        })
    }
    
    const key = `${eventId}/${fileId}/raw`
    
    const config = useRuntimeConfig()
    const supabase = createClient<Database>(
        config.public.supabaseUrl,
        config.supabaseServiceKey
    )
    
    try {
        // First, check if the file exists in the database
        const {data: existingFile, error: fetchError} = await supabase
            .from('event_photos')
            .select('*')
            .eq('event_id', eventId)
            .eq('file_path', key)
            .single()
            
        if (fetchError || !existingFile) {
            throw createError({
                statusCode: 404,
                statusMessage: 'File not found in database'
            })
        }
        
        // Delete from R2 bucket
        const r2DeleteResult = await bucket.delete(key)
        console.log('R2 delete result:', r2DeleteResult)
        
        // Delete from database
        const {error: dbDeleteError} = await supabase
            .from('event_photos')
            .delete()
            .eq('event_id', eventId)
            .eq('file_path', key)
            
        if (dbDeleteError) {
            console.error('Database delete error:', dbDeleteError)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to delete file metadata from database'
            })
        }
        
        console.log('File deleted successfully:', {
            eventId,
            fileId,
            filePath: key,
            deletedBy: user.sub
        })
        
        return {
            success: true,
            message: 'File deleted successfully',
            deletedFile: {
                eventId,
                fileId,
                filePath: key,
                originalName: existingFile.file_name,
                deletedAt: new Date().toISOString(),
                deletedBy: user.sub
            }
        }
        
    } catch (error) {
        console.error('Error deleting file:', error)
        
        // If it's already a createError, re-throw it
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete file'
        })
    }
}) 