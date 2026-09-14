import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const PERSONA_PROMPTS = {
  standard: "You are a helpful and professional AI learning assistant.",
  socratic: "You are a Socratic tutor. Instead of giving direct answers, ask guiding questions that help the learner discover the truth themselves. Encourage critical thinking.",
  specialist: "You are a world-class domain specialist. Use precise technical language, provide deep academic insights, and refer to advanced concepts when explaining.",
  peer: "You are a supportive and friendly study peer. Use simple, relatable language, plenty of analogies, and a conversational tone with occasional emojis. Keep things encouraging."
};

const requireGeminiKey = () => {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    const error = new Error("GEMINI_API_KEY is not set in the environment variables.");
    error.statusCode = 503;
    throw error;
  }
};

let cachedWorkingModel = null;
let cachedApiVersion = "v1beta";

const getAvailableGeminiModel = async (apiKey) => {
  if (cachedWorkingModel) return { model: cachedWorkingModel, apiVersion: cachedApiVersion };

  const versions = ["v1beta", "v1"];
  for (const ver of versions) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`);
      if (res.ok) {
        const data = await res.json();
        const models = data.models || [];
        console.log(`[Gemini] Available models (${ver}):`, models.map((m) => m.name.replace("models/", "")));
        
        // Prioritize gemini-3.6-flash or latest flash
        const suitable = models.find(
          (m) =>
            m.supportedGenerationMethods?.includes("generateContent") &&
            m.name.includes("3.6")
        ) || models.find(
          (m) =>
            m.supportedGenerationMethods?.includes("generateContent") &&
            (m.name.includes("flash") || m.name.includes("gemini"))
        );

        if (suitable) {
          cachedWorkingModel = suitable.name.replace(/^models\//, "");
          cachedApiVersion = ver;
          console.log(`[Gemini] Selected working model: ${cachedWorkingModel} (${cachedApiVersion})`);
          return { model: cachedWorkingModel, apiVersion: cachedApiVersion };
        }
      }
    } catch (e) {
      console.warn(`[Gemini] ListModels check failed on ${ver}:`, e.message);
    }
  }

  // Fallback default
  return { model: "gemini-3.6-flash", apiVersion: "v1beta" };
};

export const callGemini = async (messages, requestedModel = null) => {
  requireGeminiKey();

  const apiKey = process.env.GEMINI_API_KEY.trim();

  // Determine model and API version
  let targetModel = requestedModel || process.env.GEMINI_MODEL || cachedWorkingModel || "gemini-3.6-flash";
  let apiVersion = cachedApiVersion || "v1beta";

  // Separate system instruction from user/model messages
  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  const contents = nonSystemMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content || "" }],
  }));

  const requestBody = {
    contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello" }] }],
  };

  if (systemMsg) {
    requestBody.system_instruction = {
      parts: [{ text: systemMsg.content || "" }],
    };
  }

  const executeRequest = async (modelName, ver) => {
    const url = `https://generativelanguage.googleapis.com/${ver}/models/${modelName}:generateContent?key=${apiKey}`;
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  };

  try {
    let response = await executeRequest(targetModel, apiVersion);

    // If model not found or not supported, auto-discover supported models
    if (!response.ok && (response.status === 404 || response.status === 400)) {
      const errorJson = await response.json().catch(() => ({}));
      const errMsg = errorJson.error?.message || "";

      if (errMsg.includes("not found") || errMsg.includes("not supported") || response.status === 404) {
        console.warn(`[Gemini] ${targetModel} not available (${errMsg}). Discovering supported models...`);
        const discovered = await getAvailableGeminiModel(apiKey);
        targetModel = discovered.model;
        apiVersion = discovered.apiVersion;

        console.log(`[Gemini] Retrying with discovered model: ${targetModel} on ${apiVersion}`);
        response = await executeRequest(targetModel, apiVersion);
      } else {
        throw new Error(errMsg || `Gemini API Error (${response.status})`);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      throw new Error(errorData.error?.message || `Gemini API Error (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Gemini returned an empty response.");
    }

    cachedWorkingModel = targetModel;
    cachedApiVersion = apiVersion;
    return candidateText;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};


export const callOpenRouter = callGemini;

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

  const generatedText = await callGemini([{ role: "user", content: prompt }]);

  const flashcards = [];
  const cards = generatedText.split('---').filter(c => c.trim());

  for (const card of cards) {
    const lines = card.trim().split('\n');
    let question = '', answer = '', difficulty = 'medium';

    for (const line of lines) {
      if (line.startsWith('Q:')) {
        question = line.substring(2).trim();
      } else if (line.startsWith('A:')) {
        answer = line.substring(2).trim();
      } else if (line.startsWith('D:')) {
        const diff = line.substring(2).trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(diff)) {
          difficulty = diff;
        }
      }
    }

    if (question && answer) {
      flashcards.push({ question, answer, difficulty });
    }
  }

  return flashcards.slice(0, count);
};

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
Format each question as:
Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct option - exactly as written above]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate questions with "---"

Text:
${text.substring(0, 15000)}`;

  const generatedText = await callGemini([{ role: "user", content: prompt }]);

  const questions = [];
  const questionBlocks = generatedText.split('---').filter(q => q.trim());

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n');
    let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('Q:')) {
        question = trimmed.substring(2).trim();
      } else if (trimmed.match(/^O\d:/)) {
        options.push(trimmed.substring(3).trim());
      } else if (trimmed.startsWith('C:')) {
        correctAnswer = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('E:')) {
        explanation = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('D:')) {
        const diff = trimmed.substring(2).trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(diff)) {
          difficulty = diff;
        }
      }
    }

    if (question && options.length === 4 && correctAnswer) {
      questions.push({ question, options, correctAnswer, explanation, difficulty });
    }
  }

  return questions.slice(0, numQuestions);
};

