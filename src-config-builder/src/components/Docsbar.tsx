/**
 * This component is responsible for displaying a list of docs
 * depending on what your selections are in the builder.
 */
import React from 'react';
import styled from '@emotion/styled';
import { Icon } from '.';

const Wrapper = styled.div<{ isOpen: boolean }>`
  background-color: #ffffff;
  box-shadow: 4px 0 6px 10px rgba(0, 0, 0, 0.04);
  width: 336px;
  margin-right: ${({ isOpen }) => (isOpen ? 0 : -348)}px;
  border-left: 1px solid #efefef;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: margin-right 0.4s ease;
`;

const SectionLearnMore = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0 24px;
`;


const Title = styled.div`
  height: 32px;
  width: 122px;
  color: #343434;
  font-family: Roboto;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.05px;
  margin: 22px 0;
  line-height: 32px;
`;

const CollapseWrapper = styled.button`
  background-color: #dfdfdf;
  border-bottom-left-radius: 2px;
  border-top-left-radius: 2px;
  border: none;
  cursor: pointer;
  margin: 0;
  outline: none;
  padding: 6px 8px;
  position: fixed;
  right: 0px;
  z-index: 1;
`;

const Separator = styled.div`
  height: 1px;
  background: #ddd;
`;

const SectionDocs = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const DocsTitle = styled.div`
  height: 24px;
  width: 288px;
  color: #161616;
  font-family: Roboto;
  font-size: 20px;
  letter-spacing: 0.1px;
  line-height: 24px;
`;

const DocsSubtitle = styled.div`
  height: 44px;
  width: 288px;
  color: #6a6a6a;
  font-family: Roboto;
  font-size: 14px;
  letter-spacing: 0.08px;
  line-height: 22px;
  margin: 16px 0;
`;

const DocsLink = styled.a`
  color: #3aa3f2;
  font-family: Roboto;
  font-size: 14px;
  margin: 12px 0;
  letter-spacing: 0.08px;
  line-height: 21px;
  text-decoration: none;
`;

const buildDocLink = (link: string) => `https://circleci.com/docs/2.0/${link}/`;

const docLinks = [
  {
    name: 'Configuration Reference',
    link: buildDocLink('configuration-reference'),
  },
  { name: 'Writing YAML', link: buildDocLink('writing-yaml') },
  { name: 'Using Environment Variables', link: buildDocLink('env-vars') },
];

interface DocsbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (toggle: boolean) => void; // LEAVING OFF: figure out what to name the hooks
}

export const Docsbar = ({ sidebarOpen, setSidebarOpen }: DocsbarProps) => {
  const collapseIcon = sidebarOpen ? 'collapseClose' : 'collapseOpen';
  const toggleBar = sidebarOpen ? false : true;

  return (
    <Wrapper isOpen={sidebarOpen}>
      <SectionLearnMore>
        <Title>Learn more</Title>
        <CollapseWrapper onClick={() => setSidebarOpen(toggleBar)}>
          <Icon width={10} img={collapseIcon} />
        </CollapseWrapper>
      </SectionLearnMore>
      <Separator />

      <SectionDocs>
        <DocsTitle>Documentation</DocsTitle>
        <DocsSubtitle>
          Our most popular docs on hwo to set up and debug your build
          configuration.
        </DocsSubtitle>
        {docLinks.map(l => (
          <DocsLink key={l.name} target="_blank" href={l.link}>
            {l.name}
          </DocsLink>
        ))}
      </SectionDocs>

      {/* TODO: Conditional rendering based on selected documents. */}
      <SectionDocs> </SectionDocs>
    </Wrapper>
  );
};
