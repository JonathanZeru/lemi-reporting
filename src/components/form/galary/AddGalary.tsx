import { Button } from '@/components/ui/button';
import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/use-toast';
import { apiURL } from '@/utils/constants/constants';
import { Input } from '@/components/ui/input';

interface Category {
  id: number;
  name: string;
}

export default function GalaryForm({ galleryCategoryId }: { galleryCategoryId: number }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    galaryCategoryId: galleryCategoryId,
  });

  const { user, accessToken } = useAuthStore();
  const [profileImages, setProfileImages] = useState<File[]>([]); // Changes made for multiple images
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImages(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...profileImages];
    updatedImages.splice(index, 1);
    setProfileImages(updatedImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();

    // Append form fields
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value as string);
    });

    // Append multiple images
    profileImages.forEach((image) => {
      form.append('image', image);
    });

    if (videoFile) {
      form.append('video', videoFile);
    }

    try {
      const response = await axios.post(`${apiURL}api/galary/create`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Gallary created successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: `Error: ${response.data.message}`,
        });
      }
    } catch (error) {
      console.error('Error creating news:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating news.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="w-full lg:max-w-3xl mx-auto p-3 rounded-lg shadow-md">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-card-foreground">News Title:</label>
          <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground">News Description:</label>
          <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required />
        </div>



        <div>
          <label className="block text-sm font-medium text-card-foreground">Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-card-foreground file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
          />
        </div>

        {/* Image Preview Section */}
        {profileImages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-card-foreground mb-2">Selected Images:</h4>
            <div className="grid grid-cols-3 gap-4">
              {profileImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Selected Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-card-foreground p-1 rounded-full text-xs hover:bg-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        <div>
          <label className="block text-sm font-medium text-card-foreground">Video:</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="mt-1 block w-full text-sm text-card-foreground file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Adding Gallery...' : 'Add Gallery'}
        </Button>
      </form>
    </div>
  );
}