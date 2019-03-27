import styled from "styled-components";
import { breakpoints } from "./../globalStyles";
export const StyledText = styled.div`
  &.Text {
    --font-size-1: 12px;
    --font-size-2: 14px;
    --font-size-3: 16px;
    --font-size-4: 18px;
    --font-size-5: 21px;
    font-family: 'DINRoundPro';
  }

  &.inline {
    display: inline-block;
  }

  &.capitalize {
    text-transform: capitalize;
  }

  &.capitalize {
    text-transform: capitalize;
  }

  &.uppercase {
    text-transform: uppercase;
  }

  &.lowercase {
    text-transform: lowercase;
  }

  &.fontSize1 {
    font-size: var(--font-size-1);
  }

  &.fontSize2 {
    font-size: var(--font-size-2);
  }

  &.fontSize3 {
    font-size: var(--font-size-3);
  }

  &.fontSize4 {
    font-size: var(--font-size-4);
  }

  &.fontSize5 {
    font-size: var(--font-size-5);
  }

  @media (${breakpoints.sm}) {
    &.smFontSize1 {
      font-size: var(--font-size-1);
    }

    &.smFontSize2 {
      font-size: var(--font-size-2);
    }

    &.smFontSize3 {
      font-size: var(--font-size-3);
    }

    &.smFontSize4 {
      font-size: var(--font-size-4);
    }

    &.smFontSize5 {
      font-size: var(--font-size-5);
    }
  }

  @media (${breakpoints.md}) {
    &.mdFontSize1 {
      font-size: var(--font-size-1);
    }

    &.mdFontSize2 {
      font-size: var(--font-size-2);
    }

    &.mdFontSize3 {
      font-size: var(--font-size-3);
    }

    &.mdFontSize4 {
      font-size: var(--font-size-4);
    }

    &.mdFontSize5 {
      font-size: var(--font-size-5);
    }
  }

  @media (${breakpoints.lg}) {
    &.lgFontSize1 {
      font-size: var(--font-size-1);
    }

    &.lgFontSize2 {
      font-size: var(--font-size-2);
    }

    &.lgFontSize3 {
      font-size: var(--font-size-3);
    }

    &.lgFontSize4 {
      font-size: var(--font-size-4);
    }

    &.lgFontSize5 {
      font-size: var(--font-size-5);
    }
  }
`;
export default StyledText;
