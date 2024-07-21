import "./App.css";
import Navbar from "./components/user/Navbar.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/common/login.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from './components/user/footer.jsx';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <div>
                <h1>This is My React Application</h1>
              </div>
            }
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;