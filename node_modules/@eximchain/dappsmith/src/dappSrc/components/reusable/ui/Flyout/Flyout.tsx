import * as React from "react";
import Controller from "./../Controller";

export interface FlyoutProps {
  /**
   * HTMLElement, Ref for the element that the Flyout will attach to
   **/
  anchor: HTMLElement;
  /**
   * React.ReactNode, React node as childeren
   **/
  children?: React.ReactNode;
  /**
   * String, Preferred direction for the Flyout to open
   * Options includes : "up" | "right" | "down" | "left"
   **/
  idealDirection?: "up" | "right" | "down" | "left";
  /**
   * function, Event called when flyout dismissed
   **/
  onDismiss: () => void;
  /**
   * boolean, Depicts if the Flyout shares a relative root with the anchor element
   * @default true
   **/
  positionRelativeToAnchor?: boolean;
  /**
   * boolean, The background color of the Flyout: orange matches other baked-in error flyouts
   * @default white
   **/
  color?: "blue" | "orange" | "white" | "darkGray";
  /**
   * boolean, Focus on the flyout when opened
   * @default true
   **/
  shouldFocus?: boolean;
  /**
   * string | number, Size of flyout xs: 185px, sm: 230px, md: 284px, lg: 320px, xl:375px
   * @default sm
   **/
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
}

export const Flyout: React.SFC<FlyoutProps> = props => {
  const {
    anchor,
    children,
    idealDirection,
    onDismiss,
    positionRelativeToAnchor = true,
    color = "white",
    shouldFocus = true,
    size
  } = props;

  if (!anchor) {
    return null;
  }

  return (
    <Controller
      anchor={anchor}
      bgColor={color}
      idealDirection={idealDirection}
      onDismiss={onDismiss}
      positionRelativeToAnchor={positionRelativeToAnchor}
      shouldFocus={shouldFocus}
      size={size}
    >
      {children}
    </Controller>
  );
};

Flyout.defaultProps = {
  color: "white",
  positionRelativeToAnchor: true,
  shouldFocus: true,
  size: "sm"
};

Flyout.displayName = "Flyout";

export default Flyout;
