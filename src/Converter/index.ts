import path from "path";
import { pdfToPng } from "pdf-to-png-converter";
import { Logger, LogTypes } from "../Logger";
const logger = new Logger();
export const IMAGE_PATH = path.join(process.cwd(), "images");

export async function convertToPng(pdfFilePath: string) {
  try {
    await pdfToPng(
      pdfFilePath, // The function accepts PDF file path or a Buffer
      {
        disableFontFace: true, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
        useSystemFonts: true, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
        viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0.
        outputFolder: IMAGE_PATH, // Folder to write output PNG files. If not specified, PNG output will be available only as a Buffer content, without saving to a file.
        outputFileMask: pdfFilePath.split(path.sep).pop(), // Output filename mask. Default value is 'buffer'.
        // pagesToProcess: [1, 3, 11], // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
        strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
      }
    );
    logger.log(LogTypes.CONVERT_FILE, pdfFilePath);
  } catch (error) {
    logger.log(LogTypes.ERROR_IN_CONVERTING, { error, pdfFilePath });
  }
}
