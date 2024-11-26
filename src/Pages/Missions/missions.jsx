import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]); // État pour stocker les utilisateurs
  const [currentPage, setCurrentPage] = useState(1);
  const missionsPerPage = 10; // Nombre de missions par page
  const [allMissions, setAllMissions] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("all");

  const authorizedUserIds = process.env.REACT_APP_AUTHORIZED_USER_IDS
    ? process.env.REACT_APP_AUTHORIZED_USER_IDS.split(",")
    : [];

  const fetchMissions = async () => {
    try {
      const q = query(
        collection(db, "missions"),
        orderBy("interventionEndDate", "desc")
      );
      const querySnapshot = await getDocs(q);
      const missionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllMissions(missionsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des missions : ", error);
    }
  };

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        email: doc.data().email,
        urlPhoto: doc.data().urlPhoto,
      }));
      setTechnicians(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  // Fonction pour récupérer les utilisateurs depuis Firestore

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des utilisateurs : ",
        error
      );
    }
  };

  const initializeTechnicianFilter = () => {
    if (!auth.currentUser) return;

    const currentUserUid = auth.currentUser.uid;

    // Cas spécial pour l'utilisateur avec l'UID spécifique (Anaelle)
    if (currentUserUid === "oXOlHndiQhTZlB7fdZcRhYEE7U83") {
      setSelectedTechnician("all");
      setMissions(allMissions); // Affiche toutes les missions
      return;
    }

    // Trouver l'utilisateur connecté
    const user = users.find((user) => user.uid === currentUserUid);

    if (user) {
      const technician = technicians.find((tech) => tech.email === user.email);

      if (technician) {
        setSelectedTechnician(technician.id);
        const filteredMissions = allMissions.filter((mission) =>
          mission.intervenants.includes(technician.id)
        );
        setMissions(filteredMissions);
      }
    }
  };

  const filterMissionsByUser = (e) => {
    const selectedTechnician = e.target.value;
    setSelectedTechnician(selectedTechnician);

    if (selectedTechnician === "all") {
      setMissions(allMissions);
    } else {
      const filteredMissions = allMissions.filter((mission) =>
        mission.intervenants.includes(selectedTechnician)
      );
      setMissions(filteredMissions);
    }
  };

  useEffect(() => {
    fetchMissions();
    fetchTechnicians();
    fetchUsers(); // Récupération des utilisateurs
  }, []);

  useEffect(() => {
    initializeTechnicianFilter();
  }, [users, technicians, allMissions]);

  // Fonction pour obtenir l'email du créateur de la mission à partir du uid
  const getUserEmail = (uid) => {
    const user = users.find((user) => user.uid === uid);
    return user ? user.email : "Email inconnu";
  };

  // Fonction pour obtenir l'URL de la photo du technicien par ID
  const getTechnicianPhotoURL = (id) => {
    const technician = technicians.find((tech) => tech.id === id);
    return technician ? technician.urlPhoto : null;
  };

  // Fonction pour supprimer une mission
  const deleteMission = async (missionId) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "missions", missionId));
        fetchMissions();
        Swal.fire("Supprimé !", "La mission a été supprimée.", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression de la mission :", error);
        Swal.fire(
          "Erreur",
          "Une erreur est survenue lors de la suppression de la mission.",
          "error"
        );
      }
    }
  };

  const totalPages = Math.ceil(missions.length / missionsPerPage);

  // Extraire les missions pour la page actuelle
  const currentMissions = missions.slice(
    (currentPage - 1) * missionsPerPage,
    currentPage * missionsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const isInterventionDateWhen = (mission) => {
    const currentDate = new Date();
    const interventionStartDate = new Date(mission.interventionStartDate);
    const interventionEndDate = new Date(mission.interventionEndDate);

    // Supprime l'heure pour ne comparer que les dates
    currentDate.setHours(0, 0, 0, 0);
    interventionStartDate.setHours(0, 0, 0, 0);
    interventionEndDate.setHours(0, 0, 0, 0);

    if (currentDate > interventionEndDate) {
      return "passee";
    } else if (
      currentDate >= interventionStartDate &&
      currentDate <= interventionEndDate
    ) {
      return "ceJour";
    } else {
      return "aVenir";
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1300 });
  }, []);

  return (
    <div className={styles.missionsContainer}>
      <h1>Fiches Missions</h1>
      <Link to="/missions/create" className={styles.createMission}>
        <i className="fa-solid fa-plus"></i> Créer une nouvelle fiche mission
      </Link>

      {/* select permemttant de filter les missions par technicien */}
      <div className={styles.filterMissions}>
        <label htmlFor="technician">Filtrer par technicien :</label>
        <select
          name="technician"
          id="technician"
          onChange={filterMissionsByUser}
          value={selectedTechnician}
        >
          <option value="all">Tous</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.missionsList}>
        {currentMissions.map((mission) => (
          <div
            className={styles.missionItem}
            key={mission.id}
            data-aos="fade-up"
          >
            <h2>
              <span className={styles.interventionDate}>
                {new Date(mission.interventionStartDate).toLocaleDateString(
                  "fr-FR"
                ) ===
                new Date(mission.interventionEndDate).toLocaleDateString(
                  "fr-FR"
                )
                  ? new Date(mission.interventionStartDate).toLocaleDateString(
                      "fr-FR"
                    )
                  : `${new Date(
                      mission.interventionStartDate
                    ).toLocaleDateString("fr-FR")} - ${new Date(
                      mission.interventionEndDate
                    ).toLocaleDateString("fr-FR")}`}
              </span>{" "}
              - {mission.site.siteName} / {mission.client.nomEntreprise}
            </h2>

            {/* // badge avec a venir, aujourd'hui ou passée */}
            <span
              className={styles[isInterventionDateWhen(mission)]}
              data-aos="fade-up"
            >
              {isInterventionDateWhen(mission) === "passee" && "Passée"}
              {isInterventionDateWhen(mission) === "ceJour" && "Aujourd'hui"}
              {isInterventionDateWhen(mission) === "aVenir" && "À venir"}
            </span>

            <br />
            <p>
              <i className="fa-solid fa-folder-plus"></i>Mission créée par :{" "}
              {getUserEmail(mission.createdBy)} le{" "}
              {mission.createdAt.toDate().toLocaleDateString()}
            </p>

            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h3>Entreprise / Site</h3>
                <ul>
                  <li>
                    {/* //si le logo de l entreprise est renseigné, on l affiche */}
                    {mission.client.logoEntreprise && (
                      <img
                        src={mission.client.logoEntreprise}
                        alt="logo entreprise"
                        className={styles.logoEntreprise}
                        data-aos="zoom-in"
                      />
                    )}
                  </li>
                  <li>
                    <i className="fa-regular fa-building"></i> Client :{" "}
                    {mission.client.nomEntreprise}
                  </li>
                  <li>
                    <i className="fa-solid fa-phone"></i> Téléphone :{" "}
                    {mission.client.tel}
                  </li>
                  <li>
                    <i className="fa-solid fa-at"></i> Email :{" "}
                    {mission.client.email}
                  </li>
                  <li>
                    <i className="fa-solid fa-monument"></i> Nom du site :{" "}
                    {mission.site.siteName}
                  </li>
                  <li>
                    <i className="fa-solid fa-location-dot"></i> Adresse :{" "}
                    {mission.site.adresse}
                  </li>
                  <li>
                    <i className="fa-regular fa-user"></i> Contact sur site :{" "}
                    {mission.site.nomContact}
                  </li>
                  <li>
                    <i className="fa-regular fa-address-card"></i> Fonction du
                    contact : {mission.site.fonctionContact}
                  </li>
                  <li>
                    <i className="fa-solid fa-mobile-screen-button"></i>{" "}
                    Téléphone : {mission.site.telContact}
                  </li>
                </ul>
              </div>

              <div className={styles.section1Right}>
                <h3>Intervenant(s)</h3>
                <div className={styles.technicians}>
                  {mission.intervenants && mission.intervenants.length > 0 ? (
                    mission.intervenants.map((intervenantId, index) => (
                      <div key={index} className={styles.technicianItem}>
                        <p>
                          {technicians.find((tech) => tech.id === intervenantId)
                            ?.name || "Nom inconnu"}
                        </p>
                        <img
                          src={getTechnicianPhotoURL(intervenantId)}
                          alt="Technicien"
                          data-aos="zoom-in"
                        />
                      </div>
                    ))
                  ) : (
                    <p>Aucun intervenant</p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.section2}>
              <div className={styles.section2Left}>
                <h3>Mission(s) :</h3>
                <ul>
                  {mission.missions.map((mission, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-chevron-right"></i>
                      {mission}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.section2Right}>
                <h3> Risques / EPI :</h3>
                <ul>
                  {mission.risqueEPI.map((risque, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-minus"></i>
                      {risque}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.section3}>
              <Link
                to={`/mission/${mission.id}`}
                className={styles.viewMission}
              >
                <i className="fa-solid fa-eye"></i>
              </Link>

              <Link
                to={`/missions/edit/${mission.id}`}
                className={styles.editMission}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </Link>

              {authorizedUserIds.includes(auth.currentUser.uid) && (
                <Link
                  className={styles.deleteMission}
                  onClick={() => deleteMission(mission.id)}
                >
                  <i className="fa-solid fa-trash"></i>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button onClick={() => handlePageChange(currentPage - 1)}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <p>
          Page {currentPage} / {totalPages}
        </p>
        <button onClick={() => handlePageChange(currentPage + 1)}>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
