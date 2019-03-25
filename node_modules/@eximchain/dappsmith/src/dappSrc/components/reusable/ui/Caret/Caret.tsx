import * as React from "react";

export interface CaretProps {
  /**
   * String, caret direction option
   * options include: 'up' | 'right' | 'down' | 'left'
   **/
  direction?: "up" | "right" | "down" | "left";
}

const Caret: React.SFC<CaretProps> = props => {
  const { direction } = props;
  let path;
  switch (direction) {
    case "up":
      path = "M0 0 L12 12 L24 0";
      break;
    case "right":
      path = "M24 0 L12 12 L24 24";
      break;
    case "down":
      path = "M0 24 L12 12 L24 24";
      break;
    case "left":
      path = "M0 0 L12 12 L0 24";
      break;
    default:
  }

  return (
    <svg width="24" height="24">
      <path d={path} />
    </svg>
  );
};

Caret.displayName = "Caret";

export default Caret;
