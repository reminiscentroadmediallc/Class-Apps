import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initialStudents, PERIOD_MAPPING } from '../data/initialStudents';

const AppContext = createContext();

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initializeStudents = (rawStudents) => {
  return rawStudents.map(student => ({
    ...student,
    id: generateId(),
    period: PERIOD_MAPPING[student.homeroom]?.period || null,
    periodName: PERIOD_MAPPING[student.homeroom]?.name || 'Unassigned',
    podNumber: null,
    role: null,
    sharedRole: false,
    sharedWith: []
  }));
};

const initialState = {
  students: initializeStudents(initialStudents),
  pods: {}, // { period_podNumber: { id, period, podNumber, members: [studentIds], assessments: [], stage: 'not_started' } }
  assessments: [], // { id, assessorId, assesseeId, podId, roleScores: {}, generalScores: {}, comments, timestamp }
  teacherGrades: {}, // { studentId: { engagement: score, activity: score, comments } }
  currentPeriod: 1,
  currentPod: null
};

const loadState = () => {
  try {
    const saved = localStorage.getItem('podGradingState');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return initialState;
};

const saveState = (state) => {
  try {
    localStorage.setItem('podGradingState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

const appReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case 'IMPORT_STUDENTS':
      const importedStudents = action.payload.map(student => ({
        ...student,
        id: student.id || generateId(),
        period: PERIOD_MAPPING[student.homeroom]?.period || null,
        periodName: PERIOD_MAPPING[student.homeroom]?.name || 'Unassigned',
        podNumber: student.podNumber || null,
        role: student.role || null,
        sharedRole: student.sharedRole || false,
        sharedWith: student.sharedWith || []
      }));
      newState = { ...state, students: importedStudents };
      break;

    case 'ADD_STUDENTS':
      const newStudents = action.payload.map(student => ({
        ...student,
        id: generateId(),
        period: PERIOD_MAPPING[student.homeroom]?.period || null,
        periodName: PERIOD_MAPPING[student.homeroom]?.name || 'Unassigned',
        podNumber: student.podNumber || null,
        role: student.role || null,
        sharedRole: false,
        sharedWith: []
      }));
      newState = { ...state, students: [...state.students, ...newStudents] };
      break;

    case 'UPDATE_STUDENT':
      newState = {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        )
      };
      break;

    case 'ASSIGN_POD':
      const { studentId, podNumber, period } = action.payload;
      const podKey = `${period}_${podNumber}`;

      // Update student
      const updatedStudents = state.students.map(s =>
        s.id === studentId ? { ...s, podNumber, period } : s
      );

      // Create or update pod
      const existingPod = state.pods[podKey] || {
        id: podKey,
        period,
        podNumber,
        members: [],
        stage: 'not_started'
      };

      if (!existingPod.members.includes(studentId)) {
        existingPod.members = [...existingPod.members, studentId];
      }

      newState = {
        ...state,
        students: updatedStudents,
        pods: { ...state.pods, [podKey]: existingPod }
      };
      break;

    case 'REMOVE_FROM_POD':
      const studentToRemove = state.students.find(s => s.id === action.payload.studentId);
      if (!studentToRemove || !studentToRemove.podNumber) {
        return state;
      }

      const oldPodKey = `${studentToRemove.period}_${studentToRemove.podNumber}`;
      const oldPod = state.pods[oldPodKey];

      newState = {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? { ...s, podNumber: null, role: null, sharedRole: false, sharedWith: [] }
            : s
        ),
        pods: oldPod ? {
          ...state.pods,
          [oldPodKey]: {
            ...oldPod,
            members: oldPod.members.filter(id => id !== action.payload.studentId)
          }
        } : state.pods
      };
      break;

    case 'ASSIGN_ROLE':
      newState = {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.studentId
            ? {
                ...s,
                role: action.payload.role,
                sharedRole: action.payload.sharedRole || false,
                sharedWith: action.payload.sharedWith || []
              }
            : s
        )
      };
      break;

    case 'BULK_IMPORT_POD_DATA':
      // Import format: [{ firstName, lastName, homeroom, podNumber, role }]
      const importData = action.payload;
      let studentsToUpdate = [...state.students];
      let podsToUpdate = { ...state.pods };

      importData.forEach(item => {
        // Find matching student
        const studentIndex = studentsToUpdate.findIndex(s =>
          s.firstName.toUpperCase() === item.firstName.toUpperCase() &&
          s.lastName.toUpperCase() === item.lastName.toUpperCase() &&
          s.homeroom === item.homeroom
        );

        if (studentIndex !== -1) {
          const student = studentsToUpdate[studentIndex];
          const period = PERIOD_MAPPING[item.homeroom]?.period;

          if (period && item.podNumber) {
            studentsToUpdate[studentIndex] = {
              ...student,
              podNumber: item.podNumber,
              role: item.role || null,
              sharedRole: item.sharedRole || false,
              sharedWith: item.sharedWith || []
            };

            // Update pod
            const podKey = `${period}_${item.podNumber}`;
            if (!podsToUpdate[podKey]) {
              podsToUpdate[podKey] = {
                id: podKey,
                period,
                podNumber: item.podNumber,
                members: [],
                stage: 'not_started'
              };
            }
            if (!podsToUpdate[podKey].members.includes(student.id)) {
              podsToUpdate[podKey].members.push(student.id);
            }
          }
        }
      });

      newState = { ...state, students: studentsToUpdate, pods: podsToUpdate };
      break;

    case 'BULK_DELETE_POD_ASSIGNMENTS':
      const periodToReset = action.payload.period;
      newState = {
        ...state,
        students: state.students.map(s =>
          s.period === periodToReset
            ? { ...s, podNumber: null, role: null, sharedRole: false, sharedWith: [] }
            : s
        ),
        pods: Object.fromEntries(
          Object.entries(state.pods).filter(([key]) => !key.startsWith(`${periodToReset}_`))
        )
      };
      break;

    case 'ADD_ASSESSMENT':
      newState = {
        ...state,
        assessments: [...state.assessments, { ...action.payload, id: generateId(), timestamp: Date.now() }]
      };
      break;

    case 'UPDATE_POD_STAGE':
      const podKeyToUpdate = action.payload.podKey;
      newState = {
        ...state,
        pods: {
          ...state.pods,
          [podKeyToUpdate]: {
            ...state.pods[podKeyToUpdate],
            stage: action.payload.stage
          }
        }
      };
      break;

    case 'ADD_TEACHER_GRADE':
      newState = {
        ...state,
        teacherGrades: {
          ...state.teacherGrades,
          [action.payload.studentId]: action.payload.grades
        }
      };
      break;

    case 'SET_CURRENT_PERIOD':
      newState = { ...state, currentPeriod: action.payload };
      break;

    case 'SET_CURRENT_POD':
      newState = { ...state, currentPod: action.payload };
      break;

    case 'RESET_ALL_DATA':
      newState = {
        ...initialState,
        students: initializeStudents(initialStudents)
      };
      break;

    case 'RESET_ASSESSMENTS':
      newState = {
        ...state,
        assessments: [],
        teacherGrades: {},
        pods: Object.fromEntries(
          Object.entries(state.pods).map(([key, pod]) => [
            key,
            { ...pod, stage: 'not_started' }
          ])
        )
      };
      break;

    default:
      return state;
  }

  saveState(newState);
  return newState;
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  // Auto-save on state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = {
    state,
    dispatch,
    // Helper functions
    getStudentsByPeriod: (period) => state.students.filter(s => s.period === period),
    getStudentById: (id) => state.students.find(s => s.id === id),
    getPodsByPeriod: (period) => Object.values(state.pods).filter(p => p.period === period),
    getPodMembers: (podKey) => {
      const pod = state.pods[podKey];
      if (!pod) return [];
      return pod.members.map(id => state.students.find(s => s.id === id)).filter(Boolean);
    },
    getStudentAssessments: (studentId) => state.assessments.filter(a => a.assesseeId === studentId),
    getAssessmentsGivenBy: (studentId) => state.assessments.filter(a => a.assessorId === studentId),
    calculateStudentGrade: (studentId) => {
      const student = state.students.find(s => s.id === studentId);
      if (!student) return null;

      const peerAssessments = state.assessments.filter(a => a.assesseeId === studentId);
      const teacherGrade = state.teacherGrades[studentId];

      if (peerAssessments.length === 0 && !teacherGrade) return null;

      let totalPeerScore = 0;
      let maxPeerScore = 0;

      peerAssessments.forEach(assessment => {
        Object.values(assessment.roleScores || {}).forEach(score => {
          totalPeerScore += score;
          maxPeerScore += 5;
        });
        Object.values(assessment.generalScores || {}).forEach(score => {
          totalPeerScore += score;
          maxPeerScore += 5;
        });
      });

      const peerPercentage = maxPeerScore > 0 ? (totalPeerScore / maxPeerScore) * 100 : 0;

      let teacherPercentage = 0;
      if (teacherGrade) {
        const teacherTotal = (teacherGrade.engagement || 0) + (teacherGrade.activity || 0);
        teacherPercentage = (teacherTotal / 10) * 100;
      }

      // Weight: 60% peer, 40% teacher
      const finalGrade = teacherGrade
        ? (peerPercentage * 0.6) + (teacherPercentage * 0.4)
        : peerPercentage;

      return {
        peerScore: peerPercentage.toFixed(1),
        teacherScore: teacherPercentage.toFixed(1),
        finalGrade: finalGrade.toFixed(1),
        assessmentCount: peerAssessments.length
      };
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
