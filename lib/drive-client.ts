import { google } from "googleapis";
import { Readable } from "stream";

const drive = google.drive("v3");

/**
 * Upload video to Google Drive
 */
export async function uploadToDrive(
    videoBuffer: Buffer,
    accessToken: string,
    folderId?: string
): Promise<{ fileId: string; webViewLink: string }> {
    try {
        // Set up OAuth2 client
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: accessToken,
        });

        // Prepare file metadata
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `lumina-video-${timestamp}.mp4`;

        const fileMetadata: any = {
            name: fileName,
            mimeType: "video/mp4",
        };

        // Add to folder if specified
        if (folderId) {
            fileMetadata.parents = [folderId];
        }

        // Convert buffer to readable stream
        const bufferStream = new Readable();
        bufferStream.push(videoBuffer);
        bufferStream.push(null);

        // Upload file
        const response = await drive.files.create({
            auth: oauth2Client,
            requestBody: fileMetadata,
            media: {
                mimeType: "video/mp4",
                body: bufferStream,
            },
            fields: "id, webViewLink, webContentLink",
        });

        const fileId = response.data.id!;

        // Make file publicly accessible (optional - adjust permissions as needed)
        await drive.permissions.create({
            auth: oauth2Client,
            fileId: fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        // Get shareable link
        const fileInfo = await drive.files.get({
            auth: oauth2Client,
            fileId: fileId,
            fields: "webViewLink",
        });

        return {
            fileId,
            webViewLink: fileInfo.data.webViewLink!,
        };
    } catch (error) {
        console.error("Error uploading to Google Drive:", error);
        throw new Error(
            `Drive upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Get folder name from folder ID
 */
export async function getFolderName(
    folderId: string,
    accessToken: string
): Promise<string> {
    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: accessToken,
        });

        const response = await drive.files.get({
            auth: oauth2Client,
            fileId: folderId,
            fields: "name",
        });

        return response.data.name || "Unknown Folder";
    } catch (error) {
        console.error("Error getting folder name:", error);
        return "Unknown Folder";
    }
}
