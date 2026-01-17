
import { generateVideo } from "../lib/veo-client";

// Mock environment variables
process.env.GEMINI_API_KEY = "test-api-key";

// Mock fetch
const originalFetch = global.fetch;

async function testSafetyViolation() {
    console.log("Testing Safety Violation...");
    global.fetch = async (url: any, options: any) => {
        if (url.includes("predictLongRunning")) {
            return {
                ok: true,
                json: async () => ({ name: "operations/123" }),
            } as unknown as Response;
        }
        if (url.includes("operations/123")) {
            return {
                ok: true,
                json: async () => ({
                    done: true,
                    response: {
                        "@type": "type.googleapis.com/google.ai.generativelanguage.v1beta.PredictLongRunningResponse",
                        generateVideoResponse: {
                            raiMediaFilteredCount: 1,
                            raiMediaFilteredReasons: ["Your prompt conflicted with our safety policies..."]
                        }
                    }
                }),
            } as unknown as Response;
        }
        // Mock image fetch
        if (url.includes("image.jpg")) {
            return {
                ok: true,
                arrayBuffer: async () => Buffer.from("fake-image-data"),
            } as unknown as Response;
        }
        return { ok: false } as unknown as Response;
    };

    try {
        await generateVideo("https://example.com/image.jpg", "unsafe prompt");
        console.error("FAILED: Should have thrown an error");
    } catch (error: any) {
        if (error.message.includes("Video generation blocked by safety filters")) {
            console.log("PASSED: Correct error thrown:", error.message);
        } else {
            console.log("FAILED: Incorrect error message:", error.message);
        }
    }
}

async function testBadRequest() {
    console.log("\nTesting Bad Request (400)...");
    global.fetch = async (url: any, options: any) => {
        if (url.includes("predictLongRunning")) {
            return {
                ok: false,
                status: 400,
                json: async () => ({
                    error: {
                        code: 400,
                        message: "Unable to process input image.",
                        status: "INVALID_ARGUMENT"
                    }
                }),
            } as unknown as Response;
        }
        // Mock image fetch
        if (url.includes("image.jpg")) {
            return {
                ok: true,
                arrayBuffer: async () => Buffer.from("fake-image-data"),
            } as unknown as Response;
        }
        return { ok: false } as unknown as Response;
    };

    try {
        await generateVideo("https://example.com/image.jpg", "prompt");
        console.error("FAILED: Should have thrown an error");
    } catch (error: any) {
        if (error.message.includes("API Error (400): Unable to process input image")) {
            console.log("PASSED: Correct error thrown:", error.message);
        } else {
            console.log("FAILED: Incorrect error message:", error.message);
        }
    }
}

async function testRetryLogic() {
    console.log("\nTesting Retry Logic...");
    let callCount = 0;

    global.fetch = async (url: any, options: any) => {
        // Mock image fetch
        if (url.includes("image.jpg")) {
            return {
                ok: true,
                arrayBuffer: async () => Buffer.from("fake-image-data"),
            } as unknown as Response;
        }

        if (url.includes("predictLongRunning")) {
            callCount++;
            const body = JSON.parse(options.body);
            const prompt = body.instances[0].prompt;

            console.log(`Call ${callCount} prompt: "${prompt}"`);

            return {
                ok: true,
                json: async () => ({ name: `operations/${callCount}` }),
            } as unknown as Response;
        }

        if (url.includes("operations/")) {
            // First call (default prompt) fails with safety error
            if (url.includes("operations/1")) {
                return {
                    ok: true,
                    json: async () => ({
                        done: true,
                        response: {
                            "@type": "type.googleapis.com/google.ai.generativelanguage.v1beta.PredictLongRunningResponse",
                            generateVideoResponse: {
                                raiMediaFilteredCount: 1,
                                raiMediaFilteredReasons: ["Safety violation"]
                            }
                        }
                    }),
                } as unknown as Response;
            }

            // Second call (neutral prompt) succeeds
            if (url.includes("operations/2")) {
                return {
                    ok: true,
                    json: async () => ({
                        done: true,
                        response: {
                            "@type": "type.googleapis.com/google.ai.generativelanguage.v1beta.PredictLongRunningResponse",
                            generateVideoResponse: {
                                generatedSamples: [
                                    { video: { uri: "https://example.com/video.mp4" } }
                                ]
                            }
                        }
                    }),
                } as unknown as Response;
            }
        }

        // Mock video fetch
        if (url.includes("video.mp4")) {
            return {
                ok: true,
                arrayBuffer: async () => Buffer.from("fake-video-data"),
            } as unknown as Response;
        }

        return { ok: false } as unknown as Response;
    };

    try {
        // Call without prompt to trigger default prompt
        const result = await generateVideo("https://example.com/image.jpg");

        if (callCount === 2 && result.startsWith("data:video/mp4;base64,")) {
            console.log("PASSED: Retry logic worked. Calls:", callCount);
        } else {
            console.log("FAILED: Retry logic failed. Calls:", callCount);
        }
    } catch (error: any) {
        console.log("FAILED: Should not have thrown error:", error.message);
    }
}

async function runTests() {
    await testSafetyViolation();
    await testBadRequest();
    await testRetryLogic();

    // Restore fetch
    global.fetch = originalFetch;
}

runTests().catch(console.error);
