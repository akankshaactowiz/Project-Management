import './App.css'
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';
import { Toaster } from "react-hot-toast";
// import {ModalProvider} from "../src/context/modalContext";


function App() {
  return (
    <>
      <Router>
         {/* <ModalProvider> */}
        <Toaster position="top-center" reverseOrder={false} />

      <AppRoutes />
      {/* </ModalProvider> */}
    </Router>
    </>
  )
}

export default App
