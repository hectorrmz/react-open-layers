// @ts-ignore
import { Style, Text, Fill, Stroke } from 'ol/style';

export const highlightStyle = new Style({
  fill: new Fill({
    color: 'rgba(255,255,255,0.7)',
  }),
  stroke: new Stroke({
    color: 'purple',
    width: 1,
  }),
});

export const normalStyle = new Style({
  stroke: new Stroke({
    color: 'transparent',
    width: 1,
  }),
  fill: new Fill({
    color: 'rgba(255, 252, 127, 0.2)',
  }),
});

export const rectangleStyle = new Style({
  stroke: new Stroke({
    color: '#333',
    width: 1,
    lineDash: [5, 2],
  }),
});

export function polygonStyleFunction() {
  return new Style({
    stroke: new Stroke({
      color: '#333',
      width: 1,
      lineDash: [5, 2],
    }),
    text: new Text({
      textAlign: 'end',
      textBaseline: 'bottom',
      font: 'bold 12px Arial',
      text: 'Account Number',
      fill: new Fill({ color: '#333' }),
      placement: 'line',
      overflow: true,
    }),
  });
}
