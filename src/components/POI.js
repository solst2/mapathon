import React from "react";
import "./POI.css";
import deleteIcon from "../icons/delete.png";
import targetIcon from "../icons/targetWhite.png";
import shareIcon from "../icons/share.png";
export default function POI(props) {
  const {
    name,
    description,
    lat,
    id,
    lng,
    image,
    url,
    liked,
    likes
  } = props;
  const { Categories, Tags, Status } = props;
  const creator = { ...props.Creator };
  const { zoomOnMarker, deleteMarker, sendEmail, setLike } = props;

  let handleLikeClick = async e => {
    setLike(id);
  };

  return (
    <div className="PoiCard">
      <div className="info_section">
        <div className="movie_header">
          <img className="picture" src={image} />
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
                <br/>
                <div>
                <p className="text">
                  <b>Description</b> <br/>
                  {description}
                </p>
              </div>
                <br/>
                <div className="coordinate">
                  <b>Latitude :</b> {lat} <br/>
                  <b>Longitude :</b> {lng}
                </div>
                <br/>
                <p className="text"><b>Url</b></p>
                <div className="text"> {url}</div>
                <br/>
                <br/>
                <p className="text">
                  {"👍"+likes}
                </p>
                <button onClick={handleLikeClick}>
                  {liked ? "Dislike 👎" : "Like 👍" }
                </button>
              </div>
            </div>
              <div className="utilitiesBtn">
                  <img width={20} height={20} src={targetIcon} name={id} onClick={zoomOnMarker}/>
                  <div className="utilitie">
                  {id !== undefined && <img width={20} height={20} src={deleteIcon} name={id} onClick={deleteMarker}/>}
                  </div>
                  <div className="utilitie">
                  <img width={20} height={20} src={shareIcon} name={id} onClick={sendEmail}/>
                  </div>
              </div>
            </div>
          </div>
  );
}
