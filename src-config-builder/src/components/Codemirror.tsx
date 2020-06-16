/**
 * FIXME: copied from `web-ui/src/design` system. Fix with npm import / component-library?
 */

import * as React from 'react';
import styled from '@emotion/styled';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/yaml/yaml';

export const CodeMirrorEditor = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;

  /* Copied from node_modules/codemirror/lib/codemirror.css*/

  /* BASICS */

  .CodeMirror {
    /* Set height, width, borders, and global font properties here */
    font-family: monospace;
    height: 300px;
    color: black;
    direction: ltr;
  }

  /* PADDING */

  .CodeMirror-lines {
    padding: 4px 0; /* Vertical padding around content */
  }
  .CodeMirror pre.CodeMirror-line,
  .CodeMirror pre.CodeMirror-line-like {
    padding: 0 4px; /* Horizontal padding of content */
  }

  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    background-color: white; /* The little square between H and V scrollbars */
  }

  /* GUTTER */

  .CodeMirror-gutters {
    border-right: 1px solid #ddd;
    background-color: #f7f7f7;
    white-space: nowrap;
  }
  .CodeMirror-linenumbers {
  }
  .CodeMirror-linenumber {
    padding: 0 3px 0 5px;
    min-width: 20px;
    text-align: right;
    color: #999;
    white-space: nowrap;
  }

  .CodeMirror-guttermarker {
    color: black;
  }
  .CodeMirror-guttermarker-subtle {
    color: #999;
  }

  /* CURSOR */

  .CodeMirror-cursor {
    border-left: 1px solid black;
    border-right: none;
    width: 0;
  }
  /* Shown when moving in bi-directional text */
  .CodeMirror div.CodeMirror-secondarycursor {
    border-left: 1px solid silver;
  }
  .cm-fat-cursor .CodeMirror-cursor {
    width: auto;
    border: 0 !important;
    background: #7e7;
  }
  .cm-fat-cursor div.CodeMirror-cursors {
    z-index: 1;
  }
  .cm-fat-cursor-mark {
    background-color: rgba(20, 255, 20, 0.5);
    -webkit-animation: blink 1.06s steps(1) infinite;
    -moz-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
  }
  .cm-animate-fat-cursor {
    width: auto;
    border: 0;
    -webkit-animation: blink 1.06s steps(1) infinite;
    -moz-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
    background-color: #7e7;
  }
  @-moz-keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }
  @-webkit-keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }
  @keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }

  /* Can style cursor different in overwrite (non-insert) mode */
  .CodeMirror-overwrite .CodeMirror-cursor {
  }

  .cm-tab {
    display: inline-block;
    text-decoration: inherit;
  }

  .CodeMirror-rulers {
    position: absolute;
    left: 0;
    right: 0;
    top: -50px;
    bottom: 0;
    overflow: hidden;
  }
  .CodeMirror-ruler {
    border-left: 1px solid #ccc;
    top: 0;
    bottom: 0;
    position: absolute;
  }

  /* Default styles for common addons */

  div.CodeMirror span.CodeMirror-matchingbracket {
    color: #0b0;
  }
  div.CodeMirror span.CodeMirror-nonmatchingbracket {
    color: #a22;
  }
  .CodeMirror-matchingtag {
    background: rgba(255, 150, 0, 0.3);
  }
  .CodeMirror-activeline-background {
    background: #e8f2ff;
  }

  /* STOP */

  /* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

  .CodeMirror {
    position: relative;
    overflow: hidden;
    background: white;
  }

  .CodeMirror-scroll {
    overflow: scroll !important; /* Things will break if this is overridden */
    /* 30px is the magic margin used to hide the element's real scrollbars */
    /* See overflow: hidden in .CodeMirror */
    margin-bottom: -30px;
    margin-right: -30px;
    padding-bottom: 30px;
    height: 100%;
    outline: none; /* Prevent dragging from highlighting the element */
    position: relative;
  }
  .CodeMirror-sizer {
    position: relative;
    border-right: 30px solid transparent;
  }

  /* The fake, visible scrollbars. Used to force redraw during scrolling
   before actual scrolling happens, thus preventing shaking and
   flickering artifacts. */
  .CodeMirror-vscrollbar,
  .CodeMirror-hscrollbar,
  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    position: absolute;
    z-index: 6;
    display: none;
  }
  .CodeMirror-vscrollbar {
    right: 0;
    top: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .CodeMirror-hscrollbar {
    bottom: 0;
    left: 0;
    overflow-y: hidden;
    overflow-x: scroll;
  }
  .CodeMirror-scrollbar-filler {
    right: 0;
    bottom: 0;
  }
  .CodeMirror-gutter-filler {
    left: 0;
    bottom: 0;
  }

  .CodeMirror-gutters {
    position: absolute;
    left: 0;
    top: 0;
    min-height: 100%;
    z-index: 3;
  }
  .CodeMirror-gutter {
    white-space: normal;
    height: 100%;
    display: inline-block;
    vertical-align: top;
    margin-bottom: -30px;
  }
  .CodeMirror-gutter-wrapper {
    position: absolute;
    z-index: 4;
    background: none !important;
    border: none !important;
  }
  .CodeMirror-gutter-background {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 4;
  }
  .CodeMirror-gutter-elt {
    position: absolute;
    cursor: default;
    z-index: 4;
  }
  .CodeMirror-gutter-wrapper ::selection {
    background-color: transparent;
  }
  .CodeMirror-gutter-wrapper ::-moz-selection {
    background-color: transparent;
  }

  .CodeMirror-lines {
    cursor: text;
    min-height: 1px; /* prevents collapsing before first draw */
  }
  .CodeMirror pre.CodeMirror-line,
  .CodeMirror pre.CodeMirror-line-like {
    /* Reset some styles that the rest of the page might have set */
    -moz-border-radius: 0;
    -webkit-border-radius: 0;
    border-radius: 0;
    border-width: 0;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    white-space: pre;
    word-wrap: normal;
    line-height: inherit;
    color: inherit;
    z-index: 2;
    position: relative;
    overflow: visible;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-variant-ligatures: contextual;
    font-variant-ligatures: contextual;
  }
  .CodeMirror-wrap pre.CodeMirror-line,
  .CodeMirror-wrap pre.CodeMirror-line-like {
    word-wrap: break-word;
    white-space: pre-wrap;
    word-break: normal;
  }

  .CodeMirror-linebackground {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 0;
  }

  .CodeMirror-linewidget {
    position: relative;
    z-index: 2;
    padding: 0.1px; /* Force widget margins to stay inside of the container */
  }

  .CodeMirror-widget {
  }

  .CodeMirror-rtl pre {
    direction: rtl;
  }

  .CodeMirror-code {
    outline: none;
  }

  /* Force content-box sizing for the elements where we expect it */
  .CodeMirror-scroll,
  .CodeMirror-sizer,
  .CodeMirror-gutter,
  .CodeMirror-gutters,
  .CodeMirror-linenumber {
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }

  .CodeMirror-measure {
    position: absolute;
    width: 100%;
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }

  .CodeMirror-cursor {
    position: absolute;
    pointer-events: none;
  }
  .CodeMirror-measure pre {
    position: static;
  }

  div.CodeMirror-cursors {
    visibility: hidden;
    position: relative;
    z-index: 3;
  }
  div.CodeMirror-dragcursors {
    visibility: visible;
  }

  .CodeMirror-focused div.CodeMirror-cursors {
    visibility: visible;
  }

  .CodeMirror-selected {
    background: #d9d9d9;
  }
  .CodeMirror-focused .CodeMirror-selected {
    background: #d7d4f0;
  }
  .CodeMirror-crosshair {
    cursor: crosshair;
  }
  .CodeMirror-line::selection,
  .CodeMirror-line > span::selection,
  .CodeMirror-line > span > span::selection {
    background: #d7d4f0;
  }
  .CodeMirror-line::-moz-selection,
  .CodeMirror-line > span::-moz-selection,
  .CodeMirror-line > span > span::-moz-selection {
    background: #d7d4f0;
  }

  .cm-searching {
    background-color: #ffa;
    background-color: rgba(255, 255, 0, 0.4);
  }

  /* Used to force a border model for a node */
  .cm-force-border {
    padding-right: 0.1px;
  }

  @media print {
    /* Hide the cursor when printing */
    .CodeMirror div.CodeMirror-cursors {
      visibility: hidden;
    }
  }

  /* See issue #2901 */
  .cm-tab-wrap-hack:after {
    content: '';
  }

  /* Help users use markselection to safely style text background */
  span.CodeMirror-selectedtext {
    background: none;
  }

  /* End Copied from */

  /*
  Name:       Custom Theme. Based on (material)
  Author:     Originaly Created by Mattia Astorino (http://github.com/equinusocio)
  Website:    https://material-theme.site/
  */

  .cm-s-material.CodeMirror {
    background-color: #2b2b2b;
    color: #ffffff;
    font-size: 14px;
    line-height: 24px;
    font-family: 'Roboto Mono', monospace;
    height: auto;
    width: 100%;
  }

  .cm-s-material .CodeMirror-gutters {
    background: #343434;
    color: #546e7a;
    border-right: 1px solid #555555;
  }

  .cm-s-material .CodeMirror-guttermarker,
  .cm-s-material .CodeMirror-guttermarker-subtle,
  .cm-s-material .CodeMirror-linenumber {
    color: #959595;
  }
  .cm-s-material .CodeMirror-lines {
    padding: 16px 0;
  }

  .cm-s-material .CodeMirror-linenumbers {
    width: 49px;
  }

  .cm-s-material .CodeMirror-linenumber {
    padding: 0 15px 0 6px;
  }

  .cm-s-material pre.CodeMirror-line,
  .cm-s-material pre.CodeMirror-line-like {
    padding: 0 16px;
  }

  .cm-s-material .CodeMirror-cursor {
    border-left: 1px solid #ffcc00;
  }

  .cm-s-material div.CodeMirror-selected {
    background: rgba(128, 203, 196, 0.2);
  }

  .cm-s-material.CodeMirror-focused div.CodeMirror-selected {
    background: rgba(128, 203, 196, 0.2);
  }

  .cm-s-material .CodeMirror-line::selection,
  .cm-s-material .CodeMirror-line > span::selection,
  .cm-s-material .CodeMirror-line > span > span::selection {
    background: rgba(128, 203, 196, 0.2);
  }

  .cm-s-material .CodeMirror-line::-moz-selection,
  .cm-s-material .CodeMirror-line > span::-moz-selection,
  .cm-s-material .CodeMirror-line > span > span::-moz-selection {
    background: rgba(128, 203, 196, 0.2);
  }

  .cm-s-material .CodeMirror-activeline-background {
    background: rgba(0, 0, 0, 0.5);
  }

  .cm-s-material .cm-keyword {
    color: #c792ea;
  }

  .cm-s-material .cm-operator {
    color: #89ddff;
  }

  .cm-s-material .cm-variable-2 {
    color: #ffffff;
  }

  .cm-s-material .cm-variable-3,
  .cm-s-material .cm-type {
    color: #f07178;
  }

  .cm-s-material .cm-builtin {
    color: #ffcb6b;
  }

  .cm-s-material .cm-atom {
    color: #fff176;
  }

  .cm-s-material .cm-number {
    color: #ffffff;
  }

  .cm-s-material .cm-def {
    color: #82aaff;
  }

  .cm-s-material .cm-string {
    color: #c3e88d;
  }

  .cm-s-material .cm-string-2 {
    color: #f07178;
  }

  .cm-s-material .cm-comment {
    color: #959595;
  }

  .cm-s-material .cm-variable {
    color: #f07178;
  }

  .cm-s-material .cm-tag {
    color: #ff5370;
  }

  .cm-s-material .cm-meta {
    color: #ffffff;
  }

  .cm-s-material .cm-attribute {
    color: #c792ea;
  }

  .cm-s-material .cm-property {
    color: #c792ea;
  }

  .cm-s-material .cm-qualifier {
    color: #decb6b;
  }

  .cm-s-material .cm-variable-3,
  .cm-s-material .cm-type {
    color: #decb6b;
  }

  .cm-s-material .cm-error {
    color: rgba(255, 255, 255, 1);
    background-color: #ff5370;
  }

  .cm-s-material .CodeMirror-matchingbracket {
    text-decoration: underline;
    color: white;
  }
`;

const CodeMirrorTheme = ({ children }: { children: React.ReactNode }) => (
  <CodeMirrorEditor>{children}</CodeMirrorEditor>
);

const Code = styled(CodeMirror)`
  flex: 1;
  height: 100%;
  max-width: 100%;
  overflow: scroll;
  display: flex;
`;

type Props = Parameters<typeof Code>[0];

export default (props: Props) => (
  <CodeMirrorTheme>
    <Code {...props} />
  </CodeMirrorTheme>
);
