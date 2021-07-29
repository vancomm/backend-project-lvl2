import program from 'commander';
import diff from './diff.js';

export default () => {
  program
    .description('Compares two configuration files and shows a difference. ')
    .version('0.0.1')
    .option('-f, --format <type>', 'output format')
    .argument('<filename1>')
    .argument('<filename2>')
    .action((filename1, filename2) => {
      console.log(diff(filename1, filename2));
    });
  program.parse();
};
