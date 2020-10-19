export { default as baseImg } from './baseConfigs';

/**
 * Selector values -------------------------------------------------------------
 */

interface IData {
  [key: string]: any;
}

export const executorOptions = [
  { value: 'docker', label: 'Linux (Docker)' },
  { value: 'machine', label: 'Linux (Machine)' },
  { value: 'macos', label: 'Mac' },
  { value: 'windows', label: 'Windows' },
];

// TODO replace any type
const buildSteps = (steps: any) => {
  return ['checkout', ...steps];
};

export const buildConfig: IData = {
  machine: {
    name: 'Machine image',
    options: [
      {
        value: 'ubuntu-2004:202010-01',
        label: 'Ubuntu 20.04, Docker v19.03.13, Docker Compose v1.27.4',
      },
      {
        value: 'ubuntu-1604:202010-01',
        label: 'Ubuntu 16.04, Docker v19.03.13, Docker Compose v1.27.4',
      },
      {
        value: 'ubuntu-1604:202007-01',
        label: 'Ubuntu 16.04, Docker v19.03.12, Docker Compose v1.26.1',
      },
      {
        value: 'ubuntu-1604:202004-01',
        label: 'Ubuntu 16.04, Docker v19.03.8, Docker Compose v1.25.5',
      },
      {
        value: 'ubuntu-1604:201903-01',
        label: 'Ubuntu 16.04, Docker v18.09.3, Docker Compose v1.23.1',
      },
    ],
  },

  docker: {
    name: 'Docker Image',
    options: [
      // { value: '', label: 'Android' },
      {
        value: {
          image: 'cimg/elixir:1.10.4',
          steps: buildSteps([
            { run: 'mix --version' },
            { run: 'mix deps.get' },
            { run: 'mix test' },
          ]),
        },
        label: 'Elixir',
      },
      {
        value: {
          image: 'cimg/go:1.15.3',
          steps: ['checkout', { run: 'go version' }],
        },
        label: 'Go',
      },
      {
        value: {
          image: 'cimg/openjdk:15.0.0',
          steps: [{ run: 'java --version' }],
        },
        label: 'Java',
      },
      {
        value: {
          image: 'cimg/node:14.14.0',
          steps: [{ run: 'node --version' }],
        },
        label: 'Node',
      },
      {
        value: {
          image: 'cimg/php:7.4.11',
          steps: [{ run: 'php --version' }],
        },
        label: 'PHP',
      },
      {
        value: {
          image: 'cimg/python:3.9.0',
          steps: [{ run: 'python --version' }],
        },
        label: 'Python',
      },

      {
        value: {
          image: 'cimg/ruby:2.7.2',
          steps: [{ run: 'ruby --version' }],
        },
        label: 'Ruby',
      },
      {
        value: {
          image: 'cimg/rust:1.47.0',
          steps: [{ run: 'cargo --version' }],
        },
        label: 'Rust',
      }
    ],
  },

  macos: {
    name: 'Xcode Version',
    options: [
      { value: '12.0.0', label: 'Xcode 12.0.0 Beta (macOS 10.15.5)' },
      { value: '11.6.0', label: 'Xcode 11.6.0 (macOS 10.15.5)' },
      { value: '11.5.0', label: 'Xcode 11.5.0 (macOS 10.15.4)' },
      { value: '11.4.1', label: 'Xcode 11.4.1 (macOS 10.15.4)' },
      { value: '11.3.1', label: 'Xcode 11.3.1 (macOS 10.15.1)' },
      { value: '11.3.0', label: 'Xcode 11.3.0 (macOS 10.15.1)' },
      { value: '11.2.1', label: 'Xcode 11.2.1 (macOS 10.15)' },
      { value: '11.2.0', label: 'Xcode 11.2.0 (macOS 10.15)' },
      { value: '11.1.0', label: 'Xcode 11.1.0 (macOS 10.14.4)' },
      { value: '11.0.0', label: 'Xcode 11.0.0 (macOS 10.14.4)' },
      { value: '10.3.0', label: 'Xcode 10.3.0 (macOS 10.14.4)' },
      { value: '10.2.1', label: 'Xcode 10.2.1 (macOS 10.14.4)' },
      { value: '10.1.0', label: 'Xcode 10.1.0 (macOS 10.13.6)' },
      { value: '10.0.0', label: 'Xcode 10.0.0 (macOS 10.13.6)' },
      { value: '9.4.1', label: 'Xcode 9.4.1 (macOS 10.13.3)' },
      { value: '9.3.1', label: 'Xcode 9.3.1 (macOS 10.13.3)' },
      { value: '9.0.1', label: 'Xcode 9.0.1 (macOS 10.15.0)' },
    ],
  },

  // Windows uses orbs, so it looks a bit different than the other images.
  windows: {
    name: 'Windows Image',
    options: [
      { value: 'circleci/windows@2.2.0', label: 'Windows Server 2019' },
    ],
  },
};
