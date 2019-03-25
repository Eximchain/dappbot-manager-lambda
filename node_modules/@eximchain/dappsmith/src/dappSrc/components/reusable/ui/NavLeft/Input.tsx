import * as React from "react";
import classnames from "classnames";
import "./Input.css";

export type InputTypeOptions =
  | "text"
  | "password"
  | "number"
  | "email"
  | "select"
  | "textarea";
  
export interface Props {
  /**
   * func, Event --> called on onChange
   **/
  onChange?: (
    e?:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  /**
   * string, input value
   **/
  value?: string;
  /**
   * string, name attribute
   **/
  name?: string;
  /**
   * string, define input type
   * options includes - "text" | "password" | "number" | "email" | "select"
   * @default text
   **/
  type: InputTypeOptions;
  /**
   * Attaches a ref to the `<input>` element.
   *
   * ```js
   *  <Input inputRef={this.ref} />
   * ```
   */
  inputRef?: React.RefObject<any>;

  /**
   * string, placehoder for input
   **/
  placeholder?: string;
  /**
   * boolean, Disables input
   * @default false
   **/
  disabled?: boolean;
  /**
   * string, custom class prefix for css
   * @default form-control
   **/
  customClass?: string;
  /**
   * string, class to apply on component
   **/
  className?: string;
}

export class Input extends React.Component<Props> {
  static defaultProps = {
    customClass: "form-control",
    disabled: false,
    type: "text"
  };

  render() {
    let {
      type,
      inputRef,
      customClass,
      placeholder,
      children,
      disabled,
      value,
      className,
      onChange,
      name
    } = this.props;
    let classes = classnames(customClass, className);
    if (type == "select") {
      return (
        <div className="select_wrap">
          <select
            className={classes}
            ref={inputRef}
            placeholder={placeholder}
            disabled={disabled}
          >
            {children ? children : null}
          </select>
        </div>
      );
    } else if ((type == "textarea")) {
      return (
        <textarea
          name={name}
          value={value}
          className={classes}
          disabled={disabled}
          placeholder={placeholder}
          ref={inputRef}
          onChange={onChange}
        />
      );
    } else {
      return (
        <input
          type={type}
          name={name}
          value={value}
          className={classes}
          disabled={disabled}
          placeholder={placeholder}
          ref={inputRef}
          onChange={onChange}
        />
      );
    }
  }
}

export default Input;
