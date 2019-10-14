import React, { useState,Component } from "react";
import "./App.css";
import { useAuth0 } from "./react-auth0-spa";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import POI from "./components/POI";
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup  } from 'react-leaflet';


export function Geo(){
  let [laltitude, setLaltitude] = useState([]);
  let [longtitude, setLongtitude] = useState([]);
  let [available, setAvailable] = useState(false);
  let [message, setMessage] = useState('Browser does not support geolocation.');

  function getPosition(position) {
    setLaltitude(position.coords.latitude);
    setLongtitude(position.coords.longitude);
    setAvailable(true);
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
  return(available) ? <div > <Mapdiv firstLat={laltitude} firstLng={longtitude}/></div>: <p>{message}</p>

}

var myIcon = L.icon({
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=',
  iconSize: [20, 50],
  iconAnchor: [10, 50],
  popupAnchor: [0, -20]
});

function setFirstMarker () {
  const {markers} = this.state

  this.setState({markers})
}
class Mapdiv extends Component {

  constructor(props) {
    super(props);

    this.state = {
      markers:[[props.firstLat,props.firstLng]],
      citiesData:[
        { "name": "Tokyo", "coordinates": [139.6917, 35.6895], "population": 37843000 ,"displayed":true},
        { "name": "Jakarta", "coordinates": [106.8650, -6.1751], "population": 30539000 ,"displayed":false},
        { "name": "Delhi", "coordinates": [77.1025, 28.7041], "population": 24998000 ,"displayed":false},
        { "name": "Seoul", "coordinates": [126.9780, 37.5665], "population": 23480000 ,"displayed":false},
        { "name": "Shanghai", "coordinates": [121.4737, 31.2304], "population": 23416000 ,"displayed":false},
        { "name": "Karachi", "coordinates": [67.0099, 24.8615], "population": 22123000 ,"displayed":false},
        { "name": "Beijing", "coordinates": [116.4074, 39.9042], "population": 21009000 ,"displayed":false},
        { "name": "Mumbai", "coordinates": [72.8777, 19.0760], "population": 17712000 ,"displayed":false},
        { "name": "Osaka", "coordinates": [135.5022, 34.6937], "population": 17444000 ,"displayed":false},
        { "name": "Moscow", "coordinates": [37.6173, 55.7558], "population": 16170000 ,"displayed":false},
        { "name": "Dhaka", "coordinates": [90.4125, 23.8103], "population": 15669000 ,"displayed":false},
        { "name": "Bangkok", "coordinates": [100.5018, 13.7563], "population": 14998000 ,"displayed":false},
        { "name": "Kolkata", "coordinates": [88.3639, 22.5726], "population": 14667000 ,"displayed":false},
        { "name": "Istanbul", "coordinates": [28.9784, 41.0082], "population": 13287000 ,"displayed":true},
      ]
    };
  }

  addMarker = (e) => {
    const {markers} = this.state;
    markers.push(e.latlng);
    this.setState({markers})
  };

  deleteMarker= (e) =>  {
    const {markers} = this.state;
    markers.splice(e.target.value, 1);
    this.setState({markers})
  };

  hideMarker = (e) => {
    const {markers} = this.state
    //console.log(markers.find(e => e.title == "Istanbul"))

  };

  render() {
    let {markers,firstLat,firstLng} = this.props;
    return (
        <div>
          <button className="ButtonBar">reload actual location</button>
          {/*<button onClick={this.handleReload} className="ButtonBar">reload actual location</button>*/}
          <Map className="map"
               id="map"
               minZoom ={1}
               center={[firstLat, firstLng]}
               View={[60,0]}
               onClick={this.addMarker}
               zoom={16}
          >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'

            />
            {this.state.markers.map((position, idx) =>
                <Marker key={`marker-${idx}`} position={position}  icon={myIcon}>
                  <Popup>
                    <span><img width={10} height={10} src="https://image.flaticon.com/icons/svg/61/61456.svg" /><br/>{position.lat} {position.lng}</span>
                  </Popup>


                </Marker>
            )}
          </Map>
        </div>

    );
  }

}

function MenuOptions() {
  let [text, setText] = useState('Create new POI');
  let [filter, setFilter] = useState('Filter POIs');

  let handleNewPOI = async e => {
    setText('Create clicked');
  };
  let handleFilterClick = async e => {
    setFilter('Filter activated');
  };

  return (<div>
    <button onClick={handleNewPOI} className="ButtonBar">➕ {text}</button>
    <button onClick={handleFilterClick} className="ButtonBar">{filter}</button>
  </div>)
}

function Filter (){

}

function App() {
  let [pois, setPois] = useState([]);
  let { loading, loginWithRedirect, getTokenSilently } = useAuth0();

  let handlePOIsClick = async e => {
    e.preventDefault();
    let pois = await request(
        `${process.env.REACT_APP_SERVER_URL}${endpoints.pois}?group=4`,
        getTokenSilently,
        loginWithRedirect
    );

    if (pois && pois.length > 0) {
      console.log(pois);
      setPois(pois);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
      <div className="App">
        <header className="App-header">
          <h1>Mapathon </h1>
          <Geo/>
          <br />
          <a className="App-link" href="#" onClick={handlePOIsClick}>
            Get POIs
          </a>
          <MenuOptions/>
          {pois && pois.length > 0 && (
              <ul className="POI-List">
                {pois.map(poi => (
                    <li key={poi.id}>
                      <POI {...poi} />
                    </li>
                ))}
              </ul>
          )}
        </header>
      </div>
  );
}

export default App;