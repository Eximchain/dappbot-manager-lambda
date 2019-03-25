import * as React from 'react';
import classnames from 'classnames';
import Label from './Label';
import Icon from './Icon';
import './Address.css';
export type AddressIconOptions =
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

export interface Props {
  /**
   * func, Event --> called on address click
   **/
  onClick?: (e: any, data: any) => void;
  /**
   * string, title text
   **/
  title?: string;
  /**
   * string, lable text
   **/
  label?: string;
  /**
   * String, icon to show
   * options include: 'add' | 'blockmaker' |'chevronLeft' |'close' | 'cycle' |'demotion' |'filte' |'governanceCycle' |'help' |'home' |'listView' |'media' |'members' |'more' |'node' |'notificationBell' |'promotion' |'remove' |'search' |'settings' |'upload' |'user' |'vote' |'arrowDown'
   **/
  icon?: AddressIconOptions;
  /**
   * string, custom class prefix for css
   * @default address
   **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

export const Address: React.SFC<Props> = (props) => {
  let { onClick, title, label, icon, customClass, className } = props;
  let data = {
    title: title,
    label: label
  }
  let classes = classnames(className, customClass);
  return (
    <div className={classes} onClick={(e: any) => { onClick && onClick(e, data) }}>
      <p>
        {icon ? <Icon for={icon}/> : null}
        {title}
      </p>
      <div className="text-left">
        <Label color="lightNeutral">{label}</Label>
      </div>
    </div>
  )
}

Address.defaultProps = {
  customClass: 'address',
  icon: 'blockmaker'
}

export default Address;
