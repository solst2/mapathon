import React, { useState, Component, useEffect, useRef } from "react";
import "./App.css";
import L from "leaflet";
import {
  LayerGroup,
  LayersControl,
  Map,
  Marker,
  Popup,
  TileLayer,
    FeatureGroup
} from "react-leaflet";
import { useAuth0 } from "./react-auth0-spa";
import Loading from "./components/Loading";
import POIMarker from "./components/POIMarker";
import MenuOptions from "./components/MenuOptions";
import GeoLocat from "./components/GeoLocat";
import POI from "./components/POI";
import request from "./utils/request";
import Control from "react-leaflet-control";
import targetIcon from "./icons/target.png";
import searchResultImg from "./icons/pin/searchResult.png";
import * as ELG from "esri-leaflet-geocoder";
import routeIconImg from "./icons/rout.png";
import Routing from "./RoutingMachine";
import popupsound from "./sounds/pop.mp3";
import ReactNotifications from "react-browser-notifications";
import TagManager from "./pages/TagManager";
import CategoryManager from "./pages/CategroyManager";
import { Route, Link, BrowserRouter as Router } from "react-router-dom";
// import plugin's css (if present)
// note, that this is only one of possible ways to load css
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu";
import * as emailjs from "emailjs-com";
import MiniMap from "leaflet-minimap";
import "leaflet-sidebar/src/L.Control.Sidebar.css";
import AnalogClock, { Themes } from "react-analog-clock";
import "leaflet-sidebar/src/L.Control.Sidebar";
import NavBar from "./components/NavBar";
import { Multiselect } from "multiselect-react-dropdown";
import "leaflet.sync/L.Map.Sync";
import currentPosition from "./icons/my_position.gif";
import "./cardTemplate.scss";

var myPostionIcon = L.icon({
  iconUrl: currentPosition,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -20]
});

const { BaseLayer, Overlay } = LayersControl;
const users = [];
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
  let [allUser, setAllUser] = useState([]);
  let [position, setPosition] = useState({ lat: 0, lng: 0 });
  //get the pois on load
  useEffect(() => {
    const fn = async () => {
      if (loading === false) {
        let poisList = await getAllO("poi");
        if (poisList.length > 0) {
          setPoisList(poisList);
          setAllUser(
            await request.getAllObject(
              getTokenSilently,
              loginWithRedirect,
              "user"
            )
          );
        }
      }
    };
    fn();
  }, [isAuthenticated, loginWithRedirect, loading]);

  // insert a poi
  async function insertPOi(newPOI) {
    //if the poi has no id, it must be created
    if (newPOI.id === undefined) {
      let answer = await request.addNewObject(
        "poi",
        newPOI,
        getTokenSilently,
        loginWithRedirect
      );
      return answer;
    } else {
      //just update it
      let answer = await request.updateObject(
        "poi",
        newPOI.id,
        newPOI,
        getTokenSilently,
        loginWithRedirect
      );
      return answer;
    }
  }
  // set a like form the like button
  async function setLike(poiID, like) {
    let answer = await request.updateLike(
      "poi",
      poiID,
      like,
      getTokenSilently,
      loginWithRedirect
    );

    return answer;
  }
  // add POI and call the insertPOi and then update the category and tags
  async function addPOI(newPOI) {
    let poiadd = await insertPOi(newPOI);
    let idCateArray = [];
    let idTags = [];
    newPOI.Categories.map(cat => idCateArray.push(cat.id));
    newPOI.Tags.map(tag => idTags.push(tag.id));
    await request.updatePoiType(
      "category",
      idCateArray,
      poiadd.id,
      getTokenSilently,
      loginWithRedirect
    );
    await request.updatePoiType(
      "tag",
      idTags,
      poiadd.id,
      getTokenSilently,
      loginWithRedirect
    );
  }

  async function getAllO(object) {
    return await request.getAllObject(
      getTokenSilently,
      loginWithRedirect,
      object
    );
  }

  async function deleteObject(poi) {
    return await request.deleteObject(
      "poi",
      poi.id,
      getTokenSilently,
      loginWithRedirect
    );
  }

  //when the side is loading, show the loading circle
  if (loading) {
    return <Loading />;
  }

  //for the geologalisation for show in the map
  function setpostion(newPostion) {
    setPosition(newPostion);
  }

  //called once to button start is pressed
  function AfterLoad(props) {
    return (
      <div>
        <header>
          <Router>
            <NavBar />
            <Route exact path="/">
              <GeoLocat upGeoLocalisation={setpostion} />
              {position !== null && (
                <App
                  poisList={props.poisList}
                  getAllO={getAllO}
                  addPoi={addPOI}
                  deleteObject={deleteObject}
                  position={position}
                  key="app"
                  user={user}
                  isAuthenticated={isAuthenticated}
                  userList={allUser}
                  setLike={setLike}
                />
              )}
            </Route>
            <Route path="/categories" component={CategoryManager} />
            <Route path="/tags" component={TagManager} />
          </Router>
        </header>
      </div>
    );
  }

  return <AfterLoad poisList={poisList} />;
}
let selectedUsers = [];
//App class at the second level of the tree
class App extends Component {
  constructor(props) {
    super(props);
    this.showNotifications = this.showNotifications.bind(this);
    this.leafletMap = React.createRef();
    this.leafletOverlay= React.createRef();
    this.sideBarLeft = "";
    this.state = {
      POIs: [],
      filteredPoisToShow: [],
      unsavedPOIs: [],
      Routes: [],
      categories: [],
      tags: [],
      unsavedPois: [],
      sharepoiId: "",
      oldSizevalue: "",
      notifications: [],
      searchResults: [],
      displayDiv: false,
      is2ddisplayed: true,
      selectedPoi: "",
      indexPoiPage: 0,
        ismyPoiCheck:false,
        justOwn:false,
        justOwnGroup:false
    };
  }

