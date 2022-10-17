import React from 'react';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { createMockStore, fireEvent, render } from '../../../../tests/config/setupTest';
import { MoreButton } from './MoreButton';
import { SingleToken } from '@/types/tokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';

const mockShowForm = jest.fn();
const mockDeleteToken = jest.fn();
const mockSetNodeData = jest.fn(() => Promise.resolve());

jest.mock('../../store/useManageTokens', () => jest.fn(() => ({
  deleteSingleToken: mockDeleteToken,
})));

jest.mock('../../../hooks/useSetNodeData', () => jest.fn(() => mockSetNodeData));

const token: SingleToken = {
  value: '16',
  name: 'my-large-token',
  type: TokenTypes.SPACING,
};

describe('MoreButton', () => {
  it('displays menu items', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    expect(getByText(token.name)).toBeInTheDocument();
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Gap')).toBeInTheDocument();
    expect(getByText('Documentation Tokens')).toBeInTheDocument();
  });

  it('should show form on edit', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Edit Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Edit Token'));
    expect(mockShowForm).toHaveBeenCalled();
  });

  it('should show form on duplicate', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Duplicate Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Duplicate Token'));
    expect(mockShowForm).toHaveBeenCalledWith({ name: `${token.name}-copy`, token, status: EditTokenFormStatus.DUPLICATE });
  });

  it('should call delete on delete', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Delete Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Delete Token'));
    expect(mockDeleteToken).toHaveBeenCalled();
  });

  it('should apply when clicking', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.click(getByText(token.name));
    expect(mockSetNodeData).toHaveBeenCalledWith({
      itemSpacing: token.name,
    }, []);
  });

  it('should clear when clicking', async () => {
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          itemSpacing: token.name,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={token}
        />
      </Provider>,
    );
    await fireEvent.click(result.getByText(token.name));
    expect(mockSetNodeData).toHaveBeenCalledWith({
      itemSpacing: 'delete',
    }, []);
  });

  it('should clear when using context menu', async () => {
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          itemSpacing: token.name,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={token}
        />
      </Provider>,
    );
    await fireEvent.contextMenu(result.getByText(token.name));
    await fireEvent.click(result.getByText('Gap'));
    expect(mockSetNodeData).toHaveBeenCalledWith({ itemSpacing: 'delete' }, []);
  });

  it('should remove other properties if a main one is given', async () => {
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          paddingLeft: token.name,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={token}
        />
      </Provider>,
    );
    await fireEvent.contextMenu(result.getByText(token.name));
    await fireEvent.click(result.getByText('All'));
    expect(mockSetNodeData).toHaveBeenCalledWith({
      horizontalPadding: 'delete',
      verticalPadding: 'delete',
      itemSpacing: 'delete',
      spacing: token.name,
      paddingLeft: 'delete',
      paddingTop: 'delete',
      paddingRight: 'delete',
      paddingBottom: 'delete',
    }, []);
  });
});
