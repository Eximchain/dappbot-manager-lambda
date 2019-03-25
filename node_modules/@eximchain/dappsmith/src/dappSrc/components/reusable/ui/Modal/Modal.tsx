import * as React from "react";
import Box from "./../Box";
import Button from "./../Button";
import Divider from "./../Divider";
import Icon from "./../Icon";
import Text from "./../Text";
import StopScrollBehavior from "./../utils/StopScrollBehavior";
import TrapFocusBehavior from "./../utils/TrapFocusBehavior";
import OutsideEventBehavior from "./../utils/OutsideEventBehavior";
import StyledModal from "./StyledModal";

export interface ModalProps {
  /**
   * string, String that clients such as VoiceOver will read to describe the close button. Always localize the label.
   **/
  accessibilityCloseLabel: string;
  /**
   * string, String that clients such as VoiceOver will read to describe the modal. Always localize the label.
   **/
  accessibilityModalLabel: string;
  /**
   * React.ReactNode, React node as childeren
   **/
  children?: React.ReactNode;
  /**
   * React.ReactNode, React node as childeren
   **/
  footer?: React.ReactNode;
  /**
   * string, Modal heading title
   **/
  heading: React.ReactNode;
  /**
   * function, Event called when modal dismissed
   **/
  onDismiss: () => void;
  /**
   * string, role
   * options includes : "alertdialog" | "dialog" | "popup"
   * @default "dialog"
   **/
  role?: "alertdialog" | "dialog" | "popup";
  /**
   * string, Ref for the element that the Flyout will attach to
   * options includes :  "sm" | "md" | "lg"
   * @default "sm"
   **/
  size?: "xs" | "sm" | "md" | "lg";
  /**
   * boolean, Show close button only work with role = "popup"
   * @default false
   **/
  showCloseButton?: boolean;
}

const SIZE_WIDTH_MAP = {
  xs: 314,
  sm: 414,
  md: 544,
  lg: 804
};

const ESCAPE_KEY_CODE = 27;

const Backdrop = ({ children }: { children?: React.ReactNode }) => (
  <React.Fragment>
    <div className="Backdrop" />
    {children}
  </React.Fragment>
);

export default class Modal extends React.Component<ModalProps> {
  componentDidMount() {
    window.addEventListener("keyup", this.handleKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  handleOutsideClick = () => {
    this.props.onDismiss();
  };

  handleCloseClick = () => {
    this.props.onDismiss();
  };

  handleKeyUp = (event: { keyCode: number }) => {
    if (event.keyCode === ESCAPE_KEY_CODE) {
      this.props.onDismiss();
    }
  };

  renderHeader = () => {
    const { heading, role, showCloseButton } = this.props;
    const justifyContent = role === "popup" ? "center" : "start";
    if (role === "dialog" || (role === "popup" && showCloseButton)) {
      return (
        <Box display="flex" justifyContent="center" paddingY={6} paddingX={12}>
          <Text bold>{heading}</Text>
        </Box>
      );
    } else {
      return (
        <Box display="flex" padding={6} justifyContent={justifyContent}>
          <Text bold>{heading}</Text>
        </Box>
      );
    }
  };

  renderCloseButton = () => {
    let { accessibilityCloseLabel, role, showCloseButton } = this.props;
    if (role === "dialog" || (role === "popup" && showCloseButton)) {
      return (
        <Box padding={3} position="absolute" top right>
          <Button
            accessibilityLabel={accessibilityCloseLabel}
            className="close"
            onClick={this.handleCloseClick}
          >
            <Icon icon="close" />
          </Button>
        </Box>
      );
    }
    return null;
  };

  render() {
    const {
      accessibilityModalLabel,
      children,
      footer,
      role = "dialog",
      size = "sm"
    } = this.props;

    const width = SIZE_WIDTH_MAP[size];

    return (
      <StopScrollBehavior>
        <TrapFocusBehavior>
          <StyledModal
            aria-label={accessibilityModalLabel}
            className="container"
            role={role}
          >
            <Backdrop>
              <OutsideEventBehavior onClick={this.handleOutsideClick}>
                <div className="wrapper" tabIndex={-1} style={{ width }}>
                  <Box
                    flex="grow"
                    direction="column"
                    display="flex"
                    position="relative"
                    width="100%"
                  >
                    <Box fit>
                      {this.renderHeader()}
                      {this.renderCloseButton()}
                      {role === "dialog" && <Divider type="secondary" />}
                    </Box>
                    <Box
                      flex="grow"
                      overflow="auto"
                      position="relative"
                      paddingX={6}
                      paddingY={3}
                    >
                      <Text>{children}</Text>
                    </Box>
                    <Box fit>
                      {footer && (
                        <Box>
                          {role === "dialog" && <Divider type="secondary" />}
                          <Box padding={6}>
                            <Text>{footer}</Text>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </div>
              </OutsideEventBehavior>
            </Backdrop>
          </StyledModal>
        </TrapFocusBehavior>
      </StopScrollBehavior>
    );
  }
}
