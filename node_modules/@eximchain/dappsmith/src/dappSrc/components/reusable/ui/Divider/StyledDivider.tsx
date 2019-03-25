import styled from "styled-components";

const StyledDivider = styled.hr`
  &.divider.primary {
    display: block;
    border-top: var(--border-width) solid var(--color-neutral-7, #b7bec6);
    margin: 0;
    border-bottom: 0;
    border-left: 0;
    width: 100%;
  }
  &.divider.secondary {
    display: block;
    border-top: var(--border-width) solid var(--color-neutral-4, #e3e5e8);
    margin: 0;
    border-bottom: 0;
    border-left: 0;
    width: 100%;
  }
`;

export default StyledDivider;
