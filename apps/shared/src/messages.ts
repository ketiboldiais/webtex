export const SERVER_FAIL = "SERVER_OP_FAIL";
export const SERVER_SUCCESS = "SERVER_OP_SUCCESS";
export const DB_FAIL = "DB_OP_FAIL";
export const DB_SUCCESS = "DB_OP_SUCCESS";
export const CLIENT_FAIL = "CLIENT_OP_FAIL";
export const CLIENT_SUCCESS = "CLIENT_OP_SUCCESS";
export const ASYNC_ERROR = "ASYNC_OP_FAIL";

export type AsyncMessage = "ASYNC_OP_FAIL";

export type ServerMessage =
  | "SERVER_OP_FAIL"
  | "SERVER_OP_SUCCESS"
  | AsyncMessage;

export type DBMessage = "DB_OP_FAIL" | "DB_OP_SUCCESS" | AsyncMessage;

export type ClientMessage =
  | "CLIENT_OP_FAIL"
  | "CLIENT_OP_SUCCESS"
  | AsyncMessage;

export type Message = ClientMessage | ServerMessage | AsyncMessage;

export type MessagePayload = {
  message: Message;
};
