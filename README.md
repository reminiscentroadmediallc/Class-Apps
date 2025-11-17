# Pod Grading System

A comprehensive web application for managing and grading student pods in the Science Ambassador Media Project. This system allows teachers to organize students into pods, track role assignments, facilitate peer assessments, and automatically calculate grades.

## Features

### Dashboard
- Overview statistics for all periods
- Period-by-period assessment status tracking
- Students needing peer assessment identification
- Students needing teacher grades tracking
- Pod stage monitoring (Not Started, In Progress, Completed)

### Pod Management
- Assign students to pods (supports 3-5 members per pod)
- Auto-adjusts based on pod size
- Assign roles to students:
  - Lead Researcher
  - Script Writer
  - Director / Visual Designer
  - On-Camera Ambassador
- Support for shared roles
- Search and filter students by period
- Visual pod organization

### Student Self-Evaluation (Aligned with Official Form)
**Part 1: Self-Evaluation**
- Day 1: Research and discussion participation
- Day 2: Script and visual design contribution
- Day 3: Recording and submission focus
- Biggest contribution reflection
- Challenge identification and resolution

**Part 2: Peer Evaluation**
- Contribution: Fair share of work
- Reliability: Task completion on time
- Attitude: Positive, collaborative, focused

**Part 3: Team Advocacy (Confidential)**
- Team collaboration assessment
- Participation issue flagging

### Peer Assessment (Teacher-Led)
- Role-specific evaluation questions
- General collaboration assessment
- Star rating system (1-5)
- Progress tracking per pod
- Assessment stage management

### Teacher Grading
- Engagement score (0-5)
- Activity score (0-5)
- Comments and observations
- Track graded vs. ungraded students
- Edit existing grades

### Grade Calculator
- Auto-calculation: 60% peer score + 40% teacher score
- Grade statistics (average, highest, lowest)
- Letter grade assignment (A/B/C/D/F)
- Detailed grade breakdown view
- CSV export for grades

### Import/Export & Data Management
- Import pod assignments via CSV
- Bulk import students with roles
- Export pod assignments
- Complete data backup (JSON)
- Bulk delete operations by period
- Reset assessments and grades
- Full system reset

## Period Mapping

- **7C** → 1st Period
- **7D** → 3rd Period
- **7E** → 4th Period
- **7A** → 8th Period
- **7B** → 9th Period

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Class-Apps
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Usage Guide

### Initial Setup

1. **Review Pre-loaded Students**: The system comes pre-loaded with your student roster organized by homeroom codes.

2. **Assign Students to Pods**:
   - Go to "Pod Management"
   - Select a period
   - Click "Assign" next to unassigned students
   - Enter pod number (1-7 typically)
   - Optionally assign a role

3. **Bulk Import Pod Data** (Optional):
   - Go to "Import/Export"
   - Download the sample CSV template
   - Fill in: firstName, lastName, homeroom, podNumber, role
   - Upload the completed CSV

### Conducting Assessments

**Student Self-Evaluation:**
1. Go to "Student Self-Eval" tab
2. Student selects their name
3. Completes Part 1 (Self-Evaluation)
4. Completes Part 2 (Peer Evaluation for each teammate)
5. Completes Part 3 (Team Advocacy)
6. Submits the form

**Teacher-Led Peer Assessment:**
1. Go to "Peer Assessment" tab
2. Select a pod to assess
3. Choose the student who is filling out the assessment
4. Rate each team member on role-specific and general questions
5. Complete for all pod members

### Teacher Grading

1. Go to "Teacher Grading" tab
2. Select a period
3. Click "Grade" for ungraded students
4. Assign engagement score (0-5)
5. Assign activity score (0-5)
6. Add optional comments
7. Save the grade

### Viewing Grades

1. Go to "Grade Calculator" tab
2. View all calculated grades
3. Export to CSV for records
4. Click "Details" for grade breakdown

## Data Persistence

All data is automatically saved to the browser's localStorage. Data persists between sessions on the same browser.

## CSV Import Format

```csv
firstName,lastName,homeroom,podNumber,role,sharedRole
John,D,7C,1,Lead Researcher,false
Jane,S,7C,1,Script Writer,false
Mike,R,7C,1,Director / Visual Designer,false
Sara,M,7C,1,On-Camera Ambassador,false
```

## Grade Calculation Formula

```
Final Grade = (Peer Assessment Score × 0.60) + (Teacher Grade × 0.40)

Peer Assessment Score = (Total points received / Maximum possible points) × 100
Teacher Grade = ((Engagement + Activity) / 10) × 100
```

## Technology Stack

- **Frontend**: React 18
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **State Management**: React Context + useReducer
- **Storage**: Browser localStorage

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/
│   └── AppContext.js    # Global state management
├── data/
│   └── initialStudents.js  # Student roster and questions
├── pages/
│   ├── Dashboard.js     # Overview and statistics
│   ├── PodManagement.js # Pod and role assignment
│   ├── PeerAssessment.js    # Teacher-led assessment
│   ├── SelfAssessment.js    # Student self-evaluation
│   ├── TeacherGrading.js    # Teacher scoring
│   ├── GradeCalculator.js   # Grade computation
│   └── ImportExport.js      # Data management
├── App.js               # Main application component
├── index.js             # Application entry point
└── index.css            # Global styles
```

## License

This project is for educational use in managing the Science Ambassador Media Project assessments.

## Support

For questions or issues, please contact your system administrator.
