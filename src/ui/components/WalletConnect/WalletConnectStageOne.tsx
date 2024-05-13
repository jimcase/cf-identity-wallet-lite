import { IonIcon } from "@ionic/react";
import { checkmark, personCircleOutline } from "ionicons/icons";
import { useState } from "react";
import { i18n } from "../../../i18n";
import { Alert } from "../../components/Alert";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { combineClassNames } from "../../utils/style";
import "./WalletConnect.scss";
import { WalletConnectStageOneProps } from "./WalletConnect.types";

const WalletConnectStageOne = ({
  isOpen,
  className,
  onClose,
  onAccept,
}: WalletConnectStageOneProps) => {
  const [openDeclineAlert, setOpenDeclineAlert] = useState(false);
  const [acceptAnimation, setAcceptAnimation] = useState(false);

  const classes = combineClassNames(className, {
    show: !!isOpen,
    hide: !isOpen,
    "animation-on": acceptAnimation,
    "animation-off": !acceptAnimation,
  });

  const openDecline = () => {
    setOpenDeclineAlert(true);
  };

  const handleClose = () => {
    onClose();
  };

  const handleAccept = () => {
    setAcceptAnimation(true);

    setTimeout(() => {
      onAccept();
    }, 700);
  };

  return (
    <>
      <ResponsivePageLayout
        pageId="connect-wallet-stage-one"
        activeStatus={isOpen}
        customClass={classes}
        header={
          <PageHeader
            title={`${i18n.t(
              "menu.tab.items.connectwallet.request.stageone.title"
            )}`}
            closeButton
            closeButtonLabel={`${i18n.t(
              "menu.tab.items.connectwallet.request.button.back"
            )}`}
            closeButtonAction={openDecline}
          />
        }
      >
        <div className="request-animation-center">
          <div className="request-icons-row">
            <div className="request-user-logo">
              <IonIcon
                icon={personCircleOutline}
                color="light"
              />
            </div>
            <div className="request-checkmark-logo">
              <span>
                <IonIcon icon={checkmark} />
              </span>
            </div>
          </div>
          <p
            data-testid="wallet-connect-message"
            className="wallet-connect-message"
          >
            {i18n.t("menu.tab.items.connectwallet.request.stageone.message")}
          </p>
        </div>
        <PageFooter
          customClass="request-footer"
          pageId="connect-wallet-stage-one"
          primaryButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.request.button.accept"
          )}`}
          primaryButtonAction={handleAccept}
          secondaryButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.request.button.decline"
          )}`}
          secondaryButtonAction={openDecline}
        />
      </ResponsivePageLayout>
      <Alert
        isOpen={openDeclineAlert}
        setIsOpen={setOpenDeclineAlert}
        dataTestId="alert-decline-connect"
        headerText={i18n.t(
          "menu.tab.items.connectwallet.request.stageone.alert.titleconfirm"
        )}
        confirmButtonText={`${i18n.t(
          "menu.tab.items.connectwallet.request.stageone.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "menu.tab.items.connectwallet.request.stageone.alert.cancel"
        )}`}
        actionConfirm={handleClose}
        actionCancel={() => setOpenDeclineAlert(false)}
        actionDismiss={() => setOpenDeclineAlert(false)}
      />
    </>
  );
};

export { WalletConnectStageOne };
