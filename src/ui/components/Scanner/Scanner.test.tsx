import { IonInput } from "@ionic/react";
import { ionFireEvent } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import {
  BarcodeFormat,
  BarcodeScannedEvent,
  BarcodeValueType,
} from "@capacitor-mlkit/barcode-scanning";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import EN_Translation from "../../../locales/en/en.json";
import {
  setMultiSigGroupCache,
  setOpenMultiSigId,
} from "../../../store/reducers/identifiersCache";
import { setBootUrl, setConnectUrl } from "../../../store/reducers/ssiAgent";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { OperationType, ToastMsgType } from "../../globals/types";
import { CustomInputProps } from "../CustomInput/CustomInput.types";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { Scanner } from "./Scanner";
import { setOpenConnectionDetail } from "../../../store/reducers/connectionsCache";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  isPlatform: () => true,
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div {...props}>{children}</div> : null,
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

const addListener = jest.fn(
  (eventName: string, listenerFunc: (result: BarcodeScannedEvent) => void) => {
    setTimeout(() => {
      listenerFunc({
        barcode: {
          displayValue:
            "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
          format: BarcodeFormat.QrCode,
          rawValue:
            "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
          valueType: BarcodeValueType.Url,
        },
      });
    }, 100);

    return {
      remove: jest.fn(),
    };
  }
);

jest.mock("@capacitor-mlkit/barcode-scanning", () => {
  return {
    ...jest.requireActual("@capacitor-mlkit/barcode-scanning"),
    BarcodeScanner: {
      checkPermissions: () =>
        Promise.resolve({
          camera: "granted",
        }),
      addListener: (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => addListener(eventName, listenerFunc),
      startScan: jest.fn(),
      stopScan: jest.fn(),
    },
  };
});

jest.mock("../CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <IonInput
        data-testid={props.dataTestId}
        onIonInput={(e) => {
          props.onChangeInput(e.detail.value as string);
        }}
      />
    );
  },
}));

const connectByOobiUrlMock = jest.fn();
const getMultisigLinkedContactsMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        connectByOobiUrl: () => connectByOobiUrlMock(),
        getMultisigLinkedContacts: (args: unknown) =>
          getMultisigLinkedContactsMock(args),
      },
    },
  },
}));

