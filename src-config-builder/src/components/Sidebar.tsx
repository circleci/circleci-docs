import React from 'react';
import styled from '@emotion/styled';
import Select, { ValueType } from 'react-select';
import { H1, P } from './index';
import { executorOptions, buildConfig, baseImg } from '../data/';
import {screens, sidebarWidth} from '../config';


const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: ${sidebarWidth}px;
  max-width: ${sidebarWidth}px;
  min-width: ${sidebarWidth}px;
  background: white; // #f5f5f5;
  min-height: 100%;
  order-right: 1px solid #d8d8d8;
  border-right: 1px solid rgb(227, 227, 227);
  border-bottom: none;
  @media(max-width: ${screens.med}px) {
    width: 100%;
    max-width: none;
    border-right: none;
    border-bottom: 1px solid rgb(227, 227, 227);
  }
`;

const Content = styled.div`
  padding: 24px;
`

const SidebarHeading = styled.div`
  max-width: 288px;
  @media(max-width: ${screens.med}px) {
    max-width: 100%;
  }

`

const SelectHeading = styled.div`
  height: 20px;
  width: 158px;
  color: #161616;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  line-height: 20px;
  margin-bottom: 8px;

`;

const FormValues = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const GenerateConfig = styled.button`
  height: 44px;
  width: 100%;
  border-radius: 4px;
  color: #ffffff;
  font-family: Roboto;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.3px;
  line-height: 24px;
  border: none;
  margin-bottom: 32px;
  cursor: pointer;
  text-align: center;
  outline: none;
  background-color: ${({ disabled }) => (disabled ? `lightgrey` : `#3aa3f2`)};
  &:disabled {
    cursor: not-allowed;
  }
  &:hover:enabled {
    background-color: #218AD9;
  }
  `;

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 8px 0 16px;
`;

type OptionType = { label: string; value: string };

interface SidebarProps {
  setCurrentStep: any; // FIXME:
  setConfig: any; // FIXME
}

/**
 * Returns a list of OptionTypes to use in a <Select>
 */
const determineExecutorOptions = (
  selectedPlatform: OptionType,
): OptionType[] => {
  return buildConfig[selectedPlatform.value].options;
};

export const Sidebar = ({ setCurrentStep, setConfig }: SidebarProps) => {
  const [executorOption, setExecutorOption] = React.useState<OptionType | null>(
    null,
  );
  const [imageOption, setImageOption] = React.useState<OptionType | null>(null);

  const validateForm = () => {
    return executorOption === null || imageOption === null;
  };

  const handleGenerateConfig = () => {
    if (executorOption !== null && imageOption !== null) {
      setCurrentStep('generated');
      setConfig(baseImg[executorOption.value](imageOption.value));
    }
  };

  const handleSelectorChange = (
    selectedOption: OptionType,
    whichSelector: string,
  ) => {
    switch (whichSelector) {
      case 'executor':
        setExecutorOption(selectedOption);
        setImageOption(null);
        break;
      case 'image':
        setImageOption(selectedOption);
        break;
    }
  };

  return (
    <Wrapper>
      <Content>
      <SidebarHeading><H1>Tell us about your project</H1></SidebarHeading>
      <P>
        This will help us give you the right configuration template for you to
        customize.
      </P>

      <FormValues>
        <SelectWrapper>
          <SelectHeading>Executor</SelectHeading>
          <Select
            options={executorOptions}
            components={{ IndicatorSeparator: () => null }}
            onChange={(selectedOption: ValueType<OptionType>) =>
              handleSelectorChange(selectedOption as OptionType, 'executor')
            }
          />
        </SelectWrapper>

        {executorOption !== null && (
          <SelectWrapper>
            <SelectHeading>Image</SelectHeading>
            <Select
              value={imageOption}
              components={{ IndicatorSeparator: () => null }}
              onChange={(selectedOption: ValueType<OptionType>) =>
                handleSelectorChange(selectedOption as OptionType, 'image')
              }
              options={determineExecutorOptions(executorOption)}
            />
          </SelectWrapper>
        )}
      </FormValues>

      <GenerateConfig
        onClick={() => handleGenerateConfig()}
        disabled={validateForm()}
      >
        Generate Configuration
      </GenerateConfig>
      </Content>
    </Wrapper>
  );
};