  componentDidMount() {
    const map = this.leafletMap.leafletElement;
    const searchControl = new ELG.Geosearch().addTo(map);
    const results = new L.LayerGroup().addTo(map);
    //take poi and change the state isSaved to true, so it will show the poi and not the edit mode
    var result = this.props.poisList.map(el => {
      var o = Object.assign({}, el);
      o.isSaved = true;
      return o;
    });
    this.setState({ POIs: result });

    this.getTagAndCats();
    // for the notification
    this.setState({ oldSizevalue: result.length });
    //realtime informations
    this.interval = setInterval(() => this.testtimeOut(), 8000);
    let searchResults = [];
    searchControl.on("results", function(data) {
      results.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        searchResults.push(data.results[i]);
      }
    });
    //minimap
    let osmUrl = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
    let osmAttrib = "Map data &copy; OpenStreetMap contributors";
    let osm = new L.TileLayer(osmUrl, {
      minZoom: 5,
      maxZoom: 18,
      attribution: osmAttrib
    });
    var osm2 = new L.TileLayer(osmUrl, {
      minZoom: 0,
      maxZoom: 13,
      attribution: osmAttrib
    });
    var rect1 = { color: "#ff1100", weight: 3 };
    var rect2 = { color: "#0000AA", weight: 1, opacity: 0, fillOpacity: 0 };
    var miniMap = new L.Control.MiniMap(osm2, {
      toggleDisplay: true,
      aimingRectOptions: rect1,
      shadowRectOptions: rect2
    }).addTo(map);
    map.addLayer(osm);

