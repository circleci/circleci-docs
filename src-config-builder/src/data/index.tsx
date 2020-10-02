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

export const buildConfig: IData = {
  machine: {
    name: 'Machine image',
    options: [
      { value: 'ubuntu-1604:201903-01', label: 'Ubuntu 16.04 (default)' },
      {
        value: 'circleci/classic:latest',
        label: 'Ubuntu 14.04 (circleci/classic:latest)',
      },
      {
        value: 'circleci/classic:edge',
        label: 'Ubuntu 14.04 (circleci/classic:edge)',
      },
    ],
  },

  docker: {
    name: 'Docker Image',
    options: [
      'android',
      'buildpack-deps',
      'clojure',
      'dynamodb',
      'elixir',
      'golang',
      'jruby',
      'mariadb',
      'mongo',
      'mysql',
      'node',
      'openjdk',
      'php',
      'postgres',
      'python',
      'redis',
      'ruby',
      'rust',
    ].map(img => ({
      value: `circleci/${img}:latest`,
      label: img.charAt(0).toUpperCase() + img.slice(1),
    })),
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
