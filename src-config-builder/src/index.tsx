import React from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import TagManager from 'react-gtm-module'
import {Sidebar, Docsbar, ConfigContent, Navbar} from "./components";
import baseImg from './data/baseConfigs'
import appConfig, {screens} from './config';
import "./styles.css";


const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: stretch;
  overflow-x: hidden;
  @media (max-width: ${screens.med}px ) {
    flex-direction: column;
  }
`;


const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(appConfig.SHOW_DOCBAR)
  const [config, setConfig] = React.useState(baseImg.defaultConfig())     // The config, as JS, pre yaml conversion.
  const [currentStep, setCurrentStep] = React.useState("empty") // FIXME: enum this eventually.

  return (
    <Wrapper>
      {appConfig.SHOW_HEADER && ( <Navbar/>)}
      <Content>
        <Sidebar setConfig={setConfig} setCurrentStep={setCurrentStep} />
        <ConfigContent
          config={config}
          currentStep={currentStep}
          sidebarOpen={sidebarOpen} />

        {appConfig.SHOW_DOCBAR && (
          <Docsbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
      </Content>
    </Wrapper>
  );
};

// Add google analyitcs.
const tagManagerArgs = {gtmId: 'GTM-W9HDVK'}
TagManager.initialize(tagManagerArgs)

ReactDOM.render(<App />, document.getElementById("root"));
