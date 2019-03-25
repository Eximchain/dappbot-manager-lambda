import * as React from 'react';
import classnames from 'classnames';
import './Typography.css';

export const TypographyClasses = {
  'subtitle': 'subtitle',
  'subtitleSmall': 'subtitle-small',
  'content': 'content',
  'contentSmall': 'content-small',
  'caption': 'caption',
  'button': 'button-text',
  'buttonSmall': 'button-small',
  'plexMonoReg': 'plex-mono-reg',
  'plexMonoMed': 'plex-mono-med'
}
 type TypographyOptions =
  | "subtitle"
  | "subtitleSmall"
  | "content"
  | "contentSmall"
  | "caption"
  | "button"
  | "buttonSmall"
  | "plexMonoReg"
  | "plexMonoMed";

export interface Props {
  /**
   * string, Use to show diffrent Typography
   * options include : 'subtitle' | 'subtitle-small' | 'content' | 'contentSmall' | 'caption' | 'button' | 'buttonSmall' | 'plexMonoReg' | 'plexMonoMed';
   **/
  useFor?: TypographyOptions;

  /*** boolean, h1 tag ***/
  h1?: boolean;

  /*** boolean, h2 tag ***/
  h2?: boolean;

  /*** boolean, h3 tag ***/
  h3?: boolean;

  /*** boolean, h4 tag ***/
  h4?: boolean;

  /*** boolean, h5 tag ***/
  h5?: boolean;

  /*** boolean, h6 tag ***/
  h6?: boolean;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

const getClasses = (props: Props) => {
  let { useFor, className } = props;
  return classnames((useFor && TypographyClasses[useFor]), className)
}

export const Typography: React.SFC<Props> = (props) => {
  const { children, h1, h2, h3, h4, h5, h6 } = props;
  const className = getClasses(props)
  if (h1)
    return <h1>{children}</h1>
  if (h2)
    return <h2>{children}</h2>
  if (h3)
    return <h3>{children}</h3>
  if (h4)
    return <h4>{children}</h4>
  if (h5)
    return <h5>{children}</h5>
  if (h6)
    return <h6>{children}</h6>

  return (
    children ? <p className={className}>{children}</p> : null
  );
}

export default Typography;
