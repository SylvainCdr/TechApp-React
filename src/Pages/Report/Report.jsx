import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import styles from "./style.module.scss";

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

  return (
    <div className={styles.reportContainer}>
      <h1> Rapport d'intervention N° {report.id} </h1>
      {report ? (
        <div className={styles.reportItem}>
          <h2>
            {" "}
            {report.interventionStartDate} / {report.interventionEndDate} -{" "}
            {report.client.nomEntreprise}
          </h2>

          <div className={styles.section1}>
            <div className={styles.section1Left}>
              <h4>Entreprise / Site</h4>
              <ul>
                <li>Client : {report.client.nomEntreprise}</li>
                <li>Email : {report.client.email}</li>
                <li>Téléphone : {report.client.tel}</li>
                <li>Adresse du site : {report.site.adresse}</li>
                <li>Nom du contact sur site : {report.site.nomContact}</li>
                <li>Fonction du contact : {report.site.fonctionContact}</li>
                <li>Téléphone du contact: {report.site.telContact}</li>
              </ul>
            </div>

            <div className={styles.section1Right}>
              <h4>Intervenant</h4>
              <h3> {report.intervenant}</h3>

              <img
                src={
                  technicians.find((tech) => tech.name === report.intervenant)
                    ?.urlPhoto
                }
                alt="Photo de l'intervenant"
              />
            </div>
          </div>

          <div className={styles.section2}>
            <div className={styles.section2Left}>
              <h4>Actions menées </h4>
              <div>
                {report.actionsDone?.map((action, index) => (
                  <div key={index}>
                    <li>
                      <i className="fa-solid fa-check"></i> {action.description}
                    </li>
                    {/* Boucle sur les photos de chaque action */}
                    <div>
                      {action.photos?.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Photo ${i + 1} de l'action ${index + 1}`}
                          style={{ width: "100px", height: "auto" }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section2Right}>
              <h4> Remarques / Risques</h4>
              {report.remarques?.map((remarque, index) => (
                  <div key={index}>
                    <li>
                      <i className="fa-solid fa-check"></i> {remarque.remarque}
                    </li>
                    {/* Boucle sur les photos de chaque action */}
                    <div>
                      {remarque.photos?.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Photo ${i + 1} de l'action ${index + 1}`}
                          style={{ width: "100px", height: "auto" }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              <p>
                {" "}
                <i class="fa-solid fa-triangle-exclamation"></i> Intervention à
                risque : {report.risques ? "Oui" : "Non"}
              </p>
            </div>
          </div>

          <div>
            <h4>Photos :</h4>
            {/* <div>
  {report.remarques && report.remarques[0].photos && report.remarques[0].photos.map((photo, i) => (
    <img key={i} src={photo} alt={`Photo ${i + 1}`}  />
  ))}
</div> */}
          </div>
        </div>
      ) : (
        <p>Rapport non disponible.</p>
      )}
    </div>
  );
}
