import React, { useState } from "react";
import "./App.css";
import { useAuth0 } from "./react-auth0-spa";
import request from "./utils/request";
import endpoints from "./endpoints";
import Loading from "./components/Loading";
import POI from "./components/POI";

function App() {
  let [pois, setPois] = useState([]);
  let { loading, loginWithRedirect, getTokenSilently } = useAuth0();

  let handlePOIsClick = async e => {
    e.preventDefault();
    let pois = await request(
      `${process.env.REACT_APP_SERVER_URL}${endpoints.pois}`,
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
        <h1>Mapathon</h1>
        <br />
        <a className="App-link" href="#" onClick={handlePOIsClick}>
          Get POIs
        </a>
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
