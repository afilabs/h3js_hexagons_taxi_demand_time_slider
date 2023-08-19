/* eslint-disable react-hooks/exhaustive-deps */
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Layer, Source } from "react-map-gl";
import React, { useEffect, useState } from "react";
import { cellToBoundary } from "h3-js";
import sortBy from "lodash/sortBy";
import 'rc-slider/assets/index.css';

import './MapBoxMultipleHex.scss';
import Slider from "rc-slider";
import moment from "moment";

const singaporeTaxiData = require('../data/singapore_taxi_data.json');
const singaporeTaxiHexagon = require('../data/singapore_taxi_hexagon.json');
const sortTaxiData = sortBy(singaporeTaxiData, (element) => moment(element.date_time, 'DD/MM/YYYY HH:mm:ss'))
const formatDateTime= "DD/MM/YYYY HH:mm:ss"
const firstDateTime = moment(sortTaxiData[0].date_time, formatDateTime)
const lastDateTime = moment(sortTaxiData[sortTaxiData.length - 1].date_time, formatDateTime)

const timePeriods = Object.keys(singaporeTaxiHexagon);

// console.log(timePeriods);

const dateTimes = [];
let datetime = firstDateTime;
sortTaxiData.forEach(() => {
  if (datetime.isAfter(lastDateTime)) return;
  dateTimes.push(datetime);
  datetime = moment(datetime).add(15, 'minutes')
});


function MapBox() {

    const [singaporeHexagonsArr, setSingaporeHexagonsArr] = useState([]);
    const [sliderTitle, setSliderTitle] = useState(timePeriods[0].substring(11,16) + " - " + timePeriods[0].substring(31,36));
    const [currentStep, setCurrentStep] = useState(1);

    

    const getHexagon = (step) => {
      const singaporeHexagonsObj = singaporeTaxiHexagon[dateTimes[step - 1].format(formatDateTime) + '-'+ dateTimes[step].format(formatDateTime)]
      const sgHexagonsArr = [];

      for (const hexagon in singaporeHexagonsObj) {
          sgHexagonsArr.push({
            hexindex7: hexagon,
            bookingCount: singaporeHexagonsObj[hexagon]
          });
      }
      
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

    const setStep = (step) => {

      setCurrentStep(step);
      setSliderTitle(dateTimes[step - 1].format('HH:mm') + ' - ' + dateTimes[step].format('HH:mm'))
      getHexagon(step);
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

    // setStep(1);

    // console.log("this line of code is running");

    // console.log(singaporeHexagonsArr);

    const onLoad = () => {
      const singaporeHexagonsObj = singaporeTaxiHexagon[dateTimes[0].format(formatDateTime) + '-'+ dateTimes[1].format(formatDateTime)]
      const sgHexagonsArr = [];

      for (const hexagon in singaporeHexagonsObj) {
          sgHexagonsArr.push({
            hexindex7: hexagon,
            bookingCount: singaporeHexagonsObj[hexagon]
          });
      }

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
              <h4 className="slider-title">Time Window: {sliderTitle}</h4>
              <Slider
                onChange={setStep}
                min={1}
                max={dateTimes.length - 1}
                defaultValue={currentStep}
                value={currentStep}
              />
            </div>
          </div>
        </div>
    );
  
};
  
export default MapBox;