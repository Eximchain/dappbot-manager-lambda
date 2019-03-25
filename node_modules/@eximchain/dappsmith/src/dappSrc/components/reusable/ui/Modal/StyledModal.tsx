import styled from "styled-components";

export const StyledModal = styled.div`
  &.container {
    position: fixed;
    display: flex;
    justify-content: center;
    left: 0;
    top: 0;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  & .Backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: zoom-out;
    background-color: var(--darkGray, #333);
    height: 100%;
    opacity: 0.9;
    overflow-y: scroll;
  }

  & .wrapper {
    position: relative;
    display: flex;
    overflow: hidden;
    background-color: var(--white, #ffffff);
    border-radius: var(--border-radius);
    margin-right: calc(var(--bt) * 4);
    margin-left: calc(var(--bt) * 4);
    max-height: calc(100vh - 32px);
    outline: none;
  }
`;

export default StyledModal;
