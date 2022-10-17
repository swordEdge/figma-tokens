import { renderHook } from '@testing-library/react-hooks';
import { Selector } from 'reselect';
import { waitFor } from '@testing-library/react';
import useRemoteTokens from './remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import {
  themesListSelector,
  tokensSelector,
} from '@/selectors';
import { notifyToUI } from '@/plugin/notifiers';
import { ErrorMessages } from '@/constants/ErrorMessages';

const mockStartJob = jest.fn();
const mockRetrieve = jest.fn();
const mockCanWrite = jest.fn();
const mockChangePath = jest.fn();
const mockSelectBrach = jest.fn();
const mockEnableMultiFile = jest.fn();
const mockSetLastSyncedState = jest.fn();
const mockSetTokenData = jest.fn();
const mockSetEditProhibited = jest.fn();
const mockCompleteJob = jest.fn();
const mockAssignProjectId = jest.fn();
const mockSetProjectURL = jest.fn();
const mockSetApiData = jest.fn();
const mockSetLocalApiState = jest.fn();
const mockSetStorage = jest.fn();
const mockFetchBranches = jest.fn();
const mockSetBranches = jest.fn();
const mockConfirm = jest.fn();
const mockSetShowConfirm = jest.fn();
const mockPushDialog = jest.fn();
const mockCloseDialog = jest.fn();
const mockCreateBranch = jest.fn();
const mockSave = jest.fn();
const mockSetCollapsedTokenSets = jest.fn();

const mockSelector = (selector: Selector) => {
  switch (selector) {
    case tokensSelector:
      return {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      };
    case themesListSelector:
      return [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ];
    default:
      return {};
  }
};

jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockImplementation(() => ({
    uiState: {
      startJob: mockStartJob,
      completeJob: mockCompleteJob,
      setProjectURL: mockSetProjectURL,
      setLocalApiState: mockSetLocalApiState,
      setApiData: mockSetApiData,
      setStorage: mockSetStorage,
      setShowConfirm: mockSetShowConfirm,
    },
    tokenState: {
      setLastSyncedState: mockSetLastSyncedState,
      setTokenData: mockSetTokenData,
      setEditProhibited: mockSetEditProhibited,
      setCollapsedTokenSets: mockSetCollapsedTokenSets,
    },
    branchState: {
      setBranches: mockSetBranches,
    },
  })),
  useSelector: (selector: Selector) => mockSelector(selector),
}));
jest.mock('../../storage/GithubTokenStorage', () => ({
  GithubTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      fetchBranches: mockFetchBranches,
      save: mockSave,
      createBranch: mockCreateBranch,
    }
  )),
}));
jest.mock('../../storage/GitlabTokenStorage', () => ({
  GitlabTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      save: mockSave,
      createBranch: mockCreateBranch,
      assignProjectId: jest.fn().mockImplementation(() => ({
        retrieve: mockRetrieve,
        canWrite: mockCanWrite,
        changePath: mockChangePath,
        selectBranch: mockSelectBrach,
        enableMultiFile: mockEnableMultiFile,
        assignProjectId: mockAssignProjectId,
        fetchBranches: mockFetchBranches,
        save: mockSave,
        createBranch: mockCreateBranch,
      })),
    }
  )),
}));
jest.mock('../../storage/BitbucketTokenStorage', () => ({
  BitbucketTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      fetchBranches: mockFetchBranches,
      save: mockSave,
      createBranch: mockCreateBranch,
    }
  )),
}));
jest.mock('../../storage/JSONBinTokenStorage', () => ({
  JSONBinTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
    }
  )),
}));
jest.mock('../../storage/ADOTokenStorage', () => ({
  ADOTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      fetchBranches: mockFetchBranches,
      save: mockSave,
      createBranch: mockCreateBranch,
    }
  )),
}));
jest.mock('../../storage/UrlTokenStorage', () => ({
  UrlTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
    }
  )),
}));
jest.mock('../../storage/FileTokenStorage', () => ({
  FileTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      enableMultiFile: mockEnableMultiFile,
    }
  )),
}));

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));
jest.mock('../hooks/usePushDialog', () => ({
  __esModule: true,
  default: () => ({
    pushDialog: mockPushDialog,
    closeDialog: mockCloseDialog,
  }),
}));
jest.mock('../../plugin/notifiers', (() => ({
  notifyToUI: jest.fn(),
})));

