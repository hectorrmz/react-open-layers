// @ts-ignore
import { Style } from "ol/style";
// @ts-ignore
import Fill from "ol/style/Fill";
// @ts-ignore
import Stroke from "ol/style/Stroke";

export const highlightStyle = new Style({
  fill: new Fill({
    color: "rgba(255,255,255,0.7)",
  }),
  stroke: new Stroke({
    color: "purple",
    width: 1,
  }),
});

export const normalStyle = new Style({
  stroke: new Stroke({
    color: "transparent",
    width: 1,
  }),
  fill: new Fill({
    color: "rgba(255, 252, 127, 0.2)",
  }),
});

export const rectangleStyle = new Style({
  stroke: new Stroke({
    color: "#333",
    width: 1,
    lineDash: [5, 2],
  }),
});
