import * as React from "react";
import classnames from "classnames";

import StyledDivider from "./StyledDivider";

export interface DividerProps {
  /**
   * String, divider type
   * options include: "primary" | "secondary"
   * @default "square"
   **/
  type?: "primary" | "secondary";
}

const Divider: React.SFC<DividerProps> = props => {
  const { type } = props;
  return <StyledDivider className={classnames("divider", type)} />;
};

Divider.defaultProps = {
  type: "primary"
};

Divider.displayName = "Divider";

export default Divider;
