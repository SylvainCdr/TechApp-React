import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";
import styles from "./style.module.scss";
import { createOrUpdateIncidentReport } from "../../automation/incidentAutomation";

export default function ReportForm({ initialData, onSubmit }) {
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
  const [intervenants, setIntervenants] = useState("");
  const [intervenantsList, setIntervenantsList] = useState([]);
  const [actionsDone, setActionsDone] = useState([{ description: "", photos: [] }]); // Photos est un tableau
  const [remarques, setRemarques] = useState([{ remarque: "", photos: [] }]); // Photos est un tableau
  const [risques, setRisques] = useState(false);
  const [missionsDangereuses, setMissionsDangereuses] = useState([""]);
  const [dateStartIntervention, setDateStartIntervention] = useState(new Date().toISOString().substring(0, 10));
  const [dateEndIntervention, setDateEndIntervention] = useState(new Date().toISOString().substring(0, 10));

  useEffect(() => {
    if (initialData) {
      setClient(initialData.client || {});
      setSite(initialData.site || {});
      setIntervenants(initialData.intervenants || "");
      setActionsDone(initialData.actionsDone || [{ description: "", photos: [] }]);
      setRemarques(initialData.remarques || [{ remarque: "", photos: [] }]);
      setRisques(initialData.risques || false);
      setMissionsDangereuses(initialData.missionsDangereuses || [""]);
      setDateStartIntervention(initialData.interventionStartDate?.substring(0, 10) || new Date().toISOString().substring(0, 10));
      setDateEndIntervention(initialData.interventionEndDate?.substring(0, 10) || new Date().toISOString().substring(0, 10));
    }
  }, [initialData]);

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        urlPhoto: doc.data().urlPhoto,
      }));
      setIntervenantsList(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

// Gérer l'ajout de photos pour chaque action
const handleActionPhotoChange = (index, e) => {
  const files = Array.from(e.target.files);
  const newActionsDone = [...actionsDone];
  
  // Conserver les anciennes photos et ajouter les nouvelles
  newActionsDone[index].photos = [...newActionsDone[index].photos, ...files];
  setActionsDone(newActionsDone);
};

// Gérer l'ajout de photos pour chaque remarque
const handleRemarquePhotoChange = (index, e) => {
  const files = Array.from(e.target.files);
  const newRemarques = [...remarques];
  
  // Conserver les anciennes photos et ajouter les nouvelles
  newRemarques[index].photos = [...newRemarques[index].photos, ...files];
  setRemarques(newRemarques);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Gérer les photos pour chaque action
    for (const [index, action] of actionsDone.entries()) {
      const uploadedActionPhotos = [];

      // Parcours des photos associées à l'action
      for (const file of action.photos) {
        if (file instanceof File) { // Si c'est un nouveau fichier (pas une URL)
          const storageRef = ref(storage, `interventionPhotos/actions/${file.name}`);
          await uploadBytes(storageRef, file); // Téléchargement du fichier
          const downloadURL = await getDownloadURL(storageRef); // Obtenir l'URL de téléchargement
          uploadedActionPhotos.push(downloadURL); // Ajouter l'URL aux photos uploadées
        } else {
          uploadedActionPhotos.push(file); // Si c'est déjà une URL, la garder
        }
      }
      actionsDone[index].photos = uploadedActionPhotos; // Conserver les URLs (anciennes et nouvelles)
    }

    // Gérer les photos pour chaque remarque
    for (const [index, remarque] of remarques.entries()) {
      const uploadedRemarquePhotos = [];

      // Parcours des photos associées à la remarque
      for (const file of remarque.photos) {
        if (file instanceof File) { // Si c'est un nouveau fichier (pas une URL)
          const storageRef = ref(storage, `interventionPhotos/remarques/${file.name}`);
          await uploadBytes(storageRef, file); // Téléchargement du fichier
          const downloadURL = await getDownloadURL(storageRef); // Obtenir l'URL de téléchargement
          uploadedRemarquePhotos.push(downloadURL); // Ajouter l'URL aux photos uploadées
        } else {
          uploadedRemarquePhotos.push(file); // Si c'est déjà une URL, la garder
        }
      }
      remarques[index].photos = uploadedRemarquePhotos; // Conserver les URLs (anciennes et nouvelles)
    }

    // Données du rapport à envoyer
    const reportData = {
      client,
      site,
      intervenants,
      actionsDone,  // Ne contient plus que des URLs pour les photos
      remarques,    // Ne contient plus que des URLs pour les photos
      risques,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
      interventionStartDate: dateStartIntervention,
      interventionEndDate: dateEndIntervention,
    };

    // Appel de la fonction onSubmit pour envoyer les données à Firestore
    await onSubmit(reportData);

    alert("Rapport soumis avec succès.");
    window.location.href = "/reports";
  } catch (error) {
    console.error("Erreur lors de la soumission du rapport : ", error);
    alert("Une erreur est survenue lors de la soumission du rapport.");
  }
};


  const addActionField = () => {
    setActionsDone([...actionsDone, { description: "", photos: [] }]);
  };

  const removeActionField = (index) => {
    setActionsDone(actionsDone.filter((_, i) => i !== index));
  };

  const addRemarqueField = () => {
    setRemarques([...remarques, { remarque: "", photos: [] }]);
  };

  const removeRemarqueField = (index) => {
    setRemarques(remarques.filter((_, i) => i !== index));
  };


  return (
    <div className={styles.reportFormContainer}>
      <form onSubmit={handleSubmit}>
        <h3>Client</h3>
        <div className={styles.formGroup}>
          <label>Nom de l'entreprise :</label>
          <input
            type="text"
            value={client.nomEntreprise}
            onChange={(e) =>
              setClient({ ...client, nomEntreprise: e.target.value })
            }
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
            onChange={(e) =>
              setSite({ ...site, fonctionContact: e.target.value })
            }
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

        <h3>Date(s) d'intervention</h3>
        <div className={styles.formGroup}>
          <label>Date de début :</label>
          <input
            type="date"
            value={dateStartIntervention}
            onChange={(e) => setDateStartIntervention(e.target.value)}
            required
          />
          <label>Date de fin :</label>
          <input
            type="date"
            value={dateEndIntervention}
            onChange={(e) => setDateEndIntervention(e.target.value)}
            required
          />
        </div>


        <h3>Intervenant</h3>
        <div className={styles.formGroup}>
  <label>Choisir les intervenants :</label>

  {/* Afficher la liste des techniciens sous forme de checkbox */}
  {intervenantsList.map((tech) => (
    <div key={tech.id}>
      <input
        type="checkbox"
        id={`intervenant-${tech.id}`}
        checked={intervenants.includes(tech.name)} // Cocher la case si le technicien est déjà sélectionné
        onChange={(e) => {
          if (e.target.checked) {
            setIntervenants((prev) => [...prev, tech.name]);
          } else {
            setIntervenants((prev) =>
              prev.filter((name) => name !== tech.name)
            );
          }
        }}
      />
      <label htmlFor={`intervenant-${tech.id}`}>{tech.name}</label>
    </div>
  ))}
</div>

<h3>Actions menées</h3>
        {actionsDone.map((action, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Description des actions menées :</label>
            <input
              type="text"
              value={action.description}
              onChange={(e) => {
                const newActionsDone = [...actionsDone];
                newActionsDone[index].description = e.target.value;
                setActionsDone(newActionsDone);
              }}
              required
            />
            <label>Ajouter des photos pour cette action :</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleActionPhotoChange(index, e)}
            />
            <button type="button" onClick={() => removeActionField(index)}>
              Supprimer cette action
            </button>
          </div>
        ))}
        <button type="button" onClick={addActionField}>
          Ajouter une action
        </button>

        <h3>Remarques</h3>
        {remarques.map((remarque, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Remarques :</label>
            <input
              type="text"
              value={remarque.remarque}
              onChange={(e) => {
                const newRemarques = [...remarques];
                newRemarques[index].remarque = e.target.value;
                setRemarques(newRemarques);
              }}
            />
            <label>Ajouter des photos pour cette remarque :</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleRemarquePhotoChange(index, e)}
            />
            <button type="button" onClick={() => removeRemarqueField(index)}>
              Supprimer cette remarque
            </button>
          </div>
        ))}
        <button type="button" onClick={addRemarqueField}>
          Ajouter une remarque
        </button>

        <h3>Risques / EPI</h3>
        <div className={styles.formGroup}>
          <label>
            <input type="checkbox" checked={risques} onChange={() => setRisques(!risques)} />
            Intervention comportant des risques
          </label>
        </div>

        <button className={styles.submitButton} type="submit">
          Créer le rapport
        </button>
      </form>
    </div>
  );
}