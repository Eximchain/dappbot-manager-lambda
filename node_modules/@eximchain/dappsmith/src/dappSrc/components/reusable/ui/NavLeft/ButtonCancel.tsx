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
   * boolean, button hover state
   * @default false
   **/
  hovered?: boolean;
  /**
   * string, custom class prefix for css
   * @default btn-cancel
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
  className: string
}

export class ButtonCancel extends React.Component<Props, State>  {

  static defaultProps = {
    disabled: false,
    customClass: 'btn-cancel',
    hovered: false
  }

  getClasses() {
    let { customClass, className } = this.props;
    let styles = {};
    if (this.state) {
      styles[prefix(customClass, ButtonStyles.hovered)] = this.state.hovered;
    }
    this.setState({
      className: classnames(customClass, styles, className)
    });
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

  constructor(props: any) {
    super(props);

    this.state = {
      hovered: !!this.props.hovered,
      className: this.getClasses()
    };

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
  }

  render() {
    const { onClick, disabled, children } = this.props;
    return (
      <button
        className={this.state.className}
        onClick={!disabled ? onClick : noop}
        disabled={disabled}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}>
        {children ? children : <span>Cancel</span>}
      </button>
    );
  }
}

export default ButtonCancel;
