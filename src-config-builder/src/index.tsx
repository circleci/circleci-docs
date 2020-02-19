import React from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import {Sidebar, Docsbar, ConfigContent} from "./components";
import baseImg from './data/baseConfigs'
import appConfig from './config';
import "./styles.css";

const Wrapper = styled.div`
  min-height: 100vh;
  // max-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const HeaderPlaceholder = styled.div`
  height: 64px;
  display: flex;
  justify-content: center;
  width: 100%;
  background: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 1;

`;

const Content = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: stretch;
  overflow-x: hidden;
`;


const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(appConfig.SHOW_DOCBAR)
  const [config, setConfig] = React.useState(baseImg.defaultConfig())     // The config, as JS, pre yaml conversion.
  const [currentStep, setCurrentStep] = React.useState("empty") // FIXME: enum this eventually.

  return (
    <Wrapper>
      {appConfig.SHOW_HEADER && ( <HeaderPlaceholder />)}
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

ReactDOM.render(<App />, document.getElementById("root"));
