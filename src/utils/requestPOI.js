export class requestPOI {
  //Update some Information for a POI
  static async updateObject(
    objectType,
    id,
    updateObject,
    getTokenSilently,
    loginWithRedirect
  ) {
    try {
      let token = await getTokenSilently();
      console.log(JSON.stringify(updateObject));
      console.log("request pass");
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}` + "/" + objectType + "/" + id,
        {
          method: "PATCH",
          body: JSON.stringify(updateObject),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(response);
      let data = await response.json();
      console.log("status" + response.status);
      return data;
    } catch (e) {
      console.error(e);
      //await loginWithRedirect();
      return null;
    }
  }
  static async updatePOICat(
    idCateArray,
    id,
    getTokenSilently,
    loginWithRedirect
  ) {
    console.log("update called");
    try {
      let token = await getTokenSilently();
      console.log(JSON.stringify(idCateArray));
      console.log("request pass");
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/poi/` + id + /category/,
        {
          method: "PATCH",
          body: JSON.stringify(idCateArray),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(response);
      let data = await response.json();
      console.log("status" + response.status);
      return await data;
    } catch (e) {
      console.error(e);
      //await loginWithRedirect();
      return null;
    }
  }
  static async updatePoiType(
    object,
    idArray,
    idPoi,
    getTokenSilently,
    loginWithRedirect
  ) {
    console.log("update called");
    try {
      let token = await getTokenSilently();
      console.log(JSON.stringify(idArray));
      console.log("request pass");
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/poi/` + idPoi + "/" + object + "/",
        {
          method: "PATCH",
          body: JSON.stringify(idArray),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(response);
      let data = await response.json();
      console.log("status" + response.status);
      return await data;
    } catch (e) {
      console.error(e);
      //await loginWithRedirect();
      return null;
    }
  }
  //Create a new POI in the Database
  static async addNewObject(
    object,
    newObject,
    getTokenSilently,
    loginWithRedirect
  ) {
    try {
      let token = await getTokenSilently();
      console.log(JSON.stringify(newObject));
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/` + object,
        {
          method: "POST",
          body: JSON.stringify(newObject),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("save poi method called, response : ");
      let data = await response.json();
      console.log(response);
      return data;
    } catch (e) {
      console.error(e);
      await loginWithRedirect();
      return null;
    }
  }

  //Return all POIs from the Database group=4
  static async getAllObject(getTokenSilently, loginWithRedirect, object) {
    try {
      let token = await getTokenSilently();
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/` + object,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      let data = await response.json();
      return data;
    } catch (e) {
      console.error(e);
      await loginWithRedirect();
    }
  }
  //Get some Information from a POI with the Id as paratmeter
  static async getPOI(id, getTokenSilently, loginWithRedirect) {
    try {
      let token = await getTokenSilently();
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/poi/` + id,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      let data = await response.json();
      return data;
    } catch (e) {
      console.error(e);
      await loginWithRedirect();
    }
  }
  //Delete a POI in the Database
  static async deleteObject(object, id, getTokenSilently, loginWithRedirect) {
    try {
      let token = await getTokenSilently();
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/` + object + "/" + id,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      let data = await response.json();
      return data;
    } catch (e) {
      console.error(e);
      await loginWithRedirect();
    }
  }

  static async getObjectWithId(
    objectID,
    objectType,
    getTokenSilently,
    loginWithRedirect
  ) {
    try {
      let token = await getTokenSilently();
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/` + objectType + "/" + objectID,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      let data = await response.json();
      return data;
    } catch (e) {
      console.error(e);
      await loginWithRedirect();
    }
  }

  static async updateLike(
    objectType,
    id,
    likeTyp,
    getTokenSilently,
    loginWithRedirect
  ) {
    try {
      let token = await getTokenSilently();
      console.log("request pass");
      let response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}` +
          "/" +
          objectType +
          "/" +
          id +
          "/" +
          likeTyp,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(response);
      let data = await response.json();
      console.log("status" + response.status);
      return data;
    } catch (e) {
      console.error(e);
      //await loginWithRedirect();
      return null;
    }
  }
}
export default requestPOI;
