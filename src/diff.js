import program from 'commander';

export default () => {
  program
    .description('Compares two configuration files and shows a difference. ')
    .version('0.0.1')
    .option('-f, --format <type>', 'output format')
    .argument('<filename1> <filename2>');
  program.parse();
};
