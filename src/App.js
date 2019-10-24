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
var myIcon = L.icon({
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=',
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -20]
});

const {  BaseLayer, Overlay} = LayersControl
const center = [51.505, -0.09]
const rectangle = [[51.49, -0.08], [51.5, -0.06]]


function AppWrapper() {
  const { isAuthenticated, loginWithRedirect, loading,getTokenSilently, user } = useAuth0();
  let [poisList, setPoisList] = useState([]);
  let [isSat,setSat]=useState(false);

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

  function addPOI(newPOI)
  {
    return requestPOI.addNewPOI(newPOI,getTokenSilently,loginWithRedirect);
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
      console.log(poisList);
      setPoisList(poisList);
    }
  };
  function updatedPOIList(newPoiList) {
    console.log('poi updated');
    setPoisList(newPoiList);
  }
  function addPOItoList(newPoi) {
    console.log('poi updated')
    var newPoiList=poisList;
    newPoiList.push(newPoi);
    setPoisList(newPoiList);

  }
  function AfterLoad(props) {
    return (
        <div className="App">
          <header className="App-header">
            <h1>Mapathon </h1>
            <br />
            <App poisList={props.poisList} addPOI={addPOI} key="app" user={user}></App>
          </header>
        </div>
    );
  }

  function BeforLoad(props) {
    return (
        <div className="App">
          <header className="App-header">
            <h1>Mapathon </h1>
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
export function GeoLocat(props){

  let [laltitude, setLaltitude] = useState([]);
  let [longtitude, setLongtitude] = useState([]);
  let [available, setAvailable] = useState(false);
  let [message, setMessage] = useState('Browser does not support geolocation.');
  var myPostionIcon = L.icon({
    iconUrl:positionIcon,
    iconSize: [30, 35],
    iconAnchor: [10, 30],
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
  console.log( {laltitude}+"   "+ {longtitude});
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

class App extends Component {

  constructor(props) {
    super(props);
    this.mapRef = React.createRef()
    this.mapRef2 = React.createRef()
    this.state = {
      markers: [],
      POIs: [],
      filteredPoisToShow:[],
      Routes:[],
      geoLat:'',
      geoLng:'',
      message:'Browser does not support geolocation.',
      available:false,
      Map:{ minZoom :1,
        center:[-0.09, 41.505],
        View:[0,0],
        zoom:1},
      isMapInit: false,
      active:false,
      justOwn:false,
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

  scrollToMyRef = () => window.scrollTo(0, this.mapRef.current.offsetTop);
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

  addMarker = (e) => {
    const pois=this.state.POIs
    var newPoi={id:this.state.POIs.length,lat:e.latlng.lat,lng:e.latlng.lng,name:'',description:'',"group": 0,isSaved:false}
    //   var test={lat:e.latlng.lat,lng:e.latlng.lng,name:'dsf',description:'sdf',"group": 0}
    console.log('Point '+newPoi.id+ ' at '+newPoi.lat +"/"+newPoi.lng)
    pois.push(newPoi)
    this.state.Map.zoom=3;
    this.state.Map.center=[e.latlng.lat,e.latlng.lng];
    this.setState(pois);
    this.changeOfPois();
    //this.props.addPOI(newPoi);
  };

  deleteMarker= (e) =>  {
    if (window.confirm('Are you sure you wish to delete this point of interest?'))
    {
      let deletedPOI = this.state.POIs.find(poi=>poi.name==e.target.value);

      const POIs= this.state.POIs.filter(item => item !== deletedPOI)
      this.setState({POIs:POIs})
      this.changeOfPois();
    }
  };

  upGeoLocalisation=(position)=>
  {
    this.setState({geoLat:position.coords.latitude})
    this.setState({geoLng:position.coords.longitude})
  };

  updatePOIs= (pois) => {
    this.setState({POIs: pois});
    this.changeOfPois();
  };

  zoomOnMarker= (e) =>
  {
    this.scrollToMyRef()
    let map = this.state.Map;
    map.zoom=15;
    console.log(e.target.value)
    let lat=this.state.POIs.find(poi=> poi.name==e.target.value).lat;
    let lng =this.state.POIs.find(poi=> poi.name==e.target.value).lng;
    map.center=[lat,lng];

    this.setState({Map:map});
  };

  zoomOnMarkerL= (e) =>
  {
    this.scrollToMyRef()
    let map = this.state.Map;
    map.zoom=15;
    console.log(e.target.value)
    let lat=this.state.POIs.find(poi=> poi.name==e.target.id).lat;
    let lng =this.state.POIs.find(poi=> poi.name==e.target.id).lng;
    map.center=[lat,lng];

    this.setState({Map:map});
  };

  ZoomOnMyLoca= (e) =>
  {
    this.scrollToMyRef();
    let map = this.state.Map;
    map.zoom=17;

    map.center=[this.state.geoLat,this.state.geoLng];

    this.setState({Map:map});
  };

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
      if (this.state.filterPoi !== undefined && this.state.filterPoi !== ''){
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

    return (
        <div >
          <Map className="map"
               id="map1"
               minZoom ={this.state.Map.minZoom}
               center={this.state.Map.center}
               view={this.state.Map.view}
               onClick={this.addMarker}
               zoom={this.state.Map.zoom}
               ref={this.mapRef}>
            <div>Zrd</div>
            <LayersControl>

              <BaseLayer checked name="Default">
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'

                />
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
              <Overlay checked name="Pois">
                <LayerGroup>
                  { this.state.filteredPoisToShow.map((poi) =>
                      <POIMarker addPOI={this.props.addPOI} isSaved={poi.isSaved} lat={poi.lat} lng={poi.lng} poi={poi} updatePOIs={this.updatePOIs} poisList={this.state.filteredPoisToShow} id={poi.id}/>

                  )}
                  { this.state.filteredPoisToShow.map((poi) =>
                      console.log(poi.lat)
                  )}

                </LayerGroup>

              </Overlay>
              <Overlay  name="cities">
                <LayerGroup>
                  {filteredCities.map((city) => {
                    return (<div ><CityMarker name={city.name} coordinates={city.coordinates} population={city.population} displayed={city.displayed} /></div>);
                  })
                  }
                </LayerGroup>
              </Overlay>
              <Overlay checked name="my position">
                <LayerGroup>
                  <GeoLocat upGeoLocalisation={this.upGeoLocalisation}></GeoLocat>
                </LayerGroup>
              </Overlay>
              <Overlay name="Feature group">
                <FeatureGroup color="purple">
                  <Popup>Popup in FeatureGroup</Popup>
                  <Circle center={[51.51, -0.06]} radius={200} />
                  <Rectangle bounds={rectangle} />
                </FeatureGroup>
              </Overlay>
            </LayersControl>
            <Control position="topleft" >
              <img src={targetIcon} onClick={this.ZoomOnMyLoca} width={20} height={20}></img>
            </Control>
            <Control position="bottomleft" >
              <div className={'poiLegend'} >
                <h3 >Points of interest</h3>
                { this.state.filteredPoisToShow.map((poi) =>
                    <div>
                      <a href={'#'} id={poi.name} onClick={this.zoomOnMarkerL}>{poi.name}</a>
                    </div>
                )}
              </div>
            </Control>

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
  genearateLayers()
  {
    let littleton = L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.'),
        denver    = L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.'),
        aurora    = L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.'),
        golden    = L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.');
    let cities = L.layerGroup([littleton, denver, aurora, golden]);

    let grayscale = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {id: 'map', attribution: '&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'}),
        satellits   = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {id: 'map', attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});

    let map = L.map('map', {
      center: [39.73, -104.99],
      zoom: 10,
      layers: [grayscale, cities]
    });
    let baseMaps = {
      "Grayscale": grayscale,
      "Satellits": satellits
    };

    let overlayMaps = {
      "Cities": cities
    };
    L.control.layers(baseMaps, overlayMaps).addTo(map);
  }
}
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

class POIMarker extends  React.Component
{
  constructor(props) {
    super(props);
    this.state = {
      // Empty POIForm object for holding form input values
      newPOI: {
        id:this.props.poi.id,
        name:this.props.poi.name,
        description:this.props.poi.description,
        position:{lng:this.props.poi.lng,lat:this.props.poi.lat},
        isSaved:props.isSaved
      }
    };
  }

  updatePOI = (poi) => {
    this.setState({newPOI: poi});
  }

  render() {

    let {updatePOIs,poisList,id} = this.props;
    let position={lat:this.props.lat,lng:this.props.lng};
    if(this.state.newPOI.isSaved)
      return (
          <div>
            <Marker position={position} icon={myIcon} draggable='true'>
              <Popup>
                <h1>{this.state.newPOI.name}</h1>
                <p>{this.state.newPOI.description}</p>
                <span><img width={10} height={10} src="https://image.flaticon.com/icons/svg/61/61456.svg" onClick= { (e) => {this.state.newPOI.isSaved=false; this.updatePOI(this.state.newPOI)}} /><br/></span>
              </Popup>
            </Marker>
          </div>
      )
    else
      return (
          <div >
            <Marker position={position} icon={myIcon}>
              <Popup>
                <POIForm updatePOIs={updatePOIs} poisList={poisList} updatePOI={this.updatePOI} position={position} id={id}/>
              </Popup>
            </Marker>
          </div>
      )
  }
}

class POIForm extends React.Component {
  constructor(props) {
    super(props);
    let poiInfo=props.poisList.find(poi=> poi.id==props.id);
    this.state = {
      newPOI: {
        id:this.props.id,
        name:poiInfo.name,
        description:poiInfo.description,
        position:'',
        isSaved: false
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
    this.state.newPOI.isSaved=true;
    this.props.updatePOI(this.state.newPOI);
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

export default AppWrapper;
