import bcrypt from "bcrypt";
import Env from "../configs/index.js";
import {
  ASYNC_ERROR,
  Message,
  MessagePayload,
  SERVER_FAIL,
} from "@webtex/shared";

import { nanoid } from "nanoid";

const makeId = (size: number) => {
  return nanoid(size);
};

const hash = async (plaintext: string) => {
  try {
    let result = await bcrypt.hash(plaintext, Env.saltRounds);
    if (result) {
      return result;
    }
    return SERVER_FAIL;
  } catch (err) {
    return ASYNC_ERROR;
  }
};

const verifyHash = async (ciphertext: string, plaintext: string) => {
  try {
    return await bcrypt.compare(ciphertext, plaintext);
  } catch (err) {
    return ASYNC_ERROR;
  }
};

const message = (message: Message): MessagePayload => {
  return { message };
};

export { hash, verifyHash, message, makeId };
