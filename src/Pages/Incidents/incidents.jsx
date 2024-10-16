import styles from "./style.module.scss";
import { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function IncidentReports() {
  const [error, setError] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // État pour la page actuelle
  const incidentsPerPage = 6; // Nombre d'incidents par page
  const [technicians, setTechnicians] = useState([]);

  const authorizedUserIds = process.env.REACT_APP_AUTHORIZED_USER_IDS
  ? process.env.REACT_APP_AUTHORIZED_USER_IDS.split(",")
  : [];


  const fetchIncidents = async () => {
    // setLoading(true);
    try {
      // Requête pour récupérer les incidents triés par date de création décroissante
      const q = query(
        collection(db, "incidentReports"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const incidentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(incidentsList);
    } catch (error) {
      setError(error);
      console.error("Erreur lors de la récupération des rapports : ", error);
    }
  };

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        urlPhoto: doc.data().urlPhoto, // Assurez-vous que le champ urlPhoto existe
      }));
      setTechnicians(techniciansList); // Stocker les techniciens dans l'état
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchIncidents(); // Récupère les incidents
    fetchTechnicians(); // Récupère les techniciens
  }, []);

  // Fonction pour supprimer un incident avec alerte de confirmation
  const deleteIncident = async (id) => {
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
        await deleteDoc(doc(db, "incidentReports", id));
        fetchIncidents(); // Met à jour la liste des incidents après suppression
        Swal.fire("Supprimé !", "L'incident a été supprimé.", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression de l'incident : ", error);
        Swal.fire(
          "Erreur",
          "Une erreur est survenue lors de la suppression de l'incident.",
          "error"
        );
      }
    }
  };

  const handleDelete = (id) => {
    deleteIncident(id);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(incidents.length / incidentsPerPage);

  // Calcul de l'index de début et de fin de la pagination
  const indexOfLastIncident = currentPage * incidentsPerPage;
  const indexOfFirstIncident = indexOfLastIncident - incidentsPerPage;

  // Extraire les incidents pour la page actuelle
  const currentIncidents = incidents.slice(
    indexOfFirstIncident,
    indexOfLastIncident
  );

  return (
    <div className={styles.incidentsContainer}>
      <h1>Fiches d'incidents</h1>

      <Link to="/incidents/create" className={styles.createIncident}>
        <i className="fa-solid fa-plus"></i> Créer une nouvelle fiche incident
      </Link>

      <ul className={styles.incidentsList}>
        {currentIncidents.map((incident) => (
          <motion.li
            key={incident.id}
            className={styles.incidentItem}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>
              {incident.createdAt
                ? typeof incident.createdAt.toDate === "function"
                  ? incident.createdAt.toDate().toLocaleDateString()
                  : new Date(incident.createdAt).toLocaleDateString()
                : "Date inconnue"}{" "}
              - {incident.client.nomEntreprise}
            </h2>

            {incident.missionsDangereuses &&
            incident.missionsDangereuses.length > 0 ? (
              <div className={styles.badgeGreen}>Complété</div>
            ) : (
              <div className={styles.badgeRed}>À compléter</div>
            )}
            <p>
              {incident.interventionReportId ? (
                <Link to={`/report/${incident.interventionReportId}`}>
                  Voir le rapport d'intervention associé
                </Link>
              ) : (
                "Aucun rapport d'intervention associé"
              )}
            </p>

            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h4>Entreprise / Site</h4>
                <ul>
                  <li>
                    <i className="fa-regular fa-building"></i> Client :{" "}
                    {incident.client.nomEntreprise}
                  </li>
                  <li>
                    <i className="fa-solid fa-phone"></i>Téléphone :{" "}
                    {incident.client.tel}
                  </li>
                  <li>
                    <i className="fa-solid fa-at"></i>Email :{" "}
                    {incident.client.email}
                  </li>
                  <li>
                    <i className="fa-solid fa-location-dot"></i>Adresse du site
                    : {incident.site.adresse}
                  </li>
                  <li>
                    <i className="fa-regular fa-user"></i>Contact sur site :{" "}
                    {incident.site.nomContact}
                  </li>
                  <li>
                    <i className="fa-regular fa-address-card"></i>Fonction du
                    contact : {incident.site.fonctionContact}
                  </li>
                  <li>
                    <i className="fa-solid fa-mobile-screen-button"></i>{" "}
                    Téléphone : {incident.site.telContact}
                  </li>
                </ul>
              </div>

              <div className={styles.section1Right}>
                <h4>Intervenant(s)</h4>
                <ul>
                  {incident.intervenants &&
                  Array.isArray(incident.intervenants) &&
                  incident.intervenants.length > 0 ? (
                    incident.intervenants.map((intervenantId, index) => {
                      // Trouver le technicien correspondant à l'ID de l'intervenant
                      const technician = technicians.find(
                        (tech) => tech.id === intervenantId
                      );
                      return technician ? (
                        <li key={index}>
                          <i className="fa-solid fa-user"></i> {technician.name}
                        </li>
                      ) : (
                        <li key={index}>
                          <i className="fa-solid fa-user"></i> Intervenant
                          inconnu
                        </li>
                      );
                    })
                  ) : (
                    <li>Aucun intervenant spécifié</li>
                  )}
                </ul>
              </div>
            </div>

            <div className={styles.section2}>
              <div className={styles.section2Left}>
                <h4>Remarque(s) :</h4>
                <ul>
                  {incident.remarques.map((remarque, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-chevron-right"></i>
                      {remarque.remarque}
                    </li>
                  ))}
                </ul>
                <p>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Intervention à risque : {incident.risques ? "Oui" : "Non"}
                </p>
                {/* <p>
                  <i className="fa-solid fa-paperclip"></i>Nombre de photos
                  jointes : {incident.photos.length}
                </p> */}
              </div>

              <div className={styles.section2Right}>
                <h4>Photo(s) liée(s) au rapport :</h4>
                <ul>
                  {incident.remarques.map((remarque, index) => (
                    <li key={index}>
                      {/* Vérification s'il y a des photos associées */}
                      {remarque.photos && remarque.photos.length > 0 && (
                        <div>
                          {/* Affichage de chaque photo */}
                          {remarque.photos.map((photo, i) => (
                            <img
                              key={i}
                              src={photo}
                              alt={`Photo ${i + 1} de la remarque`}
                            />
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.section3}>
              <div className={styles.section3Left}>
                <h4>Mission(s) dangereuse(s) :</h4>
                {incident.missionsDangereuses.map((mission, index) => (
                  <p key={index}>
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {mission}
                  </p>
                ))}
              </div>
              <div className={styles.section3Right}>
                <h4>Action(s) corrective(s) :</h4>
                <ul>
                  {incident.actions.map((action, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-check"></i>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.section4}>
              <Link to={`/incident/${incident.id}`} className={styles.viewBtn}>
                <i className="fa-solid fa-eye"></i>
              </Link>
              <Link
                to={`/incidents/edit/${incident.id}`}
                className={styles.editBtn}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </Link>
              {authorizedUserIds.includes(auth.currentUser.uid) && (
              <Link
                onClick={() => handleDelete(incident.id)}
                className={styles.deleteBtn}
              >
                <i className="fa-solid fa-trash"></i>
              </Link>
            )}
            </div>
          </motion.li>
        ))}
      </ul>

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
