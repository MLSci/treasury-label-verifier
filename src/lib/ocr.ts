import Tesseract from "tesseract.js";

export async function runOcr(file: File): Promise<string> {
  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng", {
    logger: (m) => console.log(m),
  });

  return text;
}