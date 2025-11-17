import React from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING } from '../data/initialStudents';
import { Users, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { state, getStudentsByPeriod, getPodsByPeriod, calculateStudentGrade } = useApp();

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const getOverallStats = () => {
    const totalStudents = state.students.length;
    const studentsInPods = state.students.filter(s => s.podNumber).length;
    const studentsWithRoles = state.students.filter(s => s.role).length;
    const totalAssessments = state.assessments.length;
    const studentsGraded = Object.keys(state.teacherGrades).length;

    const studentsNeedingGrades = state.students.filter(s => {
      const grade = calculateStudentGrade(s.id);
      return !grade || grade.assessmentCount === 0;
    }).length;

    return {
      totalStudents,
      studentsInPods,
      studentsWithRoles,
      totalAssessments,
      studentsGraded,
      studentsNeedingGrades
    };
  };

  const getPeriodStats = (period) => {
    const students = getStudentsByPeriod(period);
    const pods = getPodsByPeriod(period);

    const inPods = students.filter(s => s.podNumber).length;
    const withRoles = students.filter(s => s.role).length;
    const assessed = students.filter(s => {
      const assessments = state.assessments.filter(a => a.assesseeId === s.id);
      return assessments.length > 0;
    }).length;
    const teacherGraded = students.filter(s => state.teacherGrades[s.id]).length;

    const podStages = {
      not_started: 0,
      in_progress: 0,
      completed: 0
    };

    pods.forEach(pod => {
      podStages[pod.stage || 'not_started']++;
    });

    return {
      total: students.length,
      inPods,
      withRoles,
      assessed,
      teacherGraded,
      podsCount: pods.length,
      podStages
    };
  };

  const getStudentsNeedingAssessment = () => {
    return state.students.filter(s => {
      if (!s.podNumber) return false;
      const assessments = state.assessments.filter(a => a.assesseeId === s.id);
      return assessments.length === 0;
    });
  };

  const getStudentsNeedingTeacherGrade = () => {
    return state.students.filter(s => {
      return s.podNumber && !state.teacherGrades[s.id];
    });
  };

  const stats = getOverallStats();
  const needingAssessment = getStudentsNeedingAssessment();
  const needingTeacherGrade = getStudentsNeedingTeacherGrade();

  return (
    <div>
      <h2>Overview Dashboard</h2>

      {/* Overall Statistics */}
      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-number">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{stats.studentsInPods}</div>
          <div className="stat-label">In Pods</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-number">{stats.totalAssessments}</div>
          <div className="stat-label">Peer Assessments</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-number">{stats.studentsGraded}</div>
          <div className="stat-label">Teacher Grades</div>
        </div>
      </div>

      {/* Period-by-Period Overview */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={20} />
          Period-by-Period Status
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Students</th>
                <th>In Pods</th>
                <th>With Roles</th>
                <th>Pods</th>
                <th>Not Started</th>
                <th>In Progress</th>
                <th>Completed</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {periods.map(([homeroom, info]) => {
                const pStats = getPeriodStats(info.period);
                const progress = pStats.total > 0
                  ? ((pStats.assessed / pStats.total) * 100).toFixed(0)
                  : 0;

                return (
                  <tr key={homeroom}>
                    <td><strong>{info.name}</strong></td>
                    <td>{pStats.total}</td>
                    <td>
                      <span className={pStats.inPods === pStats.total ? 'text-success' : 'text-warning'}>
                        {pStats.inPods}/{pStats.total}
                      </span>
                    </td>
                    <td>
                      <span className={pStats.withRoles === pStats.total ? 'text-success' : 'text-warning'}>
                        {pStats.withRoles}/{pStats.total}
                      </span>
                    </td>
                    <td>{pStats.podsCount}</td>
                    <td>
                      <span className="badge badge-gray">{pStats.podStages.not_started}</span>
                    </td>
                    <td>
                      <span className="badge badge-warning">{pStats.podStages.in_progress}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{pStats.podStages.completed}</span>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <small className="text-muted">{progress}% assessed</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students Needing Assessment */}
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} className="text-warning" />
            Students Needing Peer Assessment ({needingAssessment.length})
          </h3>
          {needingAssessment.length === 0 ? (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              All pod members have been assessed!
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Period</th>
                    <th>Pod</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {needingAssessment.slice(0, 20).map(student => (
                    <tr key={student.id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.periodName}</td>
                      <td>Pod {student.podNumber}</td>
                      <td>
                        <span className={student.role ? 'badge badge-primary' : 'badge badge-gray'}>
                          {student.role || 'No Role'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {needingAssessment.length > 20 && (
                <p className="text-muted mt-2">
                  And {needingAssessment.length - 20} more...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} className="text-danger" />
            Students Needing Teacher Grade ({needingTeacherGrade.length})
          </h3>
          {needingTeacherGrade.length === 0 ? (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              All students have teacher grades!
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Period</th>
                    <th>Pod</th>
                  </tr>
                </thead>
                <tbody>
                  {needingTeacherGrade.slice(0, 20).map(student => (
                    <tr key={student.id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.periodName}</td>
                      <td>Pod {student.podNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {needingTeacherGrade.length > 20 && (
                <p className="text-muted mt-2">
                  And {needingTeacherGrade.length - 20} more...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pod Stage Summary by Period */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} />
          Pod Assessment Stages by Period
        </h3>
        {periods.map(([homeroom, info]) => {
          const pods = getPodsByPeriod(info.period);
          if (pods.length === 0) return null;

          return (
            <div key={homeroom} style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>{info.name}</h4>
              <div className="grid grid-4">
                {pods.sort((a, b) => a.podNumber - b.podNumber).map(pod => {
                  const members = pod.members.map(id =>
                    state.students.find(s => s.id === id)
                  ).filter(Boolean);

                  const stageColors = {
                    not_started: 'badge-gray',
                    in_progress: 'badge-warning',
                    completed: 'badge-success'
                  };

                  const stageLabels = {
                    not_started: 'Not Started',
                    in_progress: 'In Progress',
                    completed: 'Completed'
                  };

                  return (
                    <div key={pod.id} className="pod-card">
                      <div className="pod-header">
                        <div className="pod-title">Pod {pod.podNumber}</div>
                        <span className={`badge ${stageColors[pod.stage || 'not_started']}`}>
                          {stageLabels[pod.stage || 'not_started']}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {members.length} members
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        {members.map(m => (
                          <div key={m.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
                            {m.firstName} {m.lastName}
                            {m.role && (
                              <span style={{ marginLeft: '6px', color: '#2563eb' }}>
                                - {m.role}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
