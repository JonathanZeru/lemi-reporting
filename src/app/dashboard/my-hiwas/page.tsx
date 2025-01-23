'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiURL } from '@/utils/constants/constants';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { toast } from '@/components/ui/use-toast';
import { Hiwas } from '@/types/types';
import { useRouter } from "next/navigation"

const MyHiwasTable = () => {
  const [hiwas, setHiwas] = useState<Hiwas[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    first: 0,
    rows: 10,
  });

  const navigate = useRouter(); 
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      fetchHiwas(user.id);
    }
  }, []);

  const fetchHiwas = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiURL}api/hiwas/by-meseretawi?meseretawiDirijetId=${userId}`);
      setHiwas(response.data);
    } catch (error) {
      console.error('Error fetching Hiwas data:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching Hiwas data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex gap-5">
        <Input
          className="w-64 rounded-lg"
          type="text"
          placeholder="Search Hiwas"
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Navigate to a specific URL when a row is clicked
  const handleRowClick = (id: number) => {
    navigate.push(`/dashboard/my-hiwas/schedule/${id}`);  // You can change the URL pattern as per your requirement
  };

  return (
    <div className="container mx-auto py-8">
      <div className="rounded-md border overflow-hidden">
        <DataTable
          value={hiwas}
          paginator
          rows={pagination.rows}
          first={pagination.first}
          onPage={(e) => setPagination({ first: e.first, rows: e.rows })}
          globalFilter={globalFilter}
          header={renderHeader()}
          loading={loading}
        >
          <Column
            field="firstName"
            header="First Name"
            filter
            filterPlaceholder="Search by First Name"
          />
          <Column
            field="lastName"
            header="Last Name"
            filter
            filterPlaceholder="Search by Last Name"
          />
          <Column field="email" header="Email" />
          <Column field="phone" header="Phone" />
          <Column field="userName" header="Username" />
          <Column
            field="createdAt"
            header="Created At"
            body={(rowData: Hiwas) => formatDate(rowData.createdAt)}
          />
          <Column
            header="Actions"
            body={(rowData: Hiwas) => (
              <>
                <Button variant="outline" className="mr-2 bg-primary" onClick={(e) => handleRowClick(rowData.id)}>
                  Show Schedule
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    alert(`Delete ${rowData.id}`);
                    // You can implement a delete function here
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default MyHiwasTable;
