import { BrowserRouter, Routes, Route } from "react-router-dom";
import Template from "./Components/Template/Template";
import Home from "./Pages/Home/Home";
import Missions from "./Pages/Missions/missions";
import Reports from "./Pages/Reports/reports";
import Incidents from "./Pages/Incidents/incidents";
import CreateMission from "./Pages/CreateMission/createMission";
import Technicians from "./Pages/Technicians/technicians";
import EditReport from "./Pages/EditReport/editReport";
import CreateReport from "./Pages/CreateReport/createReport";
import InterventionReport from "./Pages/Report/Report";
import EditMission from "./Pages/EditMission/editMission";
import Mission from "./Pages/Mission/mission";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Template />}>
          <Route path="/" element={<Home />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/missions/create" element={<CreateMission />} />
          <Route path="/missions/edit/:missionId" element={<EditMission />} />
          <Route path="/mission/:missionId" element={<Mission />} />

          <Route path="/tech" element={<Technicians />} />
          <Route path="/reports/create" element={<CreateReport />} />
          <Route
            path="reports/view/:reportId"
            element={<InterventionReport />}
          />
          <Route path="/reports/edit/:reportId" element={<EditReport />} />

          {/* EX : <Route path="/logement/:logementId" element={<Rental />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
