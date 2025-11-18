import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING, ROLES } from '../data/initialStudents';
import { Plus, Trash2, Save, AlertCircle, ChevronUp, ChevronDown, Search } from 'lucide-react';

const StudentMasterList = () => {
  const { state, dispatch } = useApp();
  const [editingStudents, setEditingStudents] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('firstName'); // firstName, lastName, homeroom
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [changedRows, setChangedRows] = useState(new Set());
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    homeroom: '7C',
    podNumber: null,
    roles: []
  });
  const [errors, setErrors] = useState({});

  // Auto-save functionality
  useEffect(() => {
    if (Object.keys(editingStudents).length === 0) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      return;
    }

    // Clear previous timer
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    // Set new timer for auto-save (3 seconds after last change)
    const timer = setTimeout(() => {
      handleSaveAllChanges(true);
    }, 3000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [editingStudents]);

  const handleEditChange = (studentId, field, value) => {
    setEditingStudents(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));

    // Track which rows have been changed
    setChangedRows(prev => new Set([...prev, studentId]));
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
    setSaveMessage('Student added successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteStudent = (studentId) => {
    // Save any unsaved changes for this student first
    if (editingStudents[studentId]) {
      applyStudentChanges(studentId);
    }

    if (window.confirm('Are you sure you want to delete this student?')) {
      dispatch({ type: 'DELETE_STUDENT', payload: studentId });
      setChangedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      setSaveMessage('Student deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const applyStudentChanges = (studentId) => {
    const student = state.students.find(s => s.id === studentId);
    const updates = editingStudents[studentId];

    if (!student || !updates) return;

    try {
      const homeRoomChanged = updates.homeroom && updates.homeroom !== student.homeroom;

      if (homeRoomChanged) {
        // If homeroom changed, use special action
        dispatch({
          type: 'UPDATE_STUDENT_HOMEROOM',
          payload: {
            studentId,
            homeroom: updates.homeroom
          }
        });

        // Then apply other changes (except pod/roles which were cleared)
        const otherUpdates = {};
        if (updates.firstName) otherUpdates.firstName = updates.firstName;
        if (updates.lastName) otherUpdates.lastName = updates.lastName;

        if (Object.keys(otherUpdates).length > 0) {
          dispatch({
            type: 'UPDATE_STUDENT',
            payload: {
              id: studentId,
              updates: otherUpdates
            }
          });
        }
      } else {
        // Normal update - preserve pod/roles if not changing homeroom
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: {
            id: studentId,
            updates: {
              firstName: updates.firstName ?? student.firstName,
              lastName: updates.lastName ?? student.lastName,
              homeroom: updates.homeroom ?? student.homeroom,
              podNumber: updates.podNumber !== undefined ? updates.podNumber : student.podNumber,
              roles: updates.roles ?? student.roles
            }
          }
        });
      }
    } catch (error) {
      console.error('Error saving student changes:', error);
      setSaveMessage(`Error saving changes: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
      throw error;
    }
  };

  const handleSaveAllChanges = (isAutoSave = false) => {
    try {
      // Apply all editing changes
      Object.keys(editingStudents).forEach(studentId => {
        applyStudentChanges(studentId);
      });

      setEditingStudents({});
      setChangedRows(new Set());

      const message = isAutoSave ? 'Auto-saved successfully!' : 'All changes saved successfully!';
      setSaveMessage(message);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(`Error saving: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const getRoleCheckboxes = (studentId) => {
    const student = state.students.find(s => s.id === studentId);
    const currentRoles = editingStudents[studentId]?.roles ?? student?.roles ?? [];

    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {ROLES.map(role => (
          <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
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
            {role}
          </label>
        ))}
      </div>
    );
  };

  // Filter and sort students
  let filteredStudents = state.students.filter(s =>
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.homeroom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort students
  filteredStudents.sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'firstName':
        aVal = a.firstName.toLowerCase();
        bVal = b.firstName.toLowerCase();
        break;
      case 'lastName':
        aVal = a.lastName.toLowerCase();
        bVal = b.lastName.toLowerCase();
        break;
      case 'homeroom':
        aVal = a.homeroom?.toLowerCase() || '';
        bVal = b.homeroom?.toLowerCase() || '';
        break;
      default:
        return 0;
    }

    const comparison = aVal.localeCompare(bVal);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const hasChanges = Object.keys(editingStudents).length > 0;

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={14} style={{ opacity: 0.3 }} />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Master Student List</h2>

      {/* Search Bar */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <Search size={18} style={{ color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by name or homeroom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={18} /> Add Student
        </button>

        {hasChanges && (
          <button
            className="btn btn-success"
            onClick={() => handleSaveAllChanges(false)}
          >
            <Save size={18} /> Save ({Object.keys(editingStudents).length})
          </button>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#065f46'
        }}>
          {saveMessage}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3>Add New Student</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>First Name *</label>
              <input
                type="text"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                placeholder="Enter first name"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              />
              {errors.firstName && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.firstName}</span>}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Last Name *</label>
              <input
                type="text"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                placeholder="Enter last name"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              />
              {errors.lastName && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.lastName}</span>}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Homeroom</label>
              <select
                value={newStudent.homeroom}
                onChange={(e) => setNewStudent({ ...newStudent, homeroom: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              >
                {Object.entries(PERIOD_MAPPING).map(([code, info]) => (
                  <option key={code} value={code}>{code} - {info.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Pod Number</label>
              <input
                type="number"
                value={newStudent.podNumber || ''}
                onChange={(e) => setNewStudent({ ...newStudent, podNumber: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Optional"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Roles</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {ROLES.map(role => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newStudent.roles.includes(role)}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...newStudent.roles, role]
                          : newStudent.roles.filter(r => r !== role);
                        setNewStudent({ ...newStudent, roles: newRoles });
                      }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success" onClick={handleAddStudent}>
              Add Student
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }} onClick={() => toggleSort('firstName')}>
                  First Name
                  <SortIcon field="firstName" />
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }} onClick={() => toggleSort('lastName')}>
                  Last Name
                  <SortIcon field="lastName" />
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }} onClick={() => toggleSort('homeroom')}>
                  Homeroom
                  <SortIcon field="homeroom" />
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Period</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Pod #</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Roles</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const isEditing = editingStudents[student.id];
                  const isChanged = changedRows.has(student.id);
                  const editing = isEditing || student;
                  const rowBackground = isChanged ? '#fef3c7' : 'transparent';

                  return (
                    <tr
                      key={student.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: rowBackground,
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={editing.firstName || ''}
                          onChange={(e) => handleEditChange(student.id, 'firstName', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="text"
                          value={editing.lastName || ''}
                          onChange={(e) => handleEditChange(student.id, 'lastName', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={editing.homeroom || ''}
                          onChange={(e) => handleEditChange(student.id, 'homeroom', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        >
                          {Object.entries(PERIOD_MAPPING).map(([code, info]) => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                        {PERIOD_MAPPING[editing.homeroom || student.homeroom]?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="number"
                          value={editing.podNumber || ''}
                          onChange={(e) => handleEditChange(student.id, 'podNumber', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="—"
                          style={{
                            width: '70px',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        {getRoleCheckboxes(student.id)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          style={{
                            background: '#fecaca',
                            border: '1px solid #fca5a5',
                            color: '#991b1b',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#f87171';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#fecaca';
                            e.target.style.color = '#991b1b';
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      {state.students.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#eff6ff',
          border: '1px solid #93c5fd',
          borderRadius: '8px',
          color: '#1e40af',
          fontSize: '14px'
        }}>
          <strong>{filteredStudents.length}</strong> of <strong>{state.students.length}</strong> students shown
          {hasChanges && ` • ${Object.keys(editingStudents).length} unsaved changes (auto-saving in 3 seconds)`}
        </div>
      )}
    </div>
  );
};

export default StudentMasterList;
