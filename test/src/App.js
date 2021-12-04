/*                                            *\
** ------------------------------------------ **
**         Calliope - Site Generator   	      **
** ------------------------------------------ **
**  Copyright (c) 2020 - Kyle Derby MacInnis  **
**                                            **
** Any unauthorized distribution or transfer  **
**    of this work is strictly prohibited.    **
**                                            **
**           All Rights Reserved.             **
** ------------------------------------------ **
\*                                            */

import React, { useRef, useEffect } from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Pixos from "calliope-pixos/dist/bundle.js";
// APP
const App = () => {
  // Return Themed Site
  return Pixos();
};

export default Pixos;
