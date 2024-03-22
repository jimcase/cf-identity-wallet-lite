import { ConnectionShortDetails } from "../agent.types";

enum IdentifierType {
  KEY = "key",
  KERI = "keri",
}

interface groupMetadata {
  groupId: string;
  groupInitiator: boolean;
  groupCreated: boolean;
}

interface createIdentifierInputs {
  displayName: string;
  method: IdentifierType;
  colors: [string, string];
  theme: number;
  groupMetadata?: groupMetadata;
}

interface IdentifierShortDetails {
  id: string;
  method: IdentifierType;
  displayName: string;
  createdAtUTC: string;
  signifyName?: string;
  colors: [string, string];
  theme: number;
  isPending: boolean;
  groupMetadata?: groupMetadata;
}

type GetIdentifierResult =
  | { type: IdentifierType.KERI; result: KERIDetails }
  | { type: IdentifierType.KEY; result: DIDDetails };

interface DIDDetails extends IdentifierShortDetails {
  keyType: string;
  controller: string;
  publicKeyBase58: string;
}

interface KERIDetails extends IdentifierShortDetails {
  signifyOpName?: string;
  s: number;
  dt: string;
  kt: number;
  k: string[];
  nt: number;
  n: string[];
  bt: number;
  b: string[];
  di: string;
}

interface MultiSigIcpRequestDetails {
  ourIdentifier: IdentifierShortDetails;
  sender: ConnectionShortDetails;
  otherConnections: ConnectionShortDetails[];
  threshold: number;
}

export { IdentifierType };

export type {
  IdentifierShortDetails,
  DIDDetails,
  KERIDetails,
  GetIdentifierResult,
  MultiSigIcpRequestDetails,
  createIdentifierInputs,
};
