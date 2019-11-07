import L from "leaflet";
import currentPosition from "../icons/my_position.gif";
import { Marker, Popup } from "react-leaflet";
import React, { useState } from "react";

export default function GeoLocat(props) {
  let [laltitude, setLaltitude] = useState([]);
  let [longtitude, setLongtitude] = useState([]);
  let [available, setAvailable] = useState(false);
  let [message, setMessage] = useState("Browser does not support geolocation.");



  function getPosition(position) {
    setLaltitude(position.coords.latitude);
    setLongtitude(position.coords.longitude);

    setAvailable(true);
    props.upGeoLocalisation({lat:position.coords.latitude,lng:position.coords.longitude});
  }

  function getError(error) {
    {
      (() => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setMessage("permission denied for geolocation");
            setAvailable(false);
            break;
          case error.TIMEOUT:
            setMessage("timeout geolocation");
            setAvailable(false);
            break;
          case error.POSITION_UNAVAILABLE:
            setMessage("position unavailable for geolocation");
            setAvailable(false);
            break;
          case error.UNKNOWN_ERROR:
            setMessage("unknown error for geolocation");
            setAvailable(false);
            break;
        }
      })();
    }
  }

  navigator.geolocation
    ? navigator.geolocation.getCurrentPosition(getPosition, getError)
    : setAvailable(false);
  //console.log( {laltitude}+"   "+ {longtitude});
  return available ? (
   <div/>
  ) : (
    <p>{message}</p>
  );
}
