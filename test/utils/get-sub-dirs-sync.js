import glob from 'glob';

export default (cwd) => {
  return glob.sync('*/', { cwd: cwd }).map((subDir) => {
    return subDir.replace(/\/$/, '');
  });
};
