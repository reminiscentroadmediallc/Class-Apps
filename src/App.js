import React, { useState } from 'react';
import { useApp } from './contexts/AppContext';
import Dashboard from './pages/Dashboard';
import PodManagement from './pages/PodManagement';
import PeerAssessment from './pages/PeerAssessment';
import SelfAssessment from './pages/SelfAssessment';
import TeacherGrading from './pages/TeacherGrading';
import ImportExport from './pages/ImportExport';
import GradeCalculator from './pages/GradeCalculator';
import { LayoutDashboard, Users, ClipboardCheck, User, GraduationCap, Upload, Calculator, Shield, ShieldOff, Lock } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('self-assessment');
  const { isAdmin, setIsAdmin } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin password - in production, this should be handled server-side
  const ADMIN_PASSWORD = 'admin2024';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    // Reset to student view
    setActiveTab('self-assessment');
  };

  // Define tabs with admin restrictions
  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
    { id: 'pods', label: 'Pod Management', icon: Users, adminOnly: true },
    { id: 'self-assessment', label: 'Student Self-Eval', icon: User, adminOnly: false },
    { id: 'assessment', label: 'Peer Assessment', icon: ClipboardCheck, adminOnly: true },
    { id: 'teacher', label: 'Teacher Grading', icon: GraduationCap, adminOnly: true },
    { id: 'grades', label: 'Grade Calculator', icon: Calculator, adminOnly: true },
    { id: 'import', label: 'Import/Export', icon: Upload, adminOnly: true }
  ];

  // Filter tabs based on admin status
  const visibleTabs = allTabs.filter(tab => !tab.adminOnly || isAdmin);

  const renderContent = () => {
    // Double-check admin access for restricted content
    const currentTab = allTabs.find(t => t.id === activeTab);
    if (currentTab?.adminOnly && !isAdmin) {
      setActiveTab('self-assessment');
      return <SelfAssessment />;
    }

    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? <Dashboard /> : <SelfAssessment />;
      case 'pods':
        return isAdmin ? <PodManagement /> : <SelfAssessment />;
      case 'self-assessment':
        return <SelfAssessment />;
      case 'assessment':
        return isAdmin ? <PeerAssessment /> : <SelfAssessment />;
      case 'teacher':
        return isAdmin ? <TeacherGrading /> : <SelfAssessment />;
      case 'grades':
        return isAdmin ? <GradeCalculator /> : <SelfAssessment />;
      case 'import':
        return isAdmin ? <ImportExport /> : <SelfAssessment />;
      default:
        return <SelfAssessment />;
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 style={{ marginBottom: '8px' }}>Pod Grading System</h1>
            <p className="text-muted">
              {isAdmin
                ? 'Admin Mode: Manage student pods, conduct peer assessments, and calculate grades'
                : 'Student Mode: Complete your self and peer evaluations'
              }
            </p>
          </div>
          <div>
            {isAdmin ? (
              <button
                className="btn btn-warning"
                onClick={handleLogout}
              >
                <ShieldOff size={18} />
                Logout Admin
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setShowLoginModal(true)}
              >
                <Shield size={18} />
                Admin Login
              </button>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="alert alert-warning" style={{ marginTop: '10px', padding: '10px' }}>
            <Shield size={16} />
            <strong>Admin Mode Active</strong> - You have access to all features including grades and student data.
          </div>
        )}
      </div>

      <div className="tab-container">
        <div className="tabs">
          {visibleTabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.adminOnly && <Lock size={12} style={{ marginLeft: '4px', opacity: 0.6 }} />}
            </div>
          ))}
        </div>
        <div className="tab-content">
          {renderContent()}
        </div>
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>
                <Shield size={24} style={{ marginRight: '10px' }} />
                Admin Login
              </h2>
              <button className="close-btn" onClick={() => {
                setShowLoginModal(false);
                setPassword('');
                setLoginError('');
              }}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info mb-4">
                Enter the admin password to access teacher features, grades, and student data.
              </div>

              {loginError && (
                <div className="alert alert-danger mb-4">
                  {loginError}
                </div>
              )}

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowLoginModal(false);
                  setPassword('');
                  setLoginError('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleLogin}
              >
                <Lock size={16} /> Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
