import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;

export const initializeGemini = () => {
    if (API_KEY && !ai) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
};

/**
 * Sends a message to the Gemini API and streams the response.
 * @param {string} modelName - The model to use.
 * @param {Array} history - Chat history.
 * @param {string} prompt - The user's message.
 * @param {Array} images - Array of base64 images or file parts.
 * @param {Function} onToken - Callback for each streamed token.
 */
export const streamGeminiResponse = async (modelName, history, prompt, images = [], onToken) => {
    console.log("streamGeminiResponse called with model:", modelName);
    console.log("streamGeminiResponse: onToken type:", typeof onToken);
    console.log("streamGeminiResponse: onToken is function:", typeof onToken === 'function');

    if (!ai) initializeGemini();
    if (!ai) throw new Error("API Key not found");

    let currentParts = [{ text: prompt }];

    if (images && images.length > 0) {
        const imageParts = images.map(img => {
            if (img.inlineData) return img;
            return { inlineData: { mimeType: img.mime_type || 'image/jpeg', data: img.data } };
        });
        currentParts = [...imageParts, ...currentParts];
    }

    // Special handling for Video/Image Generation Models (non-streaming usually)
    // Image Generation Models
    if (modelName.includes('image-preview') || modelName.includes('nano-banana')) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: currentParts }],
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                }
            });

            console.log("Full Image Gen Response:", response);

            const parts = response.candidates?.[0]?.content?.parts;
            let outputMarkdown = "";

            if (parts && parts.length > 0) {
                for (const part of parts) {
                    // Skip parts explicitly marked as thought (intermediate thinking images)
                    if (part.thought === true) {
                        console.log("Skipping thought part");
                        continue;
                    }

                    // Handle standard inlineData (camelCase)
                    if (part.inlineData) {
                        const mime = part.inlineData.mimeType;
                        const data = part.inlineData.data;
                        console.log("Found inlineData with mimeType:", mime, "data length:", data?.length);
                        if (mime && mime.startsWith('image/') && data) {
                            outputMarkdown += `![Generated Image](data:${mime};base64,${data})\n`;
                            console.log("Added image to output markdown");
                        } else if (mime && mime.startsWith('video/') && data) {
                            outputMarkdown += `![Generated Video](data:${mime};base64,${data})\n`;
                        }
                    }
                    // Handle potential snake_case from raw JSON (fallback)
                    else if (part.inline_data) {
                        const mime = part.inline_data.mime_type || part.inline_data.mimeType;
                        const data = part.inline_data.data;
                        if (mime && mime.startsWith('image/') && data) {
                            outputMarkdown += `![Generated Image](data:${mime};base64,${data})\n`;
                        }
                    }

                    if (part.text && part.thought !== true) {
                        outputMarkdown += part.text + "\n";
                    }
                }
            }

            const result = outputMarkdown.trim() || "Image generation completed but no image was returned.";
            console.log("Image gen result length:", result.length);

            // Return a special object that indicates this is an image generation result
            // The caller should handle this directly to avoid stale closure issues
            return { isMediaGeneration: true, content: result };

        } catch (e) {
            console.error("Generation Error:", e);
            throw e;
        }
    } else if (modelName.includes('veo') || modelName.includes('video')) {
        // Video Generation (Veo)
        onToken("Initializing video generation...");

        let operation = await ai.models.generateVideos({
            model: modelName,
            prompt: prompt,
        });

        onToken("Video generation started. Waiting for completion (this may take a minute)...");

        // Poll for completion
        while (!operation.done) {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5s
            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
            onToken("Still generating video... 🎥");
        }

        if (operation.error) {
            throw new Error(operation.error.message || "Video generation failed");
        }

        const videoFile = operation.response.generatedVideos?.[0]?.video;
        if (videoFile) {
            // We have a file reference. In a browser, we need to fetch the content.
            // The SDK's ai.files.download usually requires file system access in Node.
            // We'll try to fetch the URI directly if possible, or use a workaround.
            // Since this is a browser env, let's try to fetch the bytes using the SDK's internal client or standard fetch if we have the URI.

            // Construct the download URL manually if needed or use the URI
            const videoUri = videoFile.uri;
            onToken(`Video generated! Fetching content...`);

            try {
                // Attempting to fetch the video content using the URI + API Key
                const response = await fetch(videoUri + `?key=${API_KEY}`);
                if (!response.ok) throw new Error("Failed to download video content");

                const blob = await response.blob();
                const reader = new FileReader();
                return new Promise((resolve) => {
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        const resultMarkdown = `![Generated Video](${base64data})`;
                        onToken(resultMarkdown);
                        resolve(resultMarkdown);
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (fetchError) {
                console.error("Error fetching video bytes:", fetchError);
                onToken(`Video generated but could not be downloaded to the browser. URI: ${videoUri}`);
                return `Video generated: ${videoUri}`;
            }
        } else {
            throw new Error("No video returned in operation response.");
        }
    }

    // Standard Chat / Text / Reasoning Models
    const historyContents = history.map(msg => ({
        role: msg.role === 'start' ? 'user' : msg.role,
        parts: msg.parts
    })).filter(msg => msg.parts.length > 0);

    const allContents = [
        ...historyContents,
        { role: 'user', parts: currentParts }
    ];

    const result = await ai.models.generateContentStream({
        model: modelName,
        contents: allContents,
        config: {
            maxOutputTokens: 8192,
        }
    });

    let fullText = '';

    let stream = result.stream;
    if (!stream && typeof result[Symbol.asyncIterator] === 'function') {
        stream = result;
    }

    if (!stream) {
        // Fallback for non-streaming response that might have been returned unexpectedly
        const response = await result.response;
        if (response) {
            const text = typeof response.text === 'function' ? response.text() : response.text;
            if (text) {
                onToken(text);
                return text;
            }
        }
        throw new Error("No stream found in response");
    }

    for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
            // New SDK chunk.text() is sometimes a function? 
            // In SDK 0.1.0 it was a getter, checking consistency.
            const text = typeof chunkText === 'function' ? chunkText() : chunkText;
            fullText += text;
            onToken(fullText);
        }
    }

    return fullText;
};
