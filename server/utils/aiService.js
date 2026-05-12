import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API;
const DEFAULT_MODEL = "openai/gpt-oss-120b:free";

const PERSONA_PROMPTS = {
  standard: "You are a helpful and professional AI learning assistant.",
  socratic: "You are a Socratic tutor. Instead of giving direct answers, ask guiding questions that help the learner discover the truth themselves. Encourage critical thinking.",
  specialist: "You are a world-class domain specialist. Use precise technical language, provide deep academic insights, and refer to advanced concepts when explaining.",
  peer: "You are a supportive and friendly study peer. Use simple, relatable language, plenty of analogies, and a conversational tone with occasional emojis. Keep things encouraging."
};

const requireOpenRouterKey = () => {
  if (!OPENROUTER_API_KEY) {
    const error = new Error("OPEN_ROUTER_API is not set in the environment variables.");
    error.statusCode = 503;
    throw error;
  }
};

const callOpenRouter = async (messages, model = DEFAULT_MODEL) => {
  requireOpenRouterKey();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Optional, for OpenRouter rankings
        "X-Title": "AI Learning App", // Optional, for OpenRouter rankings
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to fetch from OpenRouter");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

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

  const generatedText = await callOpenRouter([{ role: "user", content: prompt }]);

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

  const generatedText = await callOpenRouter([{ role: "user", content: prompt }]);

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

  return await callOpenRouter([
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

  return await callOpenRouter([
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

  const generatedText = await callOpenRouter([
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

  const generatedText = await callOpenRouter([{ role: "user", content: prompt }]);
  
  // Extract JSON from the response
  try {
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { name: "Error parsing map", children: [] };
  } catch (error) {
    console.error("JSON parsing error for mindmap:", error);
    return { name: "Error generating map", children: [] };
  }
};
