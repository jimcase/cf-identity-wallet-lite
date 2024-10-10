// src/pages/BarcodeScannerPage.tsx
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { scanOutline } from "ionicons/icons";
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
} from "@capacitor-mlkit/barcode-scanning";
import React, { useState } from "react";
import { Capacitor } from "@capacitor/core"; // Import Capacitor to check platform
import "./Scanner.css";

const Scanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const checkPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log("Permissions check skipped: not a native platform.");
      return false; // Immediately return false if not on a native platform
    }
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera !== "granted") {
      const requestResult = await BarcodeScanner.requestPermissions();
      return requestResult.camera === "granted";
    }
    return true;
  };

  const startScan = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.error("This feature is only available on native platforms.");
      return;
    }

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.error("Camera permission not granted");
      return;
    }

    setIsScanning(true);
    document.querySelector("body")?.classList.add("barcode-scanner-active");

    try {
      const listener = await BarcodeScanner.addListener(
        "barcodeScanned",
        async (result) => {
          console.log("result");
          console.log(result);
          if (result) {
            //setScanResult(result);
            stopScan();
          }
        }
      );

      await BarcodeScanner.startScan({
        formats: [BarcodeFormat.QrCode],
        lensFacing: LensFacing.Back,
      });
    } catch (error) {
      console.error("Error starting the barcode scan:", error);
      stopScan();
    }
  };

  const stopScan = async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    console.log("stopScan");
    setIsScanning(false);
    document.querySelector("body")?.classList.remove("barcode-scanner-active");
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scan Barcodes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        className="ion-padding"
      >
        <div className="scanner-container">
          {isScanning ? (
            <div className="scanner-spinner-container">
              <IonSpinner name="circular" />
              <p>Scanning...</p>
            </div>
          ) : (
            <>
              <IonButton onClick={startScan}>
                <IonIcon
                  slot="start"
                  icon={scanOutline}
                />
                Start Scanning
              </IonButton>
              {scanResult && <p>Scan Result: {scanResult}</p>}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Scanner;
