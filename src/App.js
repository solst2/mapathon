import React, { useState, Component, useEffect, useRef } from "react";
import "./App.css";
import L from "leaflet";
import {
  Circle,
  FeatureGroup,
  LayerGroup,
  LayersControl,
  Map,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  MapControl
} from "react-leaflet";
import { useAuth0 } from "./react-auth0-spa";
import Loading from "./components/Loading";
import POIMarker from "./components/POIMarker";
import MenuOptions from "./components/MenuOptions";
import GeoLocat from "./components/GeoLocat";
import POI from "./components/POI";
import requestPOI from "./utils/requestPOI";
import Control from "react-leaflet-control";
import targetIcon from "./icons/target.png";
import grp4IconImg from "./icons/pin/green_pin.png";
import grp3IconImg from "./icons/pin/blue_pin.png";
import grp2IconImg from "./icons/pin/orange_pin.png";
import grp1IconImg from "./icons/pin/red_pin.png";
import searchResultImg from "./icons/pin/searchResult.png";
import * as ELG from "esri-leaflet-geocoder";
import routeIconImg from "./icons/rout.png";
import Routing from "./RoutingMachine";
import popupsound from "./sounds/pop.mp3";
// unused imports:
// import request from "./utils/request";
// import endpoints from "./endpoints";
// import { latLng, marker } from "leaflet/dist/leaflet-src.esm";
// import { closestPointOnSegment } from "leaflet/src/geometry/LineUtil";
// import { City, CityForm, CityMarker, CitiesList } from "./Cities";
// import Div from "./Div";
// import Map3d from './3dMa'
// import 'leaflet.sync/L.Map.Sync'
// import map2d from "./icons/flatt.PNG";
// import map3d from "./icons/globe.PNG";



const { BaseLayer, Overlay } = LayersControl;
const center = [51.505, -0.09];
const rectangle = [[51.49, -0.08], [51.5, -0.06]];
var routeIcon = L.icon({
  iconUrl: routeIconImg,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -20]
});
var searchResultIcon = L.icon({
  iconUrl: searchResultImg,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -20]
});
//main app, at the top of the tree
function AppWrapper() {
  const {
    isAuthenticated,
    loginWithRedirect,
    loading,
    getTokenSilently,
    logout,
    user
  } = useAuth0();
  let [poisList, setPoisList] = useState([]);

  //get the pois on load
  useEffect(() => {
    const fn = async () => {

      if (loading === false) {
        let poisList =await getAllO('poi');
        if (poisList.length > 0) {
          console.log("Load");
          console.log(poisList);
          setPoisList(poisList);
        }
      }
    };
    fn();
  }, [isAuthenticated, loginWithRedirect, loading]);

  async function addPOI(newPOI) {
    if (newPOI.id === undefined) {
      let answer = await requestPOI.addNewPOI(
        newPOI,
        getTokenSilently,
        loginWithRedirect
      );
      return answer;
    } else {
      let answer = await requestPOI.updatePOI(
        newPOI.id,
        newPOI,
        getTokenSilently,
        loginWithRedirect
      );
      return answer;
    }
  }

  async function getAllO(object) {
    return await requestPOI.getAllObject(getTokenSilently, loginWithRedirect,object);
  }

  async function deletePOI(poi) {
    console.log("poi delete");
    return await requestPOI.deletePOI(
      poi.id,
      getTokenSilently,
      loginWithRedirect
    );
  }

  if (loading) {
    return <Loading />;
  }


  function userlogout() {
    if (isAuthenticated) logout();
  }

  //called once to button start is pressed
  function AfterLoad(props) {
    return (
       <div>
      <div className="sidebar" id="sidebar">
              <a className="active" href="#home">
                Map
              </a>
              {isAuthenticated && (
                  <button className="ButtonLogout" onClick={() => logout()}>
                    Log out
                  </button>
              )}
            </div>
            <div class="content">
              <div className="w3-teal">
                <div className="w3-container">

                  <App
                      poisList={props.poisList.filter((poi)=>poi.group===4)}
                      getAllO={getAllO}
                      addPOI={addPOI}
                      deletePOI={deletePOI}
                      currentUser={user}
                      key="app"
                      user={user}
                  ></App>
                </div>
              </div>
            </div>

          </div>

    );
  }

  return <AfterLoad poisList={poisList} />;
}

