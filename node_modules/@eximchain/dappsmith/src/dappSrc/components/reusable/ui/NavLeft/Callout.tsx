import * as  React from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';
const CalloutStyles = {
    content: 'content',
    wrapper: 'wrapper',
  }
  export function prefix(baseClass: any, style: string) {
    return baseClass + (style ? "-" + style : "");
  }
  export type CalloutPlacementOptions = "left" | "middle" | "right";
import './Callout.css';

export interface Props {
  /**
   * string, placement of callout
   * options include:  "left" | "middle" | "right"
   * @default middle
   **/
  placement: CalloutPlacementOptions
  /**
   * string, id to assign the tooltip
   **/
  id?: string;
  /**
   * string, callout content
   **/
  calloutContent?: any;
  /**
     * string, custom class prefix for css
     * @default callout
     **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

export interface State {
  visible: boolean
}

export class Callout extends React.Component<Props, State> {

  static defaultProps = {
    customClass: 'callout',
    placement: 'middle'
  }

  constructor(props: any) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  show = () => this.setVisibility(true);

  hide = () => this.setVisibility(false);

  setVisibility = (visible: any) => {
    this.setState(Object.assign({}, this.state, {
      visible,
    }));
  }

  handleTouch = () => {
    this.show();
    this.assignOutsideTouchHandler();
  }

  assignOutsideTouchHandler = () => {
    const handler = (e: any) => {
      let currentNode = e.target;
      const componentNode = findDOMNode(this.refs.instance);
      while (currentNode.parentNode) {
        if (currentNode === componentNode) return;
        currentNode = currentNode.parentNode;
      }
      if (currentNode !== document) return;
      this.hide();
      document.removeEventListener('touchstart', handler);
    }
    document.addEventListener('touchstart', handler);
  }

  render() {
    const { show, hide, handleTouch, state} = this;
    const { calloutContent, children, customClass, placement, className } = this.props;
    const wrapperClasses = classnames(prefix(customClass, CalloutStyles.wrapper), className);
    const calloutClasses = classnames(customClass, prefix(customClass, placement));
    const calloutContentClasses = prefix(customClass, CalloutStyles.content);
    return (
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        onTouchStart={handleTouch}
        ref="wrapper"
        className={wrapperClasses}
      >
        {children}
        {
          state.visible &&
          <div className={calloutClasses} ref="callout" >
            <div className={calloutContentClasses} ref="content">{calloutContent}</div>
          </div>
        }
      </div>
    )
  }
}

export default Callout;