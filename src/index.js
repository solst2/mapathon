import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import auth_config from "./auth_config.js";
import {Auth0Provider, useAuth0} from "./react-auth0-spa";
import { createBrowserHistory } from "history";
import 'leaflet/dist/leaflet.css';
import './w3template.css';
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.js";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";
import { Route, BrowserRouter as Router } from 'react-router-dom'
import TagManager from "./pages/TagManager";
import CategoryManager from './pages/CategroyManager'
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
        onRedirectCallback={onRedirectCallback}>
        <Router>

            <Route exact  path="/" component={App} />
            <Route path="/categories" component={CategoryManager} />
            <Route path="/tags" component={TagManager} />
        </Router>
    </Auth0Provider>
);

ReactDOM.render(
    routing,
    document.getElementById("root")
);
