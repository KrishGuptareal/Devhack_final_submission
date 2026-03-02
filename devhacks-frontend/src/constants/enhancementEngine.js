// Enhancement Engine for Resume Text Improvement
// Converts weak verbs and phrases to professional action-oriented language

const verbReplacements = {
    // Weak verb → Strong action verb
    "worked on": "developed and maintained",
    "worked with": "collaborated with cross-functional teams on",
    "helped": "contributed to",
    "helped with": "assisted in delivering",
    "was responsible for": "spearheaded",
    "responsible for": "led and managed",
    "managed": "strategically directed",
    "did": "executed",
    "made": "designed and created",
    "used": "leveraged",
    "got": "achieved",
    "had to": "proactively",
    "tried to": "focused on",
    "worked as": "served as",
    "worked in": "operated within",
    "worked": "contributed",
    "handled": "orchestrated",
    "dealt with": "resolved",
    "took care of": "oversaw",
    "was part of": "collaborated on",
    "participated in": "actively contributed to",
    "was involved in": "played key role in",
    "involved in": "instrumental in",
    "tasked with": "entrusted with",
    "assigned to": "selected to lead",
    "learned": "acquired expertise in",
    "saw": "identified",
    "looked at": "analyzed",
    "talked to": "communicated with",
    "met with": "engaged stakeholders through",
    "gave": "delivered",
    "set up": "established",
    "put together": "assembled",
    "came up with": "conceptualized",
    "figured out": "determined",
    "fixed": "resolved and optimized",
    "changed": "transformed",
    "improved": "enhanced and optimized",
    "increased": "boosted",
    "decreased": "reduced",
    "created": "architected and implemented",
    "built": "engineered",
    "developed": "designed and developed",
    "wrote": "authored",
    "maintained": "sustained and improved",
    "tested": "validated and tested",
    "debugged": "diagnosed and resolved",
    "deployed": "orchestrated deployment of",
    "launched": "successfully launched",
    "ran": "executed",
    "led": "spearheaded",
    "coordinated": "orchestrated",
    "organized": "streamlined",
    "planned": "strategized",
    "designed": "architected",
    "analyzed": "conducted comprehensive analysis of",
    "researched": "conducted research on",
    "implemented": "successfully implemented",
    "integrated": "seamlessly integrated",
    "automated": "engineered automation for",
    "optimized": "enhanced performance of",
    "streamlined": "optimized workflows for",
    "collaborated": "partnered with teams to",
    "communicated": "effectively communicated"
};

const phraseEnhancements = {
    // Common weak phrases → Professional alternatives
    "a lot of": "numerous",
    "lots of": "extensive",
    "many": "multiple",
    "some": "select",
    "good": "exceptional",
    "great": "outstanding",
    "nice": "effective",
    "big": "significant",
    "small": "focused",
    "fast": "efficiently",
    "quickly": "rapidly",
    "slowly": "methodically",
    "hard": "challenging",
    "easy": "streamlined",
    "things": "initiatives",
    "stuff": "components",
    "etc": "and more",
    "team player": "collaborative professional",
    "go-getter": "results-driven individual",
    "hard worker": "dedicated professional",
    "self-starter": "proactive contributor"
};

// Action verbs by category for suggestions
export const actionVerbsByCategory = {
    leadership: ["spearheaded", "directed", "orchestrated", "championed", "mentored", "coached", "guided", "supervised"],
    achievement: ["achieved", "exceeded", "surpassed", "attained", "delivered", "accomplished", "earned", "secured"],
    creation: ["developed", "designed", "created", "built", "established", "launched", "initiated", "pioneered"],
    improvement: ["enhanced", "improved", "optimized", "streamlined", "refined", "upgraded", "transformed", "revamped"],
    analysis: ["analyzed", "assessed", "evaluated", "investigated", "researched", "examined", "identified", "diagnosed"],
    communication: ["presented", "negotiated", "collaborated", "facilitated", "coordinated", "liaised", "advocated", "influenced"],
    technical: ["implemented", "engineered", "programmed", "architected", "automated", "integrated", "configured", "deployed"]
};

/**
 * Enhance a single text entry with professional language
 * @param {string} text - Original text to enhance
 * @returns {string} - Enhanced professional text
 */
export function enhanceText(text) {
    if (!text || typeof text !== 'string') return text;

    let enhanced = text;

    // Apply verb replacements (case-insensitive)
    Object.entries(verbReplacements).forEach(([weak, strong]) => {
        const regex = new RegExp(`\\b${weak}\\b`, 'gi');
        enhanced = enhanced.replace(regex, (match) => {
            // Preserve first letter capitalization
            if (match[0] === match[0].toUpperCase()) {
                return strong.charAt(0).toUpperCase() + strong.slice(1);
            }
            return strong;
        });
    });

    // Apply phrase enhancements
    Object.entries(phraseEnhancements).forEach(([weak, strong]) => {
        const regex = new RegExp(`\\b${weak}\\b`, 'gi');
        enhanced = enhanced.replace(regex, strong);
    });

    // Capitalize first letter of the result
    if (enhanced.length > 0) {
        enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }

    return enhanced;
}

/**
 * Enhance an array of experience/project entries
 * @param {Array} entries - Array of objects with description fields
 * @param {string} descriptionKey - Key name for the description field
 * @returns {Array} - Enhanced entries
 */
export function enhanceEntries(entries, descriptionKey = 'description') {
    return entries.map(entry => ({
        ...entry,
        [descriptionKey]: enhanceText(entry[descriptionKey]),
        _enhanced: true
    }));
}

/**
 * Check if text could benefit from enhancement
 * @param {string} text - Text to check
 * @returns {boolean} - Whether enhancement is recommended
 */
export function needsEnhancement(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return Object.keys(verbReplacements).some(weak => lowerText.includes(weak));
}

/**
 * Get enhancement suggestions for a text
 * @param {string} text - Text to analyze
 * @returns {Array} - Array of {original, suggested} objects
 */
export function getSuggestions(text) {
    if (!text) return [];
    const suggestions = [];
    const lowerText = text.toLowerCase();

    Object.entries(verbReplacements).forEach(([weak, strong]) => {
        if (lowerText.includes(weak)) {
            suggestions.push({ original: weak, suggested: strong });
        }
    });

    return suggestions;
}

export default {
    enhanceText,
    enhanceEntries,
    needsEnhancement,
    getSuggestions,
    actionVerbsByCategory
};
