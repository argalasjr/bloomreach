import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'fs';

// Read and strip comments from tsconfig.json (JSONC format)
const tsconfigContent = readFileSync('./tsconfig.json', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
  .replace(/\/\/.*/g, ''); // Remove single-line comments

const tsconfig = JSON.parse(tsconfigContent);
const { paths } = tsconfig.compilerOptions;

export default {
  displayName: 'bloomreach',
  preset: 'jest-preset-angular',
  coverageDirectory: './coverage',
  rootDir: './',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)', `<rootDir>/node_modules/(?!.*\\.mjs$)`],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  testPathIgnorePatterns: [],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>' }),
  },
};
