import styles from "./style.module.scss";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Incident() {
  const { incidentId } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const fetchIncident = async () => {
    try {
      const docRef = doc(db, "incidentReports", incidentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setIncident({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Incident introuvable");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'incident : ", error);
      setError("Erreur lors de la récupération de l'incident");
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
        urlPhoto: doc.data().urlPhoto, // Assurez-vous que le champ urlPhoto existe
      }));
      setTechnicians(techniciansList); // Stocker les techniciens dans l'état
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchIncident();
    fetchTechnicians();
  }, [incidentId]);

  const generatePdf = () => {
    const input = document.getElementById("incident-content");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`Incident_${incidentId}.pdf`);
    });
  };

  return (
    <div className={styles.incidentContainer} id="incident-content">
      <h1>Fiche Incident N° {incidentId}</h1>

      {incident && (
        <div className={styles.incidentItem}>
          <h2>
            {incident.createdAt?.toDate().toLocaleDateString()} -{" "}
            {incident.client.nomEntreprise}
          </h2>
          <div className={styles.section1}>
            <ul className={styles.section1Left}>
              <h3>Entreprise / Site</h3>
              <p>
                <i className="fa-regular fa-building"></i> Client :{" "}
                {incident.client.nomEntreprise}
              </p>
              <p>
                <i className="fa-solid fa-phone"></i>Téléphone :{" "}
                {incident.client.tel}
              </p>
              <p>
                <i className="fa-solid fa-at"></i>Email :{" "}
                {incident.client.email}
              </p>
              <p>
                <i className="fa-solid fa-location-dot"></i>Adresse du site :{" "}
                {incident.site.adresse}
              </p>
              <p>
                <i className="fa-regular fa-user"></i>Contact sur site :{" "}
                {incident.site.nomContact}
              </p>
              <p>
                <i className="fa-regular fa-address-card"></i>Fonction du
                contact : {incident.site.fonctionContact}
              </p>
              <p>
                <i className="fa-solid fa-mobile-screen-button"></i> Téléphone :{" "}
                {incident.site.telContact}
              </p>
            </ul>
            <div className={styles.section1Right}>
              <h3>Intervenant(s)</h3>
              <ul className={styles.technicians}>
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
                        <i className="fa-solid fa-user"></i> Intervenant inconnu
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
              <h3>Actions :</h3>
              <ul>
                {incident.actions.map((action, index) => (
                  <li key={index}>
                    <i className="fa-solid fa-chevron-right"></i>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.section2Right}>
              <h3>Mission(s) Dangereuse(s)</h3>
              <ul>
                {incident.missionsDangereuses.map((mission, index) => (
                  <li key={index}>
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {mission}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.section3}>
            <h3>Remarques :</h3>

            {incident.remarques && incident.remarques.length > 0 ? (
              incident.remarques.map((remarqueObj, index) => (
                <div key={index} className={styles.remarqueItem}>
                  <p>
                    {" "}
                    <i className="fa-solid fa-chevron-right"></i>
                    {remarqueObj.remarque}
                  </p>
                  {remarqueObj.photos &&
                    remarqueObj.photos.map((photoUrl, i) => (
                      <img
                        key={i}
                        src={photoUrl}
                        alt={`Remarque photo ${i + 1}`}
                        className={styles.photo}
                      />
                    ))}
                </div>
              ))
            ) : (
              <p>Aucune remarque</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
