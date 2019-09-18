import React from "react";
import "./POI.css";

export default function POI(props) {
  const { name, description, lat, lng, image, url } = props;
  const { Categories, Tags, User, Status } = props;

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
    <div className="poi" style={{ borderColor: statusColor }}>
      {Status && (
        <span className="status" style={{ color: statusColor }}>
          <small>{Status.name}</small>
        </span>
      )}
      {Categories && Categories.length > 0 && (
        <div className="categories">
          {Categories.map(category => (
            <span className="category">
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
    </div>
  );
}
