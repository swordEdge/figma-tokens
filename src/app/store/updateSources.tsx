import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { notifyToUI } from '../../plugin/notifiers';
import { updateJSONBinTokens } from './providers/jsonbin';
import { track } from '@/utils/analytics';
import type { AnyTokenList } from '@/types/tokens';
import type { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import type { SettingsState } from './models/settings';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType, StorageTypeCredentials } from '@/types/StorageType';

type UpdateRemoteTokensPayload = {
  provider: StorageProviderType;
  tokens: Record<string, AnyTokenList>;
  themes: ThemeObjectsList;
  context: StorageTypeCredentials;
  updatedAt: string;
  oldUpdatedAt?: string;
};

type UpdateTokensOnSourcesPayload = {
  tokens: Record<string, AnyTokenList> | null;
  tokenValues: Record<string, AnyTokenList>;
  usedTokenSet: UsedTokenSetsMap;
  themes: ThemeObjectsList;
  activeTheme: string | null;
  settings: SettingsState;
  updatedAt: string;
  shouldUpdateRemote: boolean;
  isLocal: boolean;
  editProhibited: boolean;
  storageType: StorageType;
  lastUpdatedAt: string;
  api: StorageTypeCredentials;
  checkForChanges: boolean;
};

async function updateRemoteTokens({
  provider,
  tokens,
  themes,
  context,
  updatedAt,
  oldUpdatedAt,
}: UpdateRemoteTokensPayload) {
  if (!context) return;
  switch (provider) {
    case StorageProviderType.JSONBIN: {
      track('pushTokens', { provider: StorageProviderType.JSONBIN });

      notifyToUI('Updating JSONBin...');
      await updateJSONBinTokens({
        themes,
        tokens,
        context,
        updatedAt,
        oldUpdatedAt,
      });
      break;
    }

    case StorageProviderType.GITHUB: {
      break;
    }
    case StorageProviderType.GITLAB: {
      break;
    }
    case StorageProviderType.BITBUCKET: {
      break;
    }
    case StorageProviderType.ADO: {
      break;
    }
    default:
      throw new Error('Not implemented');
  }
}

export default async function updateTokensOnSources({
  tokens,
  tokenValues,
  usedTokenSet,
  themes,
  activeTheme,
  settings,
  updatedAt,
  shouldUpdateRemote = true,
  isLocal,
  editProhibited,
  storageType,
  api,
  lastUpdatedAt,
  checkForChanges,
}: UpdateTokensOnSourcesPayload) {
  if (tokens && !isLocal && shouldUpdateRemote && !editProhibited) {
    updateRemoteTokens({
      provider: storageType.provider,
      tokens,
      themes,
      context: api,
      updatedAt,
      oldUpdatedAt: lastUpdatedAt,
    });
  }

  const mergedTokens = tokens
    ? resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet))
    : null;
  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.UPDATE,
    tokenValues,
    tokens: tokens ? mergedTokens : null,
    themes,
    updatedAt,
    settings,
    usedTokenSet,
    checkForChanges,
    activeTheme,
  });
}
