import { keyOutline, informationCircleOutline } from "ionicons/icons";
import { i18n } from "../../../../i18n";
import {
  ACDCDetails,
  JSONObject,
} from "../../../../core/agent/services/credentialService.types";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
  CardDetailsItem,
} from "../../../components/CardDetails";

interface ACDCContentProps {
  cardData: ACDCDetails;
}

const CredContentAcdc = ({ cardData }: ACDCContentProps) => {
  return (
    <>
      <CardDetailsBlock title={i18n.t("creds.card.details.title")}>
        <CardDetailsItem
          info={cardData.credentialType}
          icon={informationCircleOutline}
          testId="card-details-credential-type"
        />
      </CardDetailsBlock>
      <CardDetailsBlock
        className="cred-content-acdc-card"
        title={i18n.t("creds.card.details.description.label")}
      >
        {cardData.s.description}
      </CardDetailsBlock>
      {cardData.a && (
        <CardDetailsBlock title={i18n.t("creds.card.details.attributes.label")}>
          <CardDetailsAttributes data={cardData.a as JSONObject} />
        </CardDetailsBlock>
      )}
      <CardDetailsBlock title={i18n.t("creds.card.details.schemaversion")}>
        <CardDetailsItem
          info={cardData.s.version}
          icon={informationCircleOutline}
          testId="card-details-schema-version"
        />
      </CardDetailsBlock>
      <CardDetailsBlock title={i18n.t("creds.card.details.issuer")}>
        <CardDetailsItem
          info={cardData.i}
          copyButton={true}
          icon={keyOutline}
          testId="card-details-issuer"
        />
      </CardDetailsBlock>
      <CardDetailsBlock
        className="card-attribute-block"
        title={i18n.t("creds.card.details.status.label")}
      >
        <CardDetailsAttributes
          data={cardData.lastStatus as JSONObject}
          customType="status"
        />
      </CardDetailsBlock>
    </>
  );
};

export { CredContentAcdc };
