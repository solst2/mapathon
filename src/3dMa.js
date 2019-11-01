// import React, {useState,Component,useEffect,useRef} from 'react';
// import * as eeGeo from 'wrld.js';
// import L from 'leaflet'
// import {on} from "leaflet/src/dom/DomEvent";
// import map2d from './icons/flatt.PNG';
// class Map3d extends React.Component {
//
//     constructor(props)
//     {
//         super(props);
//         this.state={Map:this.props.Map,POIs:this.props.pois}
//     }
//
//     componentDidMount() {
//         // create map
//         this.map = eeGeo.map("mapxyz", "f5b88ae29a890a0e9be2b4d3a8d23870", {
//             center:[0,0],
//             zoom:1,
//             crs:this.props.crs
//         },onclick={});
//         this.map.on('click', function(e) {
//          //   alert(e.latlng);
//            // console.log("my position : "+this.state.Map.center);
//         });
//
// let fucn= this.props.is2ddisplayed;
//         var keys = Object.keys(this.map);
//
//         var getKeys = function(obj){
//             var keys = [];
//             for(var key in obj){
//                 keys.push(key);
//             }
//             return keys;
//         }
//
//         console.log("map "+keys)
//       this.props.pois.map((poi)=>
//           eeGeo.marker({lng:poi.lng,lat:poi.lat}, { title: "My marker" }).addTo(this.map))
//
//         let MyControl =   L.Control.extend({
//             options: {
//                 position: 'topright'
//             },
//
//             onAdd: function (map) {
//                 // create the control container with a particular class name
//                 let container =   L.DomUtil.create('img', 'my-custom-control')
//                 L.DomEvent.addListener(container, 'click', fucn)
//                 // ... initialize other DOM elements, add listeners, etc.
//                 container.src=map2d;
//                 container.height=70
//                 container.width=80
//                 return container;
//             },
//             onClick: function () {
//
//
//                 fucn()
//             }
//         });
//
//         this.map.addControl(new MyControl());
//       //  var marker = eeGeo.marker([37.7858, -122.401], { title: "My marker" }).addTo(this.map);
//
//     }
//    callParentfunction ()
//    {
//
//    }
// componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
//     // this.map.setView(this.props.Map.center, 1, {
//     //     animate: false
//     // });
//      this.props.pois.map((poi)=>
//         eeGeo.marker({lng:poi.lng,lat:poi.lat}, { title: "My marker" }).addTo(this.map))
//
//
//
// }
//
//     render() {
//         return <div><button onClick={this.test}>{}Merge</button><div id="mapxyz"></div></div>
//     }
//     test=(e)=>
//     {
//
//         this.map.options.center=this.props.Map.center;
//         //  this.map._cameraModule.;
//         console.log(this.map.options.center)
//         this.map.setView(this.props.Map.center, 1, {
//             animate: false
//         });
//     }
// }
//
// export default Map3d;
