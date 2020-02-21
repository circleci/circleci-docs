import React from "react";
import styled from "@emotion/styled"

import collapseOpen from './assets/collapseOpen.svg'
import collapseClose from './assets/collapseClosed.svg'
import downloadFile from './assets/downloadFile.svg' // to be replaced with asset from onboarding.
import circle from './assets/circle.png'

interface IData {
  [key: string]: any;
}

const Icons: IData = {
  collapseOpen,
  collapseClose,
  downloadFile,
		circle
}

/**
 * Accessibility: sometimes Icons should be buttons
 * Passing `true` to `isButton` when creating an <Icon> wraps it in a button.
 */

const IconStyle = styled.img<{ width?: number}>`
  width: ${({ width }) => width || 32}px;
  height: ${({ width }) => width || 32}px;
`;


interface Props {
  img: string;
  width?: number;
  style?: any;
}


export const Icon = ({width, img, style}: Props) => {
    return <IconStyle src={Icons[img]} style={style} width={width}/>
}
