import * as React from "react";
import { StyledNavItem } from "./StyledNav";
import classnames from "classnames";

export interface Props {
  /**
   * func, Event --> called nav item clicked
   **/
  onClick?: () => void;
  /**
   * boolean, indicated its currrent active nav item
   **/
  selected?: boolean;
  /**
   * boolean, disable nav item
   **/
  disabled?: boolean;

  /**
   * string, key to identify nav item
   * @default index for each item in nav
   **/
  key?: any;
}

const noop = () => {};

const NavItem: React.SFC<Props> = props => {
  const { children, disabled, key, onClick, selected } = props;
  let className = classnames({
    disabled,
    selected
  });
  return (
    <StyledNavItem
      key={key}
      className={className}
      onClick={!disabled ? onClick : noop}
    >
      {children}
    </StyledNavItem>
  );
};

export default NavItem;
