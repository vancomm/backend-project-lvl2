import program from 'commander';

export default () => {
  program
    .description('Compares two configuration files and shows a difference. ')
    .version('0.0.1');
  program.parse();
};
