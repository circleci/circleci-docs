import React from 'react';
import {Icon} from './Icon'
import styled from "@emotion/styled";

export const Wrapper = styled.div`
  height: 64px;
  display: flex;
  justify-content: center;
  width: 100%;
  background: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 1;
  align-items: center;
`;


export const Navbar = () => (
  <Wrapper>
    <a href="https://circleci.com">
      <Icon img="circle" width={32}></Icon>
    </a>
  </Wrapper>
)


