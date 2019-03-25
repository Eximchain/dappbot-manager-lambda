import * as React from 'react';
import classnames from 'classnames';

export enum Icons {
  add= 'add',
  blockmaker= 'blockmaker',
  chevronLeft= 'chevronLeft',
  close= 'close',
  cycle= 'cycle',
  demotion= 'demotion',
  filter= 'filter',
  governanceCycle= 'governanceCycle',
  help= 'help',
  home= 'home',
  listView= 'listView',
  media= 'media',
  members= 'members',
  more= 'more',
  node= 'node',
  notificationBell= 'notificationBell',
  promotion= 'promotion',
  remove= 'remove',
  search= 'search',
  settings= 'settings',
  upload= 'upload',
  user= 'user',
  vote= 'vote',
  arrowDown= 'arrowDown'
}
export type IconOptions =
  | "add"
  | "blockmaker"
  | "chevronLeft"
  | "close"
  | "cycle"
  | "demotion"
  | "filter"
  | "governanceCycle"
  | "help"
  | "home"
  | "listView"
  | "media"
  | "members"
  | "more"
  | "node"
  | "notificationBell"
  | "promotion"
  | "remove"
  | "search"
  | "settings"
  | "upload"
  | "user"
  | "vote"
  | "arrowDown";

  export function prefix(baseClass: any, style: string) {
    return baseClass + (style ? "-" + style : "");
  }
  
export interface Props {
  /**
   * String, icon to show
   * options include: 'add' | 'blockmaker' |'chevronLeft' |'close' | 'cycle' |'demotion' |'filter' |'governanceCycle' |'help' |'home' |'listView' |'media' |'members' |'more' |'node' |'notificationBell' |'promotion' |'remove' |'search' |'settings' |'upload' |'user' |'vote' |'arrowDown'
   **/
  for: IconOptions;
  /**
   * string, custom class prefix for css
   * @default icon
   **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

const getClasses = (props: Props) => {
  let { customClass, className } = props;
  if (Icons[props.for]) {
    return classnames(customClass, prefix(customClass, Icons[props.for]), className)
  } else {
    return classnames(customClass, className)
  }
}

export const Icon: React.SFC<Props> = (props) => {
  let className = getClasses(props);
  return (<span className={className}></span>);
}

Icon.defaultProps = {
  customClass: 'icon'
}

export default Icon;
