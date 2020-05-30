// @ts-ignore
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//fotts.azureedge.net/npm/pdfjs-dist/${pdfjsLib.version}/pdf.worker.js`;
const cMapUrl = `//fotts.azureedge.net/npm/pdfjs-dist/${pdfjsLib.version}/cmaps/`;

export const loadPdfFile = async (url: string) => {
  try {
    return await pdfjsLib.getDocument({ url, cMapUrl, cMapPacked: true })
      .promise;
    // Fetch current page
  } catch (reason) {
    // PDF loading error
    console.error(reason);
  }
};

export const loadPdfCanvasPreview = async (
  pdf: any,
  pageNumber: number
): Promise<any> => {
  const page = await pdf.getPage(pageNumber);
  const defaultScale = 2;
  const viewport = page.getViewport({ scale: defaultScale });

  // Prepare canvas using PDF page dimensions
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render PDF page into canvas context
  const renderContext = {
    canvasContext: context,
    viewport,
  };

  await page.render(renderContext).promise;

  return canvas;
};
