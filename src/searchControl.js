import L from "leaflet";
import  'leaflet-control-geocoder/dist/Control.Geocoder.js'
import 'leaflet-search-control/src/Leaflet.search.js'
import 'leaflet-search-control/src/Leaflet.search.css'

import {MapControl, withLeaflet} from "react-leaflet";

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

class Search extends MapControl {

    createLeafletElement() {
        return GeoSearchControl({
            provider: new OpenStreetMapProvider(),
            style: 'bar',
            showMarker: true,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: false,
            searchLabel: 'search'
        });
    }
}

export default withLeaflet(Search);