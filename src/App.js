import React, {useState,Component,useEffect,useRef} from 'react';
import './App.css';
import L from 'leaflet';
import { Circle, FeatureGroup, LayerGroup, LayersControl, Map, Marker, Popup, Rectangle, TileLayer} from 'react-leaflet';
import {latLng, marker} from "leaflet/dist/leaflet-src.esm";
import {closestPointOnSegment} from "leaflet/src/geometry/LineUtil";
import {City,CityForm,CityMarker,CitiesList} from "./Cities";
import {useAuth0} from "./react-auth0-spa";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import POI from "./components/POI";
import requestPOI from './requestPOI';
import {Geo} from "./App.old";

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
  const { isAuthenticated, loginWithRedirect, loading,getTokenSilently } = useAuth0();
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
  function UserGreeting(props) {
    return (
        <div className="App">
          <header className="App-header">
            <h1>Mapathon </h1>
            <br />
            <App poisList={props.poisList} addPOI={addPOI} key="app"></App>
          </header>
        </div>
    );
  }

  function GuestGreeting(props) {
    return (
        <div className="App">
          <header className="App-header">
            <h1>Mapathon </h1>
            <br />
            <button onClick={handlePOIsClick}>Start</button>
          </header>
        </div>
    );
  }

  if(isSat)
    return <UserGreeting poisList={poisList}/>
  else
    return <GuestGreeting/>
      }

class App extends Component {
  constructor(props) {
    super(props);
    let poisList=props.poisList;
    this.state = {
      markers: [],
      POIs: [],
      Routes:[],
      Map:{ minZoom :1,
        center:[-0.09, 41.505],
        View:[0,0],
        zoom:1},
      isMapInit: false,

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

  componentDidMount() {


    var result = this.props.poisList.map(el => {
      var o = Object.assign({}, el);
      o.isSaved = true;
      return o;
    })
    this.setState({POIs:result})


    console.log('POIS'+this.state.POIs.length)

  }
  componentDidUpdate(prevProps, prevState, snapshot) {
  }


  updateCities = ( cities ) => {
    this.setState({citiesData: cities});
  }

  addMarker = (e) => {
    const pois=this.state.POIs
    var newPoi={id:this.state.POIs.length,lat:e.latlng.lat,lng:e.latlng.lng,name:'',description:'',"group": 0,isSaved:false}
 //   var test={lat:e.latlng.lat,lng:e.latlng.lng,name:'dsf',description:'sdf',"group": 0}
    console.log('Point '+newPoi.id+ ' at '+newPoi.lat +"/"+newPoi.lng)
    pois.push(newPoi)

    this.state.Map.center=[e.latlng.lat,e.latlng.lng];
    this.setState(pois);
   //this.props.addPOI(newPoi);
  }
  deleteMarker= (e) =>  {

    ;
    let deletedPOI = this.state.POIs.find(poi=>poi.id==e.target.id);

    console.log(deletedPOI.id +' '+deletedPOI.position.lng)
    const POIs= this.state.POIs.filter(item => item !== deletedPOI)
    this.setState({POIs:POIs})
  }
  zoomOnMarker= (e) =>
  {
    let map = this.state.Map;
    map.zoom=10;
    console.log(e.target.value)
    let postion=this.state.POIs.find(poi=> poi.id==e.target.value).position
    map.center=[postion.lat,postion.lng];

    this.setState({Map:map});
  }

  updatePOIsfromParent= () => {
    this.setState({POIs: this.props.poisList});
  }
  updatePOIs= (pois) => {
    this.setState({POIs: pois});
  }
  zoomOnMarker= (e) =>
  {
    let map = this.state.Map;
    map.zoom=10;
    map.center=[postion.lat,postion.lng];
    console.log(e.target.value)
    let postion=this.state.POI.find(poi=> poi.id==e.target.value).position
    this.setState({Map:map});
  }
  render() {

    let filteredCities = this.state.citiesData.filter((city) => city.displayed);

    return (
<div>
              <Map className="map"
                   id="map"
                   minZoom ={this.state.Map.minZoom}
                   center={this.state.Map.center}
                   view={this.state.Map.view}
                   onClick={this.addMarker}
                   zoom={this.state.Map.zoom}
                   ref={this.saveMap}
              >
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
                  <Overlay checked name="Markers">
                    <LayerGroup>
                      { this.state.POIs.map((poi) =>
                   <POIMarker addPOI={this.props.addPOI} isSaved={poi.isSaved} lat={poi.lat} lng={poi.lng} poi={poi} updatePOIs={this.updatePOIs} poisList={this.state.POIs} id={poi.id}/>

                      )}
                      { this.state.POIs.map((poi) =>
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
                  <Overlay name="Feature group">
                    <FeatureGroup color="purple">
                      <Popup>Popup in FeatureGroup</Popup>
                      <Circle center={[51.51, -0.06]} radius={200} />
                      <Rectangle bounds={rectangle} />
                    </FeatureGroup>
                  </Overlay>
                </LayersControl>



              </Map>

      <ul className="POI-List">
        {this.state.POIs.map(poi => (

              <POI {...poi} />

        ))}
      </ul>
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
    let {position,updatePOI,updatePOIs,poisList,id} = this.props;



    return (
        //Render a form for adding a new book
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
            <button type="submit">Save</button>
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
