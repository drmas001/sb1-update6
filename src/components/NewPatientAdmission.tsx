import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Calendar, Clock, User, Users, Activity, X, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

interface PatientData {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  admission_time: string;
  assigned_doctor: string;
  specialty: string;
  diagnosis: string;
}

const specialtiesList = [
  'General Internal Medicine',
  'Respiratory Medicine',
  'Infectious Diseases',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Hematology',
  'Thrombosis Medicine',
  'Immunology & Allergy'
];

const NewPatientAdmission: React.FC = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData>({
    mrn: '',
    patient_name: '',
    age: 0,
    gender: '',
    admission_date: '',
    admission_time: '',
    assigned_doctor: '',
    specialty: '',
    diagnosis: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Insert into patients table
      const { data: patientInsert, error: patientError } = await supabase
        .from('patients')
        .insert([patientData])
        .select();

      if (patientError) throw patientError;

      // Insert into visits table
      const { data: visitInsert, error: visitError } = await supabase
        .from('visits')
        .insert([{
          mrn: patientData.mrn,
          admission_date: `${patientData.admission_date}T${patientData.admission_time}`,
          specialty: patientData.specialty,
          patient_status: 'Active',
          diagnosis: patientData.diagnosis
        }]);

      if (visitError) throw visitError;

      toast.success('Patient admitted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to admit patient');
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">New Patient Admission</h1>
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Existing form fields... */}
                
                <div className="sm:col-span-6">
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                    Diagnosis
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <textarea
                      id="diagnosis"
                      name="diagnosis"
                      rows={3}
                      value={patientData.diagnosis}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter initial diagnosis"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Admit Patient
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientAdmission;