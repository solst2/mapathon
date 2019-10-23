import { MapLayer } from "react-leaflet";
import L from "leaflet";
import { withLeaflet } from "react-leaflet";
import  gpx from "leaflet-gpx/gpx"
import  samplegpx from  './gpx/sample.gpx'

class GPXtest extends MapLayer {
    createLeafletElement() {
        let {map} = this.props;

        let leafletElement =  new  L.GPX(samplegpx, {async: true}).on('loaded', function(e) {
            map.fitBounds(e.target.getBounds());
        });
        return leafletElement;
    }
}
export default withLeaflet(GPXtest);