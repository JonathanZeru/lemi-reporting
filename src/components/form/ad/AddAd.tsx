import { Button } from '@/components/ui/button';
import React, { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/use-toast';
import { apiURL } from '@/utils/constants/constants';
import { Input } from '@/components/ui/input';

export default function AdForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const { accessToken } = useAuthStore();
  const [profileImage, setProfileImage] = useState<File | null>(null); // Single image
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]); // Store only one image
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();

    // Append form fields
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value as string);
    });

    // Append single image
    if (profileImage) {
      form.append('image', profileImage);
    }

    // Append video if it exists
    if (videoFile) {
      form.append('video', videoFile);
    }

    try {
      const response = await axios.post(`${apiURL}api/ad/create`, form, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Advertisement created successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: `Error: ${response.data.message}`,
        });
      }
    } catch (error) {
      console.error('Error creating advertisement:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the advertisement.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="w-full lg:max-w-3xl mx-auto p-3 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add an Advertisement</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-card-foreground">Advertisement Title:</label>
          <Input id="title" name="title"
           value={formData.title} onChange={handleInputChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground">Advertisement Description:</label>
          <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground">Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-card-foreground file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
          />
        </div>

        {/* Image Preview Section */}
        {profileImage && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-card-foreground mb-2">Selected Image:</h4>
            <div className="relative">
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Selected"
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => setProfileImage(null)} // Clear the selected image
                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700"
              >
                X
              </button>
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
          {loading ? 'Adding Advertisement...' : 'Add Advertisement'}
        </Button>
      </form>
    </div>
  );
}