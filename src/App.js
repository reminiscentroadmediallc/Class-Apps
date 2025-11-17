import React, { useState, useEffect } from 'react';
import { useApp } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import PodManagement from './pages/PodManagement';
import PeerAssessment from './pages/PeerAssessment';
import SelfAssessment from './pages/SelfAssessment';
import TeacherGrading from './pages/TeacherGrading';
import ImportExport from './pages/ImportExport';
import GradeCalculator from './pages/GradeCalculator';
import { VERSION, RELEASE_NAME, VERSION_HISTORY } from './version';
import { LayoutDashboard, Users, ClipboardCheck, User, GraduationCap, Upload, Calculator, Shield, ShieldOff, Lock, Info } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('self-assessment');
  const { isAdmin, setIsAdmin } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Log version on mount
  useEffect(() => {
    console.log(`App loaded: v${VERSION} - ${RELEASE_NAME}`);
  }, []);

  // Enforce admin access restrictions - redirect if access is lost
  useEffect(() => {
    const currentTab = allTabs.find(t => t.id === activeTab);
    if (currentTab?.adminOnly && !isAdmin) {
      // User lost admin access or tried to access restricted tab, redirect to student view
      setActiveTab('self-assessment');
    }
  }, [activeTab, isAdmin, allTabs]);

  // Admin password - in production, this should be handled server-side
  const ADMIN_PASSWORD = 'TSA2025';

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
    switch (activeTab) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        );
      case 'pods':
        return (
          <ErrorBoundary>
            <PodManagement />
          </ErrorBoundary>
        );
      case 'self-assessment':
        return (
          <ErrorBoundary>
            <SelfAssessment />
          </ErrorBoundary>
        );
      case 'assessment':
        return (
          <ErrorBoundary>
            <PeerAssessment />
          </ErrorBoundary>
        );
      case 'teacher':
        return (
          <ErrorBoundary>
            <TeacherGrading />
          </ErrorBoundary>
        );
      case 'grades':
        return (
          <ErrorBoundary>
            <GradeCalculator />
          </ErrorBoundary>
        );
      case 'import':
        return (
          <ErrorBoundary>
            <ImportExport />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <SelfAssessment />
          </ErrorBoundary>
        );
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

      {/* Version Info Modal */}
      {showVersionModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>
                <Info size={24} style={{ marginRight: '10px' }} />
                Version Information
              </h2>
              <button className="close-btn" onClick={() => setShowVersionModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-success mb-4">
                <strong>Current Version:</strong> v{VERSION} - {RELEASE_NAME}
              </div>

              <h3 style={{ marginBottom: '15px' }}>Version History</h3>
              {VERSION_HISTORY.map((release, index) => (
                <div key={release.version} className="card" style={{ marginBottom: '15px' }}>
                  <div className="card-header">
                    <strong>v{release.version}</strong> - {release.name}
                    <span className="text-muted" style={{ float: 'right' }}>{release.date}</span>
                  </div>
                  <div className="card-body">
                    <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                      {release.features.map((feature, i) => (
                        <li key={i} style={{ marginBottom: '5px' }}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setShowVersionModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version Footer */}
      <footer style={{
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Pod Grading System</strong> | Science Ambassador Media Project
        </div>
        <div>
          <button
            onClick={() => setShowVersionModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
              padding: 0
            }}
          >
            <Info size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Version {VERSION}
          </button>
          <span style={{ margin: '0 10px' }}>|</span>
          <span>{RELEASE_NAME}</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
          {isAdmin ? '🔓 Admin Mode Active' : '🔒 Student Mode'}
        </div>
      </footer>
    </div>
  );
}

export default App;