//App class at the second level of the tree
class App extends Component {
  constructor(props) {
    super(props)
    this.leafletMap = React.createRef();
    this.state = {
      POIs: [],
      filteredPois: [],
      filteredPoisToShow: [],
      Routes: [],
        categories:[],
      geoLat: "",
      geoLng: "",
      available: false,
      Map: { minZoom: 2, center: [0, 5], zoom: 2 },
      oldSizevalue:'',
      notifications:[],
      searchResults:[],
      is2ddisplayed:true,
    };
  }

  componentDidMount() {
    const map = this.leafletMap.leafletElement;
    const searchControl = new ELG.Geosearch().addTo(map);
    const results = new L.LayerGroup().addTo(map);
        console.log(this.props.poisList.length);
    var result = this.props.poisList.map(el => {
      var o = Object.assign({}, el);
      o.isSaved = true;
      return o;
    });
    this.setState({ POIs: result })
this.category();
    this.setState({ oldSizevalue: result.length });
    this.interval = setInterval(() => this.testtimeOut(), 3000);
    let searchResults = [];
    searchControl.on("results", function(data) {
      results.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        searchResults.push(data.results[i]);
      }
    });
    this.setState({ searchResults: searchResults });

     this.changeOfPois();
  }

  async testtimeOut() {
    let result = await this.props.getAllO('poi');


      var updatedList = result.map(el => {
          var o = Object.assign({}, el);
          o.isSaved = true;
          return o;
      });
    this.setState({ POIs: updatedList });
    this.changeOfPois();
    console.log(updatedList);

    if (this.state.oldSizevalue < updatedList.length) {
      let addNotif = this.state.notifications;
      let addedElement =updatedList[updatedList.length-1];
      if(addedElement.Creator.id!=this.props.user.sub)
      addNotif.push(addedElement);
      this.setState({ notifications: addNotif });
      this.notificationSound.src = popupsound;
      this.notificationSound.play();
    } else this.setState({ notifmessage: "" });

    this.setState({ oldSizevalue: updatedList.length });
  }
  //scroll on the map when you click on a marker
  scrollToMyRef = () => window.scrollTo(0, this.leafletMap);

  updateCities = cities => {
    this.setState({ citiesData: cities });
  };
  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS
  ): void {}
