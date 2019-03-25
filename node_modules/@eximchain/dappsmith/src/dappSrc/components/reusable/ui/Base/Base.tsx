import * as React from "react";
import classnames from "classnames";

import { StyledBase } from "./StyledBase";

export interface BaseProps {
  /**
   * string, class to apply on component
   **/
  className?: string;
  /**
   * string, theme option
   * "modal" | "pill" | "standard" | "tooltip"
   **/
  type?: "modal" | "pill" | "standard" | "tooltip";
}

export const Base: React.SFC<BaseProps> = props => {
  const { className, type, children } = props;
  const classes = classnames("base", type, className);
  return <StyledBase className={classes}>{children}</StyledBase>;
};

Base.defaultProps = {
  type: "standard"
};

Base.displayName = "Base";

export default Base;
