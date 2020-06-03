import React, { useEffect, useState } from 'react';
import MapView from './MapView';

import Kendo from '../kendo/KendoTest';

import { loadPdfFile, loadPdfCanvasPreview } from '../../utils/PdfHelper';

export default function Canvas() {
  const [pdfInfo, setPdfInfo] = useState({
    currentPage: 1,
  } as any);

  const [imageUri, setImageUri] = useState('');
  const [extent, setExtent] = useState([] as any);

  useEffect(() => {
    loadImageMap();
  }, []);

  useEffect(() => {
    if (pdfInfo.pdf) {
      loadPdfImage(pdfInfo.pdf, pdfInfo.currentPage);
    }
  }, [pdfInfo.currentPage]);

  async function loadImageMap() {
    const pdf = await loadPdfFile(
      'http://localhost:3002/test?name=hector_1.pdf'
    );

    setPdfInfo((prev: any) => ({ ...prev, pdf }));
    loadPdfImage(pdf, pdfInfo.currentPage);
  }

  async function loadPdfImage(pdf: any, currentPage: number) {
    const canvas = await loadPdfCanvasPreview(pdf, currentPage);

    const uri = canvas.toDataURL('image/jpeg', 0.7);
    setExtent([0, 0, canvas.width, canvas.height]);
    setImageUri(uri);

    setPdfInfo((prevState: any) => ({ ...prevState, canvas }));
  }

  const nextPage = () => {
    const next = pdfInfo.currentPage + 1;
    setPdfInfo((prevState: any) => ({
      ...prevState,
      currentPage: next,
    }));
  };

  const prevPage = () => {
    const prev = pdfInfo.currentPage - 1;
    setPdfInfo((prevState: any) => ({
      ...prevState,
      currentPage: prev,
    }));
  };

  return (
    <div className="canvas-content">
      {imageUri && (
        <MapView
          imageUri={imageUri}
          extent={extent}
          page={pdfInfo.currentPage}
        />
      )}
      {pdfInfo.pdf && pdfInfo.currentPage > 1 && (
        <button className="nav-btn prev" onClick={prevPage}>
          Prev
        </button>
      )}
      {pdfInfo.pdf && pdfInfo.pdf._pdfInfo.numPages > pdfInfo.currentPage && (
        <button className="nav-btn next" onClick={nextPage}>
          Next
        </button>
      )}

      <Kendo />
    </div>
  );
}
