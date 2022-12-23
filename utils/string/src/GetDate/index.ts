import { DateObj } from "@webtex/types";

export const getDate = (): DateObj => {
  const date = new Date();
  return {
    utcDate: date.toUTCString(),
    localDate: date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      second: "2-digit",
    }),
  };
};
