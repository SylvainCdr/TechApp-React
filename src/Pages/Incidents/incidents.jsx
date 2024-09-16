import styles from "./style.module.scss";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function IncidentReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "incidentReports"));
      const incidentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(incidentsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des rapports : ", error);
    }
  };

  console.log(incidents);

  useEffect(() => {
    fetchIncidents();
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

  // Fonction de gestionnaire d'événement pour la suppression de l'incident
  const handleDelete = (id) => {
    deleteIncident(id); // Utilise SweetAlert2 pour la confirmation
  };

  return (
    <div className={styles.incidentsContainer}>
      <h1>Fiches d'incident</h1>

      {loading && <p>Chargement...</p>}
      {error && <p>Une erreur est survenue : {error.message}</p>}

      <ul className={styles.incidentsList}>
        {incidents.map((incident) => (
          <li key={incident.id} className={styles.incidentItem}>
            <h2>
              {" "}
              {incident.createdAt?.toDate().toLocaleDateString()} -{" "}
              {incident.client.nomEntreprise}
            </h2>
            {incident.missionsDangereuses &&
            incident.missionsDangereuses.length > 0 ? (
              <div className={styles.badgeGreen}>Complété</div>
            ) : (
              <div className={styles.badgeRed}>À compléter</div>
            )}
            <p>
              {" "}
              {incident.interventionReportId ? (
                <Link to={`/report/${incident.interventionReportId}`}>
                  Voir le rapport d'intervention associée
                </Link>
              ) : (
                "Aucune fiche mission associée"
              )}{" "}
            </p>

            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h4>Entreprise / Site</h4>
                <ul>
                  <li>
                    <i class="fa-regular fa-building"></i> Client :{" "}
                    {incident.client.nomEntreprise}
                  </li>
                  <li>
                    <i class="fa-solid fa-phone"></i>Téléphone :{" "}
                    {incident.client.tel}
                  </li>
                  <li>
                    <i class="fa-solid fa-at"></i>Email :{" "}
                    {incident.client.email}
                  </li>
                  <li>
                    <i class="fa-solid fa-location-dot"></i>Adresse du site :{" "}
                    {incident.site.adresse}
                  </li>
                  <li>
                    <i class="fa-regular fa-user"></i>Contact sur site :{" "}
                    {incident.site.nomContact}
                  </li>
                  <li>
                    <i class="fa-regular fa-address-card"></i>Fonction du
                    contact : {incident.site.fonctionContact}
                  </li>
                  <li>
                    <i class="fa-solid fa-mobile-screen-button"></i> Téléphone :{" "}
                    {incident.site.telContact}
                  </li>
                </ul>
              </div>

              <div className={styles.section1Right}>
                <h4>Intervenant(s)</h4>
                <ul>
                  {incident.intervenants.map((intervenant, index) => (
                    <li key={index}>
                      <i class="fa-solid fa-user"></i>
                      {intervenant}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.section2}>
              <div className={styles.section2Left}>
                <h4>Remarque(s) :</h4>
                <ul>
                  {incident.remarques.map((remarque, index) => (
                    <li key={index}>
                      <i class="fa-solid fa-chevron-right"></i>
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
                <h4>Photo(s) :</h4>
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
                Voir la fiche incident{" "}
              </Link>
              <Link
                to={`/incidents/edit/${incident.id}`}
                className={styles.editBtn}
              >
                Remplir / Modifier
              </Link>
              <Link
                onClick={() => handleDelete(incident.id)}
                className={styles.deleteBtn}
              >
                Supprimer
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
