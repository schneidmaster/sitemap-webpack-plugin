import glob from 'glob';
import async from 'async';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import generateDate from '../../src/date';

const readFile = (path, done) => {
  if(path.endsWith('.gz')) {
    return fs.readFile(path, (err, contents) => {
      if(err) {
        done(err);
      } else {
        zlib.gunzip(contents, (err, data) => {
          if(err) {
            done(err);
          } else {
            done(null, data.toString('utf8'));
          }
        });
      }
    });
  } else {
    return fs.readFile(path, 'utf8', done);
  }
};

export default (referenceDir, targetDir, done) => {
  const compareFile = (file, done) => {
    const referenceFile = path.join(referenceDir, file);
    const targetFile = path.join(targetDir, file);

    async.map([referenceFile, targetFile], readFile, (err, results) => {
      if (err) {
        return done(err);
      }

      const referenceContent = results[0].replace(/\$DATE\$/g, generateDate());
      const targetContent = results[1];
      done(null, referenceContent === targetContent);
    });
  };

  glob('**/*', { cwd: referenceDir, nodir: true }, (err, referenceFiles) => {
    if (err) {
      return done(err);
    }

    glob('**/*', { cwd: targetDir, nodir: true }, (err, targetFiles) => {
      if (err) {
        return done(err);
      }

      async.map(referenceFiles.concat(targetFiles), compareFile, (err, results) => {
        if (err) {
          return done(err);
        }

        done(null, !results.some((result) => { return !result; }));
      });
    });
  });
};
