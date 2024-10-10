import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { RoutePath } from "./paths";
import Home from "../ui/pages/Home/Home";
import Scanner from "../ui/pages/Scanner/Scanner";

const Routes = () => {
  return (
    <IonRouterOutlet animated={false}>
      <Route
        path={RoutePath.HOME}
        component={Home}
        exact
      />

      <Route
        path={RoutePath.SCANNER}
        component={Scanner}
        exact
      />

      <Redirect
        exact
        from="/"
        to={RoutePath.HOME}
      />
    </IonRouterOutlet>
  );
};

export { Routes, RoutePath };
