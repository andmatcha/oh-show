"use client";

import { Calender as CalenderClass } from "@/utils/calender";
import { Dispatch, SetStateAction } from "react";

type Props = {
  year: number;
  month: number;
  dates: number[];
  setDates: Dispatch<SetStateAction<number[]>>;
  handleClick: (value: number | undefined) => void;
};

const Calender = ({ year, month, dates, handleClick }: Props) => {
  const calender = new CalenderClass(year, month);
  const monthlyCalender = calender.getMonthlyCalender();

  const isDisabled = (value: {
    date: number | undefined;
    day: number | undefined;
  }): boolean => {
    // クリック不可にする条件
    return value.day == 1; // 月曜定休
  };

  return (
    <div className="w-full">
      <h2 className="flex justify-center">
        {year}年{month}月
      </h2>
      <div className="w-full">
        <div className="w-full flex justify-center">
          {CalenderClass.getDayLabels().map((value, index) => (
            <div
              key={index}
              className="flex justify-center items-center m-2 p-2 border border-transparent"
            >
              <div
                className={`${
                  value == "日"
                    ? "text-red-600"
                    : value == "土"
                    ? "text-blue-600"
                    : "text-black"
                } w-4 h-4 flex justify-center items-center`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex flex-col">
          {monthlyCalender.map((week, index) => (
            <div key={index} className="w-full flex flex-row justify-center">
              {week.map((value, index) => {
                return !value.date ? (
                  <div
                    key={index}
                    className="flex justify-center items-center m-1 p-3 border border-transparent"
                  >
                    <div className="w-4 h-4"></div>
                  </div>
                ) : isDisabled(value) ? (
                  <div
                    key={index}
                    className="flex justify-center items-center m-1 p-3 border border-transparent rounded-full bg-gray-100"
                  >
                    <div className="w-4 h-4 flex justify-center items-center">
                      {value.date}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    key={index}
                    value={value.date}
                    onClick={() => {
                      handleClick(value.date);
                    }}
                    className={`${
                      dates.includes(value.date)
                        ? "bg-pink-200 border-pink-400"
                        : "bg-sky-50 border-sky-200"
                    } flex justify-center items-center m-1 p-3 border rounded-full cursor-pointer`}
                  >
                    <span className="w-4 h-4 flex justify-center items-center">
                      {value.date}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calender;
