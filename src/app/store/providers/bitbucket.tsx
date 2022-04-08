import { useDispatch, useSelector } from 'react-redux';
import { Bitbucket, APIClient } from 'bitbucket';
import { cssNumber } from 'cypress/types/jquery';
import { MessageToPluginTypes } from '@/types/messages';
import { Dispatch } from '@/app/store';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import IsJSONString from '@/utils/isJSONString';
import { ContextObject } from '@/types/api';
import { notifyToUI, postToFigma } from '../../../plugin/notifiers';
import { FeatureFlags } from '@/utils/featureFlags';
import { AnyTokenSet, TokenValues } from '@/types/tokens';
import { featureFlagsSelector, localApiStateSelector, tokensSelector } from '@/selectors';

type TokenSets = {
  [key: string]: AnyTokenSet;
};

enum PlaceHolder {
  WORKSPACE = 'workspace',
  REPOSITORY = 'repository',
}

/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getCreatePullRequestUrl(id: string, branchName: string) {
  return `https://bitbucket.com/${id}/compare/${branchName}?expand=1`;
}

const getBitbucketOptions = (context: ContextObject) => {
  const { secret, baseUrl } = context;

  if (baseUrl && baseUrl.length > 0) {
    return { auth: { token: secret }, baseUrl };
  }
  return { auth: { token: secret } };
};

const hasSameContent = (content: TokenValues, storedContent: string) => {
  const stringifiedContent = JSON.stringify(content.values, null, 2);
  return stringifiedContent === storedContent;
};

const createBranch = async ({
  api, repository, workspace,
} : { api: APIClient, repository: string, workspace: string }) => api.repositories.createBranch({ _body: '', repo_slug: repository, workspace });

const getWorkspaceUUID = async ({ api, owner } : { api: APIClient, owner: string }) => {
  const q = `slug="${owner}"`;
  const { data } = await api.workspaces.getWorkspaces({ q });
  const workspaces = data.values;

  if (workspaces && workspaces.length > 0) {
    return workspaces[0].uuid || PlaceHolder.WORKSPACE;
  }

  return PlaceHolder.WORKSPACE;
};

const getRepositoryUUID = async ({ api, workspace, repo } : { api: APIClient, workspace: string, repo: string }) => {
  const q = `name="${repo}"`;
  const { data } = await api.repositories.list({ workspace, q });
  const repositories = data.values;

  if (repositories && repositories.length > 0) {
    return repositories[0].uuid || PlaceHolder.REPOSITORY;
  }

  return PlaceHolder.REPOSITORY;
};

const readFileContent = async ({
  api, projectId, filePath, branch,
} : { api: APIClient, projectId: number, filePath: string, branch: string }) => api.RepositoryFiles.showRaw(projectId, filePath, { ref: branch });

const checkTreeInPath = async ({ api, projectId, filePath } : { api: APIClient, projectId: number, filePath: string }) => api.Repositories.tree(projectId, { path: filePath });

const getBranches = async ({ api, workspace, repository } : { api: APIClient, workspace: string, repository: string }) => {
  const { data } = await api.repositories.listBranches({ repo_slug: repository, workspace });
  const branches = data.values || [];
  return branches.map((branch) => branch.name);
};

export const fetchBranches = async ({ context, owner, repo }: { context: ContextObject, owner: string, repo: string }) => {
  const api = new Bitbucket(getBitbucketOptions(context));
  const workspace = await getWorkspaceUUID({ api, owner });
  const repository = await getRepositoryUUID({ api, workspace, repo });
  const branches = await getBranches({ api, workspace, repository });
  return branches;
};

export const checkPermissions = async ({ api, repository }: { api: APIClient, repository: string }) => {
  try {
    const q = `repository.uuid = ${repository}`;
    const { data } = await api.repositories.listPermissions({ q });
    const repositories = data.values;

    if (repositories && repositories.length > 0) {
      return repositories[0].permission;
    }

    return null;
  } catch (e) {
    console.log(e);

    return null;
  }
};

