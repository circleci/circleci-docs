/**
 * These objects get converted into yaml to be displayed in codemirror.
 */

interface IData {
  [key: string]: any;
}

const defaultConfig = (): IData => ({
  version: 2.1,
  jobs: {
    build: {
      steps: [
        'checkout',
        {
          run: 'echo "hello world"',
        },
      ],
    },
  },
});

const docker = (config: any): IData => {
  const newConfig = {
    version: 2.1,
    jobs: {
      build: {
        docker: [
          {
            image: config.image,
            auth: {
              username: 'mydockerhub-user',
              password: '$DOCKERHUB_PASSWORD',
            },
          },
        ],
        steps: config.steps,
      },
    },
  };

  return newConfig;
};

const machine = (image: string): IData => ({
  version: 2.1,
  jobs: {
    build: {
      machine: {
        image: image,
      },

      steps: [
        'checkout',
        {
          run: 'echo "Hello world!"',
        },
      ],
    },
  },
});

const macos = (image: string): IData => ({
  version: 2.1,
  jobs: {
    build: {
      macos: {
        xcode: image,
      },
      steps: ['checkout', { run: 'xcodebuild -version' }],
    },
  },
});

const windows = (image: string): IData => {
  return {
    version: 2.1,
    orbs: {
      win: image,
    },
    jobs: {
      build: {
        executor: 'win/default',
        steps: [
          'checkout',
          {
            run: 'Write-Host "Hello, Windows"',
          },
        ],
      },
    },
  };
};

// makes props available via ["bracket-notation"].
const imgs: IData = {
  defaultConfig,
  docker,
  machine,
  windows,
  macos,
};

export default imgs;
