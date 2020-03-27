import * as React from 'react';
import { Sidebar } from './Sidebar';
import { render } from '@testing-library/react';
import "@testing-library/jest-dom/extend-expect";

const setConfigMock = jest.fn()
const setCurrentStepMock = jest.fn()

describe('Sidebar test suite', () => {

  it("Renders with a disabled button", () => {
    const {getByText} = render(
      <Sidebar setCurrentStep={setCurrentStepMock} setConfig={setConfigMock} />
    )
    expect(getByText("Generate Configuration")).toBeDisabled();
  })
})
