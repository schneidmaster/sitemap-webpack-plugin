import { sync } from "glob";
import { readFileSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import { gunzip as gunzipCallback } from "zlib";

type Gunzip = (zipped: Buffer) => Promise<Buffer>;
const gunzip: Gunzip = promisify(gunzipCallback);

const readFile = async (path: string) => {
  if (path.endsWith(".gz")) {
    const data = readFileSync(path);
    const unzippedData = await gunzip(data);
    return unzippedData.toString("utf8");
  } else {
    return readFileSync(path, "utf8");
  }
};

export default async function directoryContains(
  referenceDir: string,
  targetDir: string
): Promise<boolean> {
  const referenceFiles = sync("**/*", {
    cwd: referenceDir,
    nodir: true
  }).filter(file => !["index.js", "stats.json"].includes(file));
  const targetFiles = sync("**/*", { cwd: targetDir, nodir: true });
  if (referenceFiles.length !== targetFiles.length) {
    return false;
  } else {
    for (let i = 0; i < referenceFiles.length; i++) {
      const referenceFile = await readFile(
        join(referenceDir, referenceFiles[i])
      );
      const targetFile = await readFile(join(targetDir, targetFiles[i]));
      if (referenceFile !== targetFile) {
        return false;
      }
    }
    return true;
  }
}
