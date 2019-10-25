import React, {useState,Component,useEffect,useRef} from 'react';
import './App.css';
import L from 'leaflet';
import { Circle, FeatureGroup, LayerGroup, LayersControl, Map, Marker, Popup, Rectangle, TileLayer,MapControl } from 'react-leaflet';
import {latLng, marker} from "leaflet/dist/leaflet-src.esm";
import {closestPointOnSegment} from "leaflet/src/geometry/LineUtil";
import {City,CityForm,CityMarker,CitiesList} from "./Cities";
import {useAuth0} from "./react-auth0-spa";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import POI from "./components/POI";
import requestPOI from './requestPOI';
import Control from 'react-leaflet-control';
import * as ReactDOM from "react-dom";
import targetIcon from './icons/target.png';
import positionIcon from './icons/postionIcon.png';
import grp4IconImg from './icons/pin/green_pin.png';
import grp3IconImg from './icons/pin/blue_pin.png';
import grp2IconImg from './icons/pin/orange_pin.png';
import grp1IconImg from './icons/pin/red_pin.png';
import  currentPosition from './icons/my_position.gif'
// import Map3d from './3dMa'
// import 'leaflet.sync/L.Map.Sync'
import Div from "./Div";
const {  BaseLayer, Overlay} = LayersControl
const center = [51.505, -0.09]
const rectangle = [[51.49, -0.08], [51.5, -0.06]]

//main app, at the top of the tree
function AppWrapper() {
  const { isAuthenticated, loginWithRedirect, loading,getTokenSilently,logout,user } = useAuth0();
  let [poisList, setPoisList] = useState([]);
  let [isSat,setSat]=useState(false);

  //get the pois on load
  useEffect(() => {
    const fn = async () => {
      if (loading === false ) {
          let poisList = requestPOI.getAllPOI(getTokenSilently,loginWithRedirect);
        console.log('Load');
        if (poisList.length > 0) {
          console.log(poisList);
          setPoisList(poisList);
        }
        };
      }
    fn();
  }, [isAuthenticated, loginWithRedirect, loading]);

  async function addPOI(newPOI)
  {
    console.log('new POIIII added'+{...newPOI});
    if (newPOI.id === undefined){
      return await requestPOI.addNewPOI(newPOI,getTokenSilently,loginWithRedirect)
    } else {
      return await requestPOI.updatePOI(newPOI.id,newPOI,getTokenSilently,loginWithRedirect)
    }
  }

  async function deletePOI(poi)
  {
    console.log('poi delete');
    return await requestPOI.deletePOI(poi.id,getTokenSilently,loginWithRedirect);
  }

  if (loading) {
    return <Loading />;
  }

  let handlePOIsClick = async e => {
    e.preventDefault();
    let poisList = await request(
        `${process.env.REACT_APP_SERVER_URL}${endpoints.pois}?group=4`,
        getTokenSilently,
        loginWithRedirect
    );
    setSat(true)

    if (poisList && poisList.length > 0) {
      setPoisList(poisList);
      // setPoisList(poisList.filter((poi)=>poi.group!=0));
    }
  };

  function userlogout()
  {
   if (isAuthenticated)
      logout()
  }

  //called once to button start is pressed
  function AfterLoad(props) {
    return (
        <div>
          <div className="sidebar"  id="sidebar">
            <a className="active" href="#home">Map</a>
            {isAuthenticated && <button className="ButtonLogout" onClick={() => logout()}>Log out</button>}
          </div>

        <div  class="content">


          <div className="w3-teal">
            <div className="w3-container">
              <App poisList={props.poisList} addPOI={addPOI} deletePOI={deletePOI}  currentUser={user} key="app" user={user}></App>
            </div>
          </div>

        </div>
        </div>
    );
  }

  //while the button start is not pressed
  function BeforLoad(props) {
    return (
        <div className="App">
          {isAuthenticated && <button onClick={() => logout()}>Log out</button>}
          <header className="App-header">
            <h1>Mapathon </h1>
            {isAuthenticated && <h2>Welcome {user.nickname} {user.id_token}</h2>}
            {isAuthenticated &&    <img src={user.picture} style={{width: 100 + 'px', height: 100 + 'px'}}/>}
            {isAuthenticated &&   <h3>{user.sub}</h3>}
            <br />
            <br />
            <button className={'ButtonBar'} onClick={handlePOIsClick}>Start</button>
          </header>

        </div>

    );
  }

  if(isSat)
    return <AfterLoad poisList={poisList}/>
  else
    return <BeforLoad/>
      }

