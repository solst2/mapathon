import {MapControl} from "react-leaflet";
import L from "leaflet";
import React from "react";

export class Legend extends MapControl {
    createLeafletElement() {
        {
            const { map } = this.props;
            let legend = L.control({ position: "bottomleft" });
            legend.onAdd = function(map) {
                let div = L.DomUtil.create("div", "info legend");
                div.innerHTML =
                    "<select><option>1</option><option>2</option><option>3</option></select>";
                div.firstChild.onmousedown = div.firstChild.ondblclick =
                    L.DomEvent.stopPropagation;
                return div;
            };
            legend.addTo(map.leafletElement);
        }
    }
}