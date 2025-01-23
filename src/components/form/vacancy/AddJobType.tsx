import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";
import { apiURL } from "@/utils/constants/constants";
import { toast } from "@/components/ui/use-toast";

export default function AddJobType() {
  const [roleData, setRoleData] = useState({
    title: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [offices, setOffices] = useState<{ id: number; title: string }[]>([]); 
  const fetchOffices = async () => {
    try {
      const response = await axios.get(`${apiURL}api/job-type`);
      setOffices(response.data.data); // Update roles state with fetched data
    } catch (error) {
      console.error("Error fetching job-type:", error);
      toast({
        title: "Error",
        description: "Failed to fetch job-type.",
      });
    }
  };
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
  // Handle input changes for role data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleData({ ...roleData, [name]: value });
  };

  // Submit function for role creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log(roleData);
    try {
      await axios.post(`${apiURL}api/job-type/create`, roleData);
      toast({
        title: "Success",
        description: "job-type added successfully",
      });
      setRoleData({ title: "", description: "" });
      fetchOffices(); 
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to job-type",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Job-Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="title">Job-Type Name</Label>
              <Input
                id="title"
                name="title"
                value={roleData.title}
                onChange={handleChange}
                placeholder="Enter job type title"
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="description">Job-Type Description</Label>
              <Input
                id="description"
                name="description"
                value={roleData.description}
                onChange={handleChange}
                placeholder="Enter job type description"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding Job Type..." : "Add Job Type"}
            </Button>
          </form>
      {offices.map((office) => (
                    <h2 key={office.id} >
                      {office.title}
                    </h2>
                  ))}
        </CardContent>
      </Card>
    </div>
  );
}
