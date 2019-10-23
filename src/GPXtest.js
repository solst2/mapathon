import {MapControl, MapLayer} from "react-leaflet";
import L from "leaflet";
import { withLeaflet } from "react-leaflet";
import  gpx from "leaflet-gpx/gpx"
import  samplegpx from  './gpx/sample.gpx'
import * as ReactDOM from "react-dom";
import React from "react";

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

function SynchMap() {
    var map1=this.mapRef.current;
    var map2=this.mapRef2.current;
    map1.sync(map2);
    map2.sync(map1);
}
class LegendControlPOI extends MapControl {


    createLeafletElement(){
        const legend = L.control({position: 'bottomright'});
        const jsx = (
            <div {...this.props}>
                {this.props.children}
            </div>
        );

        legend.onAdd = function (map) {
            let div = L.DomUtil.create('div', '');
            ReactDOM.render(jsx, div);
            return div;
        };

        this.leafletElement = legend;
    }
}
