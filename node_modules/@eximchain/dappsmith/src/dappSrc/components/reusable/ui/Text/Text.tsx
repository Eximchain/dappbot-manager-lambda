import * as React from "react";
import cx from "classnames";
import StyledText from "./StyledText";

const SIZE_SCALE: { [key: string]: number } = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5
};

export interface TextProps {
  /**
   * string, Text align  - "left" | "right" | "center" | "justify"
   * @default left
   **/
  align?: "left" | "right" | "center" | "justify";
  /**
   * boolean, bold font
   * @default left
   **/
  bold?: boolean;
  /**
   * React.ReactNode, children items
   **/
  children?: React.ReactNode;
  /**
   * string, text color
   * "blue" | "darkGray" | "eggplant" | "gray" | "green" | "lightGray" | "maroon" | "midnight" | "navy" | "olive" | "orange" | "orchid" | "pine" | "purple" | "red" | "watermelon" | "white"
   * @default darkGray
   **/
  color?:
    | "green"
    | "pine"
    | "olive"
    | "blue"
    | "navy"
    | "midnight"
    | "purple"
    | "orchid"
    | "eggplant"
    | "maroon"
    | "watermelon"
    | "orange"
    | "darkGray"
    | "gray"
    | "lightGray"
    | "red"
    | "white"
    | "inherit";
  /**
   * boolean, inline
   * @default false
   **/
  inline?: boolean;
  /**
   * boolean, italian
   * @default false
   **/
  italic?: boolean;
  /**
   * string, "normal" | "breakWord"
   * @default breakWord
   **/
  overflow?: "normal" | "breakWord";
  /**
   * string, "xs" | "sm" | "md" | "lg" | "xl"
   * xs: 12px, sm: 14px, md: 16px, lg: 18px, xl: 21px
   * @default md
   **/
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  smSize?: "xs" | "sm" | "md" | "lg" | "xl";
  mdSize?: "xs" | "sm" | "md" | "lg" | "xl";
  lgSize?: "xs" | "sm" | "md" | "lg" | "xl";
  leading?: "tall" | "short";
  /**
   * boolean, truncate
   * @default false
   **/
  truncate?: boolean;
  /**
   * string, text transform -  "capitalize" | "lowecase" | "uppercase"
   **/
  textTransform?: "capitalize" | "lowecase" | "uppercase";
  __dangerouslyIncreaseLineHeight?: boolean;
}

export const Text: React.SFC<TextProps> = props => {
  let {
    align = "left",
    bold = false,
    children,
    color = "darkGray",
    inline = false,
    italic = false,
    overflow = "breakWord",
    size = "md",
    smSize = "md",
    mdSize = "md",
    lgSize = "md",
    leading = "md",
    truncate = false,
    textTransform,
    __dangerouslyIncreaseLineHeight = false
  } = props;

  const scale = SIZE_SCALE[size];
  const smScale = SIZE_SCALE[smSize];
  const mdScale = SIZE_SCALE[mdSize];
  const lgScale = SIZE_SCALE[lgSize];

  const cs = cx("Text", `fontSize${scale}`, color !== "inherit" ? color : "", {
    [`lgFontSize${lgScale}`]: lgSize,
    [`mdFontSize${mdScale}`]: mdSize,
    [`smFontSize${smScale}`]: smSize,
    inline,
    leadingShort: leading === "short",
    leadingTall: leading === "tall" || __dangerouslyIncreaseLineHeight,
    alignCenter: align === "center",
    alignJustify: align === "justify",
    alignLeft: align === "left",
    alignRight: align === "right",
    breakWord: overflow === "breakWord",
    fontStyleItalic: italic,
    fontStyleNormal: !italic,
    fontWeightBold: bold,
    fontWeightNormal: !bold,
    truncate: truncate,
    uppercase: textTransform === "uppercase",
    lowercase: textTransform === "lowecase",
    capitalize: textTransform === "capitalize"
  });

  return (
    <StyledText
      className={cs}
      {...(truncate && typeof children === "string"
        ? { title: children }
        : null)}
    >
      {children}
    </StyledText>
  );
};

Text.defaultProps = {
  align: "left",
  bold: false,
  color: "darkGray",
  inline: false,
  italic: false,
  overflow: "breakWord",
  size: "md",
  truncate: false,
  __dangerouslyIncreaseLineHeight: false
};

Text.displayName = "Text";

export default Text;
