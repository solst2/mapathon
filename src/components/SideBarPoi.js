import React from "react";
import "./POI.css";
import deleteIcon from "../icons/delete.png"
import targetIcon from "../icons/target.png"
import shareIcon from "../icons/share.png"
export default function SideBarPoi(props) {
    const { name, description, lat, id,lng, image, url, group} = props;
    const { Categories, Tags, User, Status } = props;
    const {zoomOnMarker,deleteMarker,hideSide}=props;

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
        <div>
            <button onClick={hideSide}>X</button>
            <div className="poi" style={{ borderColor: statusColor }}>
            {Status && (
                <span className="status" style={{ color: statusColor }}>
          <small>{Status.name }  </small>
        </span>
            )}
            {Categories && Categories.length > 0 && (
                <div className="categories">
                    {Categories.map(category => (
                        <span className="category" key={category.id}>
              {category.image && (
                  <img className="category-image" src={category.image} />
              )}
                            <small> {category.name}</small>
            </span>
                    ))}
                </div>
            )}
            <h2>
                {url ? (
                    <a href={url} target="_blank" className="App-link">
                        {name}
                    </a>
                ) : (
                    <span>{name}</span>
                )}
            </h2>
            {image && <img className="poi-image" alt={name} src={image} />}
            <section>{description}</section>
            {Tags && Tags.length > 0 && (
                <>
                    <hr />
                    <div className="categories">
                        {Tags.map(tag => (
                            <span
                                className="category tag"
                                style={{ backgroundColor: tag.color }}
                                key={tag.id}
                            >
                {tag.image && (
                    <img className="category-image" src={tag.image} />
                )}
                                <small> {tag.name}</small>
              </span>
                        ))}
                    </div>

                </>
            )}

            <img width={20} height={20} src={targetIcon} name={id} onClick={zoomOnMarker}></img>
            <img width={20} height={20} src={deleteIcon} name={id} onClick={deleteMarker}></img>
            <img width={20} height={20} src={shareIcon} name={id} ></img>
        </div>
        </div>
    );
}
