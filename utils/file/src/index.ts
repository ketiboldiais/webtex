import * as fs from "node:fs/promises";
import { URL } from "url";

export type Encoding =
  | "ascii"
  | "utf8"
  | "utf16le"
  | "ucs2"
  | "base64"
  | "latin1"
  | "binary"
  | "hex";

function getPath(file: string) {
  return new URL(file, import.meta.url);
}

async function writeFile(path: string, data: string) {
  const file = getPath(path);
  try {
    await fs.appendFile(file, data);
    return file.toString();
  } catch (error) {
    return null;
  }
}

async function writeNewFile(path: string, data: string) {
  const file = getPath(path);
  try {
    await fs.writeFile(file, data);
    return file.toString();
  } catch (error) {
    return null;
  }
}

async function readFile(path: string, encoding: Encoding = "utf8") {
  const file = getPath(path);
  try {
    let data = await fs.readFile(file, encoding);
    return data;
  } catch (error) {
    return null;
  }
}

async function makeFolder(path: string) {
  const dir = getPath(path);
  try {
    await fs.mkdir(dir);
    return dir.toString();
  } catch (error) {
    return null;
  }
}

async function renameFolder(path: string, newpath: string) {
  const dir = getPath(path);
  const newdir = getPath(newpath);
  try {
    await fs.rename(dir, newdir);
    return newdir.toString();
  } catch (error) {
    return null;
  }
}

async function deleteFolder(path: string) {
  const dir = getPath(path);
  try {
    await fs.rm(dir, { recursive: true, force: true });
    return true;
  } catch (error) {
    return null;
  }
}

export {
  getPath,
  makeFolder,
  readFile,
  writeFile,
  writeNewFile,
  renameFolder,
  deleteFolder,
};
