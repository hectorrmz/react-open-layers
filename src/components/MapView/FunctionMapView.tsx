import React, { useEffect, useState } from 'react';
// @ts-ignore
import { connect } from 'react-redux';
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

// @ts-ignore
import Polygon from 'ol/geom/Polygon';

import './MapView.scss';
import { drawOcr } from '../../utils/ocrHelper';
import * as mapActions from '../../redux/actions/mapActions';
import OcrJson from '../../assets/pdf/hector_1.ocr.json';
import { normalStyle, rectangleStyle, highlightStyle } from '../Styles';

function MapView(props: any) {
  let selected: any = [];
  let map: any;
  let imageLayer: any;
  let source: VectorSource = new VectorSource();
  let drawSource: VectorSource = new VectorSource();
  let dragBox: DragBox = new DragBox({
    condition: false,
  });

  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    dragBox.on('boxend', selectOcrFeatures);

    getImage(props.imageUri);
  }, []);

  useEffect(() => {
    //setImage(props.imageUri);
    console.log(map);
    clearSelected();
  }, [props.imageUri]);

  function createContentProjection() {
    return new Projection({
      code: 'xkcd-image',
      units: 'pixel',
      extent: props.extent,
    });
  }

  function setImage(url: string) {
    const projection = createContentProjection();
    imageLayer.setSource(
      new Static({
        url,
        projection: createContentProjection(),
        imageExtent: props.extent,
      })
    );

    map.setView(
      new View({
        projection,
        center: getCenter(props.extent),
        zoom: 1.308,
        minZoom: 1.308,
      })
    );

    getOcr(props.page);
  }

  const getImage = (url: string) => {
    imageLayer = new ImageLayer({
      source: new Static({
        url,
        projection: createContentProjection(),
        imageExtent: props.extent,
      }),
    });

    const img = document.createElement('img');
    img.src = url;

    img.onload = () => {
      initMap(img.src);
      getOcr(1);
    };
  };

  function initMap(url: string) {
    map = new Map({
      view: new View({
        projection: createContentProjection(),
        center: getCenter(props.extent),
        zoom: 1.308,
        minZoom: 1.308,
      }),
      layers: [
        imageLayer,
        new VectorLayer({
          source,
          style: normalStyle,
        }),
        new VectorLayer({
          source: drawSource,
          style: rectangleStyle,
        }),
      ],
      target: 'js-map',
    });

    map.on('pointerdown', handlePointerDown);
    map.addInteraction(dragBox);
  }

  const handlePointerDown = (event: any) => {
    const eventPixel = map.getEventPixel(event.originalEvent);

    if (map.hasFeatureAtPixel(eventPixel, source)) {
      map.forEachFeatureAtPixel(eventPixel, (feature: any) => {
        if (selected.indexOf(feature) === -1) {
          addFeature(feature);
        } else {
          selected.splice(selected.indexOf(feature), 1);
          feature.setStyle(normalStyle);
        }

        // re-draw rectangle selection
        drawRectangleSelection(selected);
      });
    } else {
      clearSelected();
    }
  };

  const addFeature = (feature: any) => {
    feature.setStyle(highlightStyle);
    selected.push(feature);
  };

  const clearSelected = () => {
    setPreviewText('');
    drawSource.clear();
    selected.forEach((feature: any) => {
      feature.setStyle(undefined);
    });
    selected = [];
  };

  // a DragBox interaction used to select features by drawing boxes

  const getOcr = (page: number) => {
    source.clear();
    source.addFeatures(drawOcr(OcrJson.readResults[page - 1], props.extent));
  };

  const drawRectangleSelection = (features: Feature[]) => {
    if (features.length === 0) {
      clearSelected();
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
      [x1, y1],
      [x2, y1],
      [x2, y2],
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

    drawSource.clear();
    drawSource.addFeature(rectangle);

    const textSelected = selected
      .sort((a: any, b: any) => (a.get('order') > b.get('order') ? 1 : -1))
      .map((feature: Feature) => feature.get('text'))
      .join(' ');

    setPreviewText(textSelected);
  };

  const selectOcrFeatures = () => {
    clearSelected();

    const extent = dragBox.getGeometry().getExtent();

    const features: Feature[] = [];
    source.forEachFeatureIntersectingExtent(extent, (feature: any) => {
      features.push(feature);
      addFeature(feature);
    });

    drawRectangleSelection(features);
  };

  return (
    <>
      <div id="js-map"></div>
      <div className="content-box">
        <button onClick={clearSelected}>Clean Selected</button>

        <div className={`preview ${previewText ? 'in' : 'out'}`}>
          <p>{previewText}</p>
        </div>
      </div>
    </>
  );
}
function MapStateToProps(state: any) {
  return {
    map: state.map,
  };
}

const MapDispatchToProps = {
  saveMap: mapActions.saveMap,
};

export default connect(MapStateToProps, MapDispatchToProps)(MapView);
