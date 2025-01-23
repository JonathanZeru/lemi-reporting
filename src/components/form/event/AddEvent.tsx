import { Button } from '@/components/ui/button';
import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/use-toast';
import { apiURL } from '@/utils/constants/constants';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Category {
  id: number;
  name: string;
}

export default function AddEvent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: 1,
    date: new Date() // Default to current date
  });

  const { accessToken } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Handle multiple images
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiURL}api/category`);
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories.',
        });
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files)); // Update state to hold multiple image files
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, categoryId: parseInt(e.target.value) });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({ ...formData, date });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('categoryId', formData.categoryId.toString());
    form.append('date', formData.date.toISOString());

    // Append all selected images to FormData
    imageFiles.forEach((image) => {
      form.append('image', image);
    });
    if (videoFile) {
      form.append('video', videoFile);
    }

    try {
      const response = await axios.post(`${apiURL}api/events/create`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Event created successfully!',
        });
        // Optionally reset the form or state
        setFormData({ title: "", description: "", categoryId: 1, date: new Date() });
        setImageFiles([]);
        setVideoFile(null);
      } else {
        toast({
          title: 'Error',
          description: `Error: ${response.data.message}`,
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the event.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to remove an image from the imageFiles array
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className='w-full lg:max-w-3xl mx-auto p-3 '>
      <form className='space-y-3' onSubmit={handleSubmit}>
        <div>
          <label className='block text-sm font-medium text-card-foreground'>Event Title:</label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-card-foreground'>Event Description:</label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-card-foreground'>Category:</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            className='text-card-foreground mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none
             focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent'
          >
            <option value='' className='bg-card'>Select a category</option>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            ) : (
              <option>Loading categories...</option>
            )}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-card-foreground'>Select Date:</label>
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className='block w-full px-3 py-2 border bg-card border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-card-foreground'>Images:</label>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageChange}
            className='mt-1 block w-full text-sm text-card-foreground file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200'
          />
          <div className='mt-2 flex flex-wrap gap-2 bg-transparent'>
            {imageFiles.map((file, index) => (
              <div key={index} className='relative'>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className='h-20 w-20 object-cover rounded-md'
                />
                <button
                  type='button'
                  onClick={() => removeImage(index)}
                  className='absolute top-0 right-0 bg-red-500 text-card-foreground rounded-full w-6 h-6 flex items-center justify-center'
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-card-foreground'>Video:</label>
          <input
            type='file'
            accept='video/*'
            onChange={handleVideoChange}
            className='mt-1 block w-full text-sm text-card-foreground file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200'
          />
        </div>

        <Button type='submit' disabled={loading}>
          {loading ? 'Adding Event...' : 'Add Event'}
        </Button>
      </form>
    </div>
  );
}
