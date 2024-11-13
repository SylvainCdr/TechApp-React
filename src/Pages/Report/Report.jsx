import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import styles from "./style.module.scss";
import generateReportPdf from "../../utils/pdfGenerator";
import AOS from "aos";
import { sendClosedReportNotification } from "../../utils/emailService";

export default function InterventionReport() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const fetchReport = async () => {
    try {
      const docRef = doc(db, "interventionReports", reportId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() });

        const techniciansSnapshot = await getDocs(collection(db, "technicians"));
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

  const closeReport = async () => {
    try {
      const reportRef = doc(db, "interventionReports", reportId);
      await updateDoc(reportRef, {
        isClosed: true,
        updatedAt: new Date(),
      });

      const { client: { nomEntreprise: clientName }, site: { siteName } } = report;
      const reportUrl = `https://pixecuritytechapp.web.app/report/${reportId}`;

      await sendClosedReportNotification({
        from_name: "Tech-App",
        reportId,
        clientName,
        siteName,
        
        
      });

      setReport((prevReport) => ({ ...prevReport, isClosed: true, updatedAt: new Date() }));
    } catch (error) {
      console.error("Erreur lors de la clôture du rapport :", error);
      setError("Erreur lors de la clôture du rapport");
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  useEffect(() => {
    AOS.init({ duration: 1500 });
  }, []);

  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p>{error}</p>;

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

      <div className={styles.reportStatus}>
        <span className={report.isClosed ? styles.badgeGreen : styles.badgeRed} data-aos="fade-down">
          {report.isClosed ? "Clos" : "À Clôturer"}
        </span>

        {!report.isClosed && (
          <button onClick={closeReport} className={styles.closeBtn}>
            Clôturer le rapport
          </button>
        )}
      </div>

      <button onClick={handleDownloadPdf} className={styles.downloadPdf}>
        <i className="fa-solid fa-file-pdf"></i> Télécharger{" "}
      </button>

      {report ? (
        <div className={styles.reportItem}>
          <h2>
            {" "}
            <span className={styles.interventionDate}>
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
            </span>
            - {report.site.siteName} /{" "}
            {report.client?.nomEntreprise || "Nom de l'entreprise manquant"}
          </h2>
          {!report.isSigned ? (
            <Link to={`/reports/edit/${report.id}`} className={styles.editBtn}>
              Remplir / Modifier{" "}
            </Link>
          ) : (
            <p className={styles.editBtn}> Rapport signé (non modifiable) </p>
          )}





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
                  {report.client.logoEntreprise && (
                    <img
                      src={report.client.logoEntreprise}
                      alt="logo entreprise"
                      className={styles.logoEntreprise}
                      data-aos="zoom-in"
                    />
                  )}
                </li>
                <li>
                  <i className="fa-regular fa-building"></i> Client :{" "}
                  {report.client.nomEntreprise}
                </li>
                <li>
                  <i className="fa-solid fa-phone"></i>Téléphone :{" "}
                  {report.client.tel}
                </li>
                <li>
                  <i className="fa-solid fa-at"></i>Email :{" "}
                  {report.client.email}
                </li>
                <li>
                  <i className="fa-solid fa-monument"></i> Nom du site :{" "}
                  {report.site.siteName}
                </li>
                <li>
                  <i className="fa-solid fa-location-dot"></i>Adresse du site :{" "}
                  {report.site.adresse}
                </li>
                <li>
                  <i className="fa-regular fa-user"></i>Contact sur site :{" "}
                  {report.site.nomContact}
                </li>
                <li>
                  <i className="fa-regular fa-address-card"></i>Fonction du
                  contact : {report.site.fonctionContact}
                </li>
                <li>
                  <i className="fa-solid fa-mobile-screen-button"></i> Téléphone
                  : {report.site.telContact}
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
                        alt="technicien"
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
                      <td style={{ whiteSpace: "pre-wrap" }}>
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
                      <td style={{ whiteSpace: "pre-wrap" }}>
                        <i className="fa-solid fa-chevron-right"></i>{" "}
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
                <i className="fa-solid fa-clock"></i> Durée de l'intervention
                (en heures) : {report.interventionDuration}{" "}
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
