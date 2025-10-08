"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchQueueThunk } from "../../store/queueSlice";
import { QueueColumn } from "../../components/queue/QueueColumn";
import { openModal } from "@/app/store/uiSlice";
import { UserPlus } from "lucide-react";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";

export default function QueuePage() {
  const dispatch = useAppDispatch();
  const { waiting, withDoctor, status, movingVisitId } = useAppSelector(
    (state) => state.queue
  );

  useEffect(() => {
    dispatch(fetchQueueThunk());

    const interval = setInterval(() => {
      dispatch(fetchQueueThunk());
    }, 30000); 

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Live Queue</h1>
          <p className="text-gray-600 mt-1">
            Real-time patient flow management
          </p>
        </div>
        <button
          onClick={() => dispatch(openModal("addWalkin"))}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <UserPlus size={20} /> Add Walk-in Patient
        </button>
      </div>

      {status === "loading" && !waiting.length && !withDoctor.length ? (
        <LoadingSpinner  />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QueueColumn
            title="Waiting"
            visits={waiting}
            color="blue"
            movingVisitId={movingVisitId}
          />
          <QueueColumn
            title="With Doctor"
            visits={withDoctor}
            color="yellow"
            movingVisitId={movingVisitId}
          />
        </div>
      )}
    </div>
  );
}
