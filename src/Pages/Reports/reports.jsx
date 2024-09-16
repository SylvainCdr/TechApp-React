import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Fonction pour récupérer les rapports d'intervention depuis Firestore
  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "interventionReports")
      );
      const reportsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsList);
    } catch (error) {
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
        urlPhoto: doc.data().urlPhoto,
      }));
      setTechnicians(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchTechnicians();
  }, []);

  // Fonction pour obtenir l'URL de la photo du technicien
  const getTechnicianPhotoURL = (name) => {
    const technician = technicians.find((tech) => tech.name === name);
    return technician ? technician.urlPhoto : null;
  };

  // Fonction pour supprimer un rapport avec alerte de confirmation
  const deleteReport = async (id) => {
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
        await deleteDoc(doc(db, "interventionReports", id));
        fetchReports(); // Met à jour la liste des rapports après suppression
        Swal.fire("Supprimé !", "Le rapport a été supprimé.", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression du rapport : ", error);
        Swal.fire(
          "Erreur",
          "Une erreur est survenue lors de la suppression du rapport.",
          "error"
        );
      }
    }
  };

  // Fonction de gestionnaire d'événement pour la suppression du rapport
  const deleteReportHandler = (id) => {
    deleteReport(id); // Utilise SweetAlert2 pour la confirmation
  };

  return (
    <div className={styles.reportsContainer}>
      <h1>Rapports d'intervention</h1>

      <Link to="/reports/create" className={styles.createReport}>
        <i className="fa-solid fa-plus"></i> Créer un nouveau rapport
        d'intervention
      </Link>

      <ul className={styles.reportsList}>
        {reports.map((report) => (
          <li key={report.id} className={styles.reportItem}>
            <h2>
              {report.interventionStartDate} / {report.interventionEndDate} -{" "}
              {report.client?.nomEntreprise || "Nom de l'entreprise manquant"}
            </h2>
            {/* Vérification de la présence des actions et affichage du badge */}
            {report.actionsDone && report.actionsDone.length > 0 ? (
              <span className={styles.badgeGreen}>Complété</span>
            ) : (
              <span className={styles.badgeRed}>À compléter</span>
            )}
            {/* Lien vers la fiche missions associée  */}
            <p>
              {report.missionId ? (
                <Link to={`/mission/${report.missionId}`}>
                  Voir la fiche mission associée
                </Link>
              ) : (
                "Aucune fiche mission associée"
              )}
            </p>

            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h4>Entreprise / Site</h4>
                <ul>
                  <li>
                    <i class="fa-regular fa-building"></i> Client :{" "}
                    {report.client.nomEntreprise}
                  </li>
                  <li>
                    <i class="fa-solid fa-phone"></i>Téléphone :{" "}
                    {report.client.tel}
                  </li>
                  <li>
                    <i class="fa-solid fa-at"></i>Email : {report.client.email}
                  </li>
                  <li>
                    <i class="fa-solid fa-location-dot"></i>Adresse du site :{" "}
                    {report.site.adresse}
                  </li>
                  <li>
                    <i class="fa-regular fa-user"></i>Contact sur site :{" "}
                    {report.site.nomContact}
                  </li>
                  <li>
                    <i class="fa-regular fa-address-card"></i>Fonction du
                    contact : {report.site.fonctionContact}
                  </li>
                  <li>
                    <i class="fa-solid fa-mobile-screen-button"></i> Téléphone :{" "}
                    {report.site.telContact}
                  </li>
                </ul>
              </div>

              <div className={styles.section1Right}>
                <h4>Intervenant(s)</h4>
                <div className={styles.technicians}>
                  {report.intervenants && report.intervenants.length > 0 ? (
                    report.intervenants.map((intervenant, index) => (
                      <div key={index} className={styles.technicianItem}>
                        <p>{intervenant}</p>
                        <img
                          src={getTechnicianPhotoURL(intervenant)}
                          alt={`Photo de ${intervenant}`}
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
                {/* Affichage des actions menées */}
                <h4>Actions menées :</h4>

                <div>
                  {report.actionsDone?.map((action, index) => (
                    <div key={index}>
                      <li>
                        <i className="fa-solid fa-check"></i>{" "}
                        {action.description}
                      </li>
                    </div>
                  ))}
                  <p>
                    <i className="fa-solid fa-paperclip"></i>
                    Nombre de photos jointes :{" "}
                    {report.actionsDone
                      ? report.actionsDone.reduce(
                          (total, action) =>
                            total + (action.photos ? action.photos.length : 0),
                          0
                        )
                      : 0}
                  </p>
                </div>
              </div>

              <div className={styles.section2Right}>
                {/* Affichage des remarques */}
                <h4>Remarques :</h4>
                <div>
                  {report.remarques?.map((remarque, index) => (
                    <li key={index}>
                      {" "}
                      <i className="fa-solid fa-minus"></i>
                      {remarque.remarque}
                    </li>
                  ))}
                </div>

                <p>
                  <i className="fa-solid fa-paperclip"></i>
                  Nombre de photos jointes :{" "}
                  {report.remarques
                    ? report.remarques.reduce(
                        (total, remarque) =>
                          total +
                          (remarque.photos ? remarque.photos.length : 0),
                        0
                      )
                    : 0}
                </p>

                <p>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Intervention à risque : {report.risques ? "Oui" : "Non"}
                </p>
              </div>
            </div>

            <div className={styles.section3}>
              <Link to={`/report/${report.id}`} className={styles.viewButton}>
                Voir le rapport
              </Link>

              <Link
                to={`/reports/edit/${report.id}`}
                className={styles.editButton}
              >
                Remplir / Modifier
              </Link>

              <Link
                className={styles.deleteButton}
                onClick={() => deleteReportHandler(report.id)}
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
