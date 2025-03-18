"use client";

import Calender from "@/components/Calender";
import Layout from "@/components/Layout";
import { DEADLINE } from "@/constants/shift";
import dayjs from "dayjs";
import { useState } from "react";

const Submit = () => {
  let year: number;
  let month: number;
  const today = dayjs();
  if (today.date() > DEADLINE) {
    year = today.add(1, "month").year();
    month = today.add(1, "month").month() + 1;
  } else {
    year = today.year();
    month = today.month() + 1;
  }

  const [dates, setDates] = useState<number[]>([]);

  const handleClick = (value: number | undefined) => {
    let newDates: number[] = [];
    if (!value) return;
    if (!dates.includes(value)) {
      newDates = [...dates, value];
    } else {
      newDates = dates.filter((date) => date !== value);
    }
    setDates(newDates);
  };

  const handleSubmit = (e: React.FormEvent, dates: number[]) => {
    e.preventDefault();
    // 提出処理
    console.log(dates);
  };
  return (
    <Layout title="シフト登録">
      <form onSubmit={(e) => handleSubmit(e, dates)}>
        <div className="pb-8">
          <Calender
            year={year}
            month={month}
            dates={dates}
            setDates={setDates}
            handleClick={handleClick}
          />
        </div>
        <ul className="w-full flex flex-col gap-2 mt-4 mb-8 border border-gray-200 rounded-md p-2">
          <li className="w-full flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-pink-400 bg-pink-200"></div>
            <p className="text-sm">選択中</p>
          </li>
          <li className="w-full flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-sky-200 bg-sky-50"></div>
            <p className="text-sm">未選択（選択可能）</p>
          </li>
          <li className="w-full flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-transparent bg-gray-100"></div>
            <p className="text-sm">選択不可</p>
          </li>
        </ul>
        <div className="px-8">
          <button
            type="submit"
            className="w-full bg-blue-600 rounded-lg p-4 text-white hover:bg-blue-700 transition-all duration-300 cursor-pointer"
          >
            提出
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default Submit;
