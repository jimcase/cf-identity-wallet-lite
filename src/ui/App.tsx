import { IonApp, setupIonicReact } from "@ionic/react";
import { StrictMode } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./App.scss";

setupIonicReact();

const App = () => {
  const renderApp = () => {
    return (
      <IonReactRouter>
        <Routes />
      </IonReactRouter>
    );
  };

  return (
    <IonApp>
      <StrictMode>{renderApp()}</StrictMode>
    </IonApp>
  );
};

export { App };
