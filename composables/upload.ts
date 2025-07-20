export async function uploadFile(
    eventId: string,
    fileName: string,
    file: File,
    onProgress?: (percentage: number) => void,
): Promise<string> {
    const {supabase} = useSupabase();
    const {data: {session}} = await supabase.auth.getSession();
    const fileID = crypto.randomUUID()
    if (!session) {
        throw new Error("No session found");
    }

    try {
        const response = await $fetch(`/api/event/${eventId}/file/${fileID}`, {
            method: 'POST',
            body: file,
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': file.type,
                'x-file-name': sanitizeFileName(fileName)
            },
            onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
                if (progressEvent.total && onProgress) {
                    const percentage = (progressEvent.loaded / progressEvent.total) * 100;
                    onProgress(percentage);
                }
            },
        });

        console.log("Upload successful:", response);
        // Handle response based on your API structure
        return typeof response === 'string' ? response : (response as any).url || "";
    } catch (error) {
        console.log("Upload failed:", error);
        throw error;
    }
}

const sanitizeFileName = (fileName: string): string => {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}