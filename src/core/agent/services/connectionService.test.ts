import { ConnectionStatus, KeriConnectionType } from "../agent.types";
import { ConnectionService } from "./connectionService";
import { EventService } from "./eventService";
import { CredentialStorage } from "../records";
import { Agent } from "../agent";

const contactListMock = jest.fn();
const deleteContactMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: jest.fn(),
    members: jest.fn(),
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      return {
        done: true,
        response: {
          i: id,
        },
      };
    }),
  }),
  oobis: () => ({
    get: jest.fn().mockImplementation((name: string) => {
      return {
        oobis: [`${oobiPrefix}${name}`],
        done: true,
      };
    }),
    resolve: jest.fn().mockImplementation((name: string) => {
      return {
        done: true,
        response: {
          i: name,
        },
      };
    }),
  }),
  contacts: () => ({
    list: contactListMock,
    get: jest.fn().mockImplementation((id: string) => {
      return {
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "oobi",
        id,
      };
    }),
    delete: deleteContactMock,
  }),
  notifications: () => ({
    list: jest.fn(),
    mark: jest.fn(),
  }),
  ipex: () => ({
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: jest.fn(),
    get: jest.fn(),
  }),
});

const session = {};

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService: new EventService(),
};

const connectionStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const connectionNoteStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const connectionService = new ConnectionService(
  agentServicesProps,
  connectionStorage as any,
  connectionNoteStorage as any,
  new CredentialStorage(session as any)
);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: { getKeriIdentifierByGroupId: jest.fn() },
    },
  },
}));

