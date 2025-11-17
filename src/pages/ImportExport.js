import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_MAPPING, ROLES } from '../data/initialStudents';
import { Upload, Download, Trash2, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

const ImportExport = () => {
  const { state, dispatch } = useApp();
  const [importData, setImportData] = useState('');
  const [importMode, setImportMode] = useState('pod-assignments'); // pod-assignments, students
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const periods = Object.entries(PERIOD_MAPPING).sort((a, b) => a[1].period - b[1].period);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target.result);
      parseImportData(event.target.result);
    };
    reader.readAsText(file);
  };

  const parseImportData = (data) => {
    setError('');
    setSuccess('');
    setPreviewData(null);

    try {
      const result = Papa.parse(data, {
        header: true,
        skipEmptyLines: true
      });

      if (result.errors.length > 0) {
        setError('Error parsing CSV: ' + result.errors[0].message);
        return;
      }

      // Validate required columns based on import mode
      if (importMode === 'pod-assignments') {
        const requiredCols = ['firstName', 'lastName', 'homeroom', 'podNumber'];
        const hasRequired = requiredCols.every(col =>
          result.meta.fields.some(f => f.toLowerCase() === col.toLowerCase())
        );

        if (!hasRequired) {
          setError('CSV must contain columns: firstName, lastName, homeroom, podNumber');
          return;
        }

        // Normalize column names
        const normalized = result.data.map(row => {
          const normalizedRow = {};
          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (lowerKey === 'firstname') normalizedRow.firstName = row[key];
            else if (lowerKey === 'lastname') normalizedRow.lastName = row[key];
            else if (lowerKey === 'homeroom') normalizedRow.homeroom = row[key];
            else if (lowerKey === 'podnumber') normalizedRow.podNumber = parseInt(row[key]) || null;
            else if (lowerKey === 'role') normalizedRow.role = row[key] || null;
            else if (lowerKey === 'sharedrole') normalizedRow.sharedRole = row[key]?.toLowerCase() === 'true';
          });
          return normalizedRow;
        });

        setPreviewData(normalized);
      } else {
        setPreviewData(result.data);
      }
    } catch (err) {
      setError('Error processing import data: ' + err.message);
    }
  };

  const handleImport = () => {
    if (!previewData || previewData.length === 0) {
      setError('No data to import');
      return;
    }

    try {
      if (importMode === 'pod-assignments') {
        dispatch({
          type: 'BULK_IMPORT_POD_DATA',
          payload: previewData
        });
        setSuccess(`Successfully imported ${previewData.length} pod assignments!`);
      }
      setPreviewData(null);
      setImportData('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Error importing data: ' + err.message);
    }
  };

  const handleBulkDelete = (period) => {
    const periodName = periods.find(p => p[1].period === period)?.[1].name || `Period ${period}`;
    if (window.confirm(`Are you sure you want to delete ALL pod assignments for ${periodName}? This cannot be undone.`)) {
      dispatch({
        type: 'BULK_DELETE_POD_ASSIGNMENTS',
        payload: { period }
      });
      setSuccess(`All pod assignments for ${periodName} have been deleted.`);
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset ALL data? This will clear all pod assignments, assessments, and grades. This cannot be undone!')) {
      if (window.confirm('This is your final warning. All data will be permanently deleted. Continue?')) {
        dispatch({ type: 'RESET_ALL_DATA' });
        setSuccess('All data has been reset to initial state.');
      }
    }
  };

  const handleResetAssessments = () => {
    if (window.confirm('Are you sure you want to reset all assessments and teacher grades? Pod assignments will be kept. This cannot be undone.')) {
      dispatch({ type: 'RESET_ASSESSMENTS' });
      setSuccess('All assessments and grades have been cleared.');
    }
  };

  const exportPodAssignments = () => {
    const data = state.students.filter(s => s.podNumber).map(s => ({
      firstName: s.firstName,
      lastName: s.lastName,
      homeroom: s.homeroom,
      podNumber: s.podNumber,
      role: s.role || '',
      sharedRole: s.sharedRole || false
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pod_assignments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportAllData = () => {
    const exportObj = {
      students: state.students,
      pods: state.pods,
      assessments: state.assessments,
      teacherGrades: state.teacherGrades,
      exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pod_grading_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const generateSampleCSV = () => {
    const sampleData = [
      { firstName: 'John', lastName: 'D', homeroom: '7C', podNumber: 1, role: 'Lead Researcher', sharedRole: false },
      { firstName: 'Jane', lastName: 'S', homeroom: '7C', podNumber: 1, role: 'Script Writer', sharedRole: false },
      { firstName: 'Mike', lastName: 'R', homeroom: '7C', podNumber: 1, role: 'Director / Visual Designer', sharedRole: false },
      { firstName: 'Sara', lastName: 'M', homeroom: '7C', podNumber: 1, role: 'On-Camera Ambassador', sharedRole: false }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_pod_import.csv';
    link.click();
  };

  return (
    <div>
      <h2>Import / Export & Data Management</h2>

      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="grid grid-2">
        {/* Import Section */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Upload size={20} />
            Import Pod Assignments
          </h3>

          <div className="alert alert-info mb-4">
            <strong>CSV Format Required:</strong><br />
            Columns: firstName, lastName, homeroom, podNumber, role (optional), sharedRole (optional)
            <br /><br />
            <button className="btn btn-secondary btn-sm" onClick={generateSampleCSV}>
              <Download size={14} /> Download Sample CSV
            </button>
          </div>

          <div className="form-group">
            <label>Import Mode</label>
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
            >
              <option value="pod-assignments">Pod Assignments & Roles</option>
            </select>
          </div>

          <div className="form-group">
            <label>Upload CSV File</label>
            <div className="file-input" onClick={() => fileInputRef.current?.click()}>
              <FileText size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p>Click to select a CSV file or drag and drop</p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {previewData && (
            <div style={{ marginTop: '20px' }}>
              <h4>Preview ({previewData.length} rows)</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
                <table style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Homeroom</th>
                      <th>Pod</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.firstName} {row.lastName}</td>
                        <td>{row.homeroom}</td>
                        <td>{row.podNumber}</td>
                        <td>{row.role || '-'}</td>
                      </tr>
                    ))}
                    {previewData.length > 10 && (
                      <tr>
                        <td colSpan="4" className="text-muted">
                          ...and {previewData.length - 10} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button
                className="btn btn-success mt-4"
                onClick={handleImport}
                style={{ width: '100%' }}
              >
                <Upload size={16} /> Import {previewData.length} Records
              </button>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} />
            Export Data
          </h3>

          <div className="form-group">
            <button
              className="btn btn-primary"
              onClick={exportPodAssignments}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <Download size={16} /> Export Pod Assignments (CSV)
            </button>
            <small className="text-muted">Download current pod assignments as CSV for backup or editing</small>
          </div>

          <div className="form-group">
            <button
              className="btn btn-secondary"
              onClick={exportAllData}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <Download size={16} /> Export Complete Backup (JSON)
            </button>
            <small className="text-muted">Download all data including assessments and grades</small>
          </div>

          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px' }}>
            <Trash2 size={20} className="text-danger" />
            Bulk Delete Operations
          </h3>

          <div className="alert alert-warning">
            <AlertTriangle size={18} />
            Warning: These actions cannot be undone!
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Delete All Pod Assignments by Period:</label>
            <div className="grid grid-2 mt-2">
              {periods.map(([homeroom, info]) => (
                <button
                  key={homeroom}
                  className="btn btn-warning btn-sm"
                  onClick={() => handleBulkDelete(info.period)}
                >
                  <Trash2 size={14} /> {info.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <button
              className="btn btn-danger"
              onClick={handleResetAssessments}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <RefreshCw size={16} /> Reset All Assessments & Grades
            </button>
            <small className="text-muted">Clear all peer assessments and teacher grades (keeps pod assignments)</small>
          </div>

          <div className="form-group">
            <button
              className="btn btn-danger"
              onClick={handleResetAll}
              style={{ width: '100%' }}
            >
              <Trash2 size={16} /> RESET EVERYTHING
            </button>
            <small className="text-muted">Complete reset to initial state - this deletes all pod assignments, assessments, and grades</small>
          </div>
        </div>
      </div>

      {/* Current Data Summary */}
      <div className="card">
        <h3>Current Data Summary</h3>
        <div className="grid grid-4">
          <div>
            <strong>Total Students:</strong> {state.students.length}
          </div>
          <div>
            <strong>Students in Pods:</strong> {state.students.filter(s => s.podNumber).length}
          </div>
          <div>
            <strong>Total Pods:</strong> {Object.keys(state.pods).length}
          </div>
          <div>
            <strong>Total Assessments:</strong> {state.assessments.length}
          </div>
        </div>
        <div className="mt-4">
          <strong>Pod Assignments by Period:</strong>
          <div className="flex gap-4 flex-wrap mt-2">
            {periods.map(([homeroom, info]) => {
              const count = state.students.filter(s => s.period === info.period && s.podNumber).length;
              return (
                <span key={homeroom} className="badge badge-primary">
                  {info.name}: {count} students
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
