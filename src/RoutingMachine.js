import { MapLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { withLeaflet } from "react-leaflet";
import 'leaflet-routing-machine/dist/leaflet-routing-machine.js'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import  'leaflet-control-geocoder/dist/Control.Geocoder.js'
class Routing extends MapLayer {
    createLeafletElement() {
        const {map,route} = this.props;
        let leafletElement = L.Routing.control({
             waypoints: [L.latLng(46.272 , 7.487), L.latLng(46.283, 7.497)],
            // lineOptions: {
            //     styles: [{color: 'black', opacity: 1, weight: 5}]
            // },
            routeWhileDragging: true,
            geocoder: L.Control.Geocoder.nominatim(),
            waypointNameFallback: function(latLng) {
                function zeroPad(n) {
                    n = Math.round(n);
                    return n < 10 ? '0' + n : n;
                }
                function sexagesimal(p, pos, neg) {
                    var n = Math.abs(p),
                        degs = Math.floor(n),
                        mins = (n - degs) * 60,
                        secs = (mins - Math.floor(mins)) * 60,
                        frac = Math.round((secs - Math.floor(secs)) * 100);
                    return (n >= 0 ? pos : neg) + degs + '°' +
                        zeroPad(mins) + '\'' +
                        zeroPad(secs) + '.' + zeroPad(frac) + '"';
                }

                return sexagesimal(latLng.lat, 'N', 'S') + ' ' + sexagesimal(latLng.lng, 'E', 'W');
            }
        }).addTo(map.leafletElement);
        return leafletElement.getPlan();
    }
}
export default withLeaflet(Routing);