import React from "react";
import Control from "react-leaflet-control";
import Map3d from "./3dMa";
import L from "leaflet";

class Div extends React.Component{
    constructor(props)
    {super(props)

    }
    render() {
        let{Map}=this.props;
        console.log("in divi "  +this.props.geoLat)

            return (
                    <Map3d is2ddisplayed={this.props.is2ddisplayed} Map={Map} geoLat={this.props.geoLat} geoLng={this.props.geoLng} crs={L.CRS.EPSG3395} pois={this.props.pois}>

                    </Map3d>
            )

    }

}
export default Div;