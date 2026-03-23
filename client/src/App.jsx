import { Routes, Route, Navigate, BrowserRouter as Router, useOutletContext, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PublicLayout from './components/PublicLayout';
import StudentDashboardLayout from './components/StudentDashboardLayout';
import InstructorDashboardLayout from './components/InstructorDashboardLayout';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import CourseLayout from './components/CourseLayout';
import NavbarDashboard from './components/NavbarDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import CourseDetail from './pages/CourseDetail';
import Payment from './pages/Payment';
import Courses from './pages/Courses';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import Overview from './pages/student/Overview';
import MyLearning from './pages/student/MyLearning';
import Chapters from './pages/student/Chapters';
import Certificates from './pages/student/Certificates';
import Payments from './pages/student/Payments';
import Support from './pages/student/Support';
import Settings from './pages/student/Settings';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseDetailPage from './pages/student/StudentCourseDetailPage';

// Instructor Pages
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import CreateCourse from './pages/instructor/CreateCourse';
import CreateAssignment from './pages/instructor/CreateAssignment';
import CreateQuiz from './pages/instructor/CreateQuiz';
import InstructorStudents from './pages/instructor/InstructorStudents';
import InstructorEarnings from './pages/instructor/InstructorEarnings';
import InstructorReviews from './pages/instructor/InstructorReviews';
import InstructorAssignments from './pages/instructor/InstructorAssignments';
import InstructorQuizzes from './pages/instructor/InstructorQuizzes';
import InstructorReports from './pages/instructor/InstructorReports';
import InstructorMessages from './pages/instructor/InstructorMessages';
import CreateAnnouncement from './pages/instructor/CreateAnnouncement';
import InstructorCourseOverview from './pages/instructor/InstructorCourseOverview';
import InstructorSettings from './pages/instructor/InstructorSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminPayments from './pages/admin/AdminPayments';
import CourseForm from './pages/admin/CourseForm';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminMessages from './pages/admin/AdminMessages';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminReviews from './pages/admin/AdminReviews';
import AdminChapters from './pages/admin/AdminChapters';
import AdminInstructors from './pages/admin/AdminInstructors';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSupport from './pages/admin/AdminSupport';


import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { useAuth } from './context/AuthContext';
import InstructorLanding from './pages/InstructorLanding';
import ApplyInstructor from './pages/ApplyInstructor';


const App = () => {
  const { loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--primary)'
    }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" style={{ marginBottom: '1rem' }}></div>
      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Initializing Xoon LMS...</p>
    </div>
  );

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>

        {/* PUBLIC ROUTES (Accessible to everyone) */}
        <Route element={<PublicLayout />}>
          {/* Landing Page - Use PublicRoute to redirect if already logged in */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />

          {/* Truly Public Pages (Always accessible) */}
          <Route path="/courses" element={<CoursesRedirect />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/course/:id" element={<CourseDetail />} />

          {/* Instructor Onboarding Page (Public) */}
          <Route path="/instructor-landing" element={<InstructorLanding />} />


          {/* Auth Pages - Use PublicRoute to redirect if already logged in */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        </Route>

        {/* Dashboard path aliases (requested) */}
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
        <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={['instructor']}><Navigate to="/instructor/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><Navigate to="/student/dashboard" replace /></ProtectedRoute>} />

        {/* Standalone Instructor Application Routes (No Dashboard Layout) */}
        <Route path="/apply-instructor" element={<ProtectedRoute allowedRoles={['student']}><ApplyInstructor /></ProtectedRoute>} />
        <Route path="/instructor-application" element={<Navigate to="/apply-instructor" replace />} />

        {/* Standalone Checkout/Payment Route (No Dashboard Layout) */}
        <Route path="/payment/:id" element={<ProtectedRoute allowedRoles={['student']}><Payment /></ProtectedRoute>} />
        <Route path="/checkout/:courseId" element={<ProtectedRoute allowedRoles={['student']}><Payment /></ProtectedRoute>} />

        {/* STUDENT DASHBOARD ROUTES */}
        <Route element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboardLayout />
          </ProtectedRoute>
        }>

          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OverviewWithContext />} />
            <Route path="my-learning" element={<MyLearningWithContext />} />
            <Route path="chapters" element={<ChaptersWithContext />} />
            <Route path="certificates" element={<CertificatesWithContext />} />
            <Route path="payments" element={<PaymentsWithContext />} />
            <Route path="support" element={<SupportWithContext />} />
            <Route path="settings" element={<SettingsWithContext />} />
          </Route>

          {/* User Requested Alias /dashboard for students */}
          <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
        </Route>

        {/* Full-Page Protected Course Layout (No Sidebar) */}
        {/* Dedicated Student Learning Page (Separate from Dashboard) */}
        <Route element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLearningLayout />
          </ProtectedRoute>
        }>
          <Route path="/student/course/:id/learn" element={<CourseDetail isPlayerMode={true} />} />
        </Route>

        {/* INSTRUCTOR DASHBOARD ROUTES (Dedicated Layout) */}
        <Route element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/instructor/course/:id/overview" element={<InstructorCourseOverview />} />
          <Route path="/instructor/courses/new" element={<CreateCourse />} />
          <Route path="/instructor/courses/:id/edit" element={<CreateCourse />} />

          <Route path="/instructor/students" element={<InstructorStudents />} />
          <Route path="/instructor/assignments" element={<InstructorAssignments />} />
          <Route path="/instructor/course/:courseId/assignments" element={<InstructorAssignments />} />
          <Route path="/instructor/assignments/new" element={<CreateAssignment />} />
          <Route path="/instructor/course/:courseId/assignment/create" element={<CreateAssignment />} />
          <Route path="/instructor/assignments/:id/edit" element={<CreateAssignment />} />
          <Route path="/instructor/quizzes" element={<InstructorQuizzes />} />
          <Route path="/instructor/course/:courseId/quizzes" element={<InstructorQuizzes />} />
          <Route path="/instructor/quizzes/new" element={<CreateQuiz />} />
          <Route path="/instructor/course/:courseId/quiz/create" element={<CreateQuiz />} />
          <Route path="/instructor/quizzes/:id/edit" element={<CreateQuiz />} />
          <Route path="/instructor/earnings" element={<InstructorEarnings />} />
          <Route path="/instructor/reviews" element={<InstructorReviews />} />
          <Route path="/instructor/reports" element={<InstructorReports />} />
          <Route path="/instructor/messages" element={<InstructorMessages />} />
          <Route path="/instructor/announcements/create" element={<CreateAnnouncement />} />
          <Route path="/instructor/settings" element={<InstructorSettings />} />
        </Route>

        {/* ADMIN DASHBOARD ROUTES */}
        <Route element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="instructors" element={<AdminInstructors />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="payments" element={<AdminPayments />} />

            <Route path="settings" element={<AdminSettings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="chapters" element={<AdminChapters />} />
            {/* Admin editing courses still uses CourseForm for now */}
            <Route path="courses/new" element={<CourseForm />} />
            <Route path="courses/:id/edit" element={<CourseForm />} />
          </Route>
        </Route>

        {/* Isolated Student Courses Page (Totally Standalone) */}
        <Route path="/student/courses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCourses />
          </ProtectedRoute>
        } />

        {/* Student Course Preview Page (Standalone, no public nav) */}
        <Route path="/student/course/:id/preview" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCourseDetailPage />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<><div style={{ display: 'none' }}>{console.log('404 hit: redirecting to /')}</div><Navigate to="/" replace /></>} />
      </Routes >
    </>
  );
};

