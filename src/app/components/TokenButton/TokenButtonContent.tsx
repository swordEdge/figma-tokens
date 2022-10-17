import React, { useContext, useMemo } from 'react';

import { useSelector } from 'react-redux';
import { lightOrDark } from '@/utils/color';
import { TokensContext } from '@/context';
import { getAliasValue } from '@/utils/alias';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenTooltip } from '../TokenTooltip';
import BrokenReferenceIndicator from '../BrokenReferenceIndicator';
import { displayTypeSelector, uiDisabledSelector } from '@/selectors';
import { StyledTokenButton, StyledTokenButtonText } from './StyledTokenButton';

type Props = {
  active: boolean;
  type: TokenTypes;
  token: SingleToken;
  onClick: () => void;
};

export default function TokenButtonContent({
  token, active, type, onClick,
}: Props) {
  const tokensContext = useContext(TokensContext);
  const uiDisabled = useSelector(uiDisabledSelector);
  const displayType = useSelector(displayTypeSelector);

  const displayValue = useMemo(() => (
    getAliasValue(token, tokensContext.resolvedTokens)
  ), [token, tokensContext.resolvedTokens]);

  const showValue = React.useMemo(() => {
    let show = true;
    if (type === TokenTypes.COLOR) {
      show = false;
      if (displayType === 'LIST') {
        show = true;
      }
    }
    return show;
  }, [type, displayType]);

  // Only show the last part of a token in a group
  const visibleName = React.useMemo(() => {
    const visibleDepth = 1;
    return (token.name ?? '').split('.').slice(-visibleDepth).join('.');
  }, [token.name]);

  const cssOverrides = React.useMemo(() => {
    switch (type) {
      case TokenTypes.COLOR: {
        return {
          '--backgroundColor': String(displayValue),
          '--borderColor': lightOrDark(String(displayValue)) === 'light' ? '$colors$border' : '$colors$borderMuted',
        };
      }
      case TokenTypes.BORDER_RADIUS: {
        return {
          borderRadius: `${displayValue}px`,
        };
      }
      default: {
        return {};
      }
    }
  }, [type, displayValue]);

  return (
    <TokenTooltip token={token}>
      <StyledTokenButton tokenType={type as TokenTypes.COLOR} displayType={type === TokenTypes.COLOR ? displayType : 'GRID'} active={active} disabled={uiDisabled} type="button" onClick={onClick} css={cssOverrides}>
        <BrokenReferenceIndicator token={token} />
        <StyledTokenButtonText>{showValue && <span>{visibleName}</span>}</StyledTokenButtonText>
      </StyledTokenButton>
    </TokenTooltip>
  );
}