const gitHubContext = {
  branch: 'main',
  filePath: 'data/tokens.json',
  id: 'six7/figma-tokens',
  provider: 'github',
  secret: 'github',
};
const gitLabContext = {
  branch: 'main',
  filePath: 'data/tokens.json',
  id: 'six7/figma-tokens',
  provider: 'gitlab',
  secret: 'gitlab',
};
const bitbucketContext = {
  name: 'six7',
  id: 'six7/figma-tokens',
  provider: 'bitbucket',
  secret: 'bitbucket',
};
const jsonbinContext = {
  name: 'six7',
  id: 'six7/figma-tokens',
  provider: 'jsonbin',
  secret: 'jsonbin',
};
const adoContext = {
  name: 'six7',
  id: 'six7/figma-tokens',
  provider: 'ado',
  secret: 'ado',
};
const urlContext = {
  name: 'six7',
  id: 'six7/figma-tokens',
  provider: 'url',
  secret: 'url',
};
const files = {
  0: {
    name: 'tokens.json',
    path: 'Downloads\\tokens.json',
    webkitRelativePath: '',
  },
  length: 1,
};

const contextMap = {
  GitHub: gitHubContext,
  GitLab: gitLabContext,
  Bitbucket: bitbucketContext,
  ADO: adoContext,
  jsonbin: jsonbinContext,
  url: urlContext,
};

const errorMessageMap = {
  GitHub: ErrorMessages.GITHUB_CREDENTIAL_ERROR,
  GitLab: ErrorMessages.GITLAB_CREDENTIAL_ERROR,
  Bitbucket: ErrorMessages.BITBUCKET_CREDENTIAL_ERROR,
  ADO: ErrorMessages.ADO_CREDENTIAL_ERROR,
  jsonbin: ErrorMessages.JSONBIN_CREDENTIAL_ERROR,
  url: ErrorMessages.URL_CREDENTIAL_ERROR,
};

