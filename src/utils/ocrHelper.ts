// @ts-ignore
import Polygon from 'ol/geom/Polygon';
// @ts-ignore
import { Feature } from 'ol';

export const drawOcr = (ocrReadResults: any, extent: number[]) => {
  const textFeatures: any[] = [];
  const ocrExtent = [0, 0, ocrReadResults.width, ocrReadResults.height];
  let order = 0;
  let regionOrders = {} as any;
  if (ocrReadResults.lines) {
    ocrReadResults.lines.forEach((line: any) => {
      if (line.words) {
        line.words.forEach((word: any) => {
          order++;
          const feature = createBoundingBoxVectorFeature(
            word.text,
            word.boundingBox,
            extent,
            ocrExtent,
            order
          );
          textFeatures.push(feature);
          regionOrders[feature.getId()] = order++;
        });
      }
    });
  }

  return textFeatures;
};

const createBoundingBoxVectorFeature = (
  text: string,
  boundingBox: any[],
  imageExtent: number[],
  ocrExtent: number[],
  order: number
) => {
  const coordinates: any = [];
  const polygonPoints: any = [];
  const imageWidth = imageExtent[2] - imageExtent[0];
  const imageHeight = imageExtent[3] - imageExtent[1];
  const ocrWidth = ocrExtent[2] - ocrExtent[0];
  const ocrHeight = ocrExtent[3] - ocrExtent[1];

  for (let i = 0; i < boundingBox.length; i += 2) {
    // An array of numbers representing an extent: [minx, miny, maxx, maxy]
    coordinates.push([
      Math.round((boundingBox[i] / ocrWidth) * imageWidth),
      Math.round((1 - boundingBox[i + 1] / ocrHeight) * imageHeight),
    ]);

    polygonPoints.push(boundingBox[i] / ocrWidth);
    polygonPoints.push(boundingBox[i + 1] / ocrHeight);
  }

  const featureId = text + Math.random();
  const feature = new Feature({
    geometry: new Polygon([coordinates]),
  });
  feature.setProperties({
    id: featureId,
    text,
    boundingbox: boundingBox,
    highlighted: false,
    isOcrProposal: true,
    order,
  });
  feature.setId(featureId);

  return feature;
};
