import * as tus from "tus-js-client";

const projectId = "";

export async function uploadFile(
    bucketName: string,
    fileName: string,
    file: File,
    onProgress?: (percentage: number) => void,
): Promise<string> {
    const { supabase } = useSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    return new Promise((resolve, reject) => {
        if (!session) {
            reject();
            return;
        }
        const upload = new tus.Upload(file, {
            endpoint:
                `https://lhsubnbimlhajxlkzrot.supabase.co/storage/v1/upload/resumable`,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
                authorization: `Bearer ${session.access_token}`,
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            metadata: {
                bucketName: bucketName,
                objectName: fileName,
                contentType: "image/png",
                cacheControl: "3600",
            },
            chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
            onError: function (error) {
                console.log("Failed because: " + error);
                reject(error);
            },
            onProgress: function (bytesUploaded, bytesTotal) {
                var percentage = ((bytesUploaded / bytesTotal) * 100);
                console.log(bytesUploaded, bytesTotal, percentage.toFixed(2) + "%");
                if (onProgress) {
                    onProgress(percentage);
                }
            },
            onSuccess: function () {
                console.log(
                    "Download %s from %s",
                    fileName,
                    upload.url,
                );
                resolve("");
            },
        });

        // Check if there are any previous uploads to continue.
        return upload.findPreviousUploads().then(function (previousUploads) {
            // Found previous uploads so we select the first one.
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0]);
            }

            // Start the upload
            upload.start();
        });
    });
}
