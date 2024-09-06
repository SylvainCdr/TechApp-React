import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import styles from "./style.module.scss";

export default function CreateReport() {
  const [client, setClient] = useState({
    nomEntreprise: "",
    email: "",
    tel: "",
  });
  const [site, setSite] = useState({
    adresse: "",
    nomContact: "",
    fonctionContact: "",
    telContact: "",
  });
  const [intervenant, setIntervenant] = useState("");
  const [intervenantsList, setIntervenantsList] = useState([]);
  const [actionsMenées, setActionsMenées] = useState("");
  const [remarques, setRemarques] = useState("");
  const [photos, setPhotos] = useState([]);
  const [risques, setRisques] = useState(false);

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        urlPhoto: doc.data().urlPhoto
      }));
      setIntervenantsList(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const reportData = {
        client,
        site,
        intervenant,
        actionsMenées,
        remarques,
        photos,
        risques,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "interventionReports"), reportData);
      alert("Rapport d'intervention créé avec succès !");

      // Reset du formulaire après la soumission
      setClient({ nomEntreprise: "", email: "", tel: "" });
      setSite({ adresse: "", nomContact: "", fonctionContact: "", telContact: "" });
      setIntervenant("");
      setActionsMenées("");
      setRemarques("");
      setPhotos([]);
      setRisques(false);

    } catch (error) {
      console.error("Erreur lors de la création du rapport : ", error);
      alert("Une erreur est survenue lors de la création du rapport.");
    }
  };

  return (
    <div className={styles.createReportContainer}>
      <h2>Créer un rapport d'intervention</h2>
      <form onSubmit={handleSubmit}>
        <h3>Client</h3>
        <div className={styles.formGroup}>
          <label>Nom de l'entreprise :</label>
          <input
            type="text"
            value={client.nomEntreprise}
            onChange={(e) => setClient({ ...client, nomEntreprise: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Adresse mail :</label>
          <input
            type="email"
            value={client.email}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Téléphone :</label>
          <input
            type="tel"
            value={client.tel}
            onChange={(e) => setClient({ ...client, tel: e.target.value })}
            required
          />
        </div>

        <h3>Site d'intervention</h3>
        <div className={styles.formGroup}>
          <label>Adresse du site :</label>
          <input
            type="text"
            value={site.adresse}
            onChange={(e) => setSite({ ...site, adresse: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Nom du contact sur site :</label>
          <input
            type="text"
            value={site.nomContact}
            onChange={(e) => setSite({ ...site, nomContact: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Fonction du contact sur site :</label>
          <input
            type="text"
            value={site.fonctionContact}
            onChange={(e) => setSite({ ...site, fonctionContact: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Téléphone du contact :</label>
          <input
            type="tel"
            value={site.telContact}
            onChange={(e) => setSite({ ...site, telContact: e.target.value })}
            required
          />
        </div>

        <h3>Intervenant</h3>
        <div className={styles.formGroup}>
          <label>Choisir l'intervenant :</label>
          <select
            value={intervenant}
            onChange={(e) => setIntervenant(e.target.value)}
            required
          >
            <option value="">Sélectionner un intervenant</option>
            {intervenantsList.map(tech => (
              <option key={tech.id} value={tech.name}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>

        <h3>Actions menées</h3>
        <div className={styles.formGroup}>
          <label>Description des actions menées :</label>
          <textarea
            value={actionsMenées}
            onChange={(e) => setActionsMenées(e.target.value)}
            required
          />
        </div>

        <h3>Remarques</h3>
        <div className={styles.formGroup}>
          <label>Remarques :</label>
          <textarea
            value={remarques}
            onChange={(e) => setRemarques(e.target.value)}
          />
        </div>

        <h3>Photos</h3>
        <div className={styles.formGroup}>
          <label>Ajouter des photos :</label>
          <input
            type="file"
            multiple
            onChange={(e) => setPhotos([...e.target.files])}
          />
        </div>

        <h3>Risques / EPI</h3>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={risques}
              onChange={() => setRisques(!risques)}
            />
            Intervention comporte des risques
          </label>
        </div>

        <button type="submit">Créer le rapport</button>
      </form>
    </div>
  );
}
