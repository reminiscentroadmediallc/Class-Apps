import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING, ROLES } from '../data/initialStudents';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';

const StudentMasterList = () => {
  const { state, dispatch } = useApp();
  const [editingStudents, setEditingStudents] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    homeroom: '7C',
    podNumber: null,
    roles: []
  });
  const [errors, setErrors] = useState({});

  const handleEditChange = (studentId, field, value) => {
    setEditingStudents({
      ...editingStudents,
      [studentId]: {
        ...editingStudents[studentId],
        [field]: value
      }
    });
  };

  const handleAddStudent = () => {
    const validationErrors = {};
    if (!newStudent.firstName.trim()) validationErrors.firstName = 'First name required';
    if (!newStudent.lastName.trim()) validationErrors.lastName = 'Last name required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    dispatch({
      type: 'ADD_STUDENT',
      payload: {
        firstName: newStudent.firstName.trim(),
        lastName: newStudent.lastName.trim(),
        homeroom: newStudent.homeroom,
        podNumber: newStudent.podNumber ? parseInt(newStudent.podNumber) : null,
        roles: newStudent.roles
      }
    });

    setNewStudent({
      firstName: '',
      lastName: '',
      homeroom: '7C',
      podNumber: null,
      roles: []
    });
    setShowAddForm(false);
    setErrors({});
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      dispatch({ type: 'DELETE_STUDENT', payload: studentId });
    }
  };

  const handleSaveAllChanges = () => {
    // Apply all editing changes
    Object.entries(editingStudents).forEach(([studentId, updates]) => {
      const student = state.students.find(s => s.id === studentId);
      if (!student) return;

      // If homeroom changed, use special action that clears pod/roles
      if (updates.homeroom && updates.homeroom !== student.homeroom) {
        dispatch({
          type: 'UPDATE_STUDENT_HOMEROOM',
          payload: {
            studentId,
            homeroom: updates.homeroom
          }
        });
      } else {
        // Otherwise update normally
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: {
            id: studentId,
            updates: {
              firstName: updates.firstName ?? student.firstName,
              lastName: updates.lastName ?? student.lastName,
              homeroom: updates.homeroom ?? student.homeroom,
              podNumber: updates.podNumber ?? student.podNumber,
              roles: updates.roles ?? student.roles
            }
          }
        });
      }
    });

    setEditingStudents({});
    alert('All changes saved successfully!');
  };

  const getRoleCheckboxes = (studentId) => {
    const student = state.students.find(s => s.id === studentId);
    const currentRoles = editingStudents[studentId]?.roles ?? student?.roles ?? [];

    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {ROLES.map(role => (
          <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={currentRoles.includes(role)}
              onChange={(e) => {
                const newRoles = e.target.checked
                  ? [...currentRoles, role]
                  : currentRoles.filter(r => r !== role);
                handleEditChange(studentId, 'roles', newRoles);
              }}
            />
            <span style={{ fontSize: '12px' }}>{role}</span>
          </label>
        ))}
      </div>
    );
  };

  const students = state.students.sort((a, b) =>
    a.firstName.localeCompare(b.firstName)
  );

  const hasChanges = Object.keys(editingStudents).length > 0;

  return (
    <div>
      <h2>Master Student List</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ marginRight: '10px' }}
        >
          <Plus size={18} /> Add New Student
        </button>
        {hasChanges && (
          <button
            className="btn btn-success"
            onClick={handleSaveAllChanges}
          >
            <Save size={18} /> Save All Changes
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
          <h3>Add New Student</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                placeholder="Enter first name"
              />
              {errors.firstName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                placeholder="Enter last name"
              />
              {errors.lastName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.lastName}</span>}
            </div>
            <div className="form-group">
              <label>Homeroom</label>
              <select
                value={newStudent.homeroom}
                onChange={(e) => setNewStudent({ ...newStudent, homeroom: e.target.value })}
              >
                {Object.entries(PERIOD_MAPPING).map(([code, info]) => (
                  <option key={code} value={code}>{code} - {info.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Pod Number</label>
              <input
                type="number"
                value={newStudent.podNumber || ''}
                onChange={(e) => setNewStudent({ ...newStudent, podNumber: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Leave blank if not assigned yet"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Roles</label>
              {getRoleCheckboxes('new')}
            </div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <button className="btn btn-success" onClick={handleAddStudent} style={{ marginRight: '10px' }}>
              Add Student
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>First Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Last Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Homeroom</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Period</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Pod #</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Roles</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              const editing = editingStudents[student.id] || student;
              return (
                <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>
                    <input
                      type="text"
                      value={editing.firstName || ''}
                      onChange={(e) => handleEditChange(student.id, 'firstName', e.target.value)}
                      style={{ width: '100%', padding: '5px', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input
                      type="text"
                      value={editing.lastName || ''}
                      onChange={(e) => handleEditChange(student.id, 'lastName', e.target.value)}
                      style={{ width: '100%', padding: '5px', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <select
                      value={editing.homeroom || ''}
                      onChange={(e) => handleEditChange(student.id, 'homeroom', e.target.value)}
                      style={{ width: '100%', padding: '5px', borderRadius: '4px' }}
                    >
                      {Object.entries(PERIOD_MAPPING).map(([code, info]) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
                    {PERIOD_MAPPING[editing.homeroom || student.homeroom]?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input
                      type="number"
                      value={editing.podNumber || ''}
                      onChange={(e) => handleEditChange(student.id, 'podNumber', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="—"
                      style={{ width: '60px', padding: '5px', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '10px' }}>
                    {getRoleCheckboxes(student.id)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteStudent(student.id)}
                      style={{ padding: '4px 8px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <div style={{ marginTop: '20px' }}>
          <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <span>You have unsaved changes. Click "Save All Changes" to persist them.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMasterList;
