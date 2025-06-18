import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BusinessCardForm } from "./components/BusinessCardForm";
import { BusinessCardPage } from "./screens/QRProfileViewer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BusinessCardForm />} />
        <Route path="/card/:id" element={<BusinessCardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