export const readContents = async ({
  context, workspace, repository, opts,
}: { context: ContextObject, workspace: string, repository: string, opts: FeatureFlagOpts }) => {
  await Promise.all([]);
  // const api = new Bitbucket(getBitbucketOptions(context));

  // try {
  //   const { filePath, branch } = context;
  //   const trees = await checkTreeInPath({ api, projectId, filePath });
  //   const fileContents: Array<{ name: string; data: string }> = [];
  //   if (trees.length > 0 && opts.multiFile) {
  //     await Promise.all(
  //       trees
  //         .filter((tree) => tree.name?.endsWith('.json'))
  //         .map((tree) => {
  //           if (tree.name) {
  //             return readFileContent({
  //               api,
  //               projectId,
  //               filePath: tree.path,
  //               branch,
  //             })
  //               .then((res) => {
  //                 fileContents.push({
  //                   name: tree.name?.replace('.json', ''),
  //                   data: res,
  //                 });
  //               });
  //           }
  //           return null;
  //         }),
  //     );
  //     if (fileContents.length > 0) {
  //       const allContents = fileContents
  //         .sort((a, b) => a.name.localeCompare(b.name))
  //         .reduce((acc, curr) => {
  //           if (IsJSONString(curr.data)) {
  //             const parsed = JSON.parse(curr.data);

  //             acc[curr.name] = parsed;
  //           }
  //           return acc;
  //         }, {});
  //       return allContents ? { values: allContents } : null;
  //     }
  //   } else {
  //     const content = await readFileContent({
  //       api, projectId, filePath, branch,
  //     });
  //     if (IsJSONString(content)) {
  //       return {
  //         values: JSON.parse(content),
  //       };
  //     }
  //   }

  //   return null;
  // } catch (e) {
  //   // Raise error (usually this is an auth error)
  //   console.log('Error', e);
  //   return null;
  // }
};

type FeatureFlagOpts = {
  multiFile: boolean;
};

enum BitbucketAccessLevel {
  NoAccess = 0,
  MinimalAccess = 5,
  Guest = 10,
  Reporter = 20,
  Developer = 30,
  Maintainer = 40,
  Owner = 50,
}

const extractFiles = (filePath: string, tokenObj: TokenSets, opts: FeatureFlagOpts) => {
  const files: { [key: string]: string } = {};
  if (filePath.endsWith('.json')) {
    files[filePath] = JSON.stringify(tokenObj, null, 2);
  } else if (opts.multiFile) {
    Object.keys(tokenObj).forEach((key) => {
      files[`${filePath}/${key}.json`] = JSON.stringify(tokenObj[key], null, 2);
    });
  }

  return files;
};

const createFiles = async (
  api: APIClient,
  context: {
    workspace: string;
    repository: string;
    branch: string;
    filePath: string;
    tokenObj: TokenSets;
    commitMessage?: string;
  },
  opts: FeatureFlagOpts,
) => {
  const {
    workspace, repository, branch, filePath, tokenObj, commitMessage,
  } = context;
  const files = extractFiles(filePath, tokenObj, opts);
  return null;
};

