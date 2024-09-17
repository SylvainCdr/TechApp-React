import { BrowserRouter, Routes, Route } from "react-router-dom";
import Template from "./Components/Template/Template";
import ScrollToTop from "./utils/scrollToTop";
import Home from "./Pages/Home/Home";
import Missions from "./Pages/Missions/missions";
import Reports from "./Pages/Reports/reports";
import IncidentReports from "./Pages/Incidents/incidents";
import CreateMission from "./Pages/CreateMission/createMission";
import Technicians from "./Pages/Technicians/technicians";
import EditReport from "./Pages/EditReport/editReport";
import CreateReport from "./Pages/CreateReport/createReport";
import InterventionReport from "./Pages/Report/Report";
import EditMission from "./Pages/EditMission/editMission";
import Mission from "./Pages/Mission/mission";
import EditIncident from "./Pages/EditIncident/editIncident";
import Incident from "./Pages/Incident/incident";
import Search from "./Pages/Search/search";
import CreateIncident from "./Pages/CreateIncident/createIncident";
import ProtectedRoute from "./Components/protectedRoute/ProtectedRoute";
import Login from "./Components/login/login";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Template />}>
        <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/missions"
            element={
              <ProtectedRoute>
                <Missions />{" "}
              </ProtectedRoute>
            }
          />
          <Route path="/reports" element={
             <ProtectedRoute>
            <Reports />
            </ProtectedRoute>
            } />
          <Route path="/incidents" element={
            <ProtectedRoute>
            <IncidentReports />
            </ProtectedRoute>
            } />
          <Route path="/missions/create" element={
            <ProtectedRoute>
            <CreateMission />
            </ProtectedRoute>
            } />
          <Route path="/missions/edit/:missionId" element={
            <ProtectedRoute>
            <EditMission />
            </ProtectedRoute>
            } />
          <Route path="/mission/:missionId" element={
            <ProtectedRoute>
            <Mission />
            </ProtectedRoute>
            } />
          <Route path="/tech" element={
            <ProtectedRoute>
            <Technicians />
            </ProtectedRoute>
            } />
          <Route path="/reports/create" element={
            <ProtectedRoute>
            <CreateReport />
            </ProtectedRoute>
            } />
          <Route path="report/:reportId" element={
            <ProtectedRoute>
            <InterventionReport />
            </ProtectedRoute>
            } />
          <Route path="/reports/edit/:reportId" element={
            <ProtectedRoute>
            <EditReport />
            </ProtectedRoute>
            } />
          <Route
            path="/incidents/edit/:incidentId"
            element={<ProtectedRoute>

            <EditIncident />
            </ProtectedRoute>
          }
          />
          <Route path="/incident/:incidentId" element={
            <ProtectedRoute>
            <Incident />
            </ProtectedRoute>
            } />
          <Route path="/incidents/create" element={
            <ProtectedRoute>
            <CreateIncident />
            </ProtectedRoute>
            } />
          <Route path="/search" element={
            <ProtectedRoute>
            <Search />
            </ProtectedRoute>
            } />

          {/* EX : <Route path="/logement/:logementId" element={<Rental />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
