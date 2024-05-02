import { Buffer } from "buffer";
import {
  Paginate,
  Cip30DataSignature,
  IWalletInfo,
} from "@fabianbormann/cardano-peer-connect/dist/src/types";
import { CardanoPeerConnect } from "@fabianbormann/cardano-peer-connect";
import { Signer } from "signify-ts";
import { Agent } from "../../agent/agent";

class IdentityWalletConnect extends CardanoPeerConnect {
  static readonly IDENTIFIER_ID_NOT_LOCATED =
    "The id doesn't correspond with any stored identifier";
  static readonly NO_IDENTIFIERS_STORED = "No stored identifiers";

  getIdentifierOobi: () => Promise<string>;
  sign: (identifier: string, payload: string) => Promise<string>;

  signerCache: Map<string, Signer>;

  constructor(
    walletInfo: IWalletInfo,
    seed: string | null,
    announce: string[],
    discoverySeed?: string | null
  ) {
    super(walletInfo, {
      seed: seed,
      announce: announce,
      discoverySeed: discoverySeed,
      logLevel: "info",
    });

    this.signerCache = new Map();

    this.getIdentifierOobi = async (): Promise<string> => {
      const identifiers = await Agent.agent.identifiers.getIdentifiers();
      if (!(identifiers && identifiers.length > 0)) {
        throw new Error(IdentityWalletConnect.NO_IDENTIFIERS_STORED);
      }

      return Agent.agent.connections.getOobi(identifiers[0].signifyName);
    };

    this.sign = async (
      identifier: string,
      payload: string
    ): Promise<string> => {
      if (this.signerCache.get(identifier) === undefined) {
        this.signerCache.set(
          identifier,
          await Agent.agent.identifiers.getSigner(identifier)
        );
      }
      return this.signerCache.get(identifier)!.sign(Buffer.from(payload)).qb64;
    };
  }

  protected getNetworkId(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  protected getUtxos(
    amount?: string | undefined,
    paginate?: Paginate | undefined
  ): Promise<string[] | null> {
    throw new Error("Method not implemented.");
  }
  protected getCollateral(
    params?: { amount?: string | undefined } | undefined
  ): Promise<string[] | null> {
    throw new Error("Method not implemented.");
  }
  protected getBalance(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  protected getUsedAddresses(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  protected getUnusedAddresses(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  protected getChangeAddress(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  protected async getRewardAddresses(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  protected signTx(tx: string, partialSign: boolean): Promise<string> {
    throw new Error("Method not implemented.");
  }
  protected async signData(
    addr: string,
    payload: string
  ): Promise<Cip30DataSignature> {
    throw new Error("Method not implemented.");
  }
  protected submitTx(tx: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export { IdentityWalletConnect };