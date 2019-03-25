import * as React from "react";
import NavItem from "./NavItem";
import { StyledNav } from "./StyledNav";

export interface Props {
  /**
   * func, Event --> called nav item selected
   **/
  onSelect?: (e: any, k: any) => void;
  /**
   * boolean, disable nav links.
   * @default false
   **/
  disabled?: boolean;
  /**
   * string, show link with particular key selected
   **/
  selectedKey?: number;
  children?: any;
}

interface State {
  selectedKey: any;
}

export class Nav extends React.Component<Props, State> {
  static defaultProps = {
    customClass: "nav",
    disabled: false
  };

  constructor(props: any) {
    super(props);
    let key =
      this.props.selectedKey != undefined ? this.props.selectedKey : undefined;
    this.state = {
      selectedKey: key
    };
  }

  onSelect(event: any, key: any) {
    this.setState({
      selectedKey: key
    });
    if (this.props.onSelect) this.props.onSelect(event, key);
  }

  getChildren() {
    const { children } = this.props;
    return React.Children.map(children, (child: any, index: number) => {
      let key = child.key != undefined ? child.key : index + 1;
      const originalOnClick = child.props.onClick;
      child = React.cloneElement(child, {
        key: key,
        selected: this.state.selectedKey == key ? true : false,
        onClick: event => {
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
    return <StyledNav>{boundChildren}</StyledNav>;
  }
}

export { NavItem };
export default Nav;
