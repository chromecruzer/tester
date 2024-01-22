import {BrowserRouter} from "react-router-dom";
import React from "react";

import RouterSwitch from './navigation/RouterSwitch';
import {TracContextProvider} from './TracContext';
import {Layout} from "./navigation/Layout";


export const App = () => {
  return (
    <TracContextProvider>
      <BrowserRouter>
        <Layout>
          <RouterSwitch/>
        </Layout>
      </BrowserRouter>
    </TracContextProvider>
  );
};