export function useBitbucket() {
  const tokens = useSelector(tokensSelector);
  const localApiState = useSelector(localApiStateSelector);
  const featureFlags = useSelector(featureFlagsSelector);
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  async function askUserIfPull(): Promise<boolean> {
    const { result } = await confirm({
      text: 'Pull from BitBucket?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return result;
  }

  function getTokenObj() {
    const raw = convertTokensToObject(tokens);
    const string = JSON.stringify(raw, null, 2);
    return { raw, string };
  }

  async function writeTokensToBitBucket({
    context,
    tokenObj,
    owner,
    repo,
    commitMessage,
    customBranch,
  }: {
    context: ContextObject;
    tokenObj: TokenSets;
    owner: string;
    repo: string;
    commitMessage?: string;
    customBranch?: string;
  }): Promise<TokenValues | null> {
    try {
      const api = new Bitbucket(getBitbucketOptions(context));
      const workspace = await getWorkspaceUUID({ api, owner });
      const repository = await getRepositoryUUID({ api, workspace, repo });
      const branches = await getBranches({ api, workspace, repository });
      const branch = customBranch || context.branch;

      if (!branches) return null;

      if (branches.includes(branch)) {
        await createFiles(
          api,
          {
            workspace,
            repository,
            branch,
            filePath: context.filePath,
            tokenObj,
            commitMessage: commitMessage || 'Commit from Figma',
          },
          { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
        );
      } else {
        await createBranch({
          api, repository: repo, workspace,
        });
        await createFiles(
          api,
          {
            workspace,
            repository,
            branch,
            filePath: context.filePath,
            tokenObj,
            commitMessage: commitMessage || 'Commit from Figma',
          },
          { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
        );
      }
      dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenObj, null, 2));
      notifyToUI('Pushed changes to BitBucket');
    } catch (e) {
      notifyToUI('Error pushing to BitBucket', { error: true });
      console.log('Error pushing to BitBucket', e);
    }
    return null;
  }

  async function pushTokensToBitbucket(context: ContextObject) {
    const { raw: rawTokenObj, string: tokenObj } = getTokenObj();
    const [owner, repo] = context.id.split('/');

    const content = await readContents({
      context,
      owner,
      repo,
      opts: { multiFile: Boolean(featureFlags?.gh_mfs_enabled) },
    });

    if (content) {
      if (content && hasSameContent(content, tokenObj)) {
        notifyToUI('Nothing to commit');
        return rawTokenObj;
      }
    }

    dispatch.uiState.setLocalApiState({ ...context });

    const pushSettings = await pushDialog();
    if (pushSettings) {
      const { commitMessage, customBranch } = pushSettings;
      try {
        await writeTokensToBitBucket({
          context,
          tokenObj: rawTokenObj,
          owner,
          repo,
          commitMessage,
          customBranch,
        });
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch });
        dispatch.uiState.setApiData({ ...context, branch: customBranch });

        pushDialog('success');
      } catch (e) {
        console.log('Error pushing to BitBucket', e);
      }
    }
    return rawTokenObj;
  }

  async function checkAndSetAccess({ context, owner, repo }: { context: ContextObject; owner: string; repo: string }) {
    const api = new Bitbucket(getBitbucketOptions(context));
    const workspace = await getWorkspaceUUID({ api, owner });
    const repository = await getRepositoryUUID({ api, workspace, repo });
    const permission = await checkPermissions({ api, repository });

    // dispatch.tokenState.setEditProhibited(!(permission?.access_level > BitBucketAccessLevel.Developer));
  }

  async function pullTokensFromBitbucket(context: ContextObject, receivedFeatureFlags?: FeatureFlags) {
    const multiFile = receivedFeatureFlags ? receivedFeatureFlags.gh_mfs_enabled : featureFlags?.gh_mfs_enabled;

    const [owner, repo] = context.id.split('/');

    await checkAndSetAccess({ context, owner, repo });

    try {
      const content = await readContents({
        context,
        owner,
        repo,
        opts: { multiFile: Boolean(multiFile) },
      });

      if (content) {
        return content;
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  }

  // Function to initially check auth and sync tokens with BitBucket
  async function syncTokensWithBitbucket(context: ContextObject): Promise<TokenValues | null> {
    try {
      const [owner, repo] = context.id.split('/');

      const hasBranches = await fetchBranches({ context, owner, repo });

      if (!hasBranches) {
        return null;
      }

      const content = await pullTokensFromBitbucket(context);

      const { string: tokenObj } = getTokenObj();

      if (content) {
        if (!hasSameContent(content, tokenObj)) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            dispatch.tokenState.setLastSyncedState(JSON.stringify(content.values, null, 2));
            dispatch.tokenState.setTokenData(content);
            notifyToUI('Pulled tokens from BitBucket');
            return content;
          }
          return { values: tokenObj };
        }
        return content;
      }
      return await pushTokensToBitbucket(context);
    } catch (e) {
      notifyToUI('Error syncing with BitBucket, check credentials', { error: true });
      console.log('Error', e);
      return null;
    }
  }

  async function addNewBitbucketCredentials(context: ContextObject): Promise<TokenValues | null> {
    let { raw: rawTokenObj } = getTokenObj();

    const data = await syncTokensWithBitbucket(context);
    if (data) {
      postToFigma({
        type: MessageToPluginTypes.CREDENTIALS,
        ...context,
      });
      if (data?.values) {
        dispatch.tokenState.setLastSyncedState(JSON.stringify(data.values, null, 2));
        dispatch.tokenState.setTokenData(data);
        rawTokenObj = data.values;
      } else {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      return null;
    }

    return {
      values: rawTokenObj,
    };
  }

  return {
    addNewBitbucketCredentials,
    syncTokensWithBitbucket,
    pullTokensFromBitbucket,
    pushTokensToBitbucket,
  };
}