//enable you to get your geoloaction
export function GeoLocat(props){

  let [laltitude, setLaltitude] = useState([]);
  let [longtitude, setLongtitude] = useState([]);
  let [available, setAvailable] = useState(false);
  let [message, setMessage] = useState('Browser does not support geolocation.');

  var myPostionIcon = L.icon({
    iconUrl:currentPosition,
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

  function getError(error){
    {(() => {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          setMessage('permission denied for geolocation');
          setAvailable(false);
          break;
        case error.TIMEOUT:
          setMessage('timeout geolocation');
          setAvailable(false);
          break;
        case error.POSITION_UNAVAILABLE:
          setMessage('position unavailable for geolocation');
          setAvailable(false);
          break;
        case error.UNKNOWN_ERROR:
          setMessage('unknown error for geolocation');
          setAvailable(false);
          break;
      }
    })()}
  }

  (navigator.geolocation) ?
      navigator.geolocation.getCurrentPosition(getPosition, getError) :
      setAvailable(false);
  //console.log( {laltitude}+"   "+ {longtitude});
  return(available) ? <Marker position={{lat:laltitude,lng:longtitude}} icon={myPostionIcon}>
    <Popup>
      My Position
    </Popup>
  </Marker>: <p>{message}</p>

}

function MenuOptions(props) {
  let [text, setText] = useState('Create new POI');
  let [filter, setFilter] = useState('Filter POIs');
  let [showFilterInput, setShowFilterInput] = useState(false);

  let handleFilterClick = async e => {
    setShowFilterInput(true);
    setFilter('Filter activated');
  };

  return (<div>
    <button onClick={handleFilterClick} className="ButtonBar">{filter}</button>
    <br/>
    {showFilterInput ? <input onChange={props.handleFilter}/>:null}
    {showFilterInput ? <div><input type="checkbox" checked={props.justOwn} onChange={props.handleJustOwnClick}/><small>Show own POI</small></div>:null}
  </div>)
}

//App class at the second level of the tree
class App extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef()
    this.leafletMap = React.createRef()
      this.domElem = React.createRef();
    this.state = {
      markers: [],
      POIs: [],
      filteredPois:[],
      filteredPoisToShow:[],
      Routes:[],
      geoLat:'',
      geoLng:'',
      message:'Browser does not support geolocation.',
      available:false,
      Map:{ minZoom :2,
        center:[0, 5],
        zoom:2},
      isMapInit: false,
      active:false,
      checkall:false,
      groupvalue:0,
      citiesData:[
        { name: "Tokyo", coordinates: [139.6917, 35.6895], population: 37843000 ,displayed:true},
        { name: "Jakarta", coordinates: [106.8650, -6.1751], population: 30539000 ,displayed:false},
        { name: "Delhi", coordinates: [77.1025, 28.7041], population: 24998000 ,displayed:false},
        { name: "Seoul", coordinates: [126.9780, 37.5665], population: 23480000 ,displayed:false},
        { name: "Shanghai", coordinates: [121.4737, 31.2304], population: 23416000 ,displayed:false},
        { name: "Karachi", coordinates: [67.0099, 24.8615], population: 22123000 ,displayed:false},
        { name: "Beijing", coordinates: [116.4074, 39.9042],population: 21009000 ,displayed:false},
        { name: "Mumbai", coordinates: [72.8777, 19.0760],population: 17712000 ,displayed:false},
        { name: "Osaka", coordinates: [135.5022, 34.6937], population: 17444000 ,displayed:false},
        { name: "Moscow", coordinates: [37.6173, 55.7558], population: 16170000 ,displayed:false},
        { name: "Dhaka", coordinates: [90.4125, 23.8103], population: 15669000 ,displayed:false},
        { name: "Bangkok", coordinates: [100.5018, 13.7563],population: 14998000 ,displayed:false},
        { name: "Kolkata", coordinates: [88.3639, 22.5726], population: 14667000 ,displayed:false},
        { name: "Istanbul", coordinates: [28.9784, 41.0082], population: 13287000 ,displayed:true},
      ]
    };

  }

  //scroll on the map when you click on a marker
  scrollToMyRef = () => window.scrollTo(0, this.leafletMap);
  componentDidMount() {
    var result = this.props.poisList.map(el => {
      var o = Object.assign({}, el);
      o.isSaved = true;
      return o;
    });

    this.setState({POIs:result});
    this.changeOfPois();

    console.log('POIS'+this.state.POIs.length)
  }

  updateCities = ( cities ) => {
    this.setState({citiesData: cities});

  };

  //add a marker when you clic on the map
  addMarker = (e) => {
    const pois=this.state.POIs;
    var newPoi={lat:e.latlng.lat,lng:e.latlng.lng,name:'',description:'',"group": 4,isSaved:false,Creator:{id:this.props.currentUser.sub}}
    console.log('Point '+newPoi.id+ ' at '+newPoi.lat +"/"+newPoi.lng);
    pois.push(newPoi);
    this.state.Map.zoom=3;
    this.state.Map.center=[e.latlng.lat,e.latlng.lng];
    this.setState({POIs:pois});
    this.changeOfPois();
  };
    getElem = () => {
        return this.domElem;
    }
  deleteMarker= (e) =>  {
    let deletedPOI = this.state.POIs.find(poi=>poi.name==e.target.value);
    if (deletedPOI.Creator.id === this.props.user.sub) {
      if (window.confirm('Are you sure you wish to delete this point of interest?')) {
        console.log("answer: "+this.props.deletePOI(deletedPOI)+":");
        const POIs = this.state.POIs.filter(item => item !== deletedPOI);
        this.setState({POIs: POIs});
        this.changeOfPois();
      } else {
        window.alert('You are not allowed to delete this.');
      }
    }
  };

  upGeoLocalisation=(position)=>
  {
    this.setState({geoLat:position.coords.latitude});
    this.setState({geoLng:position.coords.longitude});
  };

  updatePOIs= (pois) => {
    this.setState({POIs: pois});
  };

  zoomOnMarker= (e) =>
  {
    this.scrollToMyRef();
    let map = this.state.Map;
    map.zoom=15;
    console.log(e.target.value);
    let lat=this.state.POIs.find(poi=> poi.name==e.target.value).lat;
    let lng =this.state.POIs.find(poi=> poi.name==e.target.value).lng;
    map.center=[lat,lng];

    this.setState({Map:map});
  };

  //zoom on the my location
  ZoomOnMyLoca= (e) =>
  {
    this.scrollToMyRef();
    let map = this.state.Map;
    map.zoom=17;

    map.center=[this.state.geoLat,this.state.geoLng];

    this.setState({Map:map});
  };

  // DisplayGroup= (e) =>
  // {
  //   console.log("changed"+" gr : "+e.target.value);
  //   let poisFiltered=this.state.POIs.filter((poi) => poi.group==e.target.value);
  //   this.setState({filteredPois:poisFiltered})
  // };

  handleFilter = async e => {
    console.log(e.target.value);
    this.setState({filterPoi:e.target.value});
    this.changeOfPois();
  };

  handleJustOwnClick = e => {
    console.log("Change just show own to:"+!this.state.justOwn);
    this.setState((state, props) => ({justOwn:!state.justOwn}),this.changeOfPois);
  };

  changeOfPois = () =>{
    console.log("filter Poi:"+this.state.filterPoi+":");
    console.log("showOwn:"+this.state.justOwn+":");
    if(this.state.justOwn){
      if (this.state.filterPoi !== undefined && this.state.POIs !== ''){
        this.setState((state, props) => ({filteredPoisToShow:state.POIs.filter((poi) =>{
            if (poi.Creator === undefined){
              return poi
            }
            return poi.Creator.id === props.user.sub ?
                poi.name.toLowerCase().includes(state.filterPoi.toLowerCase()) ? poi : poi.description.toLowerCase().includes(state.filterPoi.toLowerCase()) :
                null
          })}))
      } else{
        this.setState((state, props) => ({filteredPoisToShow:state.POIs.filter((poi) =>{
            if (poi.Creator === undefined){
              return poi
            }
            return poi.Creator.id === props.user.sub ? poi : null
          })}))
      }
    } else if (this.state.filterPoi !== '' && this.state.filterPoi !== undefined){
      this.setState((state, props) => ({filteredPoisToShow:state.POIs.filter((poi)=>{
          return poi.name.toLowerCase().includes(state.filterPoi.toLowerCase()) ? poi : poi.description.toLowerCase().includes(state.filterPoi.toLowerCase())
        })}) )
    } else {
      this.setState((state,props)=> ({filteredPoisToShow: state.POIs}))
    }
  };

  render() {
    let filteredCities = this.state.citiesData.filter((city) => city.displayed);
    //let filterPOIs = this.state.POIs.filter((poi) => poi.user.Creator.id==this.props.currentUser);
    // let filterPOIs = this.state.POIs.filter((poi) => poi.group==this.state.groupvalue);

    return (
      <div >
        <div>Overview of Points of Interest (POIs)</div>
                    <Map className="map"
                         id="map"
                         minZoom ={this.state.Map.minZoom}
                         center={this.state.Map.center}
                         view={this.state.Map.view}
                         onClick={this.addMarker}
                         zoom={this.state.Map.zoom}
                         ref={m => { this.leafletMap = m; }}>
                      <div>Zrd</div>
                      <LayersControl>
                        <BaseLayer checked name="Default">
                          <TileLayer
                              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'/>
                        </BaseLayer>
                        <BaseLayer  name="Satelit">
                          <TileLayer
                              attribution='&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                              url='http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

                          />
                        </BaseLayer>
                        <BaseLayer name="hot">
                          <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
                              url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'

                          />
                        </BaseLayer>
                        <BaseLayer name="Topo">
                          <TileLayer
                              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                              url='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'

                          />
                        </BaseLayer>
                        <BaseLayer name="FR">
                          <TileLayer
                              attribution='&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url='https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'

                          />
                        </BaseLayer>
                        <BaseLayer name="DE">
                          <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'

                          />
                        </BaseLayer>
                        <Overlay name="My poi">
                          <LayerGroup>
                            { this.state.filteredPoisToShow.filter((poi)=>poi.Creator.id==this.props.currentUser.sub).map((poi) =>
                                <POIMarker group={poi.group} addPOI={this.props.addPOI} isSaved={poi.isSaved} lat={poi.lat} lng={poi.lng} poi={poi} updatePOIs={this.updatePOIs} poisList={this.state.filteredPoisToShow} id={poi.id}/>
                            )}
                          </LayerGroup>
                        </Overlay>
                        <Overlay key="pois" name="pois" checked>
                          <LayerGroup>
                            { this.state.filteredPoisToShow.map((poi) =>
                                <POIMarker addPOI={this.props.addPOI} isSaved={poi.isSaved} lat={poi.lat} lng={poi.lng} poi={poi} updatePOIs={this.updatePOIs} poisList={this.state.POIs} id={poi.id}/>
                            )}
                          </LayerGroup>
                        </Overlay>
                        <Overlay checked name="my position">
                            <LayerGroup>
                               <GeoLocat upGeoLocalisation={this.upGeoLocalisation}></GeoLocat>
                            </LayerGroup>
                        </Overlay>

                        </LayersControl>

                        <Control position="topleft" >
                          <img src={targetIcon} onClick={this.ZoomOnMyLoca} width={20} height={20}></img>
                        </Control>
                      {/*  <Control position="topleft" >*/}
                      {/*    <div>Group</div>*/}
                      {/*    <select onChange={this.DisplayGroup} >*/}
                      {/*      <option value={0}>None</option>*/}
                      {/*      <option value={1}>Group 1</option>*/}
                      {/*      <option value={2}>Group 2</option>*/}
                      {/*      <option value={3}>Group 3</option>*/}
                      {/*      <option value={4}>Group 4</option>*/}
                      {/*    </select>*/}
                      {/*  </Control>*/}
                      {/*  <Control position="topleft" >*/}
                      {/*    <div>Group</div>*/}
                      {/*<s/>*/}
                      {/*  </Control>*/}

                      {/*{this.state.Map!=null &&   <Div user={this.props.currentUser} geoLat={this.state.geoLat} geoLng={this.state.geoLng} Map={this.state.Map} pois={this.state.POIs} snycMap={this.snycMap}/>}*/}

                    </Map>

        <button className={'ButtonBar'} onClick={this.ZoomOnMyLoca} >Where am I..?</button>
        <MenuOptions handleFilter={this.handleFilter} handleJustOwnClick={this.handleJustOwnClick} justOwn={this.state.justOwn}/>
        <div>
            <ul className="POI-List">
              {this.state.filteredPoisToShow.map(poi => (

                    <POI {...poi} zoomOnMarker={this.zoomOnMarker} deleteMarker={this.deleteMarker}/>

              ))}
            </ul>
        </div>
      </div>
    );
  }
  snycMap(map2)
  {
  this.leafletMap.leafletMap.sync(map2);
   // map2.sync(this.leafletMap);
  }
}


