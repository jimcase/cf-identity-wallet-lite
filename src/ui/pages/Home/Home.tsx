import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from "@ionic/react";
import "./Home.css";
import React from "react";
import { useHistory } from "react-router-dom";

const Home: React.FC = () => {
  const history = useHistory();

  const navigateToScanner = () => {
    history.push("/scanner");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Welcome</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="center-container">
          <IonButton
            expand="block"
            onClick={navigateToScanner}
            style={{ margin: "20px" }}
          >
            Go to Scanner
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
