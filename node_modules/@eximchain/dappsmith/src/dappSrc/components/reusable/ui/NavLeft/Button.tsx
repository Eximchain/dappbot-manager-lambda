import * as React from 'react';
import classnames from 'classnames';
import ButtonSmall from './ButtonSmall';
import ButtonCancel from './ButtonCancel';
import ButtonClose from './ButtonClose';
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
export type ButtonSizeOptions = "large" | "medium";

export type ButtonTypeOptions = "button" | "submit" | "reset";

export function prefix(baseClass: any, style: string) {
  return baseClass + (style ? "-" + style : "");
}
export interface Props {
  /**
   * func, Event --> called on buton click
   **/
  onClick?: () => void;
  /**
   * boolean, disables button
   * @default false
   **/
  disabled?: boolean;
  /**
   * boolean, primary button
   * @default false
   **/
  primary?: boolean;
  /**
   * boolean, secondary button
   * @default false
   **/
  secondary?: boolean;
  /**
   * boolean, tertiary button
   * @default false
   **/
  tertiary?: boolean;
  /**
   * boolean, outline button
   * @default false
   **/
  outline?: boolean;
  /**
   * boolean, destructive button
   * @default false
   **/
  destructive?: boolean;
  /**
   * boolean, show loading inside button
   * @default false
   **/
  loader?: boolean;
  /**
    * String, button size options
    * options include: "medium" | "large"
    * @default medium
    **/
  size?: ButtonSizeOptions;
  /**
    * String, button type options
    * options include: "button" | "submit" | "reset"
    * @default button
    **/
  type?: ButtonTypeOptions;
  /**
   * boolean, button hover state
   * @default false
   **/
  hovered?: boolean;
  /**
   * boolean, button idle state
   * @default false
   **/
  idle?: boolean;
  /**
   * boolean, button pressed state
   * @default false
   **/
  pressed?: boolean;
  /**
    * string, custom class prefix for css
    * @default btn
    **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

const noop = () => { };

export interface State {
  hovered: boolean,
  pressed: boolean,
  idle: boolean,
  className: string
}

export class Button extends React.Component<Props, State>  {

  static defaultProps = {
    disabled: false,
    primary: false,
    secondary: false,
    tertiary: false,
    outline: false,
    destructive: false,
    loader: false,
    size: 'medium',
    customClass: 'btn',
    hovered: false,
    idle: false,
    pressed: false
  }

  getClasses() {
    let { customClass, className, size } = this.props;

    let styles = {};

    //Apply size class
    if (size && SizeMap[size])
      styles[prefix(customClass, SizeMap[size])] = true;

    //Apply classes based on props
    Object.keys(ButtonStyles).filter((key) => {
      styles[prefix(customClass, key)] = this.props[key]
    });

    //Overwrite classes with state value
    if (this.state) {
      let { hovered, pressed } = this.state;
      styles[prefix(customClass, ButtonStyles.hovered)] = hovered;
      styles[prefix(customClass, ButtonStyles.pressed)] = pressed;
      styles[prefix(customClass, ButtonStyles.idle)] = !pressed && !hovered;
    }

    this.setState({
      className: classnames(customClass, styles, className)
    })

    return classnames(customClass, styles, className);
  }


  onMouseOver() {
    this.setState({
      hovered: true
    }, this.getClasses);

  }

  onMouseOut() {
    this.setState({
      hovered: false
    }, this.getClasses);
  }

  onMouseDown() {
    this.setState({
      pressed: true
    }, this.getClasses);
  }

  onMouseUp() {
    this.setState({
      pressed: false
    }, this.getClasses);
  }

  constructor(props: any) {
    super(props);

    this.state = {
      hovered: !!this.props.hovered,
      pressed: !!this.props.pressed,
      idle: !!this.props.idle,
      className: this.getClasses()
    };

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  render() {
    const { onClick, disabled, children, loader, type } = this.props;
    return (
      <button className={this.state.className} onClick={disabled || loader ? noop : onClick} disabled={disabled} type={type} onMouseUp={this.onMouseUp} onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
        {loader ? (<i className="fa fa-spinner fa-spin"></i>) : (children ? children : <span>Button</span>)}
      </button>
    );
  }
}

export { ButtonSmall, ButtonCancel, ButtonClose };
export default Button;
