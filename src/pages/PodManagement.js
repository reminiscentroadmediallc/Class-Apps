import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING, ROLES } from '../data/initialStudents';
import { Users, Plus, Trash2, UserCheck, Search, Edit3 } from 'lucide-react';

const PodManagement = () => {
  const { state, dispatch, getStudentsByPeriod, getPodsByPeriod, getPodMembers } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ podNumber: '', role: '', sharedRole: false, sharedWith: [] });

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const currentPeriodStudents = getStudentsByPeriod(selectedPeriod);
  const currentPods = getPodsByPeriod(selectedPeriod);

  const filteredStudents = currentPeriodStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unassignedStudents = filteredStudents.filter(s => !s.podNumber);
  const assignedStudents = filteredStudents.filter(s => s.podNumber);

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

    if (assignmentData.role) {
      dispatch({
        type: 'ASSIGN_ROLE',
        payload: {
          studentId: selectedStudent.id,
          role: assignmentData.role,
          sharedRole: assignmentData.sharedRole,
          sharedWith: assignmentData.sharedWith
        }
      });
    }

    setShowAssignModal(false);
    setSelectedStudent(null);
    setAssignmentData({ podNumber: '', role: '', sharedRole: false, sharedWith: [] });
  };

  const handleRemoveFromPod = (studentId) => {
    if (window.confirm('Remove this student from their pod?')) {
      dispatch({
        type: 'REMOVE_FROM_POD',
        payload: { studentId }
      });
    }
  };

  const handleUpdateRole = () => {
    if (!selectedStudent) return;

    dispatch({
      type: 'ASSIGN_ROLE',
      payload: {
        studentId: selectedStudent.id,
        role: assignmentData.role,
        sharedRole: assignmentData.sharedRole,
        sharedWith: assignmentData.sharedWith
      }
    });

    setShowRoleModal(false);
    setSelectedStudent(null);
    setAssignmentData({ podNumber: '', role: '', sharedRole: false, sharedWith: [] });
  };

  const openRoleModal = (student) => {
    setSelectedStudent(student);
    setAssignmentData({
      podNumber: student.podNumber,
      role: student.role || '',
      sharedRole: student.sharedRole || false,
      sharedWith: student.sharedWith || []
    });
    setShowRoleModal(true);
  };

  const getPodMembersForSharing = () => {
    if (!selectedStudent || !selectedStudent.podNumber) return [];
    const podKey = `${selectedPeriod}_${selectedStudent.podNumber}`;
    return getPodMembers(podKey).filter(m => m.id !== selectedStudent.id);
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
                            {member.role ? (
                              <>
                                {member.role}
                                {member.sharedRole && <span className="text-warning"> (Shared)</span>}
                              </>
                            ) : (
                              <span className="text-muted">No role assigned</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openRoleModal(member)}
                            title="Edit Role"
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
                <label>Role (Optional)</label>
                <select
                  value={assignmentData.role}
                  onChange={(e) => setAssignmentData({ ...assignmentData, role: e.target.value })}
                >
                  <option value="">Select a role...</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {assignmentData.role && (
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="sharedRole"
                      checked={assignmentData.sharedRole}
                      onChange={(e) => setAssignmentData({ ...assignmentData, sharedRole: e.target.checked })}
                    />
                    <label htmlFor="sharedRole" style={{ marginBottom: 0 }}>This role is shared with another team member</label>
                  </div>
                </div>
              )}
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

      {/* Edit Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Role</h2>
              <button className="close-btn" onClick={() => setShowRoleModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                Student: <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>
                <br />
                Pod: <strong>{selectedStudent?.podNumber}</strong>
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={assignmentData.role}
                  onChange={(e) => setAssignmentData({ ...assignmentData, role: e.target.value })}
                >
                  <option value="">Select a role...</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {assignmentData.role && (
                <>
                  <div className="form-group">
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="sharedRoleEdit"
                        checked={assignmentData.sharedRole}
                        onChange={(e) => setAssignmentData({ ...assignmentData, sharedRole: e.target.checked, sharedWith: [] })}
                      />
                      <label htmlFor="sharedRoleEdit" style={{ marginBottom: 0 }}>This role is shared with another team member</label>
                    </div>
                  </div>

                  {assignmentData.sharedRole && (
                    <div className="form-group">
                      <label>Shared With:</label>
                      {getPodMembersForSharing().map(member => (
                        <div key={member.id} className="checkbox-group" style={{ marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            id={`share-${member.id}`}
                            checked={assignmentData.sharedWith.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignmentData({
                                  ...assignmentData,
                                  sharedWith: [...assignmentData.sharedWith, member.id]
                                });
                              } else {
                                setAssignmentData({
                                  ...assignmentData,
                                  sharedWith: assignmentData.sharedWith.filter(id => id !== member.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`share-${member.id}`} style={{ marginBottom: 0 }}>
                            {member.firstName} {member.lastName}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleUpdateRole}>
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodManagement;
