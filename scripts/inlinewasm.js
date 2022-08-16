#! /usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');

const files = process.argv.slice(2).filter((x) => x.endsWith('.wasm'));

if (files.length === 0) {
  console.log('Specify list of files separated by spaces as arguments. E.G.:');
  console.log('inlinewasm.js a.wasm b.wasm c.wasm');
  console.log('It will create inline files next to original wasm files');
  console.log('All wasm files required to have .wasm extenssion');
  process.exit();
}

(async () => {
  const template = await fs.readFile(
    path.resolve(__dirname, './template.inlwasm.js'),
    'utf8'
  );

  const generateInlineFile = async (inputPath, outputPath) => {
    const buff = await fs.readFile(inputPath);
    const base64data = buff.toString('base64');
    const jsContent = template.replace(/\$\{base64data\}/, base64data);
    return fs.writeFile(outputPath, jsContent).then(
      (x) => {
        console.info(`Inlined ${inputPath} in ${outputPath}`);
        return x;
      },
      (err) => {
        console.error('Error in generateInlineFile:', err);
        throw err;
      }
    );
  };

  const getOutputPath = (inputPath) =>
    path.resolve(
      path.dirname(inputPath),
      path.basename(inputPath).replace(/\.wasm$/, '.inl.js')
    );

  console.log('Start generating inlined wasm for files');
  return Promise.all([
    files.map((filePath) => {
      console.log(filePath);
      const outputPath = getOutputPath(filePath);
      return generateInlineFile(filePath, outputPath);
    })
  ]);
})();
