import styled from "styled-components";

export const StyledBase = styled.div`
  /*** Base class ***/
  &.base {
    box-sizing: border-box;
    background: var(--color-neutral-1, #ffffff);
    border: 1px solid var(--color-neutral-5, #cfd2d7);
    padding: 6px;
  }
  /*** Modal ***/
  &.base.modal {
    border: none;
    border-radius: var(--border-radius-base-modal, 12px);
    box-shadow: var(--elevation-3, 0px 2px 28px rgba(43, 51, 63, 0.18));
  }
  /*** Pill ***/
  &.base.pill {
    border: 1px solid var(--color-neutral-5, #cfd2d7);
    border-radius: var(--border-radius-base-pill, 999px);
  }
  /*** Standard ***/
  &.base.standard {
    border: 1px solid var(--color-neutral-5, #cfd2d7);
    border-radius: var(--border-radius-base-standard, 6px);
  }
  /*** Tooltip ***/
  &.base.tooltip {
    border: none;
    background: var(--var-neutral-12, #2d323b);
    border-radius: var(--border-radius-base-tooltip, 8px);
    box-shadow: var(--elevation-3, 0px 2px 28px rgba(43, 51, 63, 0.18));
  }
`;

export default StyledBase;
