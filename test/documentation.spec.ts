import { dequal } from 'dequal';
import fs from 'fs-extra';
import { glob } from 'glob';
import { getOptions, isTopLevelOnlyOption } from '../lib/config/options';
import { regEx } from '../lib/util/regex';

const options = getOptions();
const markdownGlob = '{docs,lib}/**/*.md';

describe('documentation', () => {
  it('has no invalid links', async () => {
    const markdownFiles = await glob(markdownGlob);

    await Promise.all(
      markdownFiles.map(async (markdownFile) => {
        const markdownText = await fs.readFile(markdownFile, 'utf8');
        expect(markdownText).not.toMatch(regEx(/\.md\/#/));
      }),
    );
  });

  describe('website-documentation', () => {
    describe('configuration-options', () => {
      const doc = fs.readFileSync(
        'docs/usage/configuration-options.md',
        'utf8',
      );

      const headers = doc
        .match(/\n## (.*?)\n/g)
        ?.map((match) => match.substring(4, match.length - 1));

      const expectedOptions = options
        .filter((option) => !option.globalOnly)
        .filter((option) => !option.parents || isTopLevelOnlyOption(option))
        .filter((option) => !option.autogenerated)
        .map((option) => option.name)
        .sort();

      it('has doc headers sorted alphabetically', () => {
        expect(headers).toEqual([...headers!].sort());
      });

      it('has headers for every required option', () => {
        expect(headers).toEqual(expectedOptions);
      });

      const subHeaders = doc
        .match(/\n### (.*?)\n/g)
        ?.map((match) => match.substring(5, match.length - 1));
      subHeaders!.sort();
      const expectedSubOptions = options
        .filter((option) => option.stage !== 'global')
        .filter((option) => !option.globalOnly)
        .filter((option) => option.parents && !isTopLevelOnlyOption(option))
        .map((option) => option.name)
        .sort();
      expectedSubOptions.sort();

      it('has headers for every required sub-option', () => {
        expect(subHeaders).toEqual(expectedSubOptions);
      });
    });

    describe('self-hosted-configuration', () => {
      const doc = fs.readFileSync(
        'docs/usage/self-hosted-configuration.md',
        'utf8',
      );

      const headers = doc
        .match(/\n## (.*?)\n/g)
        ?.map((match) => match.substring(4, match.length - 1));

      const expectedOptions = options
        .filter((option) => !!option.globalOnly)
        .map((option) => option.name)
        .sort();

      it('has headers sorted alphabetically', () => {
        expect(headers).toEqual([...headers!].sort());
      });

      it('has headers for every required option', () => {
        expect(headers).toEqual(expectedOptions);
      });
    });

    describe('self-hosted-experimental', () => {
      const doc = fs.readFileSync(
        'docs/usage/self-hosted-experimental.md',
        'utf8',
      );

      const headers = doc
        .match(/\n## (.*?)\n/g)
        ?.map((match) => match.substring(4, match.length - 1));

      it('has headers sorted alphabetically', () => {
        expect(headers).toEqual([...headers!].sort());
      });
    });
  });
});
