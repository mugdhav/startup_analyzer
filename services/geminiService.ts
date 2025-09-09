import { GoogleGenAI, Type } from "@google/genai";
import type { CompanyEvaluation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
    fileContent: { mimeType: string; data: string } | null
): Promise<CompanyEvaluation> => {
    try {
        const prompt = `
You are an expert venture capitalist analyst called "UnicornFinder". Your task is to provide a detailed, data-driven evaluation of a startup.
For the company "${companyName}", produce a comprehensive analysis.
${fileContent ? 'Use the content of the provided document as a primary source of information, supplementing this with your own knowledge and other publicly available data.' : 'Base your analysis on publicly available information.'}

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
- A list of 1-2 relevant data sources specifically for that area's analysis.

Additionally, provide:
- The company's primary **Industry** (e.g., 'Fintech', 'SaaS').
- The company's latest **Funding Status** (e.g., 'Series C - $150M', 'Seed Round').
- A publicly accessible **Logo URL** for the company.
- An **Overall Score** (1-100), which should be a weighted average of the four area scores.

Your response MUST be a single JSON object that strictly adheres to the provided schema. Do not include any text, explanations, or markdown formatting outside of the JSON object.
`;
        // Fix: Explicitly type `contents` as `any[]` to allow pushing different part types, resolving a type inference issue.
        const contents: any[] = [{ text: prompt }];

        if (fileContent) {
            contents.push({
                inlineData: {
                    mimeType: fileContent.mimeType,
                    data: fileContent.data,
                },
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: contents },
            config: {
                responseMimeType: 'application/json',
                responseSchema: evaluationSchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as CompanyEvaluation;
        return parsedData;

    } catch (error) {
        console.error("Error evaluating company with Gemini:", error);
        throw new Error("Failed to parse or receive evaluation from AI service.");
    }
};