import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
    const script = document.createElement("script");

    script.src = "https://cdn-webgl.eegeo.com/eegeojs/api/v0.1.780/eegeo.js";
    script.async = true;

    document.body.appendChild(script);
});
