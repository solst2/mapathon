import React from "react";
import "./POI.css";
import deleteIcon from "../icons/delete.png"
import targetIcon from "../icons/target.png"
import shareIcon from "../icons/share.png"
import {preventDefault} from "leaflet/src/dom/DomEvent";
export default function POI(props) {
  const { name, description, lat, id,lng, image, url, group, liked, likes} = props;
  const { Categories, Tags, User, Status } = props;
const creator={...props.Creator}
console.log(creator.email)
  const { zoomOnMarker, deleteMarker, sendEmail, setLike } = props;

  let handleLikeClick = async e => {
    setLike(id);
  };

  let statusColor;
  if (Status) {
    switch (Status.id) {
      case 1:
        statusColor = "red";
        break;
      case 2:
        statusColor = "orange";
        break;
      case 3:
        statusColor = "green";
        break;
    }
  }

  return (

      <div className="PoiCard" >
          <div className="info_section">
            <div className="movie_header">
              <img className="picture" src={image}/>
              <div className="detailsPoi">
              <h1>
                <a href={url} target="_blank" className="PoiTitle">
                {name}
              </a>
              </h1>
                {Categories && Categories.length > 0 && (
                  <p className="type">   {Categories.map(category => (
                      <div className="type">
                        <img width={25} height={30} src={category.image}/> <a>{category.name}</a>
                      </div>
                  ))}</p>)}
              {Tags && Tags.length > 0 && (
                  <p className="type">   {Tags.map(tag => (
                      <div className="type">
                        <img width={25} height={30} src={tag.image}/> <a>{tag.name}</a>
                      </div>
                  ))}</p>)}
                <h4>Created by  {creator.name} </h4>
                <div>
                <p className="text">
                  <b>Description</b> <br/>
                  {description}
                </p>
              </div>
                <div className="coordinate">
                  <b>Latitude :</b> {lat} <br/>
                  <b>Longitude :</b> {lng}
                </div>
              </div>
            </div>
              <ul>
                  <p className="text">
                      {"👍"+likes}
                  </p>
                  <button onClick={handleLikeClick}>
                      {liked ? "Liked 👍" : "Not liked 👎"}
                  </button>
                 <img width={20} height={20} src={targetIcon} name={id} onClick={zoomOnMarker}/>
                {creator.id != undefined && <img width={20} height={20} src={deleteIcon} name={id} onClick={deleteMarker}/>}
                   <img width={20} height={20} src={shareIcon} name={id} onClick={sendEmail}/>
              </ul>
            </div>
          </div>
  );
}
