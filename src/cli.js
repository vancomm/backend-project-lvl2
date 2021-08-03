import program from 'commander';
import diff from './diff.js';

export default () => {
  program
    .argument('<filename1>')
    .argument('<filename2>')
    .description('Compares two configuration files and shows a difference. ')
    .version('0.0.1')
    .option('-f, --format <type>', 'output format', 'stylish')
    .action((filename1, filename2, options) => {
      console.log(diff(filename1, filename2, options.format));
    });
  program.parse();
};
