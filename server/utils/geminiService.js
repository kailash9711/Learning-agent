import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';


dotenv.config();

const ai= new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,   
});


if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.error("Error: GOOGLE_GENAI_API_KEY is not set in the environment variables.");
    process.exit(1);
  }


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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

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
  
  // Iske baad aap shayad push kar rahe honge:
  if (question && answer) {
    flashcards.push({ question, answer, difficulty });
  }
}
    
return flashcards.slice(0, count); // Ensure we return only the requested number of flashcards
    // Yahan iske baad parsing ka logic aayega...
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    
    // Yahan generatedText ko parse karne ka logic aayega...
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


return questions.slice(0, numQuestions); // Ensure we return only the requested number of questions
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};


export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts. 
Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
};

export const chatWithContext = async (question, chunks) => {
  const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

  const prompt = `Based on the following context from a document, Analyse the context and answer the user question.
If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process chat request');
  }
};


