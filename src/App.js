import React, { useState } from "react";
import "./App.css";
import { useAuth0 } from "./react-auth0-spa";
import request from "./utils/request";
import config from "./config";
import endpoints from "./endpoints";

function App() {
  let [pois, setPois] = useState([]);
  let { loginWithRedirect, getTokenSilently } = useAuth0();

  let handlePOIsClick = async e => {
    e.preventDefault();
    let pois = await request(
      `${config.baseURL}${endpoints.pois}`,
      getTokenSilently,
      loginWithRedirect
    );
    console.log(pois.data);
    setPois(pois.data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mapathon</h1>
        <br />
        <a className="App-link" href="#" onClick={handlePOIsClick}>
          Get POIs
        </a>
        {pois && pois.length > 0 && <p>{JSON.stringify(pois)}</p>}
      </header>
    </div>
  );
}

export default App;
