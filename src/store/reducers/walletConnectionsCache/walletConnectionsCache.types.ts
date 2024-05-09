// TODO: mock data type for connect wallet ui. Need update after core function completed.
interface ConnectionData {
  id: number;
  name: string;
  owner: string;
  image?: string;
  url: string;
}

interface WalletConnectState {
  walletConnections: ConnectionData[];
  connectedWallet: ConnectionData | null;
}

export type { ConnectionData, WalletConnectState };