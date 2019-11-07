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

      <div className="movie_card" >
          <div className="info_section">
            <div className="movie_header">
              <img className="locandina"
                   src={image}/>
              <h1><a href={url} target="_blank" className="App-link">
                {name}
              </a></h1>
              <h4>{creator.name}</h4>
              <span className="minutes">{lat} {lng}</span>
              {Categories && Categories.length > 0 && (
              <p className="type">   {Categories.map(category => (
                  <div>
                  <img className="category-image" src={category.image} />
                  <p>{category.name}</p>
                  </div>
              ))}</p>)}
              {Tags && Tags.length > 0 && (
                  <p className="type">   {Tags.map(tag => (
                      <div>
                        <img className="category-image" src={tag.image} />
                        <p>{tag.name} </p>
                      </div>
                  ))}</p>)}
            </div>
            <div className="movie_desc">
              <p className="text">
                {description}
              </p>
              <p className="text">
                {"👍"+likes}
              </p>
            </div>
            <div className="movie_social">
              <ul>
                  <button onClick={handleLikeClick}>
                      {liked ? "Liked 👍" : "Not liked 👎"}
                  </button>
                 <img width={20} height={20} src={targetIcon} name={id} onClick={zoomOnMarker}/>
                {creator.id != undefined && <img width={20} height={20} src={deleteIcon} name={id} onClick={deleteMarker}/>}
                   <img width={20} height={20} src={shareIcon} name={id} onClick={sendEmail}/>
              </ul>
            </div>
          </div>
          <div className="blur_back bright_back" style={{ background:`url(${creator.picture})`}}/>
        </div>






    // <div className="poi" style={{ borderColor: statusColor }}>
    //   {Status && (
    //     <span className="status" style={{ color: statusColor }}>
    //       <small>{Status.name }  </small>
    //     </span>
    //   )}
    //   {Categories && Categories.length > 0 && (
    //     <div className="categories">
    //
    //     </div>
    //   )}
    //   <h2>
    //     {url ? (
    //       <a href={url} target="_blank" className="App-link">
    //         {name}
    //       </a>
    //     ) : (
    //       <span>{name}</span>
    //     )}
    //   </h2>
    //   {image && <img className="poi-image" alt={name} src={image} />}
    //   <section>{description}</section>
    //   {Tags && Tags.length > 0 && (
    //     <>
    //       <hr />
    //       <div className="categories">
    //         {Tags.map(tag => (
    //           <span
    //             className="category tag"
    //             style={{ backgroundColor: tag.color }}
    //             key={tag.id}
    //           >
    //             {tag.image && (
    //               <img className="category-image" src={tag.image} />
    //             )}
    //             <small> {tag.name}</small>
    //           </span>
    //         ))}
    //       </div>
    //
    //     </>
    //   )}
    //
    //   <img width={20} height={20} src={targetIcon} name={id} onClick={zoomOnMarker}></img>
    //   <img width={20} height={20} src={deleteIcon} name={id} onClick={deleteMarker}></img>
    //     <img width={20} height={20} src={shareIcon} name={id} onClick={sendEmail}></img>
    // </div>
  );
}
