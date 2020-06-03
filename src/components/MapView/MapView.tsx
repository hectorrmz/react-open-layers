import React from 'react';
// @ts-ignore
import { Map, View, Feature } from 'ol';
// @ts-ignore
import { getCenter } from 'ol/extent';
// @ts-ignore
import Projection from 'ol/proj/Projection';
// @ts-ignore
import ImageLayer from 'ol/layer/Image';
// @ts-ignore
import Static from 'ol/source/ImageStatic';
// @ts-ignore
import { Vector as VectorSource } from 'ol/source';
// @ts-ignore
import { Vector as VectorLayer } from 'ol/layer';
// @ts-ignore
import { DragBox } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
// @ts-ignore
import Polygon from 'ol/geom/Polygon';

import './MapView.scss';
import { drawOcr } from '../../utils/ocrHelper';
import OcrJson from '../../assets/pdf/hector_1.ocr.json';
import {
  normalStyle,
  rectangleStyle,
  highlightStyle,
  polygonStyleFunction,
} from '../Styles';

export default class MapView extends React.Component<any, any> {
  private selected: any = [];
  private map: any;
  private imageLayer: any;
  private source: VectorSource;
  private drawSource: VectorSource;
  private dragBox: DragBox;
  private toggled = true;

  constructor(props: any) {
    super(props);

    this.source = new VectorSource();
    this.drawSource = new VectorSource();

    this.dragBox = new DragBox({
      condition: this.toggleCtrl,
    });

    this.dragBox.on('boxend', this.selectOcrFeatures);

    this.state = {
      previewText: '',
    };
  }

  public componentDidMount() {
    this.getImage(this.props.imageUri);
  }

  public componentDidUpdate(prevProps: any) {
    if (prevProps.imageUri !== this.props.imageUri) {
      this.setImage(this.props.imageUri);
      this.clearSelected();
    }
  }

  createContentProjection() {
    return new Projection({
      code: 'xkcd-image',
      units: 'pixel',
      extent: this.props.extent,
    });
  }

  setImage(url: string) {
    const projection = this.createContentProjection();
    this.imageLayer.setSource(
      new Static({
        url,
        projection: this.createContentProjection(),
        imageExtent: this.props.extent,
      })
    );

    this.map.setView(
      new View({
        projection,
        center: getCenter(this.props.extent),
        zoom: 1.308,
        minZoom: 1.308,
      })
    );

    this.getOcr(this.props.page);
  }

  getImage(url: string) {
    this.imageLayer = new ImageLayer({
      source: new Static({
        url,
        projection: this.createContentProjection(),
        imageExtent: this.props.extent,
      }),
    });

    const img = document.createElement('img');
    img.src = url;

    img.onload = () => {
      this.initMap(img.src);
      this.getOcr(1);
    };
  }

  initMap(url: string) {
    this.map = new Map({
      view: new View({
        projection: this.createContentProjection(),
        center: getCenter(this.props.extent),
        zoom: 1.308,
        minZoom: 1.308,
      }),
      layers: [
        this.imageLayer,
        new VectorLayer({
          source: this.source,
          style: normalStyle,
        }),
        new VectorLayer({
          source: this.drawSource,
          style: polygonStyleFunction(),
        }),
      ],
      target: 'js-map',
    });

    this.map.on('pointerdown', this.handlePointerDown);
    this.map.addInteraction(this.dragBox);
  }

  handlePointerDown = (event: any) => {
    const eventPixel = this.map.getEventPixel(event.originalEvent);

    if (this.map.hasFeatureAtPixel(eventPixel, this.source)) {
      this.map.forEachFeatureAtPixel(eventPixel, (feature: any) => {
        if (this.selected.indexOf(feature) === -1) {
          this.addFeature(feature);
        } else {
          this.selected.splice(this.selected.indexOf(feature), 1);
          feature.setStyle(normalStyle);
        }

        // re-draw rectangle selection
        this.drawRectangleSelection(this.selected);
      });
    } else {
      this.toggled && this.clearSelected();
    }
  };

  addFeature(feature: any) {
    feature.setStyle(highlightStyle);
    this.selected.push(feature);
  }

  clearSelected = () => {
    this.setState({ ...this.state, previewText: '' });
    this.drawSource.clear();
    this.selected.forEach((feature: any) => {
      feature.setStyle(undefined);
    });
    this.selected = [];
  };

  // a DragBox interaction used to select features by drawing boxes

  getOcr(page: number) {
    this.source.clear();
    this.source.addFeatures(
      drawOcr(OcrJson.readResults[page - 1], this.props.extent)
    );
  }

  drawRectangleSelection(features: Feature[]) {
    if (features.length === 0) {
      this.clearSelected();
      return;
    }

    let x1 = 100000;
    let x2 = 0;
    let y1 = 100000;
    let y2 = 0;
    let rectangleCoordinates: any[] = [];

    features.forEach((feature: Feature) => {
      const xyArr = feature.getGeometry().getCoordinates()[0];

      xyArr.forEach((coordinate: number[]) => {
        x1 = x1 < coordinate[0] ? x1 : coordinate[0];
        y1 = y1 < coordinate[1] ? y1 : coordinate[1];

        x2 = x2 > coordinate[0] ? x2 : coordinate[0];
        y2 = y2 > coordinate[1] ? y2 : coordinate[1];
      });
    });

    const margin = 5;
    x1 = x1 - margin;
    x2 = x2 + margin;
    y1 = y1 - margin;
    y2 = y2 + margin;

    rectangleCoordinates = [
      [x1, y2],
      [x2, y2],
      [x2, y1],
      [x1, y1],

      [x1, y2],
    ];

    const rectangle = new Feature({
      geometry: new Polygon([rectangleCoordinates]),
    });

    rectangle.setProperties({
      id: 'iD' + Math.random(),
      text: 'VALUE',
    });
    rectangle.setId(Math.random());

    this.drawSource.clear();
    this.drawSource.addFeature(rectangle);

    const textSelected = this.selected
      .sort((a: any, b: any) => (a.get('order') > b.get('order') ? 1 : -1))
      .map((feature: Feature) => feature.get('text'))
      .join(' ');

    this.setState({ ...this.state, previewText: textSelected });
  }

  selectOcrFeatures = () => {
    this.clearSelected();

    const extent = this.dragBox.getGeometry().getExtent();

    const features: Feature[] = [];
    this.source.forEachFeatureIntersectingExtent(extent, (feature: any) => {
      features.push(feature);
      this.addFeature(feature);
    });

    this.drawRectangleSelection(features);
  };

  toggleCtrl = () => this.toggled;

  toggle = () => {
    this.toggled = !this.toggled;
  };

  public render() {
    return (
      <>
        <div id="js-map"></div>
        <div className="content-box">
          <button onClick={this.clearSelected}>Clean Selected</button>
          <button onClick={this.toggle}>Toggle</button>

          <div className={`preview ${this.state.previewText ? 'in' : 'out'}`}>
            <p>{this.state.previewText}</p>
          </div>
        </div>
      </>
    );
  }
}