    this.setState({ searchResults: searchResults });
    this.changeOfPois();

  }

  //realtime
  async testtimeOut() {
    let result = await this.props.getAllO("poi");
    var updatedList = result.map(el => {
      var o = Object.assign({}, el);
      o.isSaved = true;
      return o;
    });
    let addedElement = updatedList[updatedList.length - 1];

    this.state.unsavedPois.map(poi => updatedList.push(poi));

    this.setState({ POIs: updatedList });
    this.changeOfPois();
    //for the notification
    if (
      this.state.oldSizevalue < result.length &&
      this.props.user.sub !== addedElement.Creator.id
    ) {
      this.setState({ selectedPoi: addedElement });
      let addNotif = this.state.notifications;

      addNotif.push(addedElement);
      this.setState({ notifications: addNotif });
      this.notificationSound.src = popupsound;
      this.notificationSound.play();
      this.setState({ oldSizevalue: updatedList.length });
      this.showNotifications();
    }
  }

  //scroll on the map when you click on a marker
  scrollToMyRef = () => window.scrollTo(0, this.leafletMap);

  async getTagAndCats() {
    let categories = await this.props.getAllO("category");
    this.setState({ categories: categories });
    let tags = await this.props.getAllO("tag");
    this.setState({ tags: tags });

    let users = await this.props.getAllO("user");
    this.setState({ users: users });
  }

  //add a marker when you clic on the map
  addMarker = e => {
    this.leafletMap.leafletElement.closePopup();
    const unsavedpois = this.state.unsavedPois;
    var newPoi = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      name: "",
      description: "",
      group: 4,
      isSaved: false,
      Creator: { id: this.props.user.sub, group: 4 },
      Categories: [],
      Tags: []
    };

    unsavedpois.push(newPoi);
    this.setState({ unsavedPois: unsavedpois });

    let zoom = 0;
    if (this.leafletMap.leafletElement.zoom > 15)
      zoom = this.leafletMap.leafletElement.zoom;
    else zoom = 15;

    this.leafletMap.leafletElement.flyTo(e.latlng, zoom);
  };

  addPoi = async poi => {
    await this.props.addPoi(poi);
    const pois = this.state.POIs;
    pois.push(poi);
    this.setState({ POIs: pois });
    this.changeOfPois();
    this.setState({
      unsavedPois: this.state.unsavedPois.filter(poi => poi !== poi)
    });
  };

  deleteMarker = e => {
    let deletedPOI = this.state.POIs.find(poi => poi.id == e.target.name);

    //just allowed to delete when it is your poi
    if (deletedPOI.Creator.id === this.props.user.sub) {
      if (
        window.confirm(
          "Are you sure you wish to delete this point of interest?"
        )
      ) {
        this.props.deleteObject(deletedPOI);
        const POIs = this.state.POIs.filter(item => item !== deletedPOI);
        this.setState({ POIs: POIs });
        this.changeOfPois();
      }
    } else {
      window.alert("You are not allowed to delete this.");
    }
  };

  // deleteMyPOI= (e) =>  {
  //     let newPoiList = [];
  //     this.state.POIs.map((poi)=> {
  //         if (poi.Creator.id === this.props.user.sub) {
  //             this.props.deleteObject(poi);
  //         } else {
  //             newPoiList.push(poi);
  //         }
  //         this.setState({POIs: newPoiList});
  //     }
  //   );
  //     this.changeOfPois();
  // };

  onSelect(optionsList, selectedItem) {
    selectedUsers = optionsList;
  }

  addRoute = e => {
    const routes = [];
    routes.push({});
    this.setState({ Routes: routes });
  };

  dispalyDiv = e => {
    this.setState({ displayDiv: true });
    this.scrollToMyRef();
    this.setState({ sharepoiId: e.target.name });
  };

  sendEmail = e => {
    e.preventDefault();
    let poi = this.state.POIs.find(poi => poi.id == this.state.sharepoiId);
    selectedUsers.map(u => {
      emailjs
        .send(
          "gmail",
          "sharepoi",
          {
            message_html: "test",
            poi_image: poi.image,
            from_name: this.props.user.name,
            poi_name: poi.name,
            poi_lat: poi.lat,
            poi_lng: poi.lng,
            send_to: u.name
          },
          "user_QbNXGKWFUNVOK2RAfIVdb"
        )
        .then(res => {
          console.log("Email successfully sent!");
        })
        // Handle errors here however you like, or use a React error boundary
        .catch(err =>
          console.error(
            "Oh well, you failed. Here some thoughts on the error that occured:",
            err
          )
        );
    });
    this.setState({ displayDiv: false });
  };

  zoomOnMarker = e => {
    e.preventDefault();
    this.scrollToMyRef();
    this.leafletMap.leafletElement.closePopup();
    let lat = this.state.POIs.find(poi => poi.id == e.target.name).lat;
    let lng = this.state.POIs.find(poi => poi.id == e.target.name).lng;
    this.leafletMap.leafletElement.flyTo([lat, lng], 15);
  };
  displayPoi = e => {
    this.setState({ selectedPoi: e });
    this.sideBarLeft.show();
  };

  //zoom on the my location
  ZoomOnMyLoca = e => {
    this.leafletMap.leafletElement.closePopup();
    this.scrollToMyRef();
    this.leafletMap.leafletElement.flyTo(
      [this.props.position.lat, this.props.position.lng],
      15
    );
  };

  updatePOI = poi => {
    let ldPOivalue = this.state.POIs.find(
      poiOld => poiOld.lat == poi.lat && poiOld.lng == poi.lng
    );
    ldPOivalue = { ...poi };
  };

  handleFilter = async e => {
    this.setState({ filterPoi: e.target.value });
    this.changeOfPois();
  };

  handleJustOwnClick = e => {
    this.setState(
      (state, props) => ({ justOwn: !state.justOwn, ismyPoiCheck:!this.state.ismyPoiCheck }),
      this.changeOfPois
    );

  };

    handleJustOwnGroupClick = e => {
        this.setState(
            (state, props) => ({ justOwnGroup: !state.justOwnGroup}),
            this.changeOfPois
        );

    };

  //The filter of the pois
  changeOfPois = () => {
    // Show just own pois
    if (this.state.justOwn) {
      // with filter
      if (this.state.filterPoi !== undefined && this.state.POIs !== "") {
        this.setState((state, props) => ({
          filteredPoisToShow: state.POIs.filter(poi => {
            if (poi.Creator === undefined) {
              return poi;
            }
            return poi.Creator.id === props.user.sub
              ? this.filterThePoi(poi, state.filterPoi)
              : null;
          })
        }));
      } else {
        //without filter
        this.setState((state, props) => ({
          filteredPoisToShow: state.POIs.filter(poi => {
            return poi.Creator.id === props.user.sub ? poi : null;
          })
        }));
      }
    } else if (
      //show all pois -> is there a filter?
      this.state.filterPoi !== "" &&
      this.state.filterPoi !== undefined
    ) {
      this.setState((state, props) => ({
        filteredPoisToShow: state.POIs.filter(poi => {
          return this.filterThePoi(poi, state.filterPoi);
        })
      }));
    } else {
      //no filter and show all
      this.setState((state, props) => ({ filteredPoisToShow: state.POIs }));
    }
  };

  filterThePoi = (poi, filterPoi) => {
    let value = "";
    poi.Tags.map(tag => (value = value + tag.name));
    poi.Categories.map(cat => (value = value + cat.name));
    return poi.name.toLowerCase().includes(filterPoi.toLowerCase()) //if
      ? poi //yes
      : poi.description //else    if
          .toLowerCase()
          .includes(filterPoi.toLowerCase())
      ? poi // yes
      : poi.Creator.name //  else  if
          .toLowerCase()
          .includes(filterPoi.toLowerCase())
      ? poi //yes
      : value //else if
          .toLowerCase()
          .includes(filterPoi.toLowerCase())
      ? poi //yes
      : null; //else
  };

  // handle the like click
  setLike = async poiID => {
    let updatedPois = this.state.POIs;
    let likepoi = updatedPois.find(poi => poi.id === poiID);
    this.props.setLike(poiID, likepoi.liked ? "unlike" : "like");
    //update directly, and it will be proved with the next load
    likepoi.liked ? likepoi.likes-- : likepoi.likes++;
    likepoi.liked = !likepoi.liked;
    this.setState({ POIs: updatedPois });
  };

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  showCoordinates = e => {
    alert(e.latlng);
  };

  showNotifications() {
    // If the Notifications API is supported by the browser
    // then show the notification
    if (this.n.supported()) this.n.show();
  }

  render() {
    let currentPoi;

      if(this.state.justOwnGroup){
        currentPoi = this.state.filteredPoisToShow.filter(
            poi => poi.Creator.group === 4
        )[this.state.indexPoiPage];
      }else{
        currentPoi = this.state.filteredPoisToShow[this.state.indexPoiPage];
      }

    return (
      <div>
        <ReactNotifications
          onRef={ref => (this.n = ref)} // Required
          title="new poi add " // Required
          body={this.state.selectedPoi.name}
          icon="rete"
          tag="abcdef"
          timeout="2000"
          onClick={event => this.handleClick(event)}
        />
        {this.state.displayDiv && (
          <div id="shareDiv">
            <form onSubmit={this.sendEmail}>
              <Multiselect
                options={this.props.userList}
                displayValue="name"
                placeholder="Users" // Preselected value to persist in dropdown
                selectedvalues={this.state.selectedUsers}
                onSelect={this.onSelect}
                //onRemove={this.onRemove} // Function will trigger on remove event
                // Property name to display in the dropdown options
              />
              <button type="submit">Send</button>
            </form>
            <button onClick={e => this.setState({ displayDiv: false })}>
              X
            </button>
          </div>
        )}
        <div id="ClocksContainer">
          <div className="Clock">
            <AnalogClock gmtOffset="-8:00" width={100} theme={Themes.dark} />
            <div className="ClockCountry">Los Angeles</div>
            <img
              className="CountryFlag"
              src="https://c.tadst.com/gfx/n/fl/32/us.png"
            />
          </div>

          <div className="Clock">
            <AnalogClock gmtOffset="-4:30" width={100} theme={Themes.dark} />
            <div className="ClockCountry">New York</div>
            <img
              className="CountryFlag"
              src="https://c.tadst.com/gfx/n/fl/32/us.png"
            />
          </div>

          <div className="Clock">
            <AnalogClock width={100} theme={Themes.dark} />
            <div className="ClockCountry">Zurich</div>
            <img
              className="CountryFlag"
              src="https://c.tadst.com/gfx/n/fl/32/ch.png"
            />
          </div>

          <div className="Clock">
            <AnalogClock gmtOffset="+7:00" width={100} theme={Themes.dark} />
            <div className="ClockCountry">Bangkok</div>
            <img
              className="CountryFlag"
              width={30}
              height={20}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/1200px-Flag_of_Thailand.svg.png"
            />
          </div>

          <div className="Clock">
            <AnalogClock gmtOffset="+10:00" width={100} theme={Themes.dark} />
            <div className="ClockCountry">Sydney</div>
            <img
              className="CountryFlag"
              width={30}
              height={20}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1200px-Flag_of_New_Zealand.svg.png"
            />
          </div>
        </div>
        <div id="btnMapContainer">
          <button
            className={"PersoBtn"}
            id="btnForMap"
            onClick={this.ZoomOnMyLoca}
          >
            Locate Me
          </button>
        </div>
        <br />
        <br />
        <MenuOptions
          handleFilter={this.handleFilter}
          handleJustOwnClick={this.handleJustOwnClick}
          handleJustOwnGroupClick={this.handleJustOwnGroupClick}
          justOwn={this.state.justOwn}
          justOwnGroup={this.state.justOwnGroup}
        />

        {this.state.is2ddisplayed && (
          <Map
            className="map"
            id="map"
            minZoom={2}
            center={[0, 5]}
            zoom={2}
            onClick={(e)=>this.doubleClick}
            contextmenu={true}
            contextmenuWidth={140}
            contextmenuItems={[
              {
                text: "Show coordinates",
                callback: this.showCoordinates
              },
              {
                text: "add Marker",
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
                    .filter(poi => poi.Creator.id == this.props.user.sub)
                    .map(poi => (
                      <POIMarker
                        addPoi={this.addPoi}
                        poi={poi}
                        poisList={this.state.filteredPoisToShow}
                        categories={this.state.categories}
                        tags={this.state.tags}
                        user={this.props.user}
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

              <Overlay name="show pois" checked>
                <LayerGroup>
                  {console.log(this.state.filteredPoisToShow)}
                  {console.log(this.state.justOwnGroup)}
                    {this.state.justOwnGroup&&this.state.filteredPoisToShow
                            .filter(poi => poi.Creator.group === 4)
                            .map(poi => (
                                <POIMarker
                                    addPoi={this.addPoi}
                                    poi={poi}
                                    poisList={this.state.filteredPoisToShow}
                                    categories={this.state.categories}
                                    tags={this.state.tags}
                                    user={this.props.user}
                                    displayPoi={this.displayPoi}
                                />
                            ))
                    }
                    {!this.state.justOwnGroup&&this.state.filteredPoisToShow
                        .map(poi => (
                            <POIMarker
                                addPoi={this.addPoi}
                                poi={poi}
                                poisList={this.state.filteredPoisToShow}
                                categories={this.state.categories}
                                tags={this.state.tags}
                                user={this.props.user}
                                displayPoi={this.displayPoi}
                            />
                        ))
                    }

                </LayerGroup>
              </Overlay>
              <Control position="topleft">
                <div className="dropdown">
                  <audio ref={ref => (this.notificationSound = ref)} />
                  <div>
                    <button className="PersoBtn">
                      {this.state.notifications.length}
                    </button>
                    <div className="dropdown-content">
                      {this.state.notifications.map(poi => (
                        <a
                          onClick={() => {
                            this.scrollToMyRef();
                            this.leafletMap.leafletElement.closePopup();
                            this.leafletMap.leafletElement.flyTo(
                              { lat: poi.lat, lng: poi.lng },
                              15
                            );
                            this.setState({
                              notifications: this.state.notifications.filter(
                                n => n !== poi
                              )
                            });
                          }}
                        >
                          <img
                            width={50}
                            height={50}
                            src={poi.Creator.picture}
                          />{" "}
                          {poi.Creator.name} added : {poi.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </Control>
              <Overlay key="pois" name="my position " checked>
                <LayerGroup>
                  <Marker
                    position={{
                      lat: this.props.position.lat,
                      lng: this.props.position.lng
                    }}
                    icon={myPostionIcon}
                  >
                    <Popup>My Position</Popup>
                  </Marker>
                </LayerGroup>
              </Overlay>
            </LayersControl>
            <Control position="topleft">
              <img
                src={targetIcon}
                onClick={this.ZoomOnMyLoca}
                width={20}
                height={20}
              />
            </Control>

            <Control position="bottomright">
              <img
                src={routeIconImg}
                onClick={this.addRoute}
                width={20}
                height={20}
              />
            </Control>

            {this.state.Routes.map(route => (
              <Routing map={this.leafletMap} route={route} />
            ))}
          </Map>
        )}

        <div className="DetailsPoi">
          <div className="leftDetails">
            {this.state.justOwnGroup&&
            <div className="ListPoi">
              <ul className="GroupPoi">
                  <b>My Group Poi :</b>
                  {this.state.filteredPoisToShow
                  .filter(poi => poi.Creator.group === 4)
                  .map(poi => (
                    <li id="singleGroupPoi"
                      value={getIndex(
                        poi.name,
                        this.state.filteredPoisToShow.filter(
                          poi => poi.Creator.group === 4
                        ),
                        "name"
                      )}
                      onClick={e =>
                        this.setState({ indexPoiPage: e.target.value })
                      }
                    >
                      {poi.name}
                    </li>
                  ))}
              </ul>
            </div>}
              {!this.state.justOwnGroup&&<div className="ListPoi">
                  <ul className="GroupPoi">
                    <b>All Pois :</b>
                      {this.state.filteredPoisToShow
                          .map(poi => (
                              <li id="singleGroupPoi"
                                  value={getIndex(
                                      poi.name,
                                      this.state.filteredPoisToShow,
                                      "name"
                                  )}
                                  onClick={e =>
                                  {
                                      this.setState({ indexPoiPage: e.target.value })}
                                  }
                              >
                                  {poi.name}
                              </li>
                          ))}
                  </ul>
              </div>}
          </div>
          <div className="rightDetails">
            <POI
              {...currentPoi}
              zoomOnMarker={this.zoomOnMarker}
              deleteMarker={this.deleteMarker}
              sendEmail={this.dispalyDiv}
              setLike={this.setLike}
            />
          </div>
        </div>
      </div>
    );
  }
}

function getIndex(value, arr, prop) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][prop] === value) {
      return i;
    }
  }
  return -1; //to handle the case where the value doesn't exist
}

export default AppWrapper;
