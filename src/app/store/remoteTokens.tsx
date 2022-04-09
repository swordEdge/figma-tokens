import { useDispatch, useSelector } from 'react-redux';
import { StorageProviderType } from '@/types/api';
import { MessageToPluginTypes } from '@/types/messages';
import { track } from '@/utils/analytics';
import { postToFigma } from '../../plugin/notifiers';
import { useJSONbin } from './providers/jsonbin';
import useURL from './providers/url';
import { Dispatch } from '../store';
import useStorage from './useStorage';
import { useGitHub } from './providers/github';
import { useGitLab } from './providers/gitlab';
import { useBitbucket } from './providers/bitbucket';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { FeatureFlags } from '@/utils/featureFlags';
import { apiSelector } from '@/selectors';

export default function useRemoteTokens() {
  const dispatch = useDispatch<Dispatch>();
  const api = useSelector(apiSelector);

  const { setStorageType } = useStorage();
  const { pullTokensFromJSONBin, addJSONBinCredentials, createNewJSONBin } = useJSONbin();
  const {
    addNewGitHubCredentials, syncTokensWithGitHub, pullTokensFromGitHub, pushTokensToGitHub,
  } = useGitHub();
  const {
    addNewGitLabCredentials, syncTokensWithGitLab, pullTokensFromGitLab, pushTokensToGitLab,
  } = useGitLab();
  const {
    addNewBitbucketCredentials, syncTokensWithBitbucket, pullTokensFromBitbucket, pushTokensToBitbucket,
  } = useBitbucket();
  const { pullTokensFromURL } = useURL();

  const pullTokens = async (context = api, featureFlags?: FeatureFlags) => {
    track('pullTokens', { provider: context.provider });

    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_PULLTOKENS,
      isInfinite: true,
    });

    let tokenValues;

    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        tokenValues = await pullTokensFromJSONBin(context);
        break;
      }
      case StorageProviderType.GITHUB: {
        tokenValues = await pullTokensFromGitHub(context, featureFlags);
        break;
      }
      case StorageProviderType.GITLAB: {
        tokenValues = await pullTokensFromGitLab(context, featureFlags);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        tokenValues = await pullTokensFromGitLab(context, featureFlags);
        break;
      }
      case StorageProviderType.URL: {
        tokenValues = await pullTokensFromURL(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }

    if (tokenValues) {
      dispatch.tokenState.setLastSyncedState(JSON.stringify(tokenValues.values, null, 2));
      dispatch.tokenState.setTokenData(tokenValues);
      track('Launched with token sets', {
        count: Object.keys(tokenValues.values).length,
        setNames: Object.keys(tokenValues.values),
      });
    }

    dispatch.uiState.completeJob(BackgroundJobs.UI_PULLTOKENS);
  };

  const restoreStoredProvider = async (context) => {
    track('restoreStoredProvider', { provider: context.provider });
    dispatch.uiState.setLocalApiState(context);
    dispatch.uiState.setApiData(context);
    dispatch.tokenState.setEditProhibited(false);
    setStorageType({ provider: context, shouldSetInDocument: true });
    switch (context.provider) {
      case StorageProviderType.GITHUB: {
        await syncTokensWithGitHub(context);
        break;
      }
      case StorageProviderType.GITLAB: {
        await syncTokensWithGitLab(context);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        await syncTokensWithBitbucket(context);
        break;
      }
      default:
        await pullTokens(context);
    }
    return null;
  };

  const pushTokens = async () => {
    track('pushTokens', { provider: api.provider });
    switch (api.provider) {
      case StorageProviderType.GITHUB: {
        await pushTokensToGitHub(api);
        break;
      }
      case StorageProviderType.GITLAB: {
        await pushTokensToGitLab(api);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        await pushTokensToBitbucket(api);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
  };

  async function addNewProviderItem(context): Promise<boolean> {
    const credentials = context;
    let data;
    console.log('credentials', credentials);
    switch (context.provider) {
      case StorageProviderType.JSONBIN: {
        if (context.id) {
          data = await addJSONBinCredentials(context);
        } else {
          const id = await createNewJSONBin(context);
          credentials.id = id;
          data = true;
        }
        break;
      }
      case StorageProviderType.GITHUB: {
        data = await addNewGitHubCredentials(credentials);
        break;
      }
      case StorageProviderType.GITLAB: {
        data = await addNewGitLabCredentials(credentials);
        break;
      }
      case StorageProviderType.BITBUCKET: {
        data = await addNewBitbucketCredentials(credentials);
        break;
      }
      case StorageProviderType.URL: {
        data = await pullTokensFromURL(context);
        break;
      }
      default:
        throw new Error('Not implemented');
    }
    if (data) {
      dispatch.uiState.setLocalApiState(credentials);
      dispatch.uiState.setApiData(credentials);
      setStorageType({ provider: credentials, shouldSetInDocument: true });
      return true;
    }
    return false;
  }

  const deleteProvider = (provider) => {
    postToFigma({
      type: MessageToPluginTypes.REMOVE_SINGLE_CREDENTIAL,
      context: provider,
    });
  };

  return {
    restoreStoredProvider,
    deleteProvider,
    pullTokens,
    pushTokens,
    addNewProviderItem,
  };
}
