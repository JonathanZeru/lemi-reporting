'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import Link from "next/link"
import { Schedule } from "@/types/types";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { differenceInMinutes, format } from "date-fns";
import { useParams } from "next/navigation"
import { apiURL } from "@/utils/constants/constants";

const MyHiwasSchedule = () => {
        const { id } = useParams() as { id: string }
      
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Schedule[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    creatorId: "",
  });

  useEffect(() => {
    if (user && user.id) {
      fetchTasks(user?.id);  // Pass the user id when fetching tasks
    }
  }, [user]);  
  const fetchTasks = (userId: number) => {

    console.log("user.id= ", userId);  // Ensure user.id is available
    axios
      .get(`${apiURL}api/schedule/hiwas?hiwasId=${id}`)
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching schedule data:", error);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

 

  const categorizeTasks = (status: string) =>
    tasks.filter((task) => task.status === status);

  const renderTaskCard = (task: Schedule) => {
    
        const taskStartTime = new Date(task.startTime)
      const taskEndTime = new Date(task.endTime)
      const timeDifferenceInMinutes = differenceInMinutes(taskStartTime, taskEndTime)
    
      const taskStatus =
        timeDifferenceInMinutes > 0
          ? `Should be In Progress ${format(new Date(task.startTime), 'pp PP')}!` :
           timeDifferenceInMinutes == 0
          ? `Should be In Progress now!!`
          : 'Up to Date';
    
    return (
    <div
      key={task.id}
      draggable="true"
      className="task relative flex flex-col justify-between 
      rounded-sm border p-7 shadow-default hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[150px]"
    >
      <div>
        <h5 className="mb-4 text-lg font-medium">{task.title}</h5>
        <p>{task.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          Start: {new Date(task.startTime).toLocaleString()} <br />
          End: {new Date(task.endTime).toLocaleString()}
        </p>
     {
      task.status == "Completed" ? 
      <Link
      href={`/dashboard/report-detail/${task.id}`}
    >
      <Button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
      {task.createdByHiwas?.firstName}View Report Details
      </Button>
    </Link>:
    <Link
    href={`/dashboard/task-detail/${task.createdByHiwasId}`}
        >
          <Button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
            View Task
          </Button>
        </Link>
     }
        {
                    task.status == "To Do" ? 
                    <>
                    <h1 className="mb-4 text-lg font-medium text-red-500">
                  {taskStatus}
                  </h1>
                    </>: task.status == "In Progress" ? 
                    <>
                    <h1 className="mb-4 text-lg font-medium text-red-500">
                    Meeting started on {format(new Date(task.startTime), 'pp PP')}
                  </h1>
                    </>:<></>
                  }
      </div>
    </div>
  )}

  return (
    <div className="container mx-auto p-6">
      {/* Task Display */}
      <div className="flex gap-6 justify-between items-stretch">
        {/* To Do Column */}
        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">
            To Do ({categorizeTasks("To Do").length})
          </h4>
          {categorizeTasks("To Do").map((task) => renderTaskCard(task))}
        </div>

        {/* In Progress Column */}
        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">
            In Progress ({categorizeTasks("In Progress").length})
          </h4>
          {categorizeTasks("In Progress").map((task) => renderTaskCard(task))}
        </div>
        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">
          Under Your Review ({categorizeTasks("In Progress").length})
          </h4>
          {categorizeTasks("Under Meseretawi Review").map((task) => renderTaskCard(task))}
        </div>

        {/* Completed Column */}
        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">
            Completed ({categorizeTasks("Completed").length})
          </h4>
          {categorizeTasks("Completed").map((task) => renderTaskCard(task))}
        </div>
      </div>
    </div>
  );
};

export default MyHiwasSchedule;
