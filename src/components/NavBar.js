// src/components/NavBar.js

import React from "react";
import { useAuth0 } from "../react-auth0-spa";
import {BrowserRouter as Router, Link} from "react-router-dom";
import "../w3template.css"
const NavBar = () => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

    return (

        <div >
            <ul className={"cast"} id="ulNav" >
                <li className="liNav"><Link className="divLink" to="/">Map</Link></li>
                <li className="liNav"><Link className="divLink">Settings</Link></li>
                <li className="liNav"> <Link className="divLink" to="/categories">Categories</Link></li>
                <li className="liNav"><Link className="divLink" to="/tags">Tags</Link></li>
                <li className="dropdown">
                    <a href="javascript:void(0)" className="dropbtn">Manage</a>
                    <div className="dropdown-content">
                        <Link className="divLink" to="/tags">Tags</Link>
                        <Link className="divLink" to="/tags">Tags</Link><Link className="divLink" to="/tags">Tags</Link>

                    </div>
                </li>
                <li>
            {!isAuthenticated && (
                <button
                    onClick={() =>
                        loginWithRedirect({})
                    }
                >
                    Log in
                </button>
            )}

            {isAuthenticated && <button onClick={() => logout()} className="ButtonLogout">Log out</button>}
                </li>
            </ul>
        </div>
    );
};

export default NavBar;