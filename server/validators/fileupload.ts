import {z, ZodError} from 'zod/v4'
import type {H3Event} from "h3";

const name = z.string({message: 'invalid filename'})
type params = {
    fileName: string
    fileId: string
    file: Buffer<ArrayBufferLike>
}
export const validateFileUpload = async (event: H3Event): Promise<params> => {
    try {
        console.log(getRouterParams(event))
        const fileName = name.parse(getHeader(event, 'x-file-name'))
        const fileId = getRouterParam(event, 'id')
        const file = await readRawBody(event, false);
        if (!file) {
            throw new Error('file missing');
        }
        return {fileName, fileId, file} as params;
    } catch (e) {
        let error = {
            statusCode: 400,
            statusMessage: (e as Error).message ?? ''
        };
        if (e instanceof ZodError) {
            console.log(Array.isArray(e), e)
            error = {
                statusCode: 400,
                statusMessage: e.issues.map(a => a.message).join(',')
            }
        }
        throw createError(error)
    }
}
