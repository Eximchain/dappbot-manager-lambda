import * as React from "react";
import Contents from "./../Contents";
import OutsideEventBehavior from "./../utils/OutsideEventBehavior";

export interface ControllerProps {
  anchor: HTMLElement | null;
  bgColor: "blue" | "darkGray" | "orange" | "white";
  children?: React.ReactNode;
  idealDirection?: "up" | "right" | "down" | "left";
  onDismiss: () => void;
  positionRelativeToAnchor: boolean;
  shouldFocus?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
}

const SIZE_WIDTH_MAP = {
  xs: 185,
  sm: 230,
  md: 284,
  lg: 320,
  xl: 375
};

const ESCAPE_KEY_CODE = 27;

type ClientRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

export interface ControllerStates {
  relativeOffset: {
    x: number;
    y: number;
  };
  triggerBoundingRect: ClientRect;
}

export default class Controller extends React.Component<ControllerProps, any> {
  state: ControllerStates = {
    relativeOffset: {
      x: 0,
      y: 0
    },
    triggerBoundingRect: {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0
    }
  };

  componentDidMount() {
    this.updateTriggerRect(this.props);
  }

  componentWillReceiveProps(nextProps: ControllerProps) {
    this.updateTriggerRect(nextProps);
  }

  handleKeyDown = (event: { keyCode: number }) => {
    if (event.keyCode === ESCAPE_KEY_CODE) {
      this.props.onDismiss();
    }
  };

  handlePageClick = (event: Event) => {
    if (
      event.target instanceof Node &&
      this.props.anchor &&
      !this.props.anchor.contains(event.target)
    ) {
      this.props.onDismiss();
    }
  };

  handleResize = () => {
    this.updateTriggerRect(this.props);
  };

  updateTriggerRect = (props: ControllerProps) => {
    const { anchor, positionRelativeToAnchor } = props;
    let triggerBoundingRect;
    let relativeOffset;
    if (anchor) {
      triggerBoundingRect = anchor.getBoundingClientRect();

      // Needed for correct positioning within Contents.js
      relativeOffset = {
        x: positionRelativeToAnchor
          ? triggerBoundingRect.left - anchor.offsetLeft
          : 0,
        y: positionRelativeToAnchor
          ? triggerBoundingRect.top - anchor.offsetTop
          : 0
      };
    }

    this.setState({
      relativeOffset: relativeOffset,
      triggerBoundingRect: triggerBoundingRect
    });
  };

  render() {
    const {
      anchor,
      bgColor,
      children,
      idealDirection,
      positionRelativeToAnchor,
      shouldFocus
    } = this.props;
    if (!anchor) {
      return null;
    }
    const size = this.props.size ? this.props.size : "sm";
    const width = typeof size === "string" ? SIZE_WIDTH_MAP[size] : size;
    return (
      <OutsideEventBehavior onClick={this.handlePageClick}>
        <Contents
          bgColor={bgColor}
          idealDirection={idealDirection}
          onKeyDown={this.handleKeyDown}
          onResize={this.handleResize}
          positionRelativeToAnchor={positionRelativeToAnchor}
          relativeOffset={this.state.relativeOffset}
          shouldFocus={shouldFocus}
          triggerRect={this.state.triggerBoundingRect}
          width={width}
        >
          {children}
        </Contents>
      </OutsideEventBehavior>
    );
  }
}
