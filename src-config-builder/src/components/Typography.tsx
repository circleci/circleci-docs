// import React from "react";
import styled from '@emotion/styled';
import {screens} from "../config"

export const H1 = styled.div`
  color: #161616;
  font-family: Roboto;
  font-size: 40px;
  font-weight: 300;
  letter-spacing: 0.2px;
  line-height: 52px;
  margin-bottom: 16px;
  @media(max-width: ${screens.med}px) {
    font-size: 32px;
  }


`;

export const H3 = styled.h3`
  font-family: Roboto;
  font-size: 20px;
  font-weight: 300;
  margin-top: 0;
  margin-bottom: 12px;
  line-height: 32px;
`;

export const P = styled.p`
  color: #7f7f7f;
  font-family: Roboto;
  font-size: 16px;
  letter-spacing: 0.2px;
  line-height: 24px;
  margin: 0px 0 16px;
`;