const now = new Date();
const nowISO = now.toISOString();
const keriContacts = [
  {
    alias: "keri",
    challenges: [],
    id: "EKwzermyJ6VhunFWpo7fscyCILxFG7zZIM9JwSSABbZ5",
    oobi: "http://oobi",
    wellKnowns: [],
  },
];
const oobiPrefix = "http://oobi.com/";

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should return connection type to trigger UI to create a new identifier", async () => {
    const groupId = "123";
    const oobi = `http://localhost/oobi=3423?groupId=${groupId}`;
    signifyClient.oobis().resolve = jest.fn().mockImplementation((url) => {
      return { name: url, response: { i: "id" } };
    });
    Agent.agent.identifiers.getKeriIdentifierByGroupId = jest
      .fn()
      .mockResolvedValue(null);
    const result = await connectionService.connectByOobiUrl(oobi);
    expect(result).toStrictEqual({
      type: KeriConnectionType.MULTI_SIG_INITIATOR,
      groupId,
    });
    expect(connectionStorage.save).toBeCalled();
  });

  test("Can create groupId connections for existing pending multi-sigs", async () => {
    const groupId = "123";
    const oobi = `http://localhost/oobi=3423?groupId=${groupId}`;
    signifyClient.oobis().resolve = jest.fn().mockImplementation((url) => {
      return { alias: "alias", name: url, response: { i: "id" } };
    });
    Agent.agent.identifiers.getKeriIdentifierByGroupId = jest
      .fn()
      .mockResolvedValue({
        displayName: "displayName",
        id: "id",
        signifyName: "uuid",
        createdAtUTC: new Date().toISOString(),
        theme: 0,
        isPending: false,
        groupMetadata: {
          groupId,
          groupCreated: false,
          groupInitiator: true,
        },
      });
    await connectionService.connectByOobiUrl(oobi);
    expect(connectionStorage.save).toBeCalled();
  });

  test("can get all connections and multi-sig related ones are filtered", async () => {
    connectionStorage.getAll = jest.fn().mockResolvedValue([
      {
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        getTag: jest.fn(),
      },
      {
        id: "second-id",
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        getTag: jest.fn().mockReturnValue("group-id"),
      },
    ]);
    expect(await connectionService.getConnections()).toEqual([
      {
        id: keriContacts[0].id,
        label: "keri",
        oobi: "oobi",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: expect.any(String),
      },
    ]);
  });

  test("can save connection note with generic records", async () => {
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message",
    };
    await connectionService.createConnectionNote(connectionId, note);
    expect(connectionNoteStorage.save).toBeCalledWith({
      id: expect.any(String),
      title: "title",
      message: "message",
      connectionId,
    });
  });

  test("can delete connection note with id", async () => {
    const connectionNoteId = "connectionId";
    await connectionService.deleteConnectionNoteById(connectionNoteId);
    expect(connectionNoteStorage.deleteById).toBeCalledWith(connectionNoteId);
  });

  test("cannot update connection note because connection note invalid", async () => {
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message",
    };
    await expect(
      connectionService.updateConnectionNoteById(connectionId, note)
    ).rejects.toThrowError(ConnectionService.CONNECTION_NOTE_RECORD_NOT_FOUND);
  });

  test("can update connection note by id", async () => {
    const connectionToUpdate = {
      id: "id",
      title: "title",
      message: "message",
    };
    connectionNoteStorage.findById = jest
      .fn()
      .mockResolvedValue(connectionToUpdate);
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message2",
    };
    await connectionService.updateConnectionNoteById(connectionId, note);
    expect(connectionNoteStorage.update).toBeCalledWith({
      ...connectionToUpdate,
      title: "title",
      message: "message2",
    });
  });

  test("can delete conenction by id", async () => {
    connectionNoteStorage.findAllByQuery = jest.fn().mockReturnValue([]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(connectionStorage.deleteById).toBeCalledWith(connectionId);
    // expect(deleteContactMock).toBeCalledWith(connectionId); // it should be uncommented later when deleting on KERIA is re-enabled
  });

  test("Should delete connection's notes when deleting that connection", async () => {
    connectionNoteStorage.findAllByQuery = jest.fn().mockReturnValue([
      {
        id: "uuid",
        title: "title",
      },
    ]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(connectionNoteStorage.deleteById).toBeCalledTimes(1);
  });

  test("can receive keri oobi", async () => {
    signifyClient.oobis().resolve.mockResolvedValue({
      done: true,
    });
    const oobi =
      "http://127.0.0.1:3902/oobi/EBRcDDwjOfqZwC1w2XFcE1mKQUb1LekNNidkZ8mrIEaw/agent/EEXekkGu9IAzav6pZVJhkLnjtjM5v3AcyA-pdKUcaGei";
    await connectionService.connectByOobiUrl(oobi);
  });

  test("can get a KERI OOBI with an alias (URL encoded)", async () => {
    signifyClient.oobis().get = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}`;
    });
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(
      signifyName,
      "alias with spaces"
    );
    expect(KeriOobi).toEqual(
      `${oobiPrefix}${signifyName}?name=alias+with+spaces`
    );
  });

  test("can get KERI OOBI with alias and groupId", async () => {
    signifyClient.oobis().get = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}?groupId=123`;
    });
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(
      signifyName,
      "alias",
      "123"
    );
    expect(KeriOobi).toEqual(
      `${oobiPrefix}${signifyName}?name=alias&groupId=123`
    );
  });

  test("can get connection keri (short detail view) by id", async () => {
    connectionStorage.findById = jest.fn().mockResolvedValue({
      id: keriContacts[0].id,
      createdAt: now,
      alias: "keri",
      getTag: jest.fn(),
    });
    expect(
      await connectionService.getConnectionShortDetailById(keriContacts[0].id)
    ).toMatchObject({
      id: keriContacts[0].id,
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    });
    expect(connectionStorage.findById).toBeCalledWith(keriContacts[0].id);
  });

  test("can get KERI OOBI", async () => {
    signifyClient.oobis().get = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}`;
    });
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(signifyName);
    expect(KeriOobi).toEqual(oobiPrefix + signifyName);
  });

  test("Should call createIdentifierMetadataRecord when there are un-synced KERI contacts", async () => {
    contactListMock.mockReturnValue([
      {
        id: "EBaDnyriYK_FAruigHO42avVN40fOlVSUxpxXJ1fNxFR",
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/oobi/EBaDnyriYK_FAruigHO42avVN40fOlVSUxpxXJ1fNxFR/agent/EP48HXCPvtzGu0c90gG9fkOYiSoi6U5Am-XaqcoNHTBl",
        challenges: [],
        wellKnowns: [],
      },
      {
        id: "ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W",
        alias: "e6d37a7b-00e9-4f85-8cf9-2123d15fc094",
        oobi: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/oobi/ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W/agent/EJMV0RgikXM7jyvXB9oOyKSZzo_AsYrEgP15Ly0dwzEL",
        challenges: [],
        wellKnowns: [],
      },
    ]);
    connectionStorage.getAll = jest.fn().mockReturnValue([]);
    await connectionService.syncKeriaContacts();
    expect(connectionStorage.save).toBeCalledTimes(2);
  });

  test("Can get multisig linked contacts", async () => {
    const groupId = "123";
    const metadata = {
      id: "id",
      alias: "alias",
      oobi: `localhost/oobi=2442?groupId=${groupId}`,
      groupId,
      createdAt: new Date(),
      getTag: jest.fn().mockReturnValue(groupId),
    };
    connectionStorage.findAllByQuery = jest.fn().mockResolvedValue([metadata]);
    expect(
      await connectionService.getMultisigLinkedContacts(groupId)
    ).toStrictEqual([
      {
        id: metadata.id,
        label: metadata.alias,
        connectionDate: metadata.createdAt.toISOString(),
        status: ConnectionStatus.CONFIRMED,
        oobi: metadata.oobi,
        groupId: metadata.groupId,
      },
    ]);
  });
});
