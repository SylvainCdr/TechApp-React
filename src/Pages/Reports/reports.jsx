import { useState, useEffect } from "react";
import styles from "./style.module.scss";
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

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 6; // Nombre de rapports par page

  const authorizedUserIds = process.env.REACT_APP_AUTHORIZED_USER_IDS
  ? process.env.REACT_APP_AUTHORIZED_USER_IDS.split(',')
  : [];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsQuery = query(
          collection(db, "interventionReports"),
          orderBy("interventionStartDate", "desc") // Trie par interventionStartDate
        );
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsList = reportsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsList);
  
        const techniciansSnapshot = await getDocs(
          collection(db, "technicians")
        );
        const techniciansList = techniciansSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
          urlPhoto: doc.data().urlPhoto,
        }));
        setTechnicians(techniciansList);
      } catch (error) {
        console.error("Erreur lors de la récupération des données : ", error);
        Swal.fire(
          "Erreur",
          "Une erreur est survenue lors de la récupération des données.",
          "error"
        );
      }
    };
  
    fetchData();
  }, []);
  

  const getTechnicianPhotoURL = (id) => {
    const technician = technicians.find((tech) => tech.id === id);
    return technician ? technician.urlPhoto : null;
  };

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
        setReports(reports.filter((report) => report.id !== id));
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
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const currentReports = reports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  return (
    <div className={styles.reportsContainer}>
      <h1>Rapports d'intervention</h1>

      <Link to="/reports/create" className={styles.createReport}>
        <i className="fa-solid fa-plus"></i> Créer un nouveau rapport
        d'intervention
      </Link>

      <ul className={styles.reportsList}>
        {currentReports.map((report) => (
          <motion.li
            key={report.id}
            className={styles.reportItem}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>
              {new Date(report.interventionStartDate).toLocaleDateString(
                "fr-FR"
              ) ===
              new Date(report.interventionEndDate).toLocaleDateString("fr-FR")
                ? new Date(report.interventionStartDate).toLocaleDateString(
                    "fr-FR"
                  ) // Si les dates sont identiques
                : `${new Date(report.interventionStartDate).toLocaleDateString(
                    "fr-FR"
                  )} / ${new Date(
                    report.interventionEndDate
                  ).toLocaleDateString("fr-FR")}`}{" "}
              - {report.client?.nomEntreprise || "Nom de l'entreprise manquant"}
            </h2>

            <span
              className={
                report.actionsDone?.length ? styles.badgeGreen : styles.badgeRed
              }
            >
              {report.actionsDone?.length ? "Complété" : "À compléter"}
            </span>

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
                    <i className="fa-regular fa-building"></i> Client :{" "}
                    {report.client.nomEntreprise}
                  </li>
                  <li>
                    <i className="fa-solid fa-phone"></i> Téléphone :{" "}
                    {report.client.tel}
                  </li>
                  <li>
                    <i className="fa-solid fa-at"></i> Email :{" "}
                    {report.client.email}
                  </li>
                  <li>
                    <i className="fa-solid fa-location-dot"></i> Adresse du site
                    : {report.site.adresse}
                  </li>
                  <li>
                    <i className="fa-regular fa-user"></i> Contact sur site :{" "}
                    {report.site.nomContact}
                  </li>
                  <li>
                    <i className="fa-regular fa-address-card"></i> Fonction du
                    contact : {report.site.fonctionContact}
                  </li>
                  <li>
                    <i className="fa-solid fa-mobile-screen-button"></i>{" "}
                    Téléphone : {report.site.telContact}
                  </li>
                </ul>
              </div>

              <div className={styles.section1Right}>
                <h4>Intervenant(s)</h4>
                <div className={styles.technicians}>
                  {report.intervenants && report.intervenants.length > 0 ? (
                    report.intervenants.map((intervenantId, index) => (
                      <div key={index} className={styles.technicianItem}>
                        <p>
                          {technicians.find((tech) => tech.id === intervenantId)
                            ?.name || "Nom inconnu"}
                        </p>
                        <img
                          src={getTechnicianPhotoURL(intervenantId)}
                          alt={`Photo de technicien`}
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
                <h4>Actions menées :</h4>
                <ul>
                  {report.actionsDone?.map((action, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-check"></i> {action.description}
                    </li>
                  ))}
                </ul>
                <p>
                  <i className="fa-solid fa-paperclip"></i> Nombre de photos
                  jointes :{" "}
                  {report.actionsDone?.reduce(
                    (total, action) =>
                      total + (action.photos ? action.photos.length : 0),
                    0
                  ) || 0}
                </p>
              </div>

              <div className={styles.section2Right}>
                <h4>Remarques / Risques:</h4>
                <ul>
                  {report.remarques?.map((remarque, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-minus"></i> {remarque.remarque}
                    </li>
                  ))}
                </ul>
                <p>
                  <i className="fa-solid fa-paperclip"></i> Nombre de photos
                  jointes :{" "}
                  {report.remarques?.reduce(
                    (total, remarque) =>
                      total + (remarque.photos ? remarque.photos.length : 0),
                    0
                  ) || 0}
                </p>
                <p>
                  {" "}
                  <i class="fa-solid fa-clock"></i> Durée de l'intervention (en
                  heures) : {report.interventionDuration || "Non précisé"}{" "}
                </p>
                <p>
                  <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                  Intervention à risque : {report.risques ? "Oui" : "Non"}
                </p>
              </div>
            </div>

            <div className={styles.section3}>
              <Link to={`/report/${report.id}`} className={styles.viewButton}>
                <i className="fa-solid fa-eye"></i>
              </Link>

              {report.isSigned && ( // badge signé
                <span className={styles.badgeSigned}>
                  <i class="fa-solid fa-circle-check"></i> Signé par le client
                </span>
              )}

              {/* Affichage conditionnel des boutons edit et delete si isSigned est false */}
              {!report.isSigned && (
                <>
                  <Link
                    to={`/reports/edit/${report.id}`}
                    className={styles.editButton}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </Link>
                  {/* <Link
                    className={styles.deleteButton}
                    onClick={() => deleteReport(report.id)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </Link> */}
                   {authorizedUserIds.includes(auth.currentUser.uid) && (
                    <Link
                      className={styles.deleteButton}
                      onClick={() => deleteReport(report.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.li>
        ))}
      </ul>

      <div className={styles.pagination}>
        <button
          onClick={() =>
            setCurrentPage((prevPage) =>
              prevPage > 1 ? prevPage - 1 : prevPage
            )
          }
          disabled={currentPage === 1}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <p>
          Page {currentPage} / {totalPages}
        </p>
        <button
          onClick={() =>
            setCurrentPage((prevPage) =>
              prevPage < totalPages ? prevPage + 1 : prevPage
            )
          }
          disabled={currentPage === totalPages}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Reports;
