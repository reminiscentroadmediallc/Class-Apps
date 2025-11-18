import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING, ROLES } from '../data/initialStudents';
import { Users, Plus, Trash2, UserCheck, Search, Edit3, Award } from 'lucide-react';

const PodManagement = () => {
  const { state, dispatch, getStudentsByPeriod, getPodsByPeriod, getPodMembers } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ podNumber: '', roles: [], sharedRoles: {} });

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const currentPeriodStudents = useMemo(
    () => getStudentsByPeriod(selectedPeriod),
    [selectedPeriod]
  );

  const currentPods = useMemo(
    () => getPodsByPeriod(selectedPeriod),
    [selectedPeriod]
  );

  // Memoize expensive chained filter operations
  const { filteredStudents, unassignedStudents, assignedStudents } = useMemo(() => {
    const filtered = currentPeriodStudents.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      filteredStudents: filtered,
      unassignedStudents: filtered.filter(s => !s.podNumber),
      assignedStudents: filtered.filter(s => s.podNumber)
    };
  }, [currentPeriodStudents, searchTerm]);

  const handleAssignPod = () => {
    if (!selectedStudent || !assignmentData.podNumber) return;

    dispatch({
      type: 'ASSIGN_POD',
      payload: {
        studentId: selectedStudent.id,
        podNumber: parseInt(assignmentData.podNumber),
        period: selectedPeriod
      }
    });

    if (assignmentData.roles.length > 0) {
      dispatch({
        type: 'ASSIGN_ROLES',
        payload: {
          studentId: selectedStudent.id,
          roles: assignmentData.roles,
          sharedRoles: assignmentData.sharedRoles
        }
      });
    }

    setShowAssignModal(false);
    setSelectedStudent(null);
    setAssignmentData({ podNumber: '', roles: [], sharedRoles: {} });
  };

  const handleRemoveFromPod = (studentId) => {
    if (window.confirm('Remove this student from their pod?')) {
      dispatch({
        type: 'REMOVE_FROM_POD',
        payload: { studentId }
      });
    }
  };

  const handleUpdateRoles = () => {
    if (!selectedStudent) return;

    dispatch({
      type: 'ASSIGN_ROLES',
      payload: {
        studentId: selectedStudent.id,
        roles: assignmentData.roles,
        sharedRoles: assignmentData.sharedRoles
      }
    });

    setShowRoleModal(false);
    setSelectedStudent(null);
    setAssignmentData({ podNumber: '', roles: [], sharedRoles: {} });
  };

  const openRoleModal = (student) => {
    setSelectedStudent(student);
    setAssignmentData({
      podNumber: student.podNumber,
      roles: student.roles || [],
      sharedRoles: student.sharedRoles || {}
    });
    setShowRoleModal(true);
  };

  const toggleRole = (role) => {
    const newRoles = assignmentData.roles.includes(role)
      ? assignmentData.roles.filter(r => r !== role)
      : [...assignmentData.roles, role];

    // Clean up sharedRoles for removed roles
    const newSharedRoles = { ...assignmentData.sharedRoles };
    if (!newRoles.includes(role)) {
      delete newSharedRoles[role];
    }

    setAssignmentData({ ...assignmentData, roles: newRoles, sharedRoles: newSharedRoles });
  };

  const getRoleDisplay = (student) => {
    if (!student.roles || student.roles.length === 0) {
      return <span className="text-muted">No roles assigned</span>;
    }

    return (
      <div style={{ fontSize: '12px' }}>
        {student.roles.map((role, idx) => (
          <span key={role}>
            {role}
            {student.sharedRoles && student.sharedRoles[role] && (
              <span className="text-warning"> (Shared)</span>
            )}
            {idx < student.roles.length - 1 && ', '}
          </span>
        ))}
        {student.roles.length > 1 && (
          <span className="badge badge-success" style={{ marginLeft: '8px', fontSize: '10px' }}>
            <Award size={10} /> +{(student.roles.length - 1) * 5}% Bonus
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2>Pod Management</h2>

      {/* Period Selector */}
      <div className="period-selector">
        {periods.map(([homeroom, info]) => (
          <button
            key={homeroom}
            className={`period-btn ${selectedPeriod === info.period ? 'active' : ''}`}
            onClick={() => setSelectedPeriod(info.period)}
          >
            {info.name}
          </button>
        ))}
      </div>

      {/* Search and Stats */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div className="flex gap-4">
            <span className="badge badge-gray">Total: {currentPeriodStudents.length}</span>
            <span className="badge badge-success">In Pods: {assignedStudents.length}</span>
            <span className="badge badge-warning">Unassigned: {unassignedStudents.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Unassigned Students */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} />
            Unassigned Students ({unassignedStudents.length})
          </h3>
          {unassignedStudents.length === 0 ? (
            <div className="alert alert-success">All students assigned to pods!</div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {unassignedStudents.map(student => (
                <div key={student.id} className="member-item">
                  <div>
                    <div className="member-name">{student.firstName} {student.lastName}</div>
                    <div className="member-role">{student.homeroom}</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setAssignmentData({ podNumber: '', roles: [], sharedRoles: {} });
                      setShowAssignModal(true);
                    }}
                  >
                    <Plus size={14} /> Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Pods */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={20} />
            Current Pods ({currentPods.length})
          </h3>
          {currentPods.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>No pods created yet. Assign students to create pods.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {currentPods.sort((a, b) => a.podNumber - b.podNumber).map(pod => {
                const members = getPodMembers(pod.id);
                return (
                  <div key={pod.id} className="pod-card" style={{ marginBottom: '12px' }}>
                    <div className="pod-header">
                      <div className="pod-title">Pod {pod.podNumber}</div>
                      <span className="badge badge-primary">{members.length} members</span>
                    </div>
                    {members.map(member => (
                      <div key={member.id} className="member-item">
                        <div>
                          <div className="member-name">{member.firstName} {member.lastName}</div>
                          <div className="member-role">
                            {getRoleDisplay(member)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openRoleModal(member)}
                            title="Edit Roles"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveFromPod(member.id)}
                            title="Remove from Pod"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assign to Pod Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Assign to Pod</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                Assigning: <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>
              </div>

              <div className="form-group">
                <label>Pod Number</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={assignmentData.podNumber}
                  onChange={(e) => setAssignmentData({ ...assignmentData, podNumber: e.target.value })}
                  placeholder="Enter pod number (1-10)"
                />
              </div>

              <div className="form-group">
                <label>Roles (Select all that apply)</label>
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  {ROLES.map(role => (
                    <div key={role} className="checkbox-group" style={{ marginBottom: '8px' }}>
                      <input
                        type="checkbox"
                        id={`assign-role-${role}`}
                        checked={assignmentData.roles.includes(role)}
                        onChange={() => toggleRole(role)}
                      />
                      <label htmlFor={`assign-role-${role}`} style={{ marginBottom: 0 }}>
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
                {assignmentData.roles.length > 1 && (
                  <div className="alert alert-success" style={{ marginTop: '10px', padding: '8px' }}>
                    <Award size={16} />
                    Student will receive <strong>+{(assignmentData.roles.length - 1) * 5}%</strong> bonus for taking on multiple roles!
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssignPod}
                disabled={!assignmentData.podNumber}
              >
                Assign to Pod
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Roles Modal */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Roles</h2>
              <button className="close-btn" onClick={() => setShowRoleModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                Student: <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>
                <br />
                Pod: <strong>{selectedStudent?.podNumber}</strong>
              </div>

              <div className="form-group">
                <label>Roles (Select all that apply)</label>
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  {ROLES.map(role => (
                    <div key={role} style={{ marginBottom: '12px' }}>
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          id={`edit-role-${role}`}
                          checked={assignmentData.roles.includes(role)}
                          onChange={() => toggleRole(role)}
                        />
                        <label htmlFor={`edit-role-${role}`} style={{ marginBottom: 0, fontWeight: '600' }}>
                          {role}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {assignmentData.roles.length > 1 && (
                  <div className="alert alert-success" style={{ marginTop: '10px', padding: '8px' }}>
                    <Award size={16} />
                    Student will receive <strong>+{(assignmentData.roles.length - 1) * 5}%</strong> bonus for taking on {assignmentData.roles.length} roles!
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleUpdateRoles}>
                Update Roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodManagement;
