import styled from "styled-components";

export const StyledNav = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;

export const StyledNavItem = styled.li`
  margin: 5px 0;
  display: block;
  cursor: pointer;
  padding: 5px 0;

  &:hover,
  &.selected {
    color: #0667d0;
  }

  &.disabled {
    cursor: not-allowed;
    color: #626b76 !important;
  }
`;
