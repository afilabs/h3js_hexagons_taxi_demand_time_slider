import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Layer, Source } from "react-map-gl";
import React, { useState } from "react";
import { cellToBoundary } from "h3-js";

import './MapBoxTimelineSlider.scss';
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';

const singaporeTaxiHexagons = require('../data/singapore_taxi_hexagons.json');
const timePeriods = Object.keys(singaporeTaxiHexagons);

function MapBox() {

    const [singaporeHexagonsArr, setSingaporeHexagonsArr] = useState([]);
    const [sliderTitle, setSliderTitle] = useState(timePeriods[0].substring(11,16) + " - " + timePeriods[0].substring(31,36));
    const [currentStep, setCurrentStep] = useState(0);

    const updateHexagonData = (step) => {  
      const singaporeHexagonsArr = singaporeTaxiHexagons[timePeriods[step]];
      const sgHexagonsArr = [];
      singaporeHexagonsArr.forEach(singaporeHexagon => {
        sgHexagonsArr.push({
          hexindex7: singaporeHexagon.key,
          bookingCount: singaporeHexagon.count
        });
      })
        
        const rs = sgHexagonsArr.map((row) => {
            const style = getStyle(row);
            return {
              type: "Feature",
              properties: {
                color: style.color,
                opacity: style.opacity,
                id: row.hexindex7,
              },
              geometry: {
                type: "Polygon",
                coordinates: [cellToBoundary(row.hexindex7, true)],
              },
            };
        });
  
        setSingaporeHexagonsArr(rs);
      }

    const handleSliderChange = (step) => {
        setCurrentStep(step);
        setSliderTitle(timePeriods[step].substring(11,16) + " - " + timePeriods[step].substring(31,36))
        updateHexagonData(step);
    };

    const getStyle = (row) => {
        const styles = [
          {
            color: '#FEDD87',
            opacity: 0.2
          },
          {
            color: '#FED976',
            opacity: 0.4
          },
          {
            color: "#FC9653",
            opacity: 0.6,
          },
          {
            color: "#F77645",
            opacity: 0.7
          },
          {
            color: "#E14C48",
            opacity: 0.8
          }
        ];
    
    
        if (Number(row.bookingCount) === 0) {
          return {opacity: 0};
        }
    
        if (Number(row.bookingCount) < 250) {
          return styles[0];
        }
        if (Number(row.bookingCount) < 500) {
          return styles[1];
        }
        if (Number(row.bookingCount) < 1000) {
          return styles[2];
        }
        if (Number(row.bookingCount) < 1500) {
          return styles[3];
        }
        return styles[4];
    };

    const onLoad = () => {
        console.log("onLoad() called");
        updateHexagonData(0);
    };

    return (
      
        <div className="wrapper">
          <div className="map">
            <Map
              initialViewState={{
                latitude: 1.290270,
                longitude: 103.851959,
                zoom: 10,
                bearing: 0,
                pitch: 0,
              }}
              mapStyle="mapbox://styles/mapbox/light-v9"
              mapboxAccessToken="pk.eyJ1IjoidGhlcHJvZiIsImEiOiJja3Q5amlqaXgxNjUwMm5wY3NrdmplbzVxIn0.C3zhU7lekidOJmARhNyBdw"
              style={{
                height: "100vh",
                width: "100vw",
              }}
              onLoad={onLoad}
            >
              <Source
                type="geojson"
                data={{
                  type: "FeatureCollection",
                  features: singaporeHexagonsArr
                }}
              >
                <Layer
                  {...{
                    id: "polyline-layer",
                    type: "fill",
                    paint: {
                      'fill-outline-color': 'white',
                      "fill-color": ["get", "color"],
                      "fill-opacity": ["get", "opacity"],
                    },
                  }}
                />
              </Source>  
            </Map>
          </div>
          <div className="session">
            <h4 className="slider-title">Taxi Demand</h4>
            <div className="row colors"></div>
            <div className="row labels">
              <div className="label">1</div>
              <div className="label">250</div>
              <div className="label">500</div>
              <div className="label">1000</div>
              <div className="label">1500+</div>
            </div>
            <div className="slider">
              <h4 className="slider-title">Time Window: ({sliderTitle})</h4>
              <Slider
                onChange={handleSliderChange}
                min={0}
                max={timePeriods.length - 1}
                defaultValue={currentStep}
                value={currentStep}
              />
            </div>
          </div>
        </div>
    );



}

export default MapBox;