export const generateSummary = async (text, focus = "", persona = "standard") => {
  const focusPrompt = focus?.trim()
    ? `Focus especially on: ${focus.trim()}.`
    : "Highlight the key concepts.";

  const systemMessage = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.standard;
  const prompt = `Act as an expert educator and provide a well-structured, comprehensive summary of the following text. ${focusPrompt}

Please use the following format:
# [Title of the Document/Topic]

## 📌 Executive Overview
[A high-level 2-3 sentence overview of the entire text]

## 🔑 Key Takeaways
- **[Point 1]**: [Brief description]
- **[Point 2]**: [Brief description]
- **[Point 3]**: [Brief description]

## 📖 Detailed Analysis
[Provide a structured breakdown of the main sections or themes in the text. Use subheadings if necessary.]

## 💡 Practical Implications / Significance
[Why does this information matter? How can it be applied?]

## 🏁 Conclusion
[Final concluding thought]

Text:
${text.substring(0, 20000)}`;

  return await callGemini([
    { role: "system", content: systemMessage },
    { role: "user", content: prompt }
  ]);
};

export const explainConcept = async (text, concept, audience = "beginner", detailLevel = "balanced", persona = "standard") => {
  const systemMessage = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.standard;
  const prompt = `Act as an expert tutor and explain the concept "${concept}" based on the document context.
Write for a ${audience} learner with a ${detailLevel} level of detail.

Please use the following Markdown structure:
## 💡 Concept: ${concept}

### 🔍 What is it?
[Clear, concise definition]

### 🎯 Why it Matters
[Explain the significance and practical application]

### 📝 Practical Example
[A simple, relatable example or analogy]

### 🧠 Key Takeaway
[One single sentence that summarizes the most important point]

---
**Document context:**
${text.substring(0, 15000)}`;

  return await callGemini([
    { role: "system", content: systemMessage },
    { role: "user", content: prompt }
  ]);
};

export const chatWithContext = async (question, chunks, persona = "standard") => {
  const safeChunks = Array.isArray(chunks) ? chunks : [];
  const context = safeChunks
    .slice(0, 10)
    .map((c, i) => {
      const content = typeof c?.content === "string" ? c.content : "";
      return `[Chunk ${i + 1}]\n${content.slice(0, 1200)}`;
    })
    .join('\n\n');

  const systemMessage = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.standard;
  const prompt = `Based on the following context from a document, Analyse the context and answer the user question.
If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

  const generatedText = await callGemini([
    { role: "system", content: systemMessage },
    { role: "user", content: prompt }
  ]);

  if (!generatedText || !generatedText.trim()) {
    const error = new Error("AI returned an empty chat response.");
    error.statusCode = 502;
    throw error;
  }
  return generatedText;
};

/**
 * Generate a mind map in JSON format from text
 * @param {string} text - Document text
 * @returns {Promise<Object>} - Nested JSON structure for mindmap
 */
export const generateMindMap = async (text) => {
  const prompt = `Create a comprehensive mind map of the following text in JSON format.
The JSON should be a tree structure where each node has a "name" and an optional "children" array.
Keep node names concise (1-4 words).
Focus on the main concepts and their relationships.

JSON Format Example:
{
  "name": "Main Topic",
  "children": [
    {
      "name": "Topic A",
      "children": [
        { "name": "Subtopic 1" },
        { "name": "Subtopic 2" }
      ]
    },
    { "name": "Topic B" }
  ]
}

Text:
${text.substring(0, 15000)}`;

  const generatedText = await callGemini([{ role: "user", content: prompt }]);
  
  // Extract JSON from the response
  try {
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { name: "Error parsing map", children: [] };
  } catch (error) {
    console.error("JSON parsing error for mindmap:", error);
    return { name: "Error generating map", children: [] };
  }
};
