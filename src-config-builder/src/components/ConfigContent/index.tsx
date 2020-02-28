/**
 * This component represents the main content between the two sidebars of the
 * onboarding. It is responsible for:
 *  - showing an empty state when the user has not proceeded yet with onboarding
 *  - Displaying the codemirror output as user proceeds with onboarding.
 */

import React from "react";
import styled from "@emotion/styled";
import emptyStateImage from './assets/empty-state.svg'
import {sidebarWidth, screens} from '../../config';
import {Codemirror, H1, H3, P, Icon, Link} from '../index'
import yaml from 'js-yaml'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: stretch;
  min-height: 100%;

`;

const EmptyStateImage = styled.img`
  max-width: 300px;
  align-self: center;
  @media(max-width: ${screens.med}px) {
    margin: 64px 0 96px;
  }
`

const TopSection = styled.section`
  padding-top: 24px;
`

const Content = styled.div`
  padding: 0 40px;

`

const Row = styled.div`
  display: flex;
  flex-direction: row;
`

const FileName = styled.div`
  height: 24px;
  width: 288px;
  color: #161616;
  font-family: Roboto;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.1px;
  line-height: 24px;
`

const CodeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  flex: 1;
`

const FileAndDownload = styled.div`
  background: white;
  border-top: 1px solid rgb(216, 216, 216);
  padding: 20px 0;
`

const CodeMirrorWrapper = styled.div<{sideBarOpen: boolean}>`
  display: flex;
  height: 100%;
  max-width: ${sidebarWidth}px
  transition: max-width 0.4s ease;
  overflow-x: scroll;
`

interface ConfigContentProps {
  sidebarOpen: boolean;
  config: any;
  currentStep: string
}


export const ConfigContent = ({sidebarOpen, config, currentStep}: ConfigContentProps) => {
  let downloadContentLink = `data:text/plain;charset=utf-8,${encodeURIComponent(yaml.dump(config))}`

  return (
    <Wrapper>

      {/* Render the empty state if currentStep is empty */}
      {(currentStep === "empty") && (<EmptyStateImage src={emptyStateImage} />)}

      {(currentStep === "generated") &&
       (
         <CodeWrapper>
           <TopSection>
             <Content style={{flexDirection: "row"}}>
               <H1>View your starting config below.</H1>
               <H3>The snippet below can get your project started and building.</H3>
               <P>Visit the <Link target="_blank" href="https://circleci.com/docs/2.0">CircleCI Documentation</Link> to learn about different executors, images, caching, and other features that enable you to do more.</P>
             </Content>

             <FileAndDownload>
               <Content>
                 <Row style={{justifyContent: "space-between"}}>
                   <FileName>config.yml</FileName>
                   <a  download={"config.yml"} style={{display: "flex"}} href={downloadContentLink}>
                    <Icon width={24} img={"downloadFile"} style={{cursor: "pointer"}}/>
                   </a>
                 </Row>
               </Content>
             </FileAndDownload>
           </TopSection>

           <CodeMirrorWrapper sideBarOpen={sidebarOpen}>
             <Codemirror
               value={yaml.dump(config)}
               options={{
                 mode: 'yaml',
                 theme: 'material',
                 lineNumbers: true,
                 readOnly: true,
               }}
             />
           </CodeMirrorWrapper>
         </CodeWrapper>
       )}
    </Wrapper>
  )
}
