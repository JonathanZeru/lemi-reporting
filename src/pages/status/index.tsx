import { Button } from '../../component/ui/button';
import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '../../component/ui/input';


export default function ReportForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reportedBy: 'Hiwas',
    reporterId: 2,
    scheduleId: 2,
  });

  const [reportImages, setReportImages] = useState<File[]>([]); // Multiple images
  const [reportPdfs, setReportPdfs] = useState<File[]>([]); // PDFs
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReportImages(Array.from(e.target.files));
    }
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReportPdfs(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...reportImages];
    updatedImages.splice(index, 1);
    setReportImages(updatedImages);
  };

  const handleRemovePdf = (index: number) => {
    const updatedPdfs = [...reportPdfs];
    updatedPdfs.splice(index, 1);
    setReportPdfs(updatedPdfs);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();

    // Append form fields
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value as string);
    });

    // Append images and PDFs
    reportImages.forEach((image) => {
      form.append('reportImages', image);
    });
    reportPdfs.forEach((pdf) => {
      form.append('reportPdfs', pdf);
    });

    // Append audio and video
    if (audioFile) {
      form.append('audio', audioFile);
    }
    if (videoFile) {
      form.append('video', videoFile);
    }
    form.forEach((f)=>{
console.log(f, f.valueOf())
console.log(f.toString)
    })
    try {
      const response = await axios.post(`/api/report/create`, form, 
      //   {
      //   headers: {
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // }
    );

      if (response.status === 201) {
       alert("success")
      } else {
        alert("error")
      }
    } catch (error) {
      console.error('Error creating report:', error);
      
      alert("error")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:max-w-3xl mx-auto p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add a Report</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Report Name:</label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description:</label>
          <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reported By:</label>
          <select
            id="reportedBy"
            name="reportedBy"
            value={formData.reportedBy}
            onChange={handleInputChange}
            className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="Hiwas">Hiwas</option>
            <option value="Meseretawi">Meseretawi</option>
            <option value="Wereda">Wereda</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
          />
        </div>

        {/* Image Preview Section */}
        {reportImages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
            <div className="grid grid-cols-3 gap-4">
              {reportImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Selected Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">PDFs:</label>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handlePdfChange}
            className="mt-1 block w-full text-sm text-gray-500 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
          />
        </div>

        {/* PDF Preview Section */}
        {reportPdfs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected PDFs:</h4>
            <div className="grid grid-cols-3 gap-4">
              {reportPdfs.map((pdf, index) => (
                <div key={index} className="relative">
                  <p className="text-xs">{pdf.name}</p>
                  <button
                    type="button"
                    onClick={() => handleRemovePdf(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Audio:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
            className="mt-1 block w-full text-sm text-gray-500 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Video:</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="mt-1 block w-full text-sm text-gray-500 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting Report...' : 'Submit Report'}
        </Button>
      </form>
    </div>
  );
}
