import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LevelSelect from "@/pages/LevelSelect/LevelSelect";
import Assembly from "@/pages/Assembly/Assembly";
import Success from "@/pages/Success/Success";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LevelSelect />} />
        <Route path="/assembly/:levelId" element={<Assembly />} />
        <Route path="/success/:levelId" element={<Success />} />
      </Routes>
    </Router>
  );
}
