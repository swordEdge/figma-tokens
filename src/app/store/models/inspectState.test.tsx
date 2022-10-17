import { init, RematchStore } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './index';

type Store = RematchStore<RootModel, Record<string, never>>;

describe('inspectState', () => {
  let store: Store;
  beforeEach(() => {
    store = init<RootModel>({
      redux: {
        initialState: {
          inspectState: {
            selectedTokens: [],
          },
        },
      },
      models,
    });
  });

  it('should be able to set selected tokens', () => {
    store.dispatch.inspectState.setSelectedTokens(['size.primary', 'color.red']);
    expect(store.getState().inspectState.selectedTokens).toEqual(['size.primary', 'color.red']);
  });

  it('should be able to add a token to selected tokens', () => {
    store.dispatch.inspectState.toggleSelectedTokens('size.primary');
    expect(store.getState().inspectState.selectedTokens).toEqual(['size.primary']);
  });

  it('should be able to remove a token from selected tokens', () => {
    store = init<RootModel>({
      redux: {
        initialState: {
          inspectState: {
            selectedTokens: ['size.primary', 'color.red'],
          },
        },
      },
      models,
    });
    store.dispatch.inspectState.toggleSelectedTokens('size.primary');
    expect(store.getState().inspectState.selectedTokens).toEqual(['color.red']);
  });
});
