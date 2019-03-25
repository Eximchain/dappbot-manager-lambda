import * as React from 'react';
import classnames from 'classnames';
import './Button.css';
import Icon from './Icon';

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
   * boolean, button pressed state
   * @default false
   **/
  pressed?: boolean;
  /**
    * string, custom class prefix for css
    * @default btn-close
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
  pressed: boolean
  className: string
}

export class ButtonClose extends React.Component<Props, State>  {

  static defaultProps = {
    disabled: false,
    customClass: 'btn-close',
    hovered: false,
    pressed: false
  }

  getClasses() {
    let { customClass, className } = this.props;

    let styles = {};

    if (this.state) {
      let { hovered, pressed } = this.state;
      styles[prefix(customClass, ButtonStyles.hovered)] = hovered;
      styles[prefix(customClass, ButtonStyles.pressed)] = pressed;
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
      className: this.getClasses()
    };

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  render() {
    const { onClick, disabled } = this.props;
    return (
      <button className={this.state.className} onClick={!disabled ? onClick : noop}
        disabled={disabled}
        onMouseUp={this.onMouseUp}
        onMouseDown={this.onMouseDown}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}>
        <Icon for="close" />
      </button>
    );
  }
}

export default ButtonClose;
