import styled from "styled-components";
// import "./../variable.css";

export const StyledLabel = styled.label`
  &.label,
  &.label.large {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 15px;
    text-transform: uppercase;
    font: var(--typography-sh-3, normal 500 13px / normal "Inter UI");
  }

  &.label.large {
    padding: 9px 15px;
    border-radius: var(--border-radius-label-large, 50% / 100%);
  }

  &.label.small {
    padding: 3px 7px;
    border-radius: var(--border-radius-label-small, 6px);
  }

  &.label.filled {
    color: var(--color-neutral-1, #ffffff);
    border: 1px solid var(--color-neutral-12, #2d323b);
    background-color: var(--color-neutral-12, #2d323b);
  }

  &.label.outlined {
    color: var(--color-neutral-12, #2d323b);
    border: 1px solid var(--color-neutral-12, #2d323b);
    background-color: var(--color-neutral-1, #ffffff);
  }
`;

export default StyledLabel;