class POIMarker extends  React.Component{
  constructor(props) {
    super(props);
    this.state = {
      // Empty POIForm object for holding form input values
      newPOI: {
        id:this.props.poi.id,
        name:this.props.poi.name,
        description:this.props.poi.description,
        position:{lng:this.props.poi.lng,lat:this.props.poi.lat},
        image:this.props.poi.image,
        url:this.props.poi.url,
        isSaved:props.isSaved,
        group:this.props.poi.group,
        icon:''
      }
    };
  }

  updatePOI = (poi) => {
    this.setState({newPOI: poi});
  };

  render() {
    let {updatePOIs,poisList,id,addPOI} = this.props;
    let position={lat:this.props.lat,lng:this.props.lng};

    var myIcon = L.icon({
      iconUrl:getIcon({group:this.state.newPOI.group}),
      iconSize: [20, 30],
      iconAnchor: [10, 30],
      popupAnchor: [0, -20]
    });


    if(this.state.newPOI.isSaved)
      return (
          <div>
            <Marker elevation={260.0}  position={position} icon={myIcon} draggable='true'>
              <Popup>
                <h1>{this.state.newPOI.name}</h1>
                <p>{this.state.newPOI.description}</p>
                <p>{this.state.newPOI.group}</p>
                <img width={100} height={100} src={this.state.newPOI.image}></img>
                <span><img width={10} height={10} src="https://image.flaticon.com/icons/svg/61/61456.svg" onClick= { (e) => {this.state.newPOI.isSaved=false; this.updatePOI(this.state.newPOI)}} /><br/></span>
              </Popup>
            </Marker>
          </div>
      );
    else
      return (
          <div >
            <Marker position={position} icon={myIcon}>
              <Popup>
                <POIForm addPOI={addPOI} updatePOIs={updatePOIs} poisList={poisList} updatePOI={this.updatePOI} position={position} id={id}/>
              </Popup>
            </Marker>
          </div>
      )
  }
}

