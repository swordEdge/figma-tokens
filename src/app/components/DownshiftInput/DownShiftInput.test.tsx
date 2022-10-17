import React from 'react';
import { DownshiftInput } from './DownshiftInput';
import { render } from '../../../../tests/config/setupTest';
import { SingleToken } from '@/types/tokens';

const resolvedTokens = [
  {
    internal__Parent: 'core',
    name: 'border-radius.0',
    rawValue: '64px',
    type: 'borderRadius',
    value: '64px',
  },
  {
    internal__Parent: 'core',
    name: 'border-radius.1',
    rawValue: '1px',
    type: 'borderRadius',
    value: '1px',
  },
  {
    internal__Parent: 'core',
    name: 'border-radius.2',
    rawValue: '2px',
    type: 'borderRadius',
    value: '2px',
  },
  {
    internal__Parent: 'core',
    name: 'color.slate.200',
    rawValue: '#e2e8f0',
    type: 'color',
    value: '#e2e8f0',
  },
  {
    internal__Parent: 'core',
    name: 'color.slate.300',
    rawValue: '#cbd5e1',
    type: 'color',
    value: '#cbd5e1',
  },
  {
    internal__Parent: 'core',
    name: 'size.0',
    rawValue: '0',
    type: 'sizing',
    value: 0,
  },
  {
    internal__Parent: 'core',
    name: 'size.12',
    rawValue: '1',
    type: 'sizing',
    value: 1,
  },
] as SingleToken[];

const mockSetInputValue = jest.fn();
const mockHandleChange = jest.fn();

describe('DownShiftInput', () => {
  it('filteredValue should only replace {} or $ and remain all letters', () => {
    const dataStore = [
      {
        input: '{opacity.10}',
        output: 'opacity.10',
      },
      {
        input: '{トランスペアレント.10',
        output: 'トランスペアレント.10',
      },
      {
        input: '$不透 明度.10',
        output: '不透 明度.10',
      },
      {
        input: '$불투명.10',
        output: '불투명.10',
      },
      {
        input: '{अस्पष्टता.10}',
        output: 'अस्पष्टता.10',
      },
      {
        input: 'թափանցիկ.10',
        output: 'թափանցիկ.10',
      },
    ];
    dataStore.forEach((data) => {
      expect(data.input.replace(/[{}$]/g, '')).toBe(data.output);
    });
  });

  it('should return color tokens when type is color', () => {
    const result = render(
      <DownshiftInput
        type="color"
        resolvedTokens={resolvedTokens}
        setInputValue={mockSetInputValue}
        handleChange={mockHandleChange}
        value="{"
        suffix
      />,
    );
    result.getByTestId('downshift-input-suffix-button').click();
    expect(result.getByText('#e2e8f0')).toBeInTheDocument();
    expect(result.getByText('#cbd5e1')).toBeInTheDocument();
  });

  it('should return all tokens when type is documentation type', () => {
    const result = render(
      <DownshiftInput
        type="tokenName"
        resolvedTokens={resolvedTokens}
        setInputValue={mockSetInputValue}
        handleChange={mockHandleChange}
        value="{"
        suffix
      />,
    );
    result.getByTestId('downshift-input-suffix-button').click();
    expect(result.getAllByTestId('downshift-input-item')).toHaveLength(7);
  });
});
