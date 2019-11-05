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
import aa from "./icons/delete.png";
import popupsound from "./sounds/pop.mp3";
import Clocks from  "./components/Clocks";

// import plugin's css (if present)
// note, that this is only one of possible ways to load css
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu";
import * as emailjs from "emailjs-com"
import MiniMap from 'leaflet-minimap';
import "leaflet-sidebar/src/L.Control.Sidebar.css"
import AnalogClock, { Themes } from 'react-analog-clock';
import "leaflet-sidebar/src/L.Control.Sidebar"
import SideBarPoi from "./components/SideBarPoi";
import SideBarUsers from "./components/SideBarUsers";
import NavBar from "./components/NavBar";
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
const users=[]
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
let [currentUser,setCurrentUSer]=useState('');
    let [allUser, setAllUser] = useState([]);
  //get the pois on load
  useEffect(() => {
    const fn = async () => {

      if (loading === false) {
        let poisList =await getAllO('poi');
        if (poisList.length > 0) {
          console.log("Load");
          console.log(poisList);
          setPoisList(poisList);
            setCurrentUSer(await requestPOI.getObjectWithId(user.sub,'user', getTokenSilently,
                loginWithRedirect));
            setAllUser(await requestPOI.getAllObject(getTokenSilently,loginWithRedirect,'user'));
        }

      }
    };
    fn();
  }, [isAuthenticated, loginWithRedirect, loading]);



  async function insertPOi(newPOI)
  {
      if (newPOI.id === undefined) {
          console.log(newPOI.Categories)
          let answer =   await requestPOI.addNewObject("poi",
              newPOI,
              getTokenSilently,
              loginWithRedirect
          );
          return answer;
      } else {
          let answer = await requestPOI.updateObject("poi",
              newPOI.id,
              newPOI,
              getTokenSilently,
              loginWithRedirect
          );
          return answer;
      }
  }

  async function addPOI(newPOI) {
      let poiadd =await  insertPOi(newPOI);
      console.log("category : ")
      console.log(newPOI.Categories)
      let idCateArray=[]
      let idTags=[]
      newPOI.Categories.map((cat)=>
      idCateArray.push(cat.id)
      )
      newPOI.Tags.map((tag)=>
          idTags.push(tag.id)
      )
              await requestPOI.updatePoiType("category",idCateArray,poiadd.id,getTokenSilently,
          loginWithRedirect);
      await requestPOI.updatePoiType("tag",idTags,poiadd.id,getTokenSilently,
          loginWithRedirect);
  }

  async function getAllO(object) {
    return await requestPOI.getAllObject(getTokenSilently, loginWithRedirect,object);
  }

  async function deletePOI(poi) {
    console.log("poi delete");
    return await requestPOI.deleteObject("poi",
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

           <header>
               <NavBar />
           </header>
                  <App
                      poisList={props.poisList}
                      getAllO={getAllO}
                      addPOI={addPOI}
                      deletePOI={deletePOI}
                      currentUser={currentUser}
                      key="app"
                      user={currentUser}
                      isAuthenticated={isAuthenticated}
                      logout={logout}
                      userList={allUser}
                  ></App>
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
    this.sideBarLeft=''
    this.state = {
      POIs: [],
        unsavedPOIs:[],
      filteredPois: [],
      filteredPoisToShow: [],
      Routes: [],
        categories:[],
        tags:[],
        selecteduser:[],
      geoLat: "",
      geoLng: "",
      available: false,
      Map: { minZoom: 2, center: [0, 5], zoom: 2 },
      oldSizevalue:'',
      notifications:[],
      searchResults:[],
      is2ddisplayed:true,
        selectedPoi:'',
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
console.log("user_"+this.props.user.id);
    this.setState({ POIs: result })
this.getTags();
    this.getCategories();

    this.setState({ oldSizevalue: result.length });
    this.interval = setInterval(() => this.testtimeOut(), 4000);
    let searchResults = [];
    searchControl.on("results", function(data) {
      results.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        searchResults.push(data.results[i]);
      }
    });
      let osmUrl='http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      let osmAttrib='Map data &copy; OpenStreetMap contributors';
      let osm = new L.TileLayer(osmUrl, {minZoom: 5, maxZoom: 18, attribution: osmAttrib});
      var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
      var rect1 = {color: "#ff1100", weight: 3};
      var rect2 = {color: "#0000AA", weight: 1, opacity:0, fillOpacity:0};
      var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, aimingRectOptions : rect1, shadowRectOptions: rect2}).addTo(map);
      map.addLayer(osm);


      this.sideBarLeft = L.control.sidebar('sidebar', {
          position: 'left',
          closeButton:true
      });
      this.leafletMap.leafletElement.addControl( this.sideBarLeft);

    this.setState({ searchResults: searchResults });
    this.setGroupUsrs(this.props.poisList);
   this.changeOfPois();

  }

  async testtimeOut() {
    let result = await this.props.getAllO('poi');
      var updatedList = result.map(el => {
          var o = Object.assign({}, el);
          o.isSaved = true;
          return o;
      });
      let addedElement =updatedList[updatedList.length-1];

    console.log(updatedList);
      this.setState({ POIs: updatedList });
      this.changeOfPois();
    if (this.state.oldSizevalue < result.length&&addedElement.Creator.id!=this.props.user.sub) {



      let addNotif = this.state.notifications;

      addNotif.push(addedElement);
      this.setState({ notifications: addNotif });
      this.notificationSound.src = popupsound;
      this.notificationSound.play();
        this.setState({ oldSizevalue: updatedList.length });
    }


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
  ): void {     }
