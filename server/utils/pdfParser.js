import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from a PDF file
 * @param {string} filePath - The path to the PDF file
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */
const extractTxtFromPDF = async (filePath) => {
  let parser;
  try {
    const dataBuffer = await fs.readFile(filePath);
    parser = new PDFParse({ data: dataBuffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    return {
      text: textResult?.text ?? "",
      numPages: infoResult?.total ?? textResult?.total ?? 0,
      info: infoResult?.info ?? {},
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

export default extractTxtFromPDF;