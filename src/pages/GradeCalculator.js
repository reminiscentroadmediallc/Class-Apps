import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING } from '../data/initialStudents';
import { Calculator, Search, Download, BarChart3 } from 'lucide-react';

const GradeCalculator = () => {
  const { state, getStudentsByPeriod, calculateStudentGrade, getStudentAssessments } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const currentPeriodStudents = getStudentsByPeriod(selectedPeriod).filter(s => s.podNumber);

  const filteredStudents = currentPeriodStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentsWithGrades = filteredStudents.map(student => {
    const grade = calculateStudentGrade(student.id);
    return { ...student, calculatedGrade: grade };
  }).sort((a, b) => {
    if (!a.calculatedGrade && !b.calculatedGrade) return 0;
    if (!a.calculatedGrade) return 1;
    if (!b.calculatedGrade) return -1;
    return parseFloat(b.calculatedGrade.finalGrade) - parseFloat(a.calculatedGrade.finalGrade);
  });

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const exportGrades = () => {
    const csvData = studentsWithGrades.map(student => ({
      'First Name': student.firstName,
      'Last Name': student.lastName,
      'Period': student.periodName,
      'Pod': student.podNumber,
      'Role': student.role || 'N/A',
      'Peer Score (%)': student.calculatedGrade?.peerScore || 'N/A',
      'Teacher Score (%)': student.calculatedGrade?.teacherScore || 'N/A',
      'Final Grade (%)': student.calculatedGrade?.finalGrade || 'N/A',
      'Letter Grade': student.calculatedGrade ? getLetterGrade(parseFloat(student.calculatedGrade.finalGrade)) : 'N/A',
      'Assessments Received': student.calculatedGrade?.assessmentCount || 0
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grades_period_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  return (
    <div>
      <h2>Grade Calculator</h2>

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

      {/* Search and Export */}
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
          <button className="btn btn-success" onClick={exportGrades}>
            <Download size={16} /> Export Grades (CSV)
          </button>
        </div>
      </div>

      {/* Grade Statistics */}
      <div className="grid grid-4" style={{ marginBottom: '20px' }}>
        {(() => {
          const gradesArray = studentsWithGrades
            .filter(s => s.calculatedGrade)
            .map(s => parseFloat(s.calculatedGrade.finalGrade));

          const avg = gradesArray.length > 0
            ? (gradesArray.reduce((a, b) => a + b, 0) / gradesArray.length).toFixed(1)
            : 'N/A';
          const highest = gradesArray.length > 0 ? Math.max(...gradesArray).toFixed(1) : 'N/A';
          const lowest = gradesArray.length > 0 ? Math.min(...gradesArray).toFixed(1) : 'N/A';
          const graded = gradesArray.length;

          return (
            <>
              <div className="stat-card">
                <div className="stat-number">{avg}%</div>
                <div className="stat-label">Average Grade</div>
              </div>
              <div className="stat-card green">
                <div className="stat-number">{highest}%</div>
                <div className="stat-label">Highest Grade</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-number">{lowest}%</div>
                <div className="stat-label">Lowest Grade</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-number">{graded}/{studentsWithGrades.length}</div>
                <div className="stat-label">Students Graded</div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Grades Table */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calculator size={20} />
          Calculated Grades
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Pod</th>
                <th>Role</th>
                <th>Peer Score</th>
                <th>Teacher Score</th>
                <th>Final Grade</th>
                <th>Letter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsWithGrades.map((student, index) => {
                const grade = student.calculatedGrade;
                const letterGrade = grade ? getLetterGrade(parseFloat(grade.finalGrade)) : '-';

                return (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{student.firstName} {student.lastName}</strong>
                    </td>
                    <td>Pod {student.podNumber}</td>
                    <td>
                      <span className={student.role ? 'badge badge-primary' : 'badge badge-gray'}>
                        {student.role || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {grade ? (
                        <span>{grade.peerScore}%</span>
                      ) : (
                        <span className="text-muted">No data</span>
                      )}
                    </td>
                    <td>
                      {grade && state.teacherGrades[student.id] ? (
                        <span>{grade.teacherScore}%</span>
                      ) : (
                        <span className="text-muted">Not graded</span>
                      )}
                    </td>
                    <td>
                      {grade ? (
                        <strong style={{ fontSize: '16px' }}>{grade.finalGrade}%</strong>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        letterGrade === 'A' ? 'badge-success' :
                        letterGrade === 'B' ? 'badge-primary' :
                        letterGrade === 'C' ? 'badge-warning' :
                        letterGrade === 'D' ? 'badge-danger' :
                        'badge-gray'
                      }`}>
                        {letterGrade}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openDetails(student)}
                      >
                        <BarChart3 size={14} /> Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Grade Details</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info mb-4">
                <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>
                <br />
                Pod {selectedStudent.podNumber} - {selectedStudent.role || 'No Role'}
              </div>

              {(() => {
                const assessments = getStudentAssessments(selectedStudent.id);
                const teacherGrade = state.teacherGrades[selectedStudent.id];
                const calculatedGrade = selectedStudent.calculatedGrade;

                return (
                  <>
                    {/* Peer Assessments */}
                    <h4 style={{ marginBottom: '12px' }}>Peer Assessments ({assessments.length} received)</h4>
                    {assessments.length === 0 ? (
                      <div className="alert alert-warning">No peer assessments received yet.</div>
                    ) : (
                      <div style={{ marginBottom: '20px' }}>
                        {assessments.map((assessment, idx) => {
                          const assessor = state.students.find(s => s.id === assessment.assessorId);
                          const roleScoreTotal = Object.values(assessment.roleScores || {}).reduce((a, b) => a + b, 0);
                          const roleScoreMax = Object.keys(assessment.roleScores || {}).length * 5;
                          const generalScoreTotal = Object.values(assessment.generalScores || {}).reduce((a, b) => a + b, 0);
                          const generalScoreMax = Object.keys(assessment.generalScores || {}).length * 5;

                          return (
                            <div key={assessment.id} className="card" style={{ marginBottom: '10px', padding: '12px' }}>
                              <strong>Assessment #{idx + 1}</strong>
                              {assessor && (
                                <span className="text-muted"> from {assessor.firstName} {assessor.lastName}</span>
                              )}
                              <div style={{ marginTop: '8px' }}>
                                {roleScoreMax > 0 && (
                                  <div>Role Questions: {roleScoreTotal}/{roleScoreMax} ({((roleScoreTotal/roleScoreMax)*100).toFixed(0)}%)</div>
                                )}
                                <div>General Questions: {generalScoreTotal}/{generalScoreMax} ({((generalScoreTotal/generalScoreMax)*100).toFixed(0)}%)</div>
                                {assessment.comments && (
                                  <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#6b7280' }}>
                                    "{assessment.comments}"
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Teacher Grade */}
                    <h4 style={{ marginBottom: '12px' }}>Teacher Grade</h4>
                    {!teacherGrade ? (
                      <div className="alert alert-warning">No teacher grade assigned yet.</div>
                    ) : (
                      <div className="card" style={{ padding: '12px', marginBottom: '20px' }}>
                        <div>Engagement: <strong>{teacherGrade.engagement}/5</strong></div>
                        <div>Activity: <strong>{teacherGrade.activity}/5</strong></div>
                        <div>Total: <strong>{(teacherGrade.engagement + teacherGrade.activity).toFixed(1)}/10</strong></div>
                        {teacherGrade.comments && (
                          <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#6b7280' }}>
                            "{teacherGrade.comments}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Final Calculation */}
                    <h4 style={{ marginBottom: '12px' }}>Final Grade Calculation</h4>
                    {calculatedGrade ? (
                      <div className="card" style={{ padding: '12px', background: '#f0f9ff' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Peer Assessment Score:</strong> {calculatedGrade.peerScore}% (60% weight)
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Teacher Grade:</strong> {calculatedGrade.teacherScore}% (40% weight)
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
                          Final Grade: {calculatedGrade.finalGrade}% ({getLetterGrade(parseFloat(calculatedGrade.finalGrade))})
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-danger">
                        Unable to calculate grade. Missing peer assessments or teacher grade.
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeCalculator;
