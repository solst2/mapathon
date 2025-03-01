import React from "react";
import { useAuth0 } from "../react-auth0-spa";
import { Map } from "react-leaflet";
import { Route, Link, BrowserRouter as Router } from "react-router-dom";
import "../w3template.css";

const NavBar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <div id="Navbar">
      <ul className="MenuList">
        <li className="liNav">
          <Link className="divLink" to="/">
            Map
          </Link>
        </li>
        <li className="liNav">
          {" "}
          <Link className="divLink" to="/categories">
            Categories
          </Link>
        </li>
        <li className="liNav">
          <Link className="divLink" to="/tags">
            Tags
          </Link>
        </li>
      </ul>
      <div id="DivLog">
        <div id="DivLog2">
          {!isAuthenticated && (
            <button className="PersoBtn" onClick={() => loginWithRedirect({})}>
              Log in
            </button>
          )}

          {isAuthenticated && (
            <a href="/">
              <button
                onClick={() => {
                  logout({ returnTo: window.location.origin });
                }}
                className="PersoBtn"
                id="BtnLogOut"
              >
                Log out
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