async category()
{
    let categories= await this.props.getAllO('category');
    console.log("categories");
    console.log(categories);
    this.setState({categories:categories})
    return categories;
}
  //add a marker when you clic on the map
  addMarker = (e) => {
    const pois=this.state.POIs;
    var newPoi={lat:e.latlng.lat,lng:e.latlng.lng,name:'',description:'',"group": 4,isSaved:false,Creator:{id:this.props.currentUser.sub}}
    console.log('Point '+newPoi.id+ ' at '+newPoi.lat +"/"+newPoi.lng);
    this.props.addPOI(newPoi);
    console.log("markers");
    console.log(this.leafletMap.leafletElement._targets);
    console.log(  this.leafletMap.leafletElement);
    this.setState({POIs:pois});
    this.changeOfPois();
    this.leafletMap.leafletElement.flyTo(e.latlng, 15);

    };
  deleteMarker = e => {
    let deletedPOI = this.state.POIs.find(poi => poi.name == e.target.value);
    if (deletedPOI.Creator.id == this.props.user.sub) {
      if (
        window.confirm(
          "Are you sure you wish to delete this point of interest?"
        )
      ) {
        console.log("answer: " + this.props.deletePOI(deletedPOI) + ":");
        const POIs = this.state.POIs.filter(item => item !== deletedPOI);
        this.setState({ POIs: POIs });
        this.changeOfPois();
      }
    } else {
      window.alert("You are not allowed to delete this.");
    }
  };
  deleteMyPOI= (e) =>  {

    this.state.POIs.map((poi)=>
    {if (poi.Creator.id === this.props.user.sub) {
        console.log("answer: "+this.props.deletePOI(poi)+":");
      }}
    )
  };

  upGeoLocalisation=(position)=>
  {
      console.log("position:"+position);
    this.setState({geoLat:position.coords.latitude});
    this.setState({geoLng:position.coords.longitude});
  };

  addRoute = e => {
    const routes = this.state.Routes;
    routes.push({});
    this.setState({ Routes: routes });
  };
  zoomOnMarker = e => {
    this.scrollToMyRef();
    let map = this.state.Map;
    map.zoom = 15;
    console.log(e.target.value);
    let lat = this.state.POIs.find(poi => poi.name == e.target.value).lat;
    let lng = this.state.POIs.find(poi => poi.name == e.target.value).lng;
    this.leafletMap.leafletElement.flyTo([lat,lng], 15);

   // this.setState({ Map: map });
  };

  //zoom on the my location
  ZoomOnMyLoca = e => {
    this.scrollToMyRef();
    this.leafletMap.leafletElement.flyTo([this.state.geoLat, this.state.geoLng], 15);
  };

  handleFilter = async e => {
    console.log(e.target.value);
    this.setState({ filterPoi: e.target.value });
    this.changeOfPois();
  };

  handleJustOwnClick = e => {
    console.log("Change just show own to:" + !this.state.justOwn);
    this.setState(
      (state, props) => ({ justOwn: !state.justOwn }),
      this.changeOfPois
    );
  };

    changeOfPois = () => {
        let POIs4gr=this.state.POIs.filter((poi)=>poi.group==4)
        console.log("filter Poi:" + this.state.filterPoi + ":");
        console.log("showOwn:" + this.state.justOwn + ":");
        if (this.state.justOwn) {
            if (this.state.filterPoi !== undefined && POIs4gr !== "") {
                this.setState((state, props) => ({
                    filteredPoisToShow: POIs4gr.filter(poi => {
                        if (poi.Creator === undefined) {
                            return poi;
                        }
                        return poi.Creator.id === props.user.sub
                            ? poi.name.toLowerCase().includes(state.filterPoi.toLowerCase())
                                ? poi
                                : poi.description
                                    .toLowerCase()
                                    .includes(state.filterPoi.toLowerCase())
                            : null;
                    })
                }));
            } else {
                this.setState((state, props) => ({
                    filteredPoisToShow: POIs4gr.filter(poi => {
                        return poi.Creator.id === props.user.sub ? poi : null;
                    })
                }));
            }
        } else if (
            this.state.filterPoi !== "" &&
            this.state.filterPoi !== undefined
        ) {
            this.setState((state, props) => ({
                filteredPoisToShow: POIs4gr.filter(poi => {
                    return poi.name.toLowerCase().includes(state.filterPoi.toLowerCase())
                        ? poi
                        : poi.description
                            .toLowerCase()
                            .includes(state.filterPoi.toLowerCase());
                })
            }));
        } else {
            this.setState((state, props) => ({ filteredPoisToShow: POIs4gr }));
        }
    };
  componentWillUnmount(): void {
    clearInterval(this.interval);
  }
  render() {

    return (
      <div>
        <div>
          <button onClick={this.deleteMyPOI }>Delete all my pois</button>
          <div className="dropdown">

            <audio ref={ref => this.notificationSound = ref} />
            <div className="dropdown">
              <button className="dropbtn">
                {this.state.notifications.length}
              </button>
              <div className="dropdown-content">
                {this.state.notifications.map(poi => (
                  <a
                    onClick={() => {
                      this.scrollToMyRef();

                      let map = this.state.Map;
                      map.zoom = 15;
                      map.center = [poi.lat, poi.lng];
                      {
                        this.setState({ notifications: [] });
                      }
                      this.setState({ Map: map });
                    }}
                  >
                    <img width={50} height={50} src={poi.Creator.picture} />{" "}
                    {poi.Creator.name} added : {poi.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />

        {this.state.is2ddisplayed && (
          <Map
            className="map"
            id="map"
            minZoom={this.state.Map.minZoom}
            center={this.state.Map.center}
            view={this.state.Map.view}
            onClick={this.addMarker}
            zoom={this.state.Map.zoom}
            ref={m => {
              this.leafletMap = m;
            }}
          >
            <LayersControl>
              <BaseLayer checked name="Default">
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer name="Satelit">
                <TileLayer
                  attribution='&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </BaseLayer>
              <BaseLayer name="hot">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
                  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer name="Topo">
                <TileLayer
                  attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer name="FR">
                <TileLayer
                  attribution='&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer name="DE">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <Overlay name="my pois">
                <LayerGroup>
                  {this.state.filteredPoisToShow
                    .filter(poi => poi.Creator.id == this.props.currentUser.sub)
                    .map(poi => (
                      <POIMarker
                        group={poi.group}
                        addPOI={this.props.addPOI}
                        isSaved={poi.isSaved}
                        lat={poi.lat}
                        lng={poi.lng}
                        poi={poi}
                        poisList={this.state.filteredPoisToShow}
                        id={poi.id}
                        categories={this.state.categories}
                      />
                    ))}
                </LayerGroup>
              </Overlay>
              <Overlay name="search results" checked>
                <LayerGroup>
                  {this.state.searchResults.map(searchpoint => (
                    <Marker
                      position={searchpoint.latlng}
                      icon={searchResultIcon}
                    >
                      <Popup>{searchpoint.text}</Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              </Overlay>
              <Overlay name="all pois">
                <LayerGroup>
                      {this.state.POIs.map(poi => (
                          <POIMarker
                              addPOI={this.props.addPOI}
                              isSaved={poi.isSaved}
                              lat={poi.lat}
                              lng={poi.lng}
                              poi={poi}
                              poisList={this.state.POIs}
                              id={poi.id}
                              categories={this.state.categories}
                             />
                      ))}
                </LayerGroup>
              </Overlay>
            <Overlay key="pois" name="my group pois" checked>
              <LayerGroup>
                {this.state.filteredPoisToShow.map(poi => (
                    <POIMarker
                        addPOI={this.props.addPOI}
                        poi={poi}
                        poisList={this.state.POIs}
                        lat={poi.lat}
                        isSaved={poi.isSaved}
                        lng={poi.lng}
                        id={poi.id}
                        categories={this.state.categories}
                    />
                ))}
              </LayerGroup>
            </Overlay>
                <Overlay key="pois" name="my position " checked>
                    <LayerGroup>
                        <GeoLocat upGeoLocalisation={this.upGeoLocalisation}/>
                    </LayerGroup>
                </Overlay>
          </LayersControl>
            <Control position="topleft">
              <img
                src={targetIcon}
                onClick={this.ZoomOnMyLoca}
                width={20}
                height={20}
              ></img>
            </Control>

            <Control position="bottomright">
              <img
                src={routeIconImg}
                onClick={this.addRoute}
                width={20}
                height={20}
              ></img>
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

            {this.state.Routes.map(route => (
              <Routing map={this.leafletMap} route={route} />
            ))}
            <div className="pointer"></div>
            {/*<Control position="bottomright">*/}
            {/*  <img width={70} height={70} src={!this.state.is2ddisplayed ? map2d : map3d} onClick={()=>{let updateDisplayed = !this.state.is2ddisplayed*/}
            {/*    this.setState({is2ddisplayed:updateDisplayed})*/}
            {/*  } }/>*/}
            {/*</Control>*/}
          </Map>
        )}
        {/*{!this.state.is2ddisplayed &&   <Div is2ddisplayed={this.setIs2ddisplayed} user={this.props.currentUser} geoLat={this.state.geoLat} geoLng={this.state.geoLng} Map={this.state.Map} pois={this.state.POIs} snycMap={this.snycMap}/>}*/}
        <button className={"ButtonBar"} onClick={this.ZoomOnMyLoca}>
          Where am I..?
        </button>
        <MenuOptions
          handleFilter={this.handleFilter}
          handleJustOwnClick={this.handleJustOwnClick}
          justOwn={this.state.justOwn}
        />
        <div>
          <ul className="POI-List">
            {this.state.filteredPoisToShow.map(poi => (
              <POI
                {...poi}
                zoomOnMarker={this.zoomOnMarker}
                deleteMarker={this.deleteMarker}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

const initMarker = ref => {
  if (ref) {
    ref.leafletElement.openPopup()
  }
};

export default AppWrapper;
