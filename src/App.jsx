import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase"; // Assure-toi que le fichier Firebase est bien configuré
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
import Loader from "./utils/loader/loader";
import Sites from "./Pages/Sites/Sites";

function App() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Termine le chargement après 2 secondes
    }, 2000);
    // Suivre l'état de l'utilisateur connecté
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      // Nettoyer l'effet
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  if (loading) {
    return <Loader loading={loading} />; // Affiche le loader pendant le chargement
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Template />}>
          {/* Si l'utilisateur est connecté, redirige vers /home, sinon vers /login */}
          <Route
            path="/"
            element={user ? <Navigate to="/home" /> : <Login />}
          />

          {/* Pages protégées par l'authentification */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions"
            element={
              <ProtectedRoute>
                <Missions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <IncidentReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions/create"
            element={
              <ProtectedRoute>
                <CreateMission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missions/edit/:missionId"
            element={
              <ProtectedRoute>
                <EditMission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mission/:missionId"
            element={
              <ProtectedRoute>
                <Mission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tech"
            element={
              <ProtectedRoute>
                <Technicians />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/create"
            element={
              <ProtectedRoute>
                <CreateReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="report/:reportId"
            element={
              <ProtectedRoute>
                <InterventionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/edit/:reportId"
            element={
              <ProtectedRoute>
                <EditReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/edit/:incidentId"
            element={
              <ProtectedRoute>
                <EditIncident />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incident/:incidentId"
            element={
              <ProtectedRoute>
                <Incident />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/create"
            element={
              <ProtectedRoute>
                <CreateIncident />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
        <Route
          path="/sites"
          element={
            <ProtectedRoute>
              <Sites />
            </ProtectedRoute>
          }
          />
          </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
