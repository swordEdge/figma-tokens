import { convertToDefaultProperty } from './convertToDefaultProperty';
import { Properties } from '@/constants/Properties';

describe('convertToDefaultProperty', () => {
  const properties = [
    {
      input: Properties.width,
      output: Properties.sizing,
    },
    {
      input: Properties.height,
      output: Properties.sizing,
    },
    {
      input: Properties.itemSpacing,
      output: Properties.spacing,
    },
    {
      input: Properties.verticalPadding,
      output: Properties.spacing,
    },
    {
      input: Properties.horizontalPadding,
      output: Properties.spacing,
    },
    {
      input: Properties.paddingTop,
      output: Properties.spacing,
    },
    {
      input: Properties.paddingLeft,
      output: Properties.spacing,
    },
    {
      input: Properties.paddingBottom,
      output: Properties.spacing,
    },
    {
      input: Properties.paddingRight,
      output: Properties.spacing,
    },
    {
      input: Properties.borderRadiusTopLeft,
      output: Properties.borderRadius,
    },
    {
      input: Properties.borderRadiusTopRight,
      output: Properties.borderRadius,
    },
    {
      input: Properties.borderRadiusBottomLeft,
      output: Properties.borderRadius,
    },
    {
      input: Properties.borderRadiusBottomRight,
      output: Properties.borderRadius,
    },
    {
      input: Properties.border,
      output: Properties.fill,
    },
    {
      input: Properties.borderWidthTop,
      output: Properties.borderWidth,
    },
    {
      input: Properties.borderWidthLeft,
      output: Properties.borderWidth,
    },
    {
      input: Properties.borderWidthRight,
      output: Properties.borderWidth,
    },
    {
      input: Properties.borderWidthBottom,
      output: Properties.borderWidth,
    },
    {
      input: Properties.sizing,
      output: Properties.sizing,
    },
    {
      input: Properties.fill,
      output: Properties.fill,
    },
    {
      input: Properties.boxShadow,
      output: Properties.boxShadow,
    },
    {
      input: Properties.opacity,
      output: Properties.opacity,
    },
    {
      input: Properties.fontFamilies,
      output: Properties.fontFamilies,
    },
    {
      input: Properties.fontWeights,
      output: Properties.fontWeights,
    },
    {
      input: Properties.fontSizes,
      output: Properties.fontSizes,
    },
    {
      input: Properties.lineHeights,
      output: Properties.lineHeights,
    },
    {
      input: Properties.typography,
      output: Properties.typography,
    },
    {
      input: Properties.composition,
      output: Properties.composition,
    },

    {
      input: Properties.letterSpacing,
      output: Properties.letterSpacing,
    },
    {
      input: Properties.paragraphSpacing,
      output: Properties.paragraphSpacing,
    },
    {
      input: Properties.textCase,
      output: Properties.textCase,
    },
    {
      input: Properties.textDecoration,
      output: Properties.textDecoration,
    },
  ];
  it('should convert property to default property', () => {
    properties.forEach((property) => {
      expect(convertToDefaultProperty(property.input)).toEqual(property.output);
    });
  });
});
