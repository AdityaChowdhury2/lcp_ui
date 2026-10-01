import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store"
import './index.css'
import App from "./App";
import { AuthBootstrap } from "./Components/AuthBootstrap";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <Provider store={store}>
    <AuthBootstrap>
      <App />
    </AuthBootstrap>
  </Provider>
);
