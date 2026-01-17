import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Generate video from image using Google Veo 3.1
 */
export async function generateVideo(
    imageUrl: string,
    prompt?: string
): Promise<string> {
    try {
        const apiKey = process.env.GEMINI_API_KEY!;

        // Fetch image data
        let base64Image: string;
        let mimeType: string;

        if (imageUrl.startsWith("data:")) {
            const [header, base64Data] = imageUrl.split(",");
            mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
            base64Image = base64Data;
        } else {
            const response = await fetch(imageUrl);
            const buffer = await response.arrayBuffer();
            base64Image = Buffer.from(buffer).toString("base64");
            const ext = imageUrl.match(/\.(png|jpg|jpeg|webp)$/i)?.[1] || "jpeg";
            mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        }

        // Default prompt
        const defaultPrompt = "Create a smooth, professional product showcase video.";
        const finalPrompt = prompt || defaultPrompt;

        try {
            console.log("generateVideo called with prompt:", prompt); // DEBUG
            return await callVeoApi(apiKey, base64Image, mimeType, finalPrompt);
        } catch (error: any) {
            console.log("Caught error in generateVideo:", error.message); // DEBUG
            console.log("Is prompt empty?", !prompt); // DEBUG
            console.log("Is safety error?", error.message.includes("safety filters")); // DEBUG

            // If safety error and using default prompt, retry with neutral prompt
            if (
                !prompt &&
                error.message.includes("safety filters")
            ) {
                console.log("Safety filter triggered with default prompt. Retrying with neutral prompt...");
                const neutralPrompt = "Cinematic slow motion video.";
                return await callVeoApi(apiKey, base64Image, mimeType, neutralPrompt);
            }
            throw error;
        }

    } catch (error) {
        console.error("Error generating video with Veo:", error);
        throw new Error(
            `Video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Convert data URL to Buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
    const base64Data = dataUrl.split(",")[1];
    return Buffer.from(base64Data, "base64");
}

async function callVeoApi(
    apiKey: string,
    base64Image: string,
    mimeType: string,
    prompt: string
): Promise<string> {
    const modelName = "veo-3.1-generate-preview";
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    // 1. Start generation (predictLongRunning)
    const startResponse = await fetch(
        `${baseUrl}/models/${modelName}:predictLongRunning?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [
                    {
                        prompt: prompt,
                        image: {
                            bytesBase64Encoded: base64Image,
                            mimeType: mimeType
                        }
                    }
                ]
            }),
        }
    );

    if (!startResponse.ok) {
        const error = await startResponse.json();
        if (startResponse.status === 429) {
            throw new Error("Quota exceeded. Please check your Google Cloud billing details or try again later.");
        }
        // Extract meaningful error message
        const errorMessage = error.error?.message || JSON.stringify(error);
        throw new Error(`API Error (${startResponse.status}): ${errorMessage}`);
    }

    const startData = await startResponse.json();
    const operationName = startData.name; // e.g., "operations/..."

    if (!operationName) {
        throw new Error("No operation name returned");
    }

    // 2. Poll for completion
    const maxAttempts = 60; // 2 minutes (2s interval)

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const pollResponse = await fetch(
            `${baseUrl}/${operationName}?key=${apiKey}`
        );

        if (!pollResponse.ok) continue;

        const pollData = await pollResponse.json();

        if (pollData.done) {
            if (pollData.error) {
                throw new Error(`Generation failed: ${pollData.error.message}`);
            }

            const response = pollData.response;

            // Check for generateVideoResponse (Veo specific)
            const generateVideoResponse = (response as any).generateVideoResponse;

            // Handle safety filters
            if (generateVideoResponse?.raiMediaFilteredReasons?.length > 0) {
                const reasons = generateVideoResponse.raiMediaFilteredReasons.join(", ");
                throw new Error(`Video generation blocked by safety filters: ${reasons}`);
            }

            const videoUri = generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
            if (videoUri) {
                // Fetch the video content from the URI
                const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
                const videoBuffer = await videoResponse.arrayBuffer();
                const videoBase64 = Buffer.from(videoBuffer).toString("base64");
                return `data:video/mp4;base64,${videoBase64}`;
            }

            // If we can't find it, throw with debug info
            throw new Error(`Video generated but format unknown: ${JSON.stringify(response)}`);
        }
    }

    throw new Error("Timeout waiting for video generation");
}
