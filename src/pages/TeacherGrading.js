import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING } from '../data/initialStudents';
import { GraduationCap, Search, CheckCircle, Save } from 'lucide-react';

const TeacherGrading = () => {
  const { state, dispatch, getStudentsByPeriod } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState({ engagement: 0, activity: 0, comments: '' });
  const [showGradingModal, setShowGradingModal] = useState(false);

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const currentPeriodStudents = getStudentsByPeriod(selectedPeriod).filter(s => s.podNumber);

  const filteredStudents = currentPeriodStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gradedStudents = filteredStudents.filter(s => state.teacherGrades[s.id]);
  const ungradedStudents = filteredStudents.filter(s => !state.teacherGrades[s.id]);

  const handleOpenGrading = (student) => {
    setSelectedStudent(student);
    const existingGrade = state.teacherGrades[student.id];
    if (existingGrade) {
      setGrades(existingGrade);
    } else {
      setGrades({ engagement: 0, activity: 0, comments: '' });
    }
    setShowGradingModal(true);
  };

  const handleSaveGrade = () => {
    if (!selectedStudent) return;

    dispatch({
      type: 'ADD_TEACHER_GRADE',
      payload: {
        studentId: selectedStudent.id,
        grades: {
          engagement: grades.engagement,
          activity: grades.activity,
          comments: grades.comments
        }
      }
    });

    setShowGradingModal(false);
    setSelectedStudent(null);
    setGrades({ engagement: 0, activity: 0, comments: '' });
  };

  const ScoreInput = ({ label, value, onChange }) => (
    <div className="form-group">
      <label>{label} (0-5)</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{
          background: '#f3f4f6',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          minWidth: '60px',
          textAlign: 'center'
        }}>
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      <h2>Teacher Grading</h2>

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
            <span className="badge badge-gray">In Pods: {currentPeriodStudents.length}</span>
            <span className="badge badge-success">Graded: {gradedStudents.length}</span>
            <span className="badge badge-warning">Remaining: {ungradedStudents.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Ungraded Students */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={20} />
            Needs Grading ({ungradedStudents.length})
          </h3>
          {ungradedStudents.length === 0 ? (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              All students in this period have been graded!
            </div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {ungradedStudents.map(student => (
                <div key={student.id} className="member-item">
                  <div>
                    <div className="member-name">{student.firstName} {student.lastName}</div>
                    <div className="member-role">
                      Pod {student.podNumber} - {student.role || 'No Role'}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenGrading(student)}
                  >
                    <GraduationCap size={14} /> Grade
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Already Graded Students */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} className="text-success" />
            Already Graded ({gradedStudents.length})
          </h3>
          {gradedStudents.length === 0 ? (
            <div className="alert alert-info">No students graded yet in this period.</div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {gradedStudents.map(student => {
                const grade = state.teacherGrades[student.id];
                return (
                  <div key={student.id} className="member-item">
                    <div>
                      <div className="member-name">{student.firstName} {student.lastName}</div>
                      <div className="member-role">
                        Pod {student.podNumber} - {student.role || 'No Role'}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span className="badge badge-primary" style={{ marginRight: '6px' }}>
                          Engagement: {grade.engagement}/5
                        </span>
                        <span className="badge badge-primary">
                          Activity: {grade.activity}/5
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenGrading(student)}
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {showGradingModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Teacher Grade</h2>
              <button className="close-btn" onClick={() => setShowGradingModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info mb-4">
                Student: <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>
                <br />
                Pod: <strong>{selectedStudent.podNumber}</strong>
                <br />
                Role: <strong>{selectedStudent.role || 'Not Assigned'}</strong>
              </div>

              <ScoreInput
                label="Engagement Score"
                value={grades.engagement}
                onChange={(val) => setGrades({ ...grades, engagement: val })}
              />

              <ScoreInput
                label="Activity Score"
                value={grades.activity}
                onChange={(val) => setGrades({ ...grades, activity: val })}
              />

              <div className="form-group">
                <label>Teacher Comments (Optional)</label>
                <textarea
                  value={grades.comments}
                  onChange={(e) => setGrades({ ...grades, comments: e.target.value })}
                  placeholder="Any observations or feedback about this student's participation..."
                  rows={4}
                />
              </div>

              <div className="alert alert-warning" style={{ marginTop: '16px' }}>
                <strong>Total Teacher Score:</strong> {(grades.engagement + grades.activity).toFixed(1)} / 10
                <br />
                <small>This will account for 40% of the final grade</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowGradingModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSaveGrade}>
                <Save size={16} /> Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGrading;