async getCategories()
    {
        let categories= await this.props.getAllO('category');
        console.log("categories");
        console.log(categories);
        this.setState({categories:categories})

    }

async getTags()
{
    //let tags= await this.props.getAllO('tags');
    //this.setState({tags:tags})

}
    setGroupUsrs(results){
      console.log('users:')
        console.log( this.state.POIs.length)
        results.filter(poi=>poi.group===4).map((poi)=>
          {
              if(users.length>0)
              {
                  if(!users.some(item => poi.Creator.name === item.name))
                      users.push(poi.Creator)
              }

                else
                  users.push(poi.Creator)


          }
      )
    }
  //add a marker when you clic on the map
  addMarker = (e) => {
    const pois=this.state.POIs;
    var newPoi={lat:e.latlng.lat,lng:e.latlng.lng,name:'',description:'',"group": 4,isSaved:false,Creator:{id:this.props.user.id},Categories:[],Tags:[]}
    this.props.addPOI(newPoi);
        pois.push(newPoi);
    this.setState({POIs:pois});
    this.changeOfPois();
    this.leafletMap.leafletElement.flyTo(e.latlng, 15);

    };
  deleteMarker = e => {
      console.log("id: "+e.target.name)

    let deletedPOI = this.state.POIs.find(poi => poi.id ==e.target.name);
      console.log(deletedPOI.Creator.id)
      console.log(this.props.user.id)
    if (deletedPOI.Creator.id === this.props.user.id) {
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

      let newPoiList = []
      this.state.POIs.map((poi)=> {
          if (poi.Creator.id === this.props.user.id) {
              console.log("answer: " + this.props.deletePOI(poi) + ":");

          } else {
              newPoiList.push(poi);

          }
          this.setState({POIs: newPoiList});
      }
    )


      this.changeOfPois();
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


    sendEmail(template,poi){

    emailjs.send(
            'gmail', template,
        {message_html: "test", from_name: "Mapathon", send_to: this.props.user.name},"user_QbNXGKWFUNVOK2RAfIVdb"
        ).then(res => {
            console.log('Email successfully sent!')
        })
        // Handle errors here however you like, or use a React error boundary
            .catch(err => console.error('Oh well, you failed. Here some thoughts on the error that occured:', err))
    }

  zoomOnMarker = e => {
    this.scrollToMyRef();
    let map = this.state.Map;
    map.zoom = 15;
    console.log(e.target.value);
    let lat = this.state.POIs.find(poi => poi.id == e.target.name).lat;
    let lng = this.state.POIs.find(poi => poi.id == e.target.name).lng;
    this.leafletMap.leafletElement.flyTo([lat,lng], 15);

   // this.setState({ Map: map });
  };
displayPoi = e =>
{


this.setState({selectedPoi:e})
    this.sideBarLeft.show();

}
  //zoom on the my location
  ZoomOnMyLoca = e => {
    this.scrollToMyRef();
    this.leafletMap.leafletElement.flyTo([this.state.geoLat, this.state.geoLng], 15);
  };
    updatePOI = poi => {

   let ldPOivalue= this.state.POIs.find((poiOld)=>poiOld.lat==poi.lat&&poiOld.lng==poi.lng)
        ldPOivalue={...poi}

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
            if (this.state.filterPoi !== undefined && this.state.POIs !== "") {
                this.setState((state, props) => ({
                    filteredPoisToShow: state.POIs.filter(poi => {
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
                    filteredPoisToShow: state.POIs.filter(poi => {
                        return poi.Creator.id === props.user.sub ? poi : null;
                    })
                }));
            }
        } else if (
            this.state.filterPoi !== "" &&
            this.state.filterPoi !== undefined
        ) {
            this.setState((state, props) => ({
                filteredPoisToShow: state.POIs.filter(poi => {
                    return poi.name.toLowerCase().includes(state.filterPoi.toLowerCase())
                        ? poi
                        : poi.description
                            .toLowerCase()
                            .includes(state.filterPoi.toLowerCase());
                })
            }));
        } else {
            this.setState((state, props) => ({ filteredPoisToShow: state.POIs }));
        }
    };
  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

   showCoordinates= e => {
        alert(e.latlng);
       this.sideBarLeft.show();
            }
    showSidebar=e=>
    {

        this.sideBarLeft.show();
    }
  render() {

    return (
<div>
    <div id="sidebar">
        <SideBarUsers
            userList={this.props.userList}
        />
    </div>

  <div className="w3-teal">
  <div className="w3-container">
      <button onClick={this.deleteMyPOI }>Delete all my pois</button>
        <div id="wrapper">


            <div id="c1">   <AnalogClock gmtOffset="+4:30"  width={100} theme={Themes.dark} /></div>
            <div id="c2"><AnalogClock   width={100} theme={Themes.dark} /></div>
        </div>


        {this.state.is2ddisplayed && (
          <Map
            className="map"
            id="map"
            minZoom={this.state.Map.minZoom}
            center={this.state.Map.center}
            view={this.state.Map.view}
           // onClick={this.addMarker}
            zoom={this.state.Map.zoom}
            contextmenu={true}
            contextmenuWidth={140}
            contextmenuItems={ [{
            text: 'Show coordinates',
            callback: this.showCoordinates
            },{
                text: 'add Marker',
                callback: this.addMarker
            }

            ]}
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
                        tags={this.state.tags}
                        user={this.props.currentUser}
                        displayPoi={this.displayPoi}
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
                      {this.state.POIs.filter((poi)=>poi.Creator.group!=4).map(poi => (
                          <POIMarker
                              addPOI={this.props.addPOI}
                              isSaved={poi.isSaved}
                              lat={poi.lat}
                              lng={poi.lng}
                              poi={poi}
                              poisList={this.state.POIs}
                              id={poi.id}
                              categories={this.state.categories}
                              tags={this.state.tags}
                              user={this.props.currentUser}
                              displayPoi={this.displayPoi}
                             />
                      ))}
                </LayerGroup>
              </Overlay>
            <Overlay key="pois" name="my group pois" checked>
              <LayerGroup>
                {this.state.filteredPoisToShow.filter(poi=>poi.Creator.group===4 ).map(poi => (
                    <POIMarker
                        addPOI={this.props.addPOI}
                        poi={poi}
                        poisList={this.state.POIs}
                        lat={poi.lat}
                        isSaved={poi.isSaved}
                        lng={poi.lng}
                        id={poi.id}
                        categories={this.state.categories}
                        tags={this.state.tags}
                        user={this.props.currentUser}
                        displayPoi={this.displayPoi}
                    />
                ))}
                  {this.state.filteredPoisToShow.filter(poi=>poi.isSaved==false ).map(poi => (
                      <POIMarker
                          addPOI={this.props.addPOI}
                          poi={poi}
                          poisList={this.state.POIs}
                          lat={poi.lat}
                          isSaved={poi.isSaved}
                          lng={poi.lng}
                          id={poi.id}
                          categories={this.state.categories}
                          tags={this.state.tags}
                          user={this.props.currentUser}
                          displayPoi={this.displayPoi}
                      />
                  ))}
              </LayerGroup>
            </Overlay>
                <Control position="topleft" >
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
                </Control>
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
            {this.state.filteredPoisToShow.filter((poi)=>poi.Creator.group===4).map(poi => (
              <POI
                {...poi}
                zoomOnMarker={this.zoomOnMarker}
                deleteMarker={this.deleteMarker}
              />
            ))}
          </ul>
        </div>
      </div>
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
