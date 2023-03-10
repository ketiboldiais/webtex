import { DateObj } from "@webtex/shared";

export const GetUTCDateFromJSON = (date: DateObj) => {
  return date.utcDate;
};

export const GetLocalDateFromJSON = (date: DateObj) => {
  return date.localDate;
};