describe("Scanner", () => {
  const mockStore = configureStore();

  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.SCAN],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
      },
      currentOperation: OperationType.SCAN_WALLET_CONNECTION,
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  const setIsValueCaptured = jest.fn();

  beforeEach(() => {
    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 10000);

        return {
          remove: jest.fn(),
        };
      }
    );
  });

  test("Renders spinner", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    expect(getByTestId("qr-code-scanner")).toBeVisible();

    expect(getByTestId("scanner-spinner-container")).toBeVisible();
  });

  addListener.mockImplementation(
    (
      eventName: string,
      listenerFunc: (result: BarcodeScannedEvent) => void
    ) => {
      setTimeout(() => {
        listenerFunc({
          barcode: {
            displayValue:
              "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
            format: BarcodeFormat.QrCode,
            rawValue:
              "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
            valueType: BarcodeValueType.Url,
          },
        });
      }, 100);

      return {
        remove: jest.fn(),
      };
    }
  );

  test("Renders content and input wallet connection pid", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("qr-code-scanner")).toBeVisible();
      expect(getByTestId("secondary-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("secondary-button"));
    });

    await waitFor(() => {
      expect(getByTestId("scanner-input")).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(
        getByTestId("scanner-input"),
        "bd54hj38aK2sGhE5K9mPqR79Jkd4b23hJf5sL36nHk"
      );
    });

    await waitFor(() => {
      expect(getByTestId("action-button").getAttribute("disabled")).toBe(
        "false"
      );
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.PEER_ID_SUCCESS)
      );
    });
  });

  test("Renders error when entered a wrong input wallet connection pid", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("qr-code-scanner")).toBeVisible();
      expect(getByTestId("secondary-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("secondary-button"));
    });

    await waitFor(() => {
      expect(getByTestId("scanner-input")).toBeVisible();
    });

    act(() => {
      ionFireEvent.ionInput(getByTestId("scanner-input"), "ABC123");
    });

    await waitFor(() => {
      expect(getByTestId("action-button").getAttribute("disabled")).toBe(
        "false"
      );
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.PEER_ID_ERROR)
      );
    });
  });

  test("Multisign initiator scan - groupId not match", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.MULTI_SIG_INITIATOR_SCAN,
      },
      identifiersCache: {
        identifiers: [],
        scanGroupId: "mock",
      },
    };

    getMultisigLinkedContactsMock.mockReturnValue(connectionsFix);

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.MULTI_SIG_INITIATOR,
      };
    });

    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    const { getByText } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_Translation.createidentifier.scan.initiate)
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(dispatchMock).not.toBeCalledWith(
        setToastMsg(ToastMsgType.GROUP_ID_NOT_MATCH_ERROR)
      );
    });
  });

  test("Multisign initiator scan", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.MULTI_SIG_INITIATOR_SCAN,
      },
      identifiersCache: {
        identifiers: [],
        scanGroupId: "72e2f089cef6",
      },
    };

    getMultisigLinkedContactsMock.mockReturnValue(connectionsFix);

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.MULTI_SIG_INITIATOR,
      };
    });

    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_Translation.createidentifier.scan.initiate)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText(EN_Translation.createidentifier.scan.initiate));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.MULTI_SIG_INITIATOR_INIT)
      );
      expect(getByTestId("create-identifier-modal")).toBeVisible();
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.NEW_MULTI_SIGN_MEMBER)
      );

      expect(dispatchMock).not.toBeCalledWith(
        setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING)
      );
    });
  });

  test("Multisign receiver scan", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.MULTI_SIG_RECEIVER_SCAN,
      },
      identifiersCache: {
        identifiers: [],
        scanGroupId: "72e2f089cef6",
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const handleReset = jest.fn();

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.NORMAL,
      };
    });
    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    const { getByText } = render(
      <Provider store={storeMocked}>
        <Scanner
          setIsValueCaptured={setIsValueCaptured}
          handleReset={handleReset}
        />
      </Provider>
    );

    getMultisigLinkedContactsMock.mockReturnValue([connectionsFix[0]]);

    await waitFor(() => {
      expect(
        getByText(EN_Translation.createidentifier.scan.pasteoobi)
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(handleReset).toBeCalled();
      expect(getMultisigLinkedContactsMock).toBeCalledWith("72e2f089cef6");
      expect(dispatchMock).toBeCalledWith(
        setMultiSigGroupCache({
          groupId: "72e2f089cef6",
          connections: [connectionsFix[0]],
        })
      );
    });
  });

  test("Scan page", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.SCAN_CONNECTION,
      },
      identifiersCache: {
        identifiers: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
    };

    const { getByText } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_Translation.createidentifier.scan.pastecontents)
      ).toBeVisible();
    });
  });

  test("Scan SSI boot url", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.SCAN_SSI_BOOT_URL,
      },
      identifiersCache: {
        identifiers: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const handleReset = jest.fn();

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.NORMAL,
      };
    });

    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    render(
      <Provider store={storeMocked}>
        <Scanner
          setIsValueCaptured={setIsValueCaptured}
          handleReset={handleReset}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setBootUrl(
          "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6"
        )
      );
    });
  });

  test("Scan SSI connect url", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.SCAN_SSI_CONNECT_URL,
      },
      identifiersCache: {
        identifiers: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const handleReset = jest.fn();

    connectByOobiUrlMock.mockImplementation(() => {
      return {
        type: KeriConnectionType.NORMAL,
      };
    });

    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    render(
      <Provider store={storeMocked}>
        <Scanner
          setIsValueCaptured={setIsValueCaptured}
          handleReset={handleReset}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setConnectUrl(
          "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6"
        )
      );
    });
  });

  test("Duplicate connection error handle", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.SCAN_CONNECTION,
      },
      identifiersCache: {
        identifiers: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const handleReset = jest.fn();

    connectByOobiUrlMock.mockImplementation(() => {
      throw new Error("Record already exists with id connectionId");
    });

    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://keria:3902/oobi/EL0xzJRb4Mf/agent/foicaqnwqklena?name=domain",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://keria:3902/oobi/EL0xzJRb4Mf/agent/foicaqnwqklena?name=domain",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    render(
      <Provider store={storeMocked}>
        <Scanner
          setIsValueCaptured={setIsValueCaptured}
          handleReset={handleReset}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setOpenConnectionDetail("connectionId")
      );
    });
  });

  test("Duplicate multisig connection error handle", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.SCAN_CONNECTION,
      },
      identifiersCache: {
        identifiers: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const handleReset = jest.fn();

    connectByOobiUrlMock.mockImplementation(() => {
      throw new Error("Record already exists with id connectionId");
    });

    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    render(
      <Provider store={storeMocked}>
        <Scanner
          setIsValueCaptured={setIsValueCaptured}
          handleReset={handleReset}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(setOpenMultiSigId("72e2f089cef6"));
    });
  });

  test("Invalid connection url handle", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.SCAN],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: false,
        },
        currentOperation: OperationType.SCAN_CONNECTION,
      },
      identifiersCache: {
        identifiers: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const handleReset = jest.fn();

    addListener.mockImplementation(
      (
        eventName: string,
        listenerFunc: (result: BarcodeScannedEvent) => void
      ) => {
        setTimeout(() => {
          listenerFunc({
            barcode: {
              displayValue:
                "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org/oobi?groupId=72e2f089cef6",
              format: BarcodeFormat.QrCode,
              rawValue: "Invalid URL",
              valueType: BarcodeValueType.Url,
            },
          });
        }, 100);

        return {
          remove: jest.fn(),
        };
      }
    );

    render(
      <Provider store={storeMocked}>
        <Scanner
          setIsValueCaptured={setIsValueCaptured}
          handleReset={handleReset}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.SCANNER_ERROR)
      );
    });
  });
});
