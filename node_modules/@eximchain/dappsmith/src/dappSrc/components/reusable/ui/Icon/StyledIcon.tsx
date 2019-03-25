import styled from "styled-components";
//import "./../variable.css";
import "./../font.css";

export const StyledIcon = styled.span`
  &.icon {
    font-family: var(--font-icon, "exim-icon") !important;
    fill: red;
  }
`;

export const StyledIconSVG = styled.svg`
  &.icon {
    fill: var(--color-neutral-12);
  }
`;

export default StyledIcon;
