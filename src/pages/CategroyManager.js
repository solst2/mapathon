import React, { useState, Component, useEffect, useRef } from "react";
import { FormInput } from "../components/FormInput";

import { useAuth0 } from "../react-auth0-spa";
import request from "../utils/request";
import { Redirect } from "react-router-dom";
import deleteIcon from "../icons/delete.png";

export default function CategoryManager(props) {
  let [categories, setAllcategories] = useState([]);
  let [category, setCategory] = useState({ name: "", group: "", image: "" });
  let [isDisable, setDisable] = useState(false);
  const {
    isAuthenticated,
    loginWithRedirect,
    loading,
    getTokenSilently,
    user
  } = useAuth0();
  useEffect(() => {
    const fn = async () => {
      setAllcategories(await getAllO("category"));
    };
    fn();
  }, [isAuthenticated, loginWithRedirect, loading]);
  async function getAllO(object) {
    return await request.getAllObject(
      getTokenSilently,
      loginWithRedirect,
      object
    );
  }

  function handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let updatedCat = { ...category };
    updatedCat[name] = value;
    setCategory(updatedCat);
  }

  async function handlecatAdd(event) {
    event.preventDefault();

    if (category.id == null) {
      await request.addNewObject(
        "category",
        category,
        getTokenSilently,
        loginWithRedirect
      );
    } else {
      let answer = await request.updateObject(
        "category",
        category.id,
        category,
        getTokenSilently,
        loginWithRedirect
      );
    }

    event.preventDefault();
    setAllcategories(await getAllO("category"));
    setDisable(false);
  }
  async function AddCategory(event) {
    event.preventDefault();

    setCategory(
      categories.push({ name: "", group: "", image: "", iscreated: true })
    );
  }
  async function deleteCategory(event) {
    await request.deleteObject(
      "category",
      event.target.name,
      getTokenSilently,
      loginWithRedirect
    );
    setAllcategories(await getAllO("category"));
  }

  function AddCategory(event) {
    setDisable(true);
    setCategory(
      categories.push({ name: "", group: "", image: "", iscreated: true })
    );
  }
  function ModifyCat(event) {
    setDisable(true);
    let updatecatList = categories;

    let findCat = updatecatList.find(c => c.id == event.target.name);
    console.log(findCat.id);

    updatecatList = categories.filter(c => c !== findCat);
    findCat.iscreated = true;
    updatecatList.push(findCat);

    setAllcategories(updatecatList);
    setCategory(findCat);
  }
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  let catcreat = false;
  return (
    <div>
      <div class="wrapper">
        <form onSubmit={handlecatAdd}>
          <div className="table">
            <div className="row header">
              <div className="cell">Name</div>
              <div className="cell">Marker</div>
              <div className="cell">Creator</div>
              <div className="cell">Edit</div>
            </div>

            {categories.map(cat => {
              if (cat.iscreated)
                return (
                  <div className="row">
                    <div className="cell">
                      <FormInput
                        type="text"
                        name="name"
                        placeholder="name"
                        value={category.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="AddForm">
                      <FormInput
                        type="text"
                        name="image"
                        placeholder="marker"
                        value={category.image}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="cell" data-title="Location">
                      <button className="PersoBtn">Save</button>{" "}
                    </div>
                  </div>
                );

              return (
                <div className="row">
                  <div className="cell">{cat.name} </div>
                  <div className="cell">
                    <img width={50} height={50} src={cat.image} />{" "}
                  </div>
                  <div className="cell">{cat.Creator.name} </div>
                  {cat.Creator.id === user.sub && (
                    <div className="cell">
                      <img
                        width={20}
                        height={20}
                        src={deleteIcon}
                        onClick={deleteCategory}
                        name={cat.id}
                      ></img>{" "}
                      <img
                        width={10}
                        height={10}
                        src="https://image.flaticon.com/icons/svg/61/61456.svg"
                        name={cat.id}
                        onClick={ModifyCat}
                      />{" "}
                    </div>
                  )}
                  {cat.Creator.id !== user.sub && <div className="cell"></div>}
                </div>
              );
            })}
          </div>
          <br />
          {categories.map(category =>
            category.iscreated ? (catcreat = true) : null
          )}
          {!isDisable && !catcreat && (
            <button
              className="PersoBtn"
              style={{ width: "75%" }}
              onClick={AddCategory}
            >
              Add category
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
