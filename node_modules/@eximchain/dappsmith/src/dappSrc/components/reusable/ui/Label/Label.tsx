import * as React from "react";
import classnames from "classnames";

import { StyledLabel } from "./StyledLabel";

export interface LabelProps {
  /**
   * string, class to apply on component
   **/
  className?: string;
  /**
   * string, class to apply on component
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
    | "white";
  /**
   * string, label for attribute
   **/
  htmlFor: string;
  /**
   * string, size option "large" |"small"
   * @default "large"
   **/
  size?: "large" | "small";
  /**
   * string, type option "filled" |"outlined"
   * @default "filled"
   **/
  type?: "filled" | "outlined";
}

export const Label: React.SFC<LabelProps> = props => {
  const { children, className, htmlFor, size, type, color } = props;
  const classes = classnames("label", size, type, className, color);
  return (
    <StyledLabel className={classes} htmlFor={htmlFor}>
      {children}
    </StyledLabel>
  );
};

Label.defaultProps = {
  htmlFor: ""
  // size: "large",
  // type: "filled"
};

Label.displayName = "Label";

export default Label;
