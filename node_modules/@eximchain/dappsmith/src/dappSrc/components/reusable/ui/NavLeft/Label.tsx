import * as React from 'react';
import classnames from 'classnames';
import './Label.css';

export type LabelSizeOptions = "big" | "small";

export const LabelColors= {
  green: 'green',
  purple: 'purple',
  yellow: 'yellow',
  blue: 'blue',
  red: 'red',
  darkNeutral: 'darkneutral',
  lightNeutral: 'lightneutral',
}
export type LabelColorOptions =
  | "green"
  | "purple"
  | "yellow"
  | "blue"
  | "red"
  | "darkNeutral"
  | "lightNeutral";

  export type LabelStatusOptions = "sent" | "pending" | "received";


export const LabelSize = {
  big : 'big',
  small: 'small'
}

export const LabelStatus = {
  sent : 'sent',
  pending: 'pending',
  received: 'received'
}
export function prefix(baseClass: any, style: string) {
  return baseClass + (style ? "-" + style : "");
}

export interface Props {
  /**
   * string, color of label
   * options include: "green" | "purple" | "yellow" | "blue" | "red" | "darkNeutral" | "lightNeutral"
   **/
  color?: LabelColorOptions

  /**
   * string, label for status
   * options includes : "sent" | "pending" | "received"
   * @default false
   **/
  status?: LabelStatusOptions;
  /**
   * string, size of label
   * options include: "big" | "small"
   * @default small
   **/
  size?: LabelSizeOptions;
  /**
   * boolean, outline label
   * @default false
   **/
  outline?: boolean;
  /**
   * string, custom class prefix for css
   * @default label
   **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

const getClasses = (props: Props) => {
  let { customClass, size, className, color, status, outline } = props;
  let styles = {}
  if (status && LabelStatus[status]) {
    styles[prefix(customClass, LabelStatus[status])] = true;
    return classnames(customClass, styles, className)
  }
  styles[prefix(customClass, 'outline')] = outline
  if (size && LabelSize[size])
    styles[prefix(customClass, LabelSize[size])] = true
  if (color && LabelColors[color])
    styles[prefix(customClass, LabelColors[color])] = true
  return classnames(customClass, styles, className)
}

export const Label: React.SFC<Props> = (props) => {
  const { children } = props;
  const classes = getClasses(props);
  return (
    <label className={classes}>
      {children ? children : <span></span>}
    </label>
  );
}

Label.defaultProps = {
  outline: false,
  size: 'small',
  customClass: 'label'
}

export default Label;
