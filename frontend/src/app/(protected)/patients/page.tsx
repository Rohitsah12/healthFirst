"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Funnel, Trash2, Edit, User, UserPlus } from "lucide-react";
import { patientApi } from "../../services/patientApi";
import type { Patient } from "../../types/patient.types";
import Pagination from "../../components/shared/Pagination";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import AddEditPatientModal from "../../components/patients/AddEditPatientModal";
import DeletePatientModal from "../../components/patients/DeletePatientModal";
import { calcAge } from "../../utils/calcAge";

const exampleRows: Patient[] = [
  {
    id: "ex1",
    name: "Rajesh Kumar",
    phone: "+977-9841234567",
    dob: "1980-01-01T00:00:00.000Z",
    gender: "MALE",
    address: null,
    createdAt: undefined,
    updatedAt: undefined,
  },
  {
    id: "ex2",
    name: "Priya Singh",
    phone: "+977-9841234568",
    dob: "1993-05-10T00:00:00.000Z",
    gender: "FEMALE",
    address: null,
    createdAt: undefined,
    updatedAt: undefined,
  },
  {
    id: "ex3",
    name: "Amit Thapa",
    phone: "+977-9841234569",
    dob: "1997-08-22T00:00:00.000Z",
    gender: "MALE",
    address: null,
    createdAt: undefined,
    updatedAt: undefined,
  },
  {
    id: "ex4",
    name: "Sunita Khatri",
    phone: "+977-9841234570",
    dob: "1987-03-12T00:00:00.000Z",
    gender: "FEMALE",
    address: null,
    createdAt: undefined,
    updatedAt: undefined,
  },
];

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 9,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const fetchPatients = async (page = pagination.currentPage) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientApi.getPatients({
        page,
        limit: pagination.limit,
        search: search || undefined,
      });
      setPatients(data.patients);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchPatients(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const openAdd = () => {
    setEditingPatient(null);
    setShowAddEdit(true);
  };

  const openEdit = (p: Patient) => {
    setEditingPatient(p);
    setShowAddEdit(true);
  };

  const onAddEditSuccess = () => {
    setShowAddEdit(false);
    setEditingPatient(null);
    fetchPatients(1);
  };

  const onDeleteSuccess = () => {
    setDeletingPatient(null);
    fetchPatients(1);
  };

  const exampleRows = [
    {
      id: "ex1",
      name: "Rajesh Kumar",
      phone: "+977-9841234567",
      dob: "1980-01-01",
      gender: "MALE",
    },
    {
      id: "ex2",
      name: "Priya Singh",
      phone: "+977-9841234568",
      dob: "1993-05-10",
      gender: "FEMALE",
    },
    {
      id: "ex3",
      name: "Amit Thapa",
      phone: "+977-9841234569",
      dob: "1997-08-22",
      gender: "MALE",
    },
    {
      id: "ex4",
      name: "Sunita Khatri",
      phone: "+977-9841234570",
      dob: "1987-03-12",
      gender: "FEMALE",
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-[#f8f9fb]">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
          <p className="text-gray-600 mt-1">
            Manage patient records and history
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1f4fcf] text-white px-5 py-3 rounded-lg shadow font-semibold"
        >
          <UserPlus />
          <span> Add New Patient</span>
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Search + Filter */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-1 relative max-w-xl">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search patients by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#2563eb] focus:outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {(patients.length === 0 ? exampleRows : patients).map(
                  (p: Patient) => {
                    const age = calcAge(p.dob);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <User />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {p.name}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-gray-700">{p.phone}</td>
                        <td className="py-4 px-4 text-gray-700">{age}</td>

                        <td className="py-4 px-4">
                          <span className="inline-block px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                            {p.gender === "MALE"
                              ? "Male"
                              : p.gender === "FEMALE"
                              ? "Female"
                              : "Other"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-3">
                            <button
                              onClick={() => openEdit(p)}
                              title="Edit"
                              className="p-2 rounded hover:bg-blue-50"
                            >
                              <Edit className="text-[#2563eb]" />
                            </button>

                            <button
                              onClick={() => setDeletingPatient(p)}
                              title="Delete"
                              className="p-2 rounded hover:bg-red-50"
                            >
                              <Trash2 className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalCount}
                  onPageChange={handlePageChange}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddEdit && (
        <AddEditPatientModal
          patient={editingPatient}
          onClose={() => {
            setShowAddEdit(false);
            setEditingPatient(null);
          }}
          onSuccess={onAddEditSuccess}
        />
      )}

      {/* Delete modal */}
      {deletingPatient && (
        <DeletePatientModal
          patient={deletingPatient}
          onClose={() => setDeletingPatient(null)}
          onSuccess={onDeleteSuccess}
        />
      )}
    </div>
  );
};

export default PatientsPage;
