import "./components/stylesheets/footer.css";
import Navbar from "./components/user/Navbar.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/common/login.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/common/footer.jsx";
import Signup from "./components/common/signup.jsx";
import Problem from "./components/user/problems.jsx";
import ProblemDetail from "./components/user/problemdetail.jsx";
import AuthState from "./contexts/auth/authState.jsx";
import Dashboard from "./components/common/dashboard.jsx";
import ProtectedRoute from "./components/services/protectedRoute.jsx";

function App() {
  return (
    <AuthState>
      <Router>
        <div className="page">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={<ProtectedRoute><Dashboard/></ProtectedRoute>}
              />
              <Route path="/problems" element={<ProtectedRoute><Problem /></ProtectedRoute>} />
              <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthState>
  );
}

export default App;
