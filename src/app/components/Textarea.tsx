import React from 'react';
import { styled } from '@/stitches.config';

const StyledTextarea = styled('textarea', {
  border: 0,
  height: '100%',
  width: '100%',
  backgroundColor: '$bgDefault',
  fontSize: '$xsmall',
  padding: '$3',
  borderRadius: '$default',
  fontFamily: '$mono',
  resize: 'none',
  '&:focus': {
    backgroundColor: '$bgSubtle',
    outline: 'none',
  },
  variants: {
    border: {
      true: {
        border: '1px solid $borderMuted',
      },
    },
  },
});

function Textarea({
  id,
  rows = 2,
  value,
  placeholder,
  isDisabled = false,
  onChange,
  css,
  border,
}: {
  id?: string;
  rows?: number;
  value: string;
  placeholder?: string;
  isDisabled?: boolean;
  onChange?: Function;
  css?: any;
  border?: boolean
}) {
  return (
    <StyledTextarea
      data-cy={id}
      spellCheck={false}
      rows={rows}
      placeholder={placeholder}
      css={css}
      value={value}
      disabled={isDisabled}
      border={border}
      onChange={(event) => onChange && onChange(event.target.value, event)}
    />
  );
}

export default Textarea;
