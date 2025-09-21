
import { GoogleGenAI, Type } from "@google/genai";
import type { CompanyEvaluation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const extractInfoFromFiles = async (
    files: { mimeType: string; data: string }[]
): Promise<string> => {
    if (!files || files.length === 0) {
        return "";
    }

    try {
        const prompt = `
You are a document analysis expert. From the provided document(s), extract all information relevant to the following categories for a startup evaluation.
Focus on concrete facts, figures, and statements.

1.  **Founder Analysis**: Extract information about the founding team's experience, past successes (e.g., previous companies, exits), education, and specific domain expertise.
2.  **Market Analysis**: Extract details on the target market size (TAM, SAM, SOM), growth potential (e.g., CAGR), customer segments, and the company's go-to-market strategy or traction.
3.  **Technical Analysis**: Extract descriptions of the product's underlying technology, architecture, key innovative features, and any mentions of intellectual property, patents, or defensibility.
4.  **Competitor Analysis**: Extract any information that identifies key competitors, competitive advantages, or the startup's unique selling propositions and differentiation.

Collate all extracted information into a single, structured block of text. If no relevant information is found for a category, state "No information found in documents." under that category's heading. Do not summarize, analyze, or create new information; only extract relevant text verbatim or as close as possible.
`;

        const contents: any[] = [{ text: prompt }];

        for (const file of files) {
            contents.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: contents },
        });
        
        const extractedText = response.text.trim();

        if (!extractedText) {
            // It's better to return an empty string and let the next step decide,
            // rather than throwing an error if a document is irrelevant.
            return "No relevant information could be extracted from the provided documents.";
        }

        return extractedText;

    } catch (error) {
        console.error("Error extracting information from files with Gemini:", error);
        throw new Error("Failed to process documents with the AI service.");
    }
};


const analysisItemSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER, description: "Score (1-100) for this analysis area." },
        summary: { type: Type.STRING, description: "A single, concise sentence summarizing the analysis for this area." },
        pros: {
            type: Type.ARRAY,
            description: "An array of 2-3 key strengths (pros), each as a short, scannable phrase.",
            items: { type: Type.STRING }
        },
        cons: {
            type: Type.ARRAY,
            description: "An array of 2-3 key weaknesses (cons), each as a short, scannable phrase.",
            items: { type: Type.STRING }
        },
        sources: {
            type: Type.ARRAY,
            description: "An array of 1-2 key data sources specifically used for this analysis area.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Source name (e.g., 'Company Website', 'TechCrunch')." },
                    url: { type: Type.STRING, description: "A plausible URL for the source." },
                },
                required: ['name', 'url']
            }
        }
    },
    required: ['score', 'summary', 'pros', 'cons', 'sources']
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        companyName: {
            type: Type.STRING,
            description: "The name of the company being evaluated."
        },
        logoUrl: {
            type: Type.STRING,
            description: "A publicly accessible URL for the company's logo. Should be a high-quality image (SVG preferred)."
        },
        industry: {
            type: Type.STRING,
            description: "The primary industry or sector the company operates in (e.g., 'Fintech', 'SaaS', 'E-commerce')."
        },
        fundingStatus: {
            type: Type.STRING,
            description: "The company's latest funding status, including the stage and amount if available (e.g., 'Series C - $150M', 'Seed Round', 'Bootstrapped')."
        },
        overallScore: {
            type: Type.INTEGER,
            description: "An overall score from 1 to 100, calculated as a weighted average of the other scores (e.g., 40% Founder, 30% Market, 20% Technical, 10% Competitor)."
        },
        founderAnalysis: {
            ...analysisItemSchema,
            description: "Analysis of the founding team."
        },
        marketAnalysis: {
            ...analysisItemSchema,
            description: "Analysis of the market."
        },
        technicalAnalysis: {
            ...analysisItemSchema,
            description: "Analysis of the technology."
        },
        competitorAnalysis: {
            ...analysisItemSchema,
            description: "Analysis of the competition."
        },
    },
    required: [
        'companyName',
        'logoUrl',
        'industry',
        'fundingStatus',
        'overallScore',
        'founderAnalysis',
        'marketAnalysis',
        'technicalAnalysis',
        'competitorAnalysis'
    ]
};


export const evaluateCompany = async (
    companyName: string,
    extractedText: string | null
): Promise<CompanyEvaluation> => {
    try {
        const prompt = `
You are an expert venture capitalist analyst called "UnicornFinder". Your task is to provide a detailed, data-driven evaluation of a startup.
For the company "${companyName}", produce a comprehensive analysis.
${extractedText ? `Use your own knowledge and other publicly available data, supplementing this with the following extracted information from documents provided by the user:\n\n---EXTRACTED INFORMATION---\n${extractedText}\n---END EXTRACTED INFORMATION---` : 'Base your analysis on publicly available information.'}

Your evaluation must be structured into four key areas:
1.  **Founder Analysis**: Evaluate the founding team's experience, past successes, and domain expertise.
2.  **Market Analysis**: Assess the target market's size, growth potential (CAGR), and the company's positioning.
3.  **Technical Analysis**: Analyze the product's technology, innovation, defensibility, and scalability.
4.  **Competitor Analysis**: Evaluate the competitive landscape, identifying key players and the startup's differentiation.

For each of these four areas, provide:
- A numerical score from 1 to 100.
- A single, concise summary sentence.
- A list of 2-3 specific strengths (pros), as short phrases.
- A list of 2-3 specific weaknesses (cons), as short phrases.
- A list of relevant data sources used that area's analysis regarding the startup. If providing links as data sources, use only actual links of the sources where you found the start-up relevant information. Don't add any links that lead to dubious, unsecured websites or 404 errors. Prioritize links of SSL or HTTPS secured sites. 

Additionally, provide:
- The company's primary **Industry** (e.g., 'Fintech', 'SaaS').
- The company's latest **Funding Status** (e.g., 'Series C - $150M', 'Seed Round').
- A publicly accessible **Logo URL** for the company.
- An **Overall Score** (1-100), which should be a weighted average of the four area scores.

Your response MUST be a single JSON object that strictly adheres to the provided schema. Do not include any text, explanations, or markdown formatting outside of the JSON object.
`;
        
        const contents = [{ text: prompt }];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: contents },
            config: {
                responseMimeType: 'application/json',
                responseSchema: evaluationSchema,
            }
        });

        const jsonText = response.text.trim();
        
        if (!jsonText) {
            throw new Error("Received an empty response from the AI service.");
        }

        try {
            return JSON.parse(jsonText) as CompanyEvaluation;
        } catch (parseError) {
            console.error("Failed to parse JSON response from Gemini:", parseError);
            console.error("Raw response text:", jsonText);
            throw new Error("The AI service returned a response that was not valid JSON.");
        }

    } catch (error) {
        console.error("Error evaluating company with Gemini:", error);
        if (error instanceof Error) {
            throw error; // Re-throw the specific error for the UI to catch
        }
        throw new Error("Failed to parse or receive evaluation from AI service.");
    }
};