const CoursesRedirect = () => {
  const { user } = useAuth();
  if (user) {
    const role = String(user.role || '').trim().toLowerCase();
    if (role === 'admin') return <Navigate to="/admin/courses" replace />;
    if (role === 'instructor') return <Navigate to="/teacher-dashboard" replace />;
    return <Navigate to="/student/courses" replace />;
  }
  return <Courses />;
};

// Helper components to inject context data into views
const OverviewWithContext = () => {
  const context = useOutletContext();
  return <Overview courses={context?.courses || []} />;
};

const MyLearningWithContext = () => {
  const context = useOutletContext();
  return <MyLearning courses={context?.courses || []} loading={false} />;
};

const ChaptersWithContext = () => {
  const context = useOutletContext();
  return <Chapters courses={context?.courses || []} />;
};

const CertificatesWithContext = () => {
  const context = useOutletContext();
  return <Certificates certificates={context?.certificates || []} courses={context?.courses || []} />;
};

const PaymentsWithContext = () => {
  const context = useOutletContext();
  return <Payments payments={context?.payments || []} />;
};

const SupportWithContext = () => {
  const context = useOutletContext();
  return <Support user={context?.user} />;
};

const StudentLearningLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <NavbarDashboard toggleSidebar={() => { }} showLogo={true} hideMenu={true} />
      <main style={{ flex: 1, width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
};

const SettingsWithContext = () => {
  const context = useOutletContext();
  return (
    <Settings
      user={context?.user}
      updateProfile={context?.updateProfile}
      changingPassword={context?.changingPassword}
      updatePassword={context?.updatePassword}
    />
  );
};

export default App;

