import * as React from 'react';
import classNames from 'classnames'
import NavItem from './NavItem';
import './Nav.css';

export interface Props {
  /**
   * func, Event --> called nav item selected
   **/
  onSelect?: (e: any, k: any) => void;
  /**
   * boolean, disable nav links.
   * @default false
   **/
  disabled?: boolean,
  /**
   * string, show link with particular key selected
   **/
  selectedKey?: number,
  children?: any;
  /**
   * string, custom class prefix for css
   * @default nav
   **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

interface State {
  selectedKey: any;
}

export class Nav extends React.Component<Props, State>  {

  static defaultProps = {
    customClass: 'nav',
    disabled: false
  }

  constructor(props: any) {
    super(props);
    let key = this.props.selectedKey ? this.props.selectedKey : null;
    this.state = {
      selectedKey: key
    };
  }

  onSelect(event: any, key: any) {
    this.setState({
      selectedKey: key
    });
    if (this.props.onSelect)
      this.props.onSelect(event, key);
  }

  getClasses() {
    let { customClass, className } = this.props;
    return classNames(customClass, className);
  }

  getChildren() {
    const { children, customClass } = this.props;
    return React.Children.map(children, (child: any, index: number) => {
      let key = child.key ? child.key : (index + 1);
      const originalOnClick = child.props.onClick;
      child = React.cloneElement(child, {
        customClass: customClass+'-'+'item',
        key: key,
        selected: (this.state.selectedKey == key) ? true : false,
        onClick: (event) => {
          if (!child.props.disabled) {
            this.onSelect(event, key);
            if (originalOnClick) {
              originalOnClick.apply(child, event);
            }
          }
        }
      });
      return child;
    });
  }

  render() {
    const boundChildren = this.getChildren();
    const classes = this.getClasses();
    return (
      <ul className={classes}>{boundChildren}</ul>
    )
  }
}

export { NavItem };
export default Nav;
