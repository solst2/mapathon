import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import CategoryManager from './pages/CategroyManager'
import Settings from "./Settings";
import auth_config from "./auth_config.js";
import * as serviceWorker from "./serviceWorker";
import {Auth0Provider, useAuth0} from "./react-auth0-spa";
import { createBrowserHistory } from "history";
import 'leaflet/dist/leaflet.css';
import './w3template.css';
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.js";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import {Map} from "react-leaflet";
import TagManager from "./pages/TagManager";
let history = createBrowserHistory();

const onRedirectCallback = appState => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

const routing = (
    <Auth0Provider
        domain={auth_config.domain}
        client_id={auth_config.clientId}
        redirect_uri={window.location.origin}
        audience={auth_config.audience}
        onRedirectCallback={onRedirectCallback}

    >
    <Router>

       <Route exact  path="/" component={App} />
       <Route path="/categories" component={CategoryManager} ></Route>
        <Route path="/tags" component={TagManager} ></Route>
        <Route path="/settings" component={Settings} />
    </Router>
    </Auth0Provider>
)

ReactDOM.render(

    routing,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
