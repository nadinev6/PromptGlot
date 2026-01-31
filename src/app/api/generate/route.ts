import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRequest {
  prompt: string;
  lang: string;
  options?: {
    hdResolution?: boolean;
    depthMapping?: boolean;
    rayTracing?: boolean;
    neuralWeight?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body: GenerateRequest = await request.json();
    const { prompt, lang, options = {} } = body;

    if (!prompt || !lang) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and lang' },
        { status: 400 }
      );
    }

    // Load AI persona for the language
    const persona = await loadPersona(lang);
    
    // Step 1: Generate optimized English prompt using GPT-4o
    const optimizedPrompt = await generateOptimizedPrompt(prompt, persona, options);
    
    // Step 2: Generate image using DALL-E 3
    const imageResult = await generateImage(optimizedPrompt, options);
    
    // Step 3: Generate explanation in user's language
    const explanation = await generateExplanation(prompt, optimizedPrompt, persona, lang);

    return NextResponse.json({
      success: true,
      imageUrl: imageResult.url,
      explanation: explanation,
      optimizedPrompt: optimizedPrompt,
      originalPrompt: prompt,
      language: lang,
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function loadPersona(lang: string): Promise<any> {
  try {
    // Load persona from file system
    const personaModule = await import(`../../../prompts/${lang}/system.json`);
    return personaModule.default;
  } catch (error) {
    console.warn(`Failed to load persona for ${lang}, falling back to English`);
    try {
      const fallbackModule = await import('../../../prompts/en/system.json');
      return fallbackModule.default;
    } catch (fallbackError) {
      console.error('Failed to load fallback persona:', fallbackError);
      // Return hardcoded fallback if all else fails
      return {
        name: "English Creative AI",
        description: "Specialized in creating detailed, artistic prompts in English",
        style: "detailed, artistic, cinematic",
        systemPrompt: "You are an expert creative AI. Transform user ideas into detailed English prompts."
      };
    }
  }
}

async function generateOptimizedPrompt(
  userPrompt: string,
  persona: any,
  options: any
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are ${persona.name}, ${persona.description}. Transform the user's native language prompt into a highly detailed, artistic English prompt optimized for DALL-E 3. Consider cultural nuances and visual aesthetics. Make it vivid, specific, and artistically rich. Current options: ${JSON.stringify(options)}`
      },
      {
        role: "user", 
        content: `Transform this into an optimized English prompt: "${userPrompt}"`
      }
    ],
    max_tokens: 500,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content || userPrompt;
}

async function generateImage(prompt: string, options: any): Promise<{ url: string }> {
  const enhancedPrompt = `${prompt}. ${options.hdResolution ? 'High definition, ultra detailed, ' : ''}${options.rayTracing ? 'Ray tracing, photorealistic, ' : ''}${options.depthMapping ? 'Depth mapped, 3D rendered, ' : ''}Professional quality, masterpiece, 8k resolution`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size: "1024x1024",
    quality: options.hdResolution ? "hd" : "standard",
  });

  return {
    url: response.data?.[0]?.url || ''
  };
}

async function generateExplanation(
  originalPrompt: string,
  optimizedPrompt: string,
  persona: any,
  lang: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Explain in ${lang} the transformation process from the original prompt to the optimized version. Keep it educational and informative.`
      },
      {
        role: "user",
        content: `Original: "${originalPrompt}"\nOptimized: "${optimizedPrompt}"\nExplain what changes were made and why.`
      }
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'Image generated successfully.';
}