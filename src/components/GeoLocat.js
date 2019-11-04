import L from "leaflet";
import currentPosition from "../icons/my_position.gif";
import { Marker, Popup } from "react-leaflet";
import React, { useState } from "react";

export default function GeoLocat(props) {
  let [laltitude, setLaltitude] = useState([]);
  let [longtitude, setLongtitude] = useState([]);
  let [available, setAvailable] = useState(false);
  let [message, setMessage] = useState("Browser does not support geolocation.");

  var myPostionIcon = L.icon({
    iconUrl: currentPosition,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -20]
  });

  function getPosition(position) {
    setLaltitude(position.coords.latitude);
    setLongtitude(position.coords.longitude);

    setAvailable(true);
    props.upGeoLocalisation(position);
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
    <Marker position={{ lat: laltitude, lng: longtitude }} icon={myPostionIcon}>
      <Popup>My Position</Popup>
    </Marker>
  ) : (
    <p>{message}</p>
  );
}
