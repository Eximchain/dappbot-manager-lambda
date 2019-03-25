import React, { Component } from 'react';
import classNames from 'classnames'

export interface Props {
  /**
   * func, Event --> called nav item clicked
   **/
  onClick?: () => void
  /**
    * boolean, indicated its currrent active nav item
    **/
  selected?: boolean
  /**
    * boolean, disable nav item
    **/
  disabled?: boolean

  /**
    * string, key to identify nav item
    * @default index for each item in nav
    **/
  key?: any
  /**
    * string, custom class prefix for css
    * @default nav-item
    **/
  customClass?: string
}
const getClasses = (props: Props) => {
  let { customClass, selected, disabled } = props;
  let styles = {
    [`${customClass}-selected`]: selected,
    [`${customClass}-disabled`]: disabled
  }
  return classNames(customClass, styles)
}

const noop = () => { }

const NavItem: React.SFC<Props> = (props) => {
  const { children, key, onClick, disabled } = props;
  let className = getClasses(props);
  return (
    <li key={key} className={className} onClick={!disabled ? onClick : noop}>
      {children}
    </li>
  );
}

NavItem.defaultProps = {
  customClass: 'nav-item'
}

export default NavItem;
