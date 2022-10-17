/* eslint-disable no-param-reassign */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as asyncHandlers from './asyncMessageHandlers';
import { defaultWorker } from './Worker';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { sendSelectionChange } from './sendSelectionChange';
import { init } from '@/utils/plugin';

figma.skipInvisibleInstanceChildren = true;

AsyncMessageChannel.PluginInstance.connect();
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREDENTIALS, asyncHandlers.credentials);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CHANGED_TABS, asyncHandlers.changedTabs);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_SINGLE_CREDENTIAL, asyncHandlers.removeSingleCredential);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_STORAGE_TYPE, asyncHandlers.setStorageType);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_NODE_DATA, asyncHandlers.setNodeData);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE, asyncHandlers.removeTokensByValue);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMAP_TOKENS, asyncHandlers.remapTokens);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.BULK_REMAP_TOKENS, asyncHandlers.bulkRemapTokens);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.GOTO_NODE, asyncHandlers.gotoNode);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SELECT_NODES, asyncHandlers.selectNodes);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.PULL_STYLES, asyncHandlers.pullStyles);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.NOTIFY, asyncHandlers.notify);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.RESIZE_WINDOW, asyncHandlers.resizeWindow);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CANCEL_OPERATION, asyncHandlers.cancelOperation);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS, asyncHandlers.setShowEmptyGroups);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_UI, asyncHandlers.setUi);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREATE_ANNOTATION, asyncHandlers.createAnnotation);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREATE_STYLES, asyncHandlers.createStyles);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.UPDATE, asyncHandlers.update);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_LICENSE_KEY, asyncHandlers.setLicenseKey);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME, asyncHandlers.attachLocalStylesToTheme);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.RESOLVE_STYLE_INFO, asyncHandlers.resolveStyleInfo);

figma.on('close', () => {
  defaultWorker.stop();
});

figma.on('selectionchange', () => {
  sendSelectionChange();
});

init();
