// AI Enhancement API for Resume Text
// Calls backend proxy which forwards to Hugging Face API

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Enhance resume text using AI via backend proxy
 * @param {string} text - Original text to enhance
 * @param {string} context - Context like "work experience", "project", "summary"
 * @returns {Promise<string>} - Enhanced professional text
 */
export async function enhanceWithAI(text, context = "resume") {
    if (!text || !text.trim()) return text;

    try {
        const response = await fetch(`${API_BASE_URL}/ai/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, context })
        });

        if (!response.ok) {
            console.error('AI enhancement error:', response.status);
            return enhanceTextFallback(text);
        }

        const data = await response.json();

        if (data.status === "success" && data.enhancedText) {
            return data.enhancedText;
        }

        return enhanceTextFallback(text);
    } catch (error) {
        console.error('Error calling AI enhancement API:', error);
        return enhanceTextFallback(text);
    }
}

/**
 * Fallback enhancement using dictionary replacements
 */
function enhanceTextFallback(text) {
    if (!text) return text;

    const replacements = {
        "worked on": "developed and maintained",
        "worked with": "collaborated with cross-functional teams on",
        "helped": "contributed to",
        "was responsible for": "spearheaded",
        "responsible for": "led and managed",
        "managed": "strategically directed",
        "did": "executed",
        "made": "designed and created",
        "used": "leveraged",
        "created": "architected and implemented",
        "built": "engineered",
        "wrote": "authored",
        "fixed": "resolved and optimized",
        "improved": "enhanced and optimized",
        "worked": "contributed to",
        "handled": "orchestrated"
    };

    let enhanced = text;
    Object.entries(replacements).forEach(([weak, strong]) => {
        const regex = new RegExp(`\\b${weak}\\b`, 'gi');
        enhanced = enhanced.replace(regex, strong);
    });

    // Capitalize first letter
    if (enhanced.length > 0) {
        enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }

    return enhanced;
}

/**
 * Check if AI API is available (always true when using backend proxy)
 */
export function isAIAvailable() {
    return true;
}

export default { enhanceWithAI, isAIAvailable };
