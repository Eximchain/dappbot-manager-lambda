import * as React from 'react';
import classnames from 'classnames';
import './Button.css';

export const ButtonStyles = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  outline: 'outline',
  destructive: 'destructive',
  disabled: 'disabled',
  hovered: 'hovered',
  pressed: 'pressed',
  idle: 'idle',
  close: 'close',
  cancel: 'cancel'
}
export const SizeMap = {
  small: 'small',
  large: 'large',
  medium: 'medium'
}
export function prefix(baseClass: any, style: string) {
  return baseClass + (style ? "-" + style : "");
}
export interface Props {
  /**
   * func, Event --> called on buton click
   **/
  onClick?: () => void;
  /**
   * Disables onclick
   * @default false
   **/
  disabled?: boolean;
  /**
   * string, button type one of "button" | "submit" | "reset"
   * @default button
   **/
  type?: string;
  /**
   * boolean, button hover state
   * @default false
   **/
  hovered?: boolean;
  /**
   * string, custom class prefix for css
   * @default btn-small
   **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

const noop = () => { };

const getClasses = (props: Props) => {
  let {customClass, className} = props;
  let styles = {};

  //Apply classes based on props
  Object.keys(ButtonStyles).filter((key) => {
    styles[prefix(customClass, key)] = props[key]
  });

  return classnames(customClass, prefix(props.customClass, SizeMap.small), styles, className);
}


export const ButtonSmall: React.SFC<Props> = (props) => {
  const { onClick, disabled, children } = props;
  const classes = getClasses(props);
  return (
    <button className={classes} onClick={!disabled ? onClick : noop} disabled={disabled}>
      {children ? children : <span>Button</span>}
    </button>
  );
}

ButtonSmall.defaultProps = {
  disabled: false,
  customClass: 'btn',
  hovered: false,
}

export default ButtonSmall;
