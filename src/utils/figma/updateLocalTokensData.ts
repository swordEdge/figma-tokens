import * as pjs from '../../../package.json';
import { ThemeObjectsList, UsedTokenSetsMap } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import {
  ActiveThemeProperty,
  CheckForChangesProperty,
  ThemesProperty, UpdatedAtProperty, UsedTokenSetProperty, ValuesProperty, VersionProperty,
} from '@/figmaStorage';

type Payload = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  usedTokenSets: UsedTokenSetsMap
  activeTheme: string | null
  updatedAt: string
  checkForChanges: boolean
};

export async function updateLocalTokensData(payload: Payload) {
  await VersionProperty.write(pjs.plugin_version);
  await ThemesProperty.write(payload.themes);
  await ValuesProperty.write(payload.tokens);
  await UsedTokenSetProperty.write(payload.usedTokenSets);
  await UpdatedAtProperty.write(payload.updatedAt);
  await ActiveThemeProperty.write(payload.activeTheme);
  await CheckForChangesProperty.write(payload.checkForChanges);
}
