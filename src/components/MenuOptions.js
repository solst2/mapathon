import React, { useState } from "react";

export default function MenuOptions(props) {
  let [text, setText] = useState("Create new POI");
  let [filter, setFilter] = useState("Filter POIs");
  let [showFilterInput, setShowFilterInput] = useState(false);

  let handleFilterClick = async e => {
    setShowFilterInput(true);
    setFilter("Filter activated");
  };

  return (
    <div id="btnMapContainer">
      <button onClick={handleFilterClick} className="PersoBtn" id="btnForMap">
        {filter}
      </button>
        <br/>
        <br/>
        {showFilterInput ? <input onChange={props.handleFilter} /> : null}
      {showFilterInput ? (
        <div>
          <input
            type="checkbox"
            checked={props.justOwn}
            onChange={props.handleJustOwnClick}
          />
          <small id="smallText">Show my POI</small>
        </div>
      ) : null}
    </div>
  );
}