function getIcon({ group, category }) {
          switch(group) {
            case 1:return grp1IconImg;
            case 2:return grp2IconImg;
            case 3:return grp3IconImg;
            case 4:return grp4IconImg;
            default :return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII='
              ;

        }

  ;
}

class POIForm extends React.Component {
  constructor(props) {
    super(props);
    let poiInfo=props.poisList.find(poi=> poi.id==props.id);
    this.state = {
      newPOI: {
        id:poiInfo.id,
        name:poiInfo.name,
        description:poiInfo.description,
        isSaved: false,
        image:poiInfo.image,
        url:poiInfo.url,
        group:4,
        lat: this.props.position.lat,
        lng: this.props.position.lng,
        tag:''
      }
    };
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState(prevState => ({
      newPOI: { ...prevState.newPOI, [name]: value }
    }));
  };

  handlePOIAdd = event => {
    // Avoid reloading the page on form submission
    event.preventDefault();
    console.log('added'+this.state.newPOI.id);
    this.state.newPOI.isSaved=true;
    this.props.updatePOI(this.state.newPOI);
    this.props.addPOI(this.state.newPOI);
    let updatedPoisData = this.props.poisList;
    let updatedPOI = updatedPoisData.find((c) => c.id === this.state.newPOI.id);
    updatedPOI.name = this.state.newPOI.name;
    updatedPOI.description =this.state.newPOI.description;
    this.props.updatePOIs(updatedPoisData);
  };

  render() {
    return (

        <div>
          <form onSubmit={this.handlePOIAdd}>
            <p>Save a point at {this.props.position.lat.toFixed(2)}  {this.props.position.lng.toFixed(2)} </p>
            <FormInput
                type="text"
                name="name"
                placeholder="Name"
                value={this.state.newPOI.name}
                onChange={this.handleInputChange}

            />
            <textarea
                type="text"
                name="description"
                placeholder="Description"
                value={this.state.newPOI.description}
                onChange={this.handleInputChange}
            />
            <FormInput
                type="text"
                name="image"
                placeholder="Image"
                value={this.state.newPOI.image}
                onChange={this.handleInputChange}

            />
            <FormInput
                type="text"
                name="url"
                placeholder="URL"
                value={this.state.newPOI.url}
                onChange={this.handleInputChange}

            />
            <FormInput
                type="text"
                name="tag"
                placeholder="Tags"
                value={this.state.newPOI.tag}
                onChange={this.handleInputChange}

            />
            <br />
            <button className={'ButtonBar'} type="submit">Save</button>
            <br />
            <br />
          </form>
        </div>
    );
  }
}

export function FormInput({
                            type,
                            name,
                            placeholder,
                            value,
                            onChange,
                            fieldRef
                          }) {
  return (
      <>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            required
            value={value}
            onChange={onChange}
            ref={fieldRef}
        />
        <br />
      </>
  );
}

class Legend extends MapControl {
  createLeafletElement() {
    {
      const {map} = this.props;
      let legend = L.control({position: 'bottomleft'});
      legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = '<select><option>1</option><option>2</option><option>3</option></select>';
        div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
        return div;
      };
      legend.addTo(map.leafletElement);
    }
  }
}

export default AppWrapper;
