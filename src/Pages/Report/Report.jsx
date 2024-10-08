import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import styles from "./style.module.scss";
import generateReportPdf from "../../utils/pdfGenerator";

export default function InterventionReport() {
  const { reportId } = useParams(); // Récupérer l'ID du rapport depuis l'URL
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  // Fonction pour récupérer un rapport d'intervention spécifique depuis Firestore
  const fetchReport = async () => {
    try {
      const docRef = doc(db, "interventionReports", reportId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() });

        const techniciansSnapshot = await getDocs(
          collection(db, "technicians")
        );
        const techniciansList = techniciansSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
          urlPhoto: doc.data().urlPhoto,
        }));
        setTechnicians(techniciansList);
      } else {
        setError("Rapport introuvable");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du rapport : ", error);
      setError("Erreur lors de la récupération du rapport");
    } finally {
      setLoading(false);
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
    fetchReport();
    fetchTechnicians();
  }, [reportId]);

  if (loading) {
    return <p>Chargement en cours...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const getTechnicianPhotoURL = (id) => {
    const technician = technicians.find((tech) => tech.id === id);
    return technician ? technician.urlPhoto : null;
  };

  const handleDownloadPdf = () => {
    generateReportPdf(report, technicians);
  };

  return (
    <div className={styles.reportContainer} id="report-content">
      <h1> Rapport d'intervention N° {report.id} </h1>
      <button onClick={handleDownloadPdf} className={styles.downloadPdf}>
        <i class="fa-solid fa-file-pdf"></i> Télécharger{" "}
      </button>

      {report ? (
        <div className={styles.reportItem}>
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
                )} / ${new Date(report.interventionEndDate).toLocaleDateString(
                  "fr-FR"
                )}`}{" "}
            - {report.client?.nomEntreprise || "Nom de l'entreprise manquant"}
          </h2>

          {!report.isSigned && (
            <Link to={`/reports/edit/${report.id}`} className={styles.editBtn}>
              Remplir / Modifier{" "}
            </Link>
          )}

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
                  <i class="fa-regular fa-address-card"></i>Fonction du contact
                  : {report.site.fonctionContact}
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
              <h4>Actions menées </h4>

              <table>
                <thead>
                  <tr>
                    <th>Photos</th>
                    <th>Description de l'action</th>
                  </tr>
                </thead>
                <tbody>
                  {report.actionsDone?.map((action, index) => (
                    <tr key={index}>
                      {/* Colonne pour la description de l'action */}
                      <td>
                        {action.photos?.map((photo, i) => (
                          <img
                            key={i}
                            src={photo}
                            // alt={`Photo ${i + 1} de l'action ${index + 1}`}
                          />
                        ))}
                      </td>
                      <td>
                        <i className="fa-solid fa-check"></i>{" "}
                        {action.description}
                      </td>
                      {/* Colonne pour les photos */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.section2Right}>
              <h4>Remarques / Risques</h4>
              <table>
                <thead>
                  <tr>
                    <th>Photos</th>
                    <th>Remarque</th>
                  </tr>
                </thead>
                <tbody>
                  {report.remarques?.map((remarque, index) => (
                    <tr key={index}>
                      {/* Colonne pour la description de la remarque */}
                      <td>
                        {remarque.photos?.map((photo, i) => (
                          <img
                            key={i}
                            src={photo}
                            // alt={`Photo ${i + 1} de la remarque ${index + 1}`}
                          />
                        ))}
                      </td>
                      <td>
                        <i class="fa-solid fa-chevron-right"></i>{" "}
                        {remarque.remarque}
                      </td>
                      {/* Colonne pour les photos */}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>
                <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                Intervention à risque :{" "}
                <span
                  className={
                    report.risques ? styles.risqueOui : styles.risqueNon
                  }
                >
                  {report.risques ? "Oui" : "Non"}
                </span>
              </p>
              <p>
                {" "}
                <i class="fa-solid fa-clock"></i> Durée de l'intervention (en
                heures) : {report.interventionDuration}{" "}
              </p>
            </div>
          </div>

          <div>
            <h4>SIGNATURE DU CLIENT :</h4>

            <div className={styles.signature}>
              <p> Rapport signé : {report.isSigned ? "Oui" : "Non"} </p>

              <img
                src={report.signatureUrl}
                alt="Signature"
                className={styles.signatureImg}
              />
              <p>{report.signataireNom} </p>
            </div>
          </div>
        </div>
      ) : (
        <p>Rapport non disponible.</p>
      )}
    </div>
  );
}