describe('remoteTokens', () => {
  let { result } = renderHook(() => useRemoteTokens());

  beforeEach(() => {
    result = renderHook(() => useRemoteTokens()).result;
    mockRetrieve.mockImplementation(() => (
      Promise.resolve(
        {
          metadata: {
            commitMessage: 'Initial commit',
          },
          themes: [
            {
              id: 'light',
              name: 'Light',
              selectedTokenSets: {
                global: 'enabled',
              },
            },
          ],
          tokens: {
            global: [
              {
                value: '#ffffff',
                type: 'color',
                name: 'black',
              },
            ],
          },
          status: 'success',
        },
      )
    ));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  Object.values(contextMap).forEach((context) => {
    it(`Pull tokens from ${context.provider}`, async () => {
      if (context === jsonbinContext) {
        expect(await result.current.pullTokens({ context: context as StorageTypeCredentials })).toEqual({
          metadata: {},
          status: 'success',
          themes: [
            {
              id: 'light',
              name: 'Light',
              selectedTokenSets: {
                global: 'enabled',
              },
            },
          ],
          tokens: {
            global: [
              {
                value: '#ffffff',
                type: 'color',
                name: 'black',
              },
            ],
          },
        });
      } else {
        expect(await result.current.pullTokens({ context: context as StorageTypeCredentials })).toEqual({
          metadata: {
            commitMessage: 'Initial commit',
          },
          status: 'success',
          themes: [
            {
              id: 'light',
              name: 'Light',
              selectedTokenSets: {
                global: 'enabled',
              },
            },
          ],
          tokens: {
            global: [
              {
                value: '#ffffff',
                type: 'color',
                name: 'black',
              },
            ],
          },
        });
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`Pull tokens from ${context.provider}, should return error message when fetch data failed`, async () => {
      await result.current.pullTokens({ context: context as StorageTypeCredentials });
      mockRetrieve.mockImplementation(() => (
        Promise.resolve({
          status: 'failure',
          errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
        })
      ));
      expect(await result.current.pullTokens({ context: context as StorageTypeCredentials })).toEqual({
        status: 'failure',
        errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
      });
    });
  });

  it('Pull tokens from JSONbin, should return error message when secret is not defined', async () => {
    const jsonbinContextWithoutSecret = {
      name: 'six7',
      id: 'six7/figma-tokens',
      provider: 'jsonbin',
    };
    await result.current.pullTokens({ context: jsonbinContextWithoutSecret as StorageTypeCredentials });
    expect(await result.current.pullTokens({ context: jsonbinContextWithoutSecret as StorageTypeCredentials })).toEqual({
      status: 'failure',
      errorMessage: ErrorMessages.ID_NON_EXIST_ERROR,
    });
  });

  it('Pull tokens from url, should return error message when ID and secret are not defined', async () => {
    const urlContextWithoutId = {
      name: 'six7',
      provider: 'url',
    };
    await result.current.pullTokens({ context: urlContextWithoutId as StorageTypeCredentials });
    expect(await result.current.pullTokens({ context: urlContextWithoutId as StorageTypeCredentials })).toEqual({
      status: 'failure',
      errorMessage: ErrorMessages.ID_NON_EXIST_ERROR,
    });
  });

  Object.entries(contextMap).forEach(([contextName, context]) => {
    it(`Restore storedProvider from ${context.provider}, should pull tokens if the user agree`, async () => {
      mockFetchBranches.mockImplementationOnce(() => (
        Promise.resolve(['main'])
      ));
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(
          {
            metadata: {
              commitMessage: 'Initial commit',
            },
            themes: [
              {
                id: 'black',
                name: 'Black',
                selectedTokenSets: {
                  global: 'enabled',
                },
              },
            ],
            tokens: {
              global: [
                {
                  value: '#000000',
                  type: 'color',
                  name: 'white',
                },
              ],
            },
            status: 'success',
          },
        )
      ));
      mockConfirm.mockImplementation(() => (
        Promise.resolve(true)
      ));
      await waitFor(() => { result.current.restoreStoredProvider(context as StorageTypeCredentials); });
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        expect(notifyToUI).toBeCalledTimes(1);
        expect(notifyToUI).toBeCalledWith(`Pulled tokens from ${contextName}`);
      } else {
        expect(mockStartJob).toBeCalledWith({
          isInfinite: true,
          name: 'ui_pulltokens',
        });
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`Restore storedProvider from ${context.provider}, should return null when fetching data failed`, async () => {
      await result.current.restoreStoredProvider(context as StorageTypeCredentials);
      mockFetchBranches.mockImplementationOnce(() => (
        Promise.resolve(['main'])
      ));
      mockRetrieve.mockImplementation(() => (
        Promise.resolve({
          status: 'failure',
          errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
        })
      ));
      expect(await result.current.restoreStoredProvider(context as StorageTypeCredentials)).toEqual(null);
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`Restore storedProvider from ${context.provider}, should push tokens if there is no content`, async () => {
      mockFetchBranches.mockImplementationOnce(() => (
        Promise.resolve(['main'])
      ));
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(null)
      ));
      await waitFor(() => { result.current.restoreStoredProvider(context as StorageTypeCredentials); });
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        expect(mockPushDialog).toBeCalledTimes(1);
      } else {
        expect(mockStartJob).toBeCalledWith({
          isInfinite: true,
          name: 'ui_pulltokens',
        });
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`push tokens to ${context.provider}`, async () => {
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(null)
      ));
      mockPushDialog.mockImplementation(() => (
        Promise.resolve({
          customBranch: 'development',
          commitMessage: 'Initial commit',
        })
      ));
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        await waitFor(() => { result.current.pushTokens(context as StorageTypeCredentials); });
        expect(mockPushDialog).toBeCalledTimes(2);
        expect(mockPushDialog.mock.calls[1][0]).toBe('success');
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`push tokens to ${context.provider}, should not pop up push diaolog`, async () => {
      mockRetrieve.mockImplementation(() => (
        Promise.resolve({
          status: 'failure',
          errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
        })
      ));
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        await waitFor(() => { result.current.pushTokens(context as StorageTypeCredentials); });
        expect(mockPushDialog).toBeCalledTimes(0);
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`push tokens to ${context.provider}, should return noting to commit if the content is same`, async () => {
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        await waitFor(() => { result.current.pushTokens(context as StorageTypeCredentials); });
        expect(notifyToUI).toBeCalledWith('Nothing to commit');
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
      it(`push tokens to ${context.provider}, should close dialog when a free user trying to save multi file`, async () => {
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(null)
        ));
        mockPushDialog.mockImplementation(() => (
          Promise.resolve({
            customBranch: 'development',
            commitMessage: 'Initial commit',
          })
        ));
        mockSave.mockImplementationOnce(() => {
          throw new Error(ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR);
        });
        await waitFor(() => { result.current.pushTokens(context as StorageTypeCredentials); });
        expect(mockCloseDialog).toBeCalledTimes(1);
      });
    }
  });

  Object.values(contextMap).forEach((context) => {
    if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
      it(`Add newProviderItem to ${context.provider}, should push tokens and return status data if there is no content`, async () => {
        mockFetchBranches.mockImplementationOnce(() => (
          Promise.resolve(['main'])
        ));
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(null)
        ));
        mockPushDialog.mockImplementation(() => (
          Promise.resolve({
            customBranch: 'development',
            commitMessage: 'Initial commit',
          })
        ));
        await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
        expect(mockPushDialog).toBeCalledTimes(2);
        expect(mockPushDialog.mock.calls[1][0]).toBe('success');
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          status: 'success',
        });
      });
    } else {
      it(`Add newProviderItem to ${context.provider}, should pull tokens and return error message if there is no content`, async () => {
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(null)
        ));
        if (context === urlContext) {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
            status: 'failure',
          });
        } else {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
            status: 'failure',
          });
        }
      });
    }
  });

  Object.entries(contextMap).forEach(([contextName, context]) => {
    if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
      it(`Add newProviderItem to ${context.provider}, should return error message when a error occured while saving the data`, async () => {
        mockFetchBranches.mockImplementation(() => (
          Promise.resolve(['main'])
        ));
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(null)
        ));
        mockPushDialog.mockImplementation(() => (
          Promise.resolve({
            customBranch: 'development',
            commitMessage: 'Initial commit',
          })
        ));
        mockSave.mockImplementation(() => {
          throw new Error(ErrorMessages.GENERAL_CONNECTION_ERROR);
        });

        await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
        expect(mockCloseDialog).toBeCalledTimes(1);
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          status: 'failure',
          errorMessage: errorMessageMap[contextName as keyof typeof errorMessageMap],
        });
      });
    }
  });

  Object.entries(contextMap).forEach(([contextName, context]) => {
    if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
      it(`Add newProviderItem to ${context.provider}, should pull tokens and notify that no tokens stored on remote if there is no tokens on remote`, async () => {
        mockFetchBranches.mockImplementation(() => (
          Promise.resolve(['main'])
        ));
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(
            {
              metadata: {
                commitMessage: 'Initial commit',
              },
              themes: [
                {
                  id: 'light',
                  name: 'Light',
                  selectedTokenSets: {
                    global: 'enabled',
                  },
                },
              ],
              status: 'success',
            },
          )
        ));
        mockConfirm.mockImplementation(() => (
          Promise.resolve(true)
        ));
        await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
        expect(notifyToUI).toBeCalledTimes(2);
        expect(notifyToUI).toBeCalledWith(`Pulled tokens from ${contextName}`);
        expect(notifyToUI).toBeCalledWith('No tokens stored on remote');
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          status: 'success',
        });
      });
    } else {
      it(`Add newProviderItem to ${context.provider}, should pull tokens and return error message if there is no tokens on remote`, async () => {
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(
            {
              metadata: {
                commitMessage: 'Initial commit',
              },
              themes: [
                {
                  id: 'light',
                  name: 'Light',
                  selectedTokenSets: {
                    global: 'enabled',
                  },
                },
              ],
              tokens: null,
              status: 'success',
            },
          )
        ));
        if (context === urlContext) {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.URL_CREDENTIAL_ERROR,
            status: 'failure',
          });
        } else {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR,
            status: 'failure',
          });
        }
      });
    }
  });

  Object.values(contextMap).forEach((context) => {
    it(`Add newProviderItem to ${context.provider}, should pull tokens and return token data`, async () => {
      mockFetchBranches.mockImplementation(() => (
        Promise.resolve(['main'])
      ));
      await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          status: 'success',
        });
      } else {
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          status: 'success',
        });
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`Add newProviderItem to ${context.provider}, should return error message when there is no branch`, async () => {
      mockFetchBranches.mockImplementation(() => (
        Promise.resolve([])
      ));
      await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          status: 'failure',
          errorMessage: ErrorMessages.EMPTY_BRANCH_ERROR,
        });
      }
    });
  });

  it('Add newProviderItem to JSONbin, should return error message when secret is not defined', async () => {
    const jsonbinContextWithoutSecret = {
      name: 'six7',
      id: 'six7/figma-tokens',
      provider: 'jsonbin',
    };
    await waitFor(() => { result.current.addNewProviderItem(jsonbinContextWithoutSecret as StorageTypeCredentials); });
    expect(await result.current.addNewProviderItem(jsonbinContextWithoutSecret as StorageTypeCredentials)).toEqual({
      status: 'failure',
      errorMessage: ErrorMessages.ID_NON_EXIST_ERROR,
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`create branch in ${context.provider}`, async () => {
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        mockCreateBranch.mockImplementation(() => (
          Promise.resolve(true)
        ));
        expect(await result.current.addNewBranch(context as StorageTypeCredentials, 'newBranch')).toEqual(true);
      }
    });
  });

  Object.values(contextMap).forEach((context) => {
    it(`fetch branchs in ${context.provider}`, async () => {
      if (context === gitHubContext || context === gitLabContext || context === adoContext || context === bitbucketContext) {
        mockFetchBranches.mockImplementation(() => (
          Promise.resolve(['main'])
        ));
        expect(await result.current.fetchBranches(context as StorageTypeCredentials)).toEqual(['main']);
      } else {
        expect(await result.current.fetchBranches(context as StorageTypeCredentials)).toEqual(null);
      }
    });
  });

  it('Read tokens from File, should return token data', async () => {
    expect(await result.current.fetchTokensFromFileOrDirectory({ files: files as unknown as FileList })).toEqual({
      metadata: {
        commitMessage: 'Initial commit',
      },
      status: 'success',
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
    });
  });

  it('Read tokens from File, should return null if there is no tokens on remote', async () => {
    mockRetrieve.mockImplementation(() => (
      Promise.resolve(null)
    ));
    expect(await result.current.fetchTokensFromFileOrDirectory({ files: files as unknown as FileList })).toEqual(null);
  });

  it('Read tokens from File, should return null if there is no file', async () => {
    expect(await result.current.fetchTokensFromFileOrDirectory({ files: null })).toEqual(null);
  });
});
