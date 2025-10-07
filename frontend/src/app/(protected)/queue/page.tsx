"use client";

import { RootState, useAppSelector } from "@/app/store/store";
import { UserPlus } from "lucide-react";


const QueuePage = () => {
  return (
    <div className=" text-black">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Live Queue</h1>
          <p className="text-gray-600">Real-time patient flow managemen</p>
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
            <UserPlus size={16} className="m-1" /> Add Walk in Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueuePage;
