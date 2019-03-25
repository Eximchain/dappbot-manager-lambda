import * as React from 'react';
import classnames from 'classnames';
import './ButtonLink.css';


export function prefix(baseClass: any, style: string) {
  return baseClass + (style ? "-" + style : "");
}
export const ButtonLinkStyles = {
  plain: 'plain',
  link: 'link',
  address: 'address',
  disabled: 'disabled',
  selected: 'selected',
  hovered: 'hovered',
  pressed: 'pressed',
  idle: 'idle'
}

export interface Props {
  /**
   * func, Event --> called on buton link click
   **/
  onClick?: () => void;
  /**
   * boolean, Disble ButtonLink
   * @default false
   **/
  disabled?: boolean;
  /**
   * string, href link
   * @default #
   **/
  href?: string;
  /**
   * boolean, Show as link type
   * @default false
   **/
  link?: boolean;
  /**
   * boolean, Show as plain link
   * @default false
   **/
  plain?: boolean;
  /**
   * boolean, Show as address link
   * @default false
   **/
  address?: boolean;
  /**
   * boolean, link pressed
   * @default false
   **/
  pressed?: boolean;
  /**
   * boolean, link hovered
   * @default false
   **/
  hovered?: boolean;
  /**
   * boolean, link idle
   * @default false
   **/
  idle?: boolean;
  /**
   * string, custom class prefix for css
   * @default anchor
   **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

const noop = (e: any) => { return e.stopPropagation() };

const getClasses = (props: Props) => {
  let { customClass, className} = props;
  let styles = {};
  Object.keys(ButtonLinkStyles).filter((key) => {
    styles[prefix(customClass, key)] = props[key]
  });
  return classnames(customClass, styles, className);
}

export const ButtonLink: React.SFC<Props> = (props) => {
  const { onClick, disabled, children, href } = props;
  const classes = getClasses(props);
  return (
    <a className={classes} onClick={!disabled ? onClick : noop} href={href}>
      {children ? children : <span>Button Link</span>}
    </a>
  );
}

ButtonLink.defaultProps = {
  disabled: false,
  href: '#',
  customClass: 'anchor',
  link: false,
  plain: false,
  address: false,
  pressed: false,
  hovered: false,
  idle: false
}

export default ButtonLink;
