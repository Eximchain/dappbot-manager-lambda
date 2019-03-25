import styled from "styled-components";
//import "./../variable.css";

export const StyledButton = styled.button`
  /***** Basic button styles *****/

  &.btn {
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
    box-shadow: none;
    font: var(
      --typography-btn-large-primary,
      normal 500 17px / normal "Inter UI"
    );
    display: inline-block;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    padding: 10px 14px;
  }

  &.btn.block {
    width: 100%;
  }

  &.btn:focus {
    outline: none;
    box-shadow: none;
  }

  /***** Button - disabled *****/

  &.btn:disabled,
  &.btn[disabled] {
    cursor: not-allowed;
    box-shadow: none !important;
    color: var(--color-neutral-8, #9ca3ae) !important;
    background-color: var(--color-neutral-3, #f0f2f4) !important;
    border-color: var(--color-neutral-3, #f0f2f4) !important;
  }

  /***** styleOption - standard & pill  *****/

  &.btn.standard,
  &.btn.pill {
    color: var(--color-neutral-1, #ffffff);
    background-color: var(--color-blue-7, #267edc);
    border-color: var(--color-blue-7, #267edc);
  }

  &.btn.standard,
  &.btn.standard:focus::after {
    border-radius: var(--border-radius-btn, 6px);
  }

  &.btn.pill,
  &.btn.pill:focus::after {
    border-radius: var(--border-radius-btn-pill, 50% 100%);
  }

  &.standard:hover,
  &.pill:hover {
    box-shadow: var(--elevation-1, 0px 1px 8px rgba(43, 51, 63, 0.2));
  }

  &.btn.standard:focus::after,
  &.btn.pill:focus::after {
    position: absolute;
    content: "";
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    left: 2px;
    top: 2px;
    border: 1px solid var(--color-neutral-1, #ffffff);
  }

  /***** styleOption - quiet & quietSecondary  *****/

  &.btn.quiet,
  &.btn.quietSecondary {
    border: none !important;
    background-color: transparent !important;
  }

  &.btn.quietSecondary {
    font: var(
      --typography-btn-large-secondnary,
      normal normal 17px / normal "Inter UI"
    );
  }

  /***** styleOption - completed  *****/

  &.btn.complete,
  &.btn.complete:hover,
  &.btn.complete:active {
    color: var(--color-neutral-10, #686f78) !important;
    background-color: var(--color-neutral-3, #f0f2f4) !important;
    border: none !important;
    border-radius: var(--border-radius-btn, 6px) !important;
    box-shadow: none !important;
    font: var(
      --typography-btn-large-primary,
      normal 500 17px / normal "Inter UI"
    ) !important;
  }

  /***** size - small  *****/

  &.btn.small {
    font: var(
      --typography-btn-small-primary,
      normal 500 15px / normal "Inter UI"
    );
  }

  &.btn.quietSecondary.small {
    font: var(
      --typography-btn-small-secondnary,
      normal normal 15px / normal "Inter UI"
    );
  }

  /***** theme - cta  *****/

  &.btn.cta {
    color: var(--color-neutral-1, #ffffff);
    background-color: var(--color-blue-7, #267edc);
    border-color: var(--color-blue-7, #267edc);
  }

  &.btn.cta:hover {
    background-color: var(--color-blue-6, #529bea);
    border-color: var(--color-blue-6, #529bea);
  }

  /* &.btn.cta:not(.complete):active {
    background-color: var(--color-blue-8, #256fc7) !important;
    border-color: var(--color-blue-8, #256fc7) !important;
  } */

  &.btn.cta:not(.close):active {
    background-color: var(--color-blue-8, #256fc7) !important;
    border-color: var(--color-blue-8, #256fc7) !important;
  }

  &.btn.btn.cta:focus::after {
    border-color: var(--color-neutral-1, #ffffff);
  }

  /***** theme - white  *****/

  &.btn.white {
    color: var(--color-blue-7, #267edc);
    background-color: var(--color-neutral-1, #ffffff);
    border-color: var(--color-blue-7, #267edc);
  }

  &.btn.white:hover {
    color: var(--color-blue-6, #529bea);
    background-color: var(--color-blue-1, #f0f6fd);
    border-color: var(--color-blue-6, #529bea);
  }

  &.white:active {
    color: var(--color-blue-8, #256fc7);
    background-color: var(--color-neutral-1, #ffffff);
    border-color: var(--color-blue-8, #256fc7);
  }

  &.btn.white:focus::after {
    border-color: var(--color-blue-7, #267edc);
  }

  /***** theme - destructive  *****/

  &.btn.destructive {
    color: var(--color-neutral-1, #ffffff);
    background-color: var(--color-red-8, #cc4149);
    border-color: var(--color-red-8, #cc4149);
  }

  &.btn.destructive:hover {
    background-color: var(--color-red-7, #e2535d);
    border-color: var(--color-red-7, #e2535d);
  }

  &.btn.destructive:active {
    background-color: var(--color-red-9, #bd242d);
    border-color: var(--color-red-9, #bd242d);
  }

  &.btn.destructive:focus::after {
    border-color: var(--color-neutral-1, #ffffff);
  }

  /***** theme - destructive & styleOption - quiet | quietSecondary *****/

  &.btn.destructive.quiet,
  &.btn.destructive.quietSecondary {
    color: var(--color-red-8, #cc4149);
  }

  &.btn.destructive.quiet:hover,
  &.btn.destructive.quietSecondary:hover {
    color: var(--color-red-7, #e2535d);
  }

  &.btn.destructive.quiet:active,
  &.btn.destructive.quietSecondary:active {
    color: var(--color-red-9, #bd242d);
  }

  &.btn.destructive.quiet:focus,
  &.btn.destructive.quietSecondary:focus {
    border-radius: var(--border-radius-btn, 6px) !important;
    border: 1px solid var(--color-red-3, #ffd4d4) !important;
  }

  /***** theme - outlineBlue  *****/

  &.btn.outlineBlue {
    color: var(--color-blue-7, #267edc);
    background-color: var(--color-neutral-1, #ffffff);
    border-color: var(--color-blue-7, #267edc);
  }

  &.btn.outlineBlue:hover {
    background-color: var(--color-blue-1, #f0f6fd);
    border-color: var(--color-blue-6, #529bea);
  }

  &.btn.outlineBlue:active {
    color: var(--color-blue-8, #256fc7);
    background-color: var(--color-neutral-1, #ffffff);
    border-color: var(--color-blue-8, #256fc7);
  }

  &.btn.outlineBlue:focus:after,
  &.btn.outlineBlue:focus:after {
    border-color: var(--color-blue-7, #267edc);
  }

  /***** theme - outlineBlue & styleOption - quiet | quietSecondary *****/

  &.btn.outlineBlue.quiet,
  &.btn.outlineBlue.quietSecondary {
    color: var(--color-blue-7, #267edc);
  }

  &.btn.outlineBlue.quiet:hover,
  &.btn.outlineBlue.quietSecondary:hover {
    color: var(--color-blue-6, #529bea);
  }

  &.btn.outlineBlue.quiet:active,
  &.btn.outlineBlue.quietSecondary:active {
    color: var(--color-blue-8, #256fc7);
  }

  &.btn.outlineBlue.quiet:focus,
  &.btn.outlineBlue.quietSecondary:focus {
    border-radius: var(--border-radius-btn, 6px) !important;
    border: 1px solid var(--color-blue-3, #cfe6ff) !important;
  }

  /***** theme - outlineWhite  *****/

  &.btn.outlineWhite {
    color: var(--color-neutral-1, #ffffff);
    background-color: var(--color-neutral-12, #2d323b);
    border-color: var(--color-neutral-1, #ffffff);
  }

  &.btn.outlineWhite:disabled,
  &.btn.outlineWhite[disabled] {
    color: var(--color-opacity-1, rgba(255, 255, 255, 0.4)) !important;
    background-color: var(--color-neutral-12, #2d323b) !important;
    border-color: var(--color-opacity-1, rgba(255, 255, 255, 0.4)) !important;
  }

  &.btn.outlineWhite:hover {
    background-color: var(--color-opacity-1, rgba(255, 255, 255, 0.4));
    border-color: var(--color-neutral-1, #ffffff);
    box-shadow: none;
  }

  &.btn.outlineWhite:active {
    color: var(--color-blue-1, #f0f6fd);
    background-color: var(--color-neutral-12, #2d323b);
    border-color: var(--color-blue-1, #f0f6fd);
  }

  &.btn.outlineWhite:focus:after,
  &.btn.outlineWhite:focus:after {
    border-color: var(--color-neutral-1, #ffffff);
  }

  /***** theme - outlineWhite & styleOption - quiet | quietSecondary *****/

  &.btn.outlineWhite.quiet,
  &.btn.outlineWhite.quietSecondary {
    color: var(--color-neutral-1, #ffffff);
  }

  &.btn.outlineWhite.quiet:hover,
  &.btn.outlineWhite.quietSecondary:hover {
    color: var(--color-blue-2, #e8f2fe);
    box-shadow: none;
  }

  &.btn.outlineWhite.quiet:active,
  &.btn.outlineWhite.quietSecondary:active {
    color: var(--color-blue-3, #cfe6ff);
  }

  &.btn.outlineWhite.quiet:focus,
  &.btn.outlineWhite.quietSecondary:focus {
    border-radius: var(--border-radius-btn, 6px) !important;
    border: 1px solid var(--color-neutral-1, #ffffff) !important;
  }

  /***** theme - outlineNeutral  *****/

  &.btn.outlineNeutral {
    color: var(--color-neutral-12, #2d323b);
    background-color: var(--color-neutral-1, #ffffff);
    border-color: var(--color-neutral-5, #cfd2d7);
  }

  &.btn.outlineNeutral:hover {
    color: var(--color-neutral-11, #525762);
    background-color: var(--color-neutral-2, #f7f8f9);
    border-color: var(--color-neutral-4, #e3e5e8);
  }

  &.btn.outlineNeutral:active {
    color: var(--color-neutral-13, #242a2f);
    background-color: var(--color-neutral-3, #f0f2f4);
    border-color: var(--color-neutral-5, #cfd2d7);
    outline: 0;
  }

  &.btn.outlineNeutral:focus:after,
  &.btn.outlineNeutral:focus:after {
    border-color: var(--color-neutral-5, #cfd2d7);
  }

  /***** theme - outlineNeutral & styleOption - quiet | quietSecondary *****/

  &.btn.outlineNeutral.quiet,
  &.btn.outlineNeutral.quietSecondary {
    color: var(--color-neutral-12, #2d323b);
  }

  &.btn.outlineNeutral.quiet:hover,
  &.btn.outlineNeutral.quietSecondary:hover {
    color: var(--color-neutral-11, #525762);
  }

  &.btn.outlineNeutral.quiet:active,
  &.btn.outlineNeutral.quietSecondary:active {
    color: var(--color-neutral-13, #242a2f);
  }

  &.btn.outlineNeutral.quiet:focus,
  &.btn.outlineNeutral.quietSecondary:focus {
    border-radius: var(--border-radius-btn, 6px) !important;
    border: 1px solid var(--color-neutral-3, #f0f2f4) !important;
  }

  /***** Button disabled - outlineBlue & outlineNeutral  *****/

  &.btn.outlineBlue:disabled,
  &.btn.outlineBlue[disabled],
  &.btn.outlineNeutral:disabled,
  &.btn.outlineNeutral[disabled] {
    border-color: var(--color-neutral-4, #e3e5e8) !important;
  }

  &.close,
  &.close:hover,
  &.close:focus,
  &.close:focus:after,
  &.close:active,
  &.close:active:after {
    padding: 5px;
    background-color: transparent !important;
    color: var(--color-neutral-8, #9ca3ae) !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
  }
`;

export default StyledButton;
