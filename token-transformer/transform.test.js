const fs = require('fs');

describe('token-transformer', () => {
  it('generates dark theme files correctly', async () => {
    var expectedResult = fs.readFileSync('output/dark.json');
    var testResult = fs.readFileSync('temp/dark.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates light theme files correctly', async () => {
    var expectedResult = fs.readFileSync('output/light.json');
    var testResult = fs.readFileSync('temp/light.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates light theme files correctly with single-file and theme.json configuration', async () => {
    var expectedResult = fs.readFileSync('output/light.json');
    var testResult = fs.readFileSync('temp/themes-light.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates dark theme files correctly with single-file and theme.json configuration', async () => {
    var expectedResult = fs.readFileSync('output/dark.json');
    var testResult = fs.readFileSync('temp/themes-dark.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates typography theme files correctly', async () => {
    var expectedResult = fs.readFileSync('output/typography.json');
    var testResult = fs.readFileSync('temp/typography.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates light theme files correctly from folder', async () => {
    var expectedResult = fs.readFileSync('output/folder-light.json');
    var testResult = fs.readFileSync('temp/folder-light.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates light theme files correctly from folder with theme.json configuration', async () => {
    var expectedResult = fs.readFileSync('output/folder-light.json');
    var testResult = fs.readFileSync('temp/themes-folder-light.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates dark theme files correctly from folder with theme.json configuration', async () => {
    var expectedResult = fs.readFileSync('output/folder-dark.json');
    var testResult = fs.readFileSync('temp/themes-folder-dark.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates light theme files correctly and handles resolveReferences correctly', async () => {
    var expectedResult = fs.readFileSync('output/resolve-false.json');
    var testResult = fs.readFileSync('temp/resolve-false.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
  it('generates composition theme files correctly', async () => {
    var expectedResult = fs.readFileSync('output/composition.json');
    var testResult = fs.readFileSync('temp/composition.json');
    expect(testResult.toString()).toEqual(expectedResult.toString());
  });
});
