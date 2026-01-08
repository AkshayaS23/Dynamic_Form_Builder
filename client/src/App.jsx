import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/Landing/LandingPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MyFormsPage from './pages/Admin/MyFormsPage';
import FormDetail from './pages/Admin/FormDetail';
import FormEditor from './pages/Admin/FormEditor';
import ViewResponses from './pages/Admin/ViewResponses';
import FillForm from './pages/User/FillForm';
import UserDashboard from './pages/User/UserDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/forms/create" element={<FormEditor />} />
        <Route path="/forms/edit/:id" element={<FormEditor />} />
        <Route path="/forms/fill/:id" element={<FillForm />} />
        <Route path="/forms/responses/:id" element={<ViewResponses />} />
        <Route path="/forms" element={<MyFormsPage />} />
        <Route path="/forms/:id" element={<FormDetail/>} />
      </Routes>
    </div>
  );
}
