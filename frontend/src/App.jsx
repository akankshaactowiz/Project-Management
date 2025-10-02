import './App.css'
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </Router>
    </>
  )
}

export default App
