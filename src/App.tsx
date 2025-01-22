import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./lib/router";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './output.css'

function App() {

  return (
    <RouterProvider router={router} />
  );
}

export default App;
