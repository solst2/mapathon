import React, {useState,Component,useEffect,useRef} from 'react';
import * as eeGeo from 'wrld.js';
import {WrldMarkerController} from 'wrld.js'
class Map3d extends React.Component {

    constructor(props)
    {
        super(props);
        this.state={Map:this.props.Map,POIs:this.props.pois}
    }

    componentDidMount() {
        // create map
        this.map = eeGeo.map("mapxyz", "f5b88ae29a890a0e9be2b4d3a8d23870", {
            center:[0,0],
            zoom:1,
            crs:this.props.crs
        },onclick={});
        this.map.on('click', function(e) {
         //   alert(e.latlng);
           // console.log("my position : "+this.state.Map.center);
        });


        var keys = Object.keys(this.map);

        var getKeys = function(obj){
            var keys = [];
            for(var key in obj){
                keys.push(key);
            }
            return keys;
        }

        console.log("map "+keys)
        this.props.pois.map((poi)=>
            eeGeo.marker({lng:poi.lng,lat:poi.lat}, { title: "My marker" }).addTo(this.map))


      //  var marker = eeGeo.marker([37.7858, -122.401], { title: "My marker" }).addTo(this.map);

    }

componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
    this.map.setView(this.props.Map.center, 1, {
        animate: false
    });
    this.props.pois.map((poi)=>
        eeGeo.marker({lng:poi.lng,lat:poi.lat}, { title: "My marker" }).addTo(this.map))

}

    render() {
        return <div><button onClick={this.test}>{}Merge</button><div id="mapxyz"></div></div>
    }
    test=(e)=>
    {

        this.map.options.center=this.props.Map.center;
        //  this.map._cameraModule.;
        console.log(this.map.options.center)
        this.map.setView(this.props.Map.center, 1, {
            animate: false
        });
    }
}

export default Map3d;
