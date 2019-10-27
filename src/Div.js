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
        if (this.props.user.sub == 'github|48020196')
            return (


                    <Map3d is2ddisplayed={this.props.is2ddisplayed} Map={Map} geoLat={this.props.geoLat} geoLng={this.props.geoLng} snycMap={this.props.snycMap} crs={L.CRS.EPSG3395} pois={this.props.pois}>

                    </Map3d>

            )
        else
            return (<div>d</div>)
    }

}
export default Div;