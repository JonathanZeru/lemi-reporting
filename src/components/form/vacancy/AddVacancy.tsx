import { Button } from '@/components/ui/button';
import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/use-toast';
import { apiURL } from '@/utils/constants/constants';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddJobType from './AddJobType';

interface Category {
  id: number;
  name: string;
}
interface JobType {
  id: number;
  title: string;
}

export default function AddVacancy({ jobTypeId }: { jobTypeId: number }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: 1,
    applicationDeadline: new Date(),
    jobTypeId: jobTypeId,
    salary: 1
  });

  const { accessToken } = useAuthStore();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [offices, setOffices] = useState<{ id: number; title: string }[]>([]);

  
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await axios.get(`${apiURL}api/job-type`);
        console.log(response.data);
        setOffices(response.data.data); // Update roles state with fetched data
      } catch (error) {
        console.error("Error fetching job-type:", error);
        toast({
          title: "Error",
          description: "Failed to fetch job-type.",
        });
      }
    };

    fetchOffices();
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, categoryId: parseInt(e.target.value) });
  };

  const handleJobTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, jobTypeId: parseInt(e.target.value) });
  };

  const handleDateChange = (applicationDeadline: Date | null) => {
    if (applicationDeadline) {
      setFormData({ ...formData, applicationDeadline });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('salary', formData.salary.toString());
    form.append('jobTypeId', formData.jobTypeId.toString());
    form.append('applicationDeadline', formData.applicationDeadline.toISOString());
    
    if (imageFile) {
      form.append('image', imageFile);
    }
   
    try {
      console.log(accessToken, "access ")
      const response = await axios.post(`${apiURL}api/vacancy/create`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Vacancy created successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: `Error: ${response.data.message}`,
        });
      }
    } catch (error) {
      console.error('Error creating vacancy:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating vacancy.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex flex-col w-full justify-center items-center">
      {/* Vacancy Adder Card */}
      <div className=" lg:w-1/2 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add Job Type</h2>
        <AddJobType />
      </div>
      <div className="w-full lg:w-1/2 p-6  shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add a Vacancy</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-card-foreground">Vacancy Name:</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground">Vacancy Description:</label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground">Vacancy Salary:</label>
            <Input
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleSalaryChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground">Vacancy Category:</label>
            <select
              id="jobTypeId"
              name="jobTypeId"
              value={formData.jobTypeId}
              onChange={handleJobTypeChange}
              className="bg-card mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" className='bg-card'>Select a job type</option>
              {offices.length > 0 ? (
                offices.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))
              ) : (
                <option>Loading job types...</option>
              )}
            </select>
          </div>

          <div className='bg-transparent'>
            <label className="block text-sm font-medium text-card-foreground">Application Deadline:</label>
            <DatePicker
              selected={formData.applicationDeadline}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="bg-card block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground">Vacancy Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-card-foreground file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Adding Vacancy...' : 'Add Vacancy'}
          </Button>
        </form>
      </div>

    </div>
  );
}
