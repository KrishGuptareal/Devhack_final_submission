// AI Enhancement Controller
// Uses Groq API for resume text enhancement (fast and free)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Prompt templates for different resume sections
const PROMPT_TEMPLATES = {
    summary: `You are an expert resume writer with 15+ years of experience helping professionals land jobs at top companies.

Your task is to transform the user's professional summary into a compelling, ATS-optimized summary that:
- Opens with a strong professional identity (e.g., "Results-driven Software Engineer", "Strategic Marketing Leader")
- Highlights years of experience and key expertise areas
- Mentions 2-3 quantifiable achievements or core competencies
- Uses industry-specific keywords for ATS compatibility
- Maintains a confident, professional tone
- Keeps it to 3-4 impactful sentences (50-80 words max)

CRITICAL: Return ONLY the enhanced summary text. No explanations, no bullet points, no quotes.`,

    experience: `You are an expert resume writer specializing in transforming work experience into impactful, achievement-focused bullet points.

Transform the user's work experience description following these rules:
- Start with a powerful action verb (Spearheaded, Engineered, Orchestrated, Accelerated, Streamlined)
- Include specific metrics where possible (%, $, time saved, team size)
- Show impact and results, not just responsibilities
- Use the CAR format: Challenge → Action → Result
- Keep each point concise (under 25 words)
- Include relevant technical skills and tools

CRITICAL: Return ONLY the enhanced text. No explanations, no prefixes, no quotes.`,

    project: `You are an expert resume writer who excels at showcasing technical projects compellingly.

Transform the user's project description to:
- Lead with the project's purpose and your role
- Highlight technologies, frameworks, and tools used
- Emphasize measurable outcomes (users, performance gains, features shipped)
- Show problem-solving and technical decision-making
- Keep it concise but impactful (2-3 sentences)

CRITICAL: Return ONLY the enhanced project description. No explanations, no bullet points, no quotes.`,

    skills: `You are an expert resume writer who understands how to present technical and soft skills effectively.

Enhance the user's skills description to:
- Use professional terminology and industry-standard naming
- Group related skills logically
- Prioritize based on relevance and demand
- Include proficiency indicators where appropriate

CRITICAL: Return ONLY the enhanced skills text. No explanations, no formatting suggestions, no quotes.`,

    education: `You are an expert resume writer who knows how to present educational background professionally.

Enhance the user's education description to:
- Present degree and institution professionally
- Highlight relevant coursework, honors, or achievements
- Include GPA only if 3.5+ or explicitly mentioned
- Mention relevant academic projects or leadership roles

CRITICAL: Return ONLY the enhanced education text. No explanations, no quotes.`,

    default: `You are an expert resume writer with 15+ years of experience crafting resumes that land interviews at top companies.

Transform the user's text into professional, impactful resume content that:
- Uses strong action verbs (Spearheaded, Engineered, Orchestrated, Optimized, Accelerated)
- Includes quantifiable achievements and metrics where possible
- Is ATS-friendly with relevant industry keywords
- Sounds confident and professional, not generic
- Is concise and impactful

CRITICAL: Return ONLY the enhanced text. No explanations, no bullet points, no quotes, no prefixes like "Enhanced:" or "Here's".`
};

export const enhanceText = async (req, res) => {
    const { text, context = "resume" } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({
            status: "fail",
            message: "Text is required"
        });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return res.status(500).json({
            status: "fail",
            message: "GROQ_API_KEY not configured on server"
        });
    }

    // Select appropriate prompt template based on context
    const systemPrompt = PROMPT_TEMPLATES[context.toLowerCase()] || PROMPT_TEMPLATES.default;

    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: `Original text to enhance:\n\n"${text}"`
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.6
                })
            });

            // Handle rate limiting
            if (response.status === 429) {
                const waitTime = Math.pow(2, attempt) * 1000;
                console.warn(`Rate limited. Retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API error:', response.status, errorText);
                return res.status(response.status).json({
                    status: "fail",
                    message: "AI service error"
                });
            }

            const data = await response.json();
            const enhancedText = data?.choices?.[0]?.message?.content?.trim();

            if (enhancedText) {
                return res.status(200).json({
                    status: "success",
                    enhancedText: enhancedText.replace(/^["']|["']$/g, '')
                });
            }

            return res.status(500).json({
                status: "fail",
                message: "No response from AI"
            });

        } catch (error) {
            console.error(`AI enhancement error (attempt ${attempt + 1}):`, error);
            if (attempt === maxRetries - 1) {
                return res.status(500).json({
                    status: "fail",
                    message: "AI service unavailable"
                });
            }
        }
    }
};
