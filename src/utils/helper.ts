import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface DateInterface {
  date: string;
  dateTime: string;
  time: string;
  dateTimeUTC: string;
  localTime: string;
}

// YYYY-MM-DD, YYYY-MM-DD hh:MM A
export const ConvertDate = (date = "") => {
  let dataSend: DateInterface;
  const tzGuess = dayjs.tz.guess();
  try {
    let dateTz = dayjs(new Date());
    if (date !== "" && date !== undefined) {
      dateTz = dayjs(date).tz(tzGuess);
    }
    dataSend = {
      date: dateTz.format("YYYY-MM-DD"),
      dateTime: dateTz.format("YYYY-MM-DD HH:mm"),
      time: dateTz.format("HH:mm"),
      dateTimeUTC: dateTz.utc().format(),
      localTime: tzGuess,
    };
  } catch (error) {
    dataSend = {
      date: "",
      dateTime: "",
      time: "",
      dateTimeUTC: "",
      localTime: tzGuess,
    };
  }

  return dataSend;
};

export const ConvertDateToString = (date: Dayjs, time: Dayjs) => {
  return `${dayjs(date).format("YYYY-MM-DD")} ${dayjs(time).format("hh:mm A")}`;
};
