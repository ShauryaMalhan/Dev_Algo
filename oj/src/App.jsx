import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./components/stylesheets/footer.css";
import Navbar from "./components/user/Navbar.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/common/login.jsx";
import Footer from "./components/common/footer.jsx";
import Signup from "./components/common/signup.jsx";
import Problem from "./components/user/problems.jsx";
import ProblemDetail from "./components/user/problemdetail.jsx";
import AuthState from "./contexts/auth/authState.jsx";
import Dashboard from "./components/common/dashboard.jsx";
import ProtectedRoute from "./components/services/protectedRoute.jsx";
import SubmitProblem from "./components/user/submitProblem.jsx";
import ScrollTop from "./components/services/scrollTop.jsx";
import MySubmissions from "./components/user/mySubmissions.jsx";
import AllSubmissions from "./components/user/allSubmissions.jsx";
import AdminPage from "./components/admin/adminpage.jsx";
import AdminProtectedRoute from './components/services/adminprotectedroute.jsx';
import ManageProblems from "./components/admin/manageproblem.jsx";
import CreateProblem from "./components/admin/createproblem.jsx";
import EditProblem from "./components/admin/editproblem.jsx";
import EditSampleTestCases from "./components/admin/editsampletestcases.jsx"
import EditJudgingTestCases from "./components/admin/editjudgingtestcases.jsx"
import ForgotPassword from "./components/common/forgotpassword.jsx";
import ResetPassword from "./components/common/reset-password.jsx";
import ProfilePage from "./components/user/profilepage.jsx";
import CreateBlog from "./components/user/createblog.jsx";
import BlogDetail from "./components/user/blogdetail.jsx";
import EditBlog from "./components/user/editblog.jsx";

import './App.css';

const AppContent = () => {
  return (
    <div className="page">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<ProtectedRoute><Problem /></ProtectedRoute>} />
          <Route path="/problems/:slug" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
          <Route path="/problems/:slug/submit" element={<ProtectedRoute><SubmitProblem /></ProtectedRoute>} />
          <Route path="/mySubmissions" element={<ProtectedRoute><MySubmissions /></ProtectedRoute>} />
          <Route path="/allSubmissions" element={<ProtectedRoute><AllSubmissions /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile/:username/new-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>}/>
          <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>}/>
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/profile/:username/edit-blog/:slug" element={<ProtectedRoute><EditBlog /></ProtectedRoute>}/>
          <Route
            path="/admin/manage-problems"
            element={
              <AdminProtectedRoute>
                <ManageProblems />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/new-problem"
            element={
              <AdminProtectedRoute>
                <CreateProblem />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-problem/:id"
            element={
              <AdminProtectedRoute>
                <EditProblem />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-testcases/:id"
            element={
              <AdminProtectedRoute>
                <EditSampleTestCases />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-judging-testcases/:id"
            element={
              <AdminProtectedRoute>
                <EditJudgingTestCases />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthState>
      <Router>
        <ScrollTop />
        <AppContent />
      </Router>
    </AuthState>
  );
}

export default App;
