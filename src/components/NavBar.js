// src/components/NavBar.js

import React from "react";
import { useAuth0 } from "../react-auth0-spa";
import {BrowserRouter as Router, Link} from "react-router-dom";
import "../w3template.css"
const NavBar = () => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

    return (
        <div id="Navbar">
            <ul className="MenuList">
                <li className="liNav"><Link className="divLink" to="/">Map</Link></li>
                <li className="liNav"> <Link className="divLink" to="/categories">Categories</Link></li>
                <li className="liNav"><Link className="divLink" to="/tags">Tags</Link></li>
            </ul>
            <div id="DivLog">
                <div id="DivLog2">
                {!isAuthenticated && (
                    <button className="PersoBtn"
                            onClick={() =>
                                loginWithRedirect({})
                            }>
                        Log in
                    </button>
                )}

                {isAuthenticated && <button onClick={() => logout()} className="PersoBtn" id="BtnLogOut">Log out</button>}
                </div>
            </div>
        </div>

    );
};

export default NavBar;