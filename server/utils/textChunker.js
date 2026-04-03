/** 
 * textChunker.js
 * @param {string} text - The input text to be chunked.
 * @param {number} chunkSize - The maximum number of words per chunk.
 * @param {number} overlap - The number of words that should overlap between consecutive chunks.
 * @return {Array<{content: string, chunkIndex: number, pageNumber: number}>} An array of chunk objects.
 */

export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  const step = Math.max(1, chunkSize - overlap);
  const overlapStart = Math.max(0, chunkSize - overlap);

  // split paragraphs before collapsing whitespace so double-newline boundaries survive
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 0);

  // normalize whitespace and mark sentence boundaries for fallback sentence chunking
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .trim();

  const chunks = [];
  let chunkIndex = 0;

  // helper to chunk an array of words
  const addWordChunks = (words) => {
    for (let start = 0; start < words.length; start += step) {
      const chunkWords = words.slice(start, start + chunkSize);
      if (chunkWords.length) {
        chunks.push({
          content: chunkWords.join(' '),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
      }
    }
  };

  // first try to chunk by paragraph
  if (paragraphs.length > 0) {
    for (const para of paragraphs) {
      const words = para.split(' ').filter(w => w.trim().length > 0);
      if (words.length === 0) continue;
      addWordChunks(words);
    }
  }

  // if nothing produced (e.g. single long line), fall back to sentence-based chunking
  if (chunks.length === 0 && cleanedText.length > 0) {
    const sentences = cleanedText.split('|').filter(s => s.trim().length > 0);
    let buffer = [];

    for (const sent of sentences) {
      const words = sent.split(' ').filter(w => w.trim().length > 0);
      if (buffer.length + words.length > chunkSize && buffer.length > 0) {
        chunks.push({
          content: buffer.join(' '),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
        // retain overlap words
        buffer = buffer.slice(overlapStart);
      }
      buffer.push(...words);
    }

    if (buffer.length > 0) {
      chunks.push({
        content: buffer.join(' '),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });
    }
  }

  return chunks;
};

/**
 * find relevant chunks based on query and return top N chunks
 * @param {Array<{content: string, chunkIndex: number, pageNumber: number}>} chunks - The array of chunk objects.
 * @param {string} query - The search query to find relevant chunks.
 * @param {number} topN - The number of top relevant chunks to return.
 * @return {Array<{content: string, chunkIndex: number, pageNumber: number}>} An array of the top N relevant chunk objects.
 */


export const findRelevantChunks = (chunks, query, topN = 5) => {
  const queryWords = typeof query === 'string'
    ? query.toLowerCase().split(' ').filter(w => w.trim().length > 0)
    : [];

  const scoredChunks = chunks.map(chunk => {
    const chunkWords = chunk.content.toLowerCase().split(' ').filter(w => w.trim().length > 0);
    const commonWords = queryWords.filter(qw => chunkWords.includes(qw));
    return {
      ...chunk,
      relevanceScore: commonWords.length
    };
  });

  scoredChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scoredChunks.slice(0, topN);
}   




