import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateLocalTokensData } from '@/utils/figma';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../node';
import { defaultNodeManager } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import updateStyles from '../updateStyles';

export const update: AsyncMessageChannelHandlers[AsyncMessageTypes.UPDATE] = async (msg) => {
  let receivedStyleIds: Record<string, string> = {};
  if (msg.tokenValues && msg.updatedAt) {
    await updateLocalTokensData({
      tokens: msg.tokenValues,
      themes: msg.themes,
      activeTheme: msg.activeTheme,
      usedTokenSets: msg.usedTokenSet,
      updatedAt: msg.updatedAt,
      checkForChanges: msg.checkForChanges ?? false,
    });
  }
  if (msg.settings.updateStyles && msg.tokens) {
    receivedStyleIds = await updateStyles(msg.tokens, false, msg.settings);
  }
  if (msg.tokens) {
    const tokensMap = tokenArrayGroupToMap(msg.tokens);
    const allWithData = await defaultNodeManager.findNodesWithData({
      updateMode: msg.settings.updateMode,
    });
    await updateNodes(allWithData, tokensMap, msg.settings);
    await updatePluginData({ entries: allWithData, values: {} });
  }

  return {
    styleIds: receivedStyleIds,
  };
};
