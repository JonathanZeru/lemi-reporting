import { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "../../utils/constants/constants";
import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Schedule } from "@/types/types";
import { toast } from "@/components/ui/use-toast";
import { format, differenceInMinutes } from 'date-fns'
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "../ui/badge";

const WeredaTask = () => {
  const { user, accessToken } = useAuthStore()
  const [loadingInProgress, setLoadingInProgress] = useState(false)
  const [formData, ] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    weredaId: user?.id,
    scheduleId: 0
});



  const [tasks, setTasks] = useState<Schedule[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    weredaId: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName
  });

  // Set creatorId in newTask when user data is available
  useEffect(() => {
    if (user && user.id) {
      setNewTask((prevTask) => ({
        ...prevTask,
        creatorId: user.id, // Set creatorId when user is available
      }));
      fetchTasks(user?.id);  // Fetch tasks once user is loaded
    }
  }, [user]);

  const fetchTasks = (userId: number) => {
    console.log("user.id= ", userId);  // Ensure user.id is available
    console.log(`${apiURL}api/schedule/wereda?weredaId=${userId}`)
    axios
      .get(`${apiURL}api/schedule/wereda?weredaId=${userId}`)
      .then((response) => {
        console.log(response.data)
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching schedule data:", error);
      });
      console.log("tasks = = == = =",  tasks, " ====")
  };

  // Handle input changes for the new task
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  // Handle new task form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.weredaId) {
      toast({
        title: "Error",
        description: "User ID is not available!",
      });
      return;
    }
    try {
      const response = await axios.post(`${apiURL}api/schedule/wereda`,
         newTask);
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Task created successfully!",
        });
        fetchTasks(user?.id || 0);  // Fetch updated tasks after task creation
      } else {
        toast({
          title: "Error",
          description: "Failed to create task!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the task.",
      });
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await axios.delete(`${apiURL}api/schedule/delete?id=${taskId}`);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Task deleted successfully!",
        });
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } else {
        toast({
          title: "Error",
          description: "Failed to delete task!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the task.",
      });
    }
  };

  // Categorize tasks based on their status
  const categorizeTasks = (status: string) =>{
    console.log(status)
    return tasks.filter((task) => task.status == status);
  }

  const handleTaskInProgress = async (task: Schedule)=>{
    
        setLoadingInProgress(true);
        console.log("ere 2")
        
           console.log("ere 3");
           
             const form = new FormData();
             formData.scheduleId = task.id;
           console.log("ere 4");
   
           // Append form fields
           Object.entries(formData).forEach(([key, value]) => {
               form.append(key, value as string);
           });
           
    try {
      const response = await axios.post(`${apiURL}api/schedule/wereda-in-progress`, 
        form,
        {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Task in progress!",
        });
        fetchTasks(task.id)
      } else {
        toast({
          title: "Error",
          description: "Failed to add task to in progress!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding task to in progress.",
      });
    }
  }
  // Render individual task card
  const renderTaskCard = (task: Schedule) => {
    console.log(task)
    const taskStartTime = new Date(task.startTime)
  const taskEndTime = new Date(task.endTime)
  const timeDifferenceInMinutes = differenceInMinutes(taskEndTime, taskStartTime)

  const taskStatus =
    timeDifferenceInMinutes > 0
      ? `Meeting should have start on ${format(new Date(task.startTime), 'pp PP')}!` :
       timeDifferenceInMinutes == 0
      ? `Should be In Progress now!!`
      : 'Up to Date';

    const buttonText = task.status === "Completed" ?
      "View Report" :
      task.status == "Under Meseretawi Review"
        ? "View Report" :
        "Add Report";
    
        const buttonUrl = task.status === "Completed"
      ? `/dashboard/wereda-report-detail/${task.id}`
      : task.status === "Under Meseretawi Review"
        ? `/dashboard/wereda-report-detail/${task.id}`
        : `/dashboard/wereda-report/${task.createdByRole}/${task.createdByRole === "Hiwas"
          ? task.createdByHiwasId
          : task.createdByRole === "MD"
            ? task.createdByMDId
            : task.createdByRole === "Wereda"
              ? task.createdByWeredaId
              : task.createdByRole === "Wana"
                ? task.createdByWanaId
                : ""
        }/${task.id}`;

    return (
      <div
        key={task.id}
        draggable="true"
        className="relative flex flex-col justify-between rounded-sm border p-7 shadow-default hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[150px]"
      >
        <div>
          <h5 className="mb-4 text-lg font-medium">{task.title}</h5>
          <p>{task.description}</p>
          <p>{task.status}</p>
          <p className="text-sm text-gray-500 mt-2">
            Start: {new Date(task.startTime).toLocaleString()} <br />
            End: {new Date(task.endTime).toLocaleString()}
          </p>
          <Link to={buttonUrl}>
            <Button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
              {buttonText}
            </Button>
          </Link>
          
          {
            task.status == "To Do" ? 
            <>
            <h1 className="mb-4 text-lg font-medium text-red-500">
          {taskStatus}
          </h1>
          {timeDifferenceInMinutes >= 0 ?
          <div>
            <Button 
            disabled={loadingInProgress}
            onClick={
            ()=>{handleTaskInProgress(task)}
          }>
            Go To Meeting  
          </Button>
          </div>
          :
          <></>}
            </>:<></>
          }
        </div>
        <Button
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
          onClick={() => handleDeleteTask(task.id)}
        >
          Delete Task
        </Button>
      </div>
    );
  };
  return (
    <div className="container mx-auto p-6">
      <form className="mb-8" onSubmit={handleFormSubmit}>
        <h2 className="text-2xl font-bold mb-4">Create a New Wereda Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Task Title"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Task Description"
            className="p-2 border rounded"
            required
          />
          <input
            type="datetime-local"
            name="startTime"
            value={newTask.startTime}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="datetime-local"
            name="endTime"
            value={newTask.endTime}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
        </div>
        <Button
          type="submit"
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
        >
          Create Task
        </Button>
      </form>

      <div className="flex gap-6 justify-between items-stretch">
        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">
            To Do ({categorizeTasks("To Do").length})
          </h4>
          {categorizeTasks("To Do").map((task) => renderTaskCard(task))}
        </div>

        <div className="swim-lane flex flex-col gap-5.5 w-1/3">
          <h4 className="text-xl font-bold">
            In Progress ({categorizeTasks("In Progress").length})
          </h4>
          {categorizeTasks("In Progress").map((task) => renderTaskCard(task))}
        </div>

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

export default WeredaTask;
