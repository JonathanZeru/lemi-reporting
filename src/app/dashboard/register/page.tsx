'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiURL } from '@/utils/constants/constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const RegistrationForm = () => {
  const [userType, setUserType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [mdId, setMdId] = useState(0);  // Default to 0 for non-Hiwas types
  const [meseretawiOptions, setMeseretawiOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useRouter();

  // Fetch Meseretawi options when "Hiwas" is selected
  useEffect(() => {
    if (userType === 'Hiwas') {
      axios.get(`${apiURL}api/meseretawi`)
        .then(response => {
          setMeseretawiOptions(response.data);
        })
        .catch(error => {
          console.error('Error fetching Meseretawi options:', error);
        });
    }
  }, [userType]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const body = {
      firstName,
      lastName,
      email,
      phone,
      userName,
      password,
      role,
      isActive,
      type: userType,
      mdId: userType === 'Hiwas' ? mdId : 0, // Only include mdId if Hiwas is selected
    };

    try {
      const response = await axios.post(`${apiURL}api/auth/register`, body);
      alert(response.data.message);
      navigate.push('/dashboard');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="userName">Username</Label>
            <Input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="isActive">Active</Label>
            <Checkbox
              id="isActive"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
          </div>

          <div>
            <Label>User Type</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="Wana"
                  checked={userType === 'Wana'}
                  onChange={() => setUserType('Wana')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>Wana</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="Meseretawi"
                  checked={userType === 'Meseretawi'}
                  onChange={() => setUserType('Meseretawi')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>Meseretawi</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="Wereda"
                  checked={userType === 'Wereda'}
                  onChange={() => setUserType('Wereda')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>Wereda</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="userType"
                  value="Hiwas"
                  checked={userType === 'Hiwas'}
                  onChange={() => setUserType('Hiwas')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>Hiwas</span>
              </label>
            </div>
          </div>

          {userType === 'Hiwas' && (
            <div>
              <Label htmlFor="mdId">Select Meseretawi</Label>
              <select
                value={mdId}
                onChange={(e) => setMdId(Number(e.target.value))}
                required
                className="w-full border-gray-300 rounded"
              >
                <option value={0}>Select a Meseretawi</option>
                {meseretawiOptions.map((option: { id: number; firstName: string; lastName: string }) => (
                  <option key={option.id} value={option.id}>
                    {option.firstName} {option.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className='flex justify-between'>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader /> : 'Submit'}
            </Button>
            <Link href="/">
            <Button type="submit" disabled={loading} className="w-full">
              Login
            </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
