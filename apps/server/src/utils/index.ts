import bcrypt from 'bcrypt';
import Env from '../configs/index.js';
import { nanoid } from 'nanoid';

const makeId = (size: number) => {
  return nanoid(size);
};

const hash = async (plaintext: string) => {
  try {
    let result = await bcrypt.hash(plaintext, Env.saltRounds);
    if (result) {
      return result;
    }
    return null;
  } catch (err) {
    return null;
  }
};

const verifyHash = async (ciphertext: string, plaintext: string) => {
  try {
    return await bcrypt.compare(ciphertext, plaintext);
  } catch (err) {
    return false;
  }
};

export { hash, verifyHash, makeId };
