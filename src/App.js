import React, { useState } from 'react';
import { useApp } from './contexts/AppContext';
import Dashboard from './pages/Dashboard';
import PodManagement from './pages/PodManagement';
import PeerAssessment from './pages/PeerAssessment';
import SelfAssessment from './pages/SelfAssessment';
import TeacherGrading from './pages/TeacherGrading';
import ImportExport from './pages/ImportExport';
import GradeCalculator from './pages/GradeCalculator';
import { LayoutDashboard, Users, ClipboardCheck, User, GraduationCap, Upload, Calculator } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { state } = useApp();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pods', label: 'Pod Management', icon: Users },
    { id: 'self-assessment', label: 'Student Self-Eval', icon: User },
    { id: 'assessment', label: 'Peer Assessment', icon: ClipboardCheck },
    { id: 'teacher', label: 'Teacher Grading', icon: GraduationCap },
    { id: 'grades', label: 'Grade Calculator', icon: Calculator },
    { id: 'import', label: 'Import/Export', icon: Upload }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pods':
        return <PodManagement />;
      case 'self-assessment':
        return <SelfAssessment />;
      case 'assessment':
        return <PeerAssessment />;
      case 'teacher':
        return <TeacherGrading />;
      case 'grades':
        return <GradeCalculator />;
      case 'import':
        return <ImportExport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ marginBottom: '8px' }}>Pod Grading System</h1>
        <p className="text-muted">
          Manage student pods, conduct peer assessments, and calculate grades
        </p>
      </div>

      <div className="tab-container">
        <div className="tabs">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </div>
          ))}
        </div>
        <div className="tab-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
