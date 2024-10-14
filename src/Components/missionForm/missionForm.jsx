import { useState, useEffect } from "react";
import { db, storage, auth } from "../../firebase/firebase";
import {
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./style.module.scss";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { createInterventionReport } from "../../automation/reportAutomation";

export default function MissionForm() {
  const { missionId } = useParams(); // Récupération de l'ID de la mission
  const [client, setClient] = useState({
    nomEntreprise: "",
    email: "",
    tel: "",
  });
  const [site, setSite] = useState({
    siteName: "",
    adresse: "",
    nomContact: "",
    fonctionContact: "",
    telContact: "",
  });
  const [createdBy, setCreatedBy] = useState(""); // ID de l'utilisateur qui a créé la mission
  const [intervenants, setIntervenants] = useState([]); // Tableau pour stocker plusieurs intervenants
  const [missions, setMissions] = useState([""]);
  const [risqueEPI, setRisqueEPI] = useState([""]);
  const [intervenantsExistants, setIntervenantsExistants] = useState([]);
  const [dateStartIntervention, setDateStartIntervention] = useState(
    new Date().toISOString().substring(0, 10)
  ); // Format YYYY-MM-DD
  const [dateEndIntervention, setDateEndIntervention] = useState(
    new Date().toISOString().substring(0, 10)
  ); // Format YYYY-MM-DD
  const [commercial, setCommercial] = useState("");
  const [devis, setDevis] = useState("");
  const [planPrevention, setPlanPrevention] = useState("");
  const [comments, setComments] = useState("");
  const [clients, setClients] = useState([]); // Liste des clients et sites

  const fetchClients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const clientsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients : ", error);
    }
  };

  // Fonction pour récupérer l id de l'utilisateur connecté
  const fetchUser = async () => {
    try {
      const user = auth.currentUser;
      setCreatedBy(user.uid);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'utilisateur : ",
        error
      );
    }
  };

  const fetchIntervenants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
      }));
      setIntervenantsExistants(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  // Fonction pour récupérer les données de la mission existante
  const fetchMission = async () => {
    if (!missionId) return;
    try {
      const missionRef = doc(db, "missions", missionId);
      const missionSnap = await getDoc(missionRef);

      if (missionSnap.exists()) {
        const missionData = missionSnap.data();
        setClient(missionData.client);
        setSite(missionData.site);
        setIntervenants(missionData.intervenants || []); // Plusieurs intervenants
        setMissions(missionData.missions || [""]);
        setRisqueEPI(missionData.risqueEPI || [""]);
        setDateStartIntervention(
          missionData.interventionStartDate?.substring(0, 10) ||
            new Date().toISOString().substring(0, 10)
        );
        setDateEndIntervention(
          missionData.interventionEndDate?.substring(0, 10) ||
            new Date().toISOString().substring(0, 10)
        );
        setCreatedBy(missionData.createdBy);
        setCommercial(missionData.commercial);
        setDevis(missionData.devis);
        setPlanPrevention(missionData.planPrevention);
        setComments(missionData.comments);
      } else {
        console.log("Mission non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la mission : ", error);
    }
  };

  useEffect(() => {
    fetchIntervenants();
    fetchMission();
    fetchUser();
    fetchClients();
  }, [missionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Créer ou mettre à jour la mission
      const missionData = {
        client,
        site,
        intervenants, // stocke les IDs des techniciens
        missions,
        risqueEPI,
        interventionStartDate: dateStartIntervention,
        interventionEndDate: dateEndIntervention,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        commercial,
        devis,
        planPrevention,
        comments,
      };

      if (missionId) {
        // Mettre à jour la mission existante
        const missionRef = doc(db, "missions", missionId);
        await updateDoc(missionRef, missionData);
      } else {
        // Créer une nouvelle mission
        const missionRef = await addDoc(
          collection(db, "missions"),
          missionData
        );
        const missionId = missionRef.id; // Récupérer l'ID de la mission créée

        // Appel à la fonction d'automatisation pour créer le rapport d'intervention
        await createInterventionReport(missionId, missionData);
      }

      Swal.fire({
        title: "Mission enregistrée",
        text: "Un rapport d'intervention a été créé automatiquement et le(s) technicien(s) a/ont été notifié(s) par email",
        icon: "success",
        confirmButtonText: "Ok",
      }).then(() => {
        window.location.href = "/missions";
      });
    } catch (error) {
      console.error(
        "Erreur lors de la création/mise à jour de la mission :",
        error
      );
      Swal.fire({
        title: "Erreur",
        text: "Une erreur est survenue lors de la création/mise à jour de la mission",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  // Ajouter un nouveau champ pour les missions
  const addMissionField = () => {
    setMissions([...missions, ""]);
  };

  // Supprimer un champ pour les missions
  const removeMissionField = (index) => {
    setMissions(missions.filter((_, i) => i !== index));
  };

  // Ajouter un nouveau champ pour les risques/EPI
  const addRisqueField = () => {
    setRisqueEPI([...risqueEPI, ""]);
  };

  // Supprimer un champ pour les risques/EPI
  const removeRisqueField = (index) => {
    setRisqueEPI(risqueEPI.filter((_, i) => i !== index));
  };

  // planPrevention est un uplaod de fichier
  const handlePlanPrevention = async (e) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, `plansPrevention/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setPlanPrevention(url);
  };

  return (
    <div className={styles.missionFormContainer}>
      <form onSubmit={handleSubmit}>
        <h3>Devis associé à l'intervention</h3>
        <div className={styles.formGroup}>
          <label>N° de devis </label>
          <input
            type="text"
            value={devis}
            onChange={(e) => setDevis(e.target.value)}
          />
        </div>

        <h3>Sélectionner le client et le site d'intervention</h3>
        <div className={styles.formGroup}>
          <label>
            Client et Site d'intervention <span>*</span>
          </label>
          <select
            onChange={(e) => {
              const selectedClientSite = clients.find(
                (client) =>
                  `${client.nomEntreprise} - ${client.siteName}` ===
                  e.target.value
              );
              if (selectedClientSite) {
                // Remplir automatiquement les champs du client et du site avec les données sélectionnées
                setClient({
                  nomEntreprise: selectedClientSite.nomEntreprise,
                  email: selectedClientSite.email,
                  tel: selectedClientSite.tel,
                  // commercial: selectedClientSite.commercial || "",
                });
                setSite({
                  siteName: selectedClientSite.siteName,
                  adresse: selectedClientSite.siteAddress,
                  nomContact: selectedClientSite.nomContact || "",
                  fonctionContact: selectedClientSite.fonctionContact || "",
                  telContact: selectedClientSite.telContact || "",
                });
                setPlanPrevention(selectedClientSite.planPrevention || "");
                setCommercial(selectedClientSite.commercial || "");
              }
            }}
          >
            <option value="">Sélectionnez un client et un site</option>
            {clients.map((client, index) => (
              <option
                key={index}
                value={`${client.nomEntreprise} - ${client.siteName}`}
              >
                {client.nomEntreprise} - {client.siteName}
              </option>
            ))}
          </select>
        </div>
        <h3>Informations du client</h3>
        <div className={styles.formGroup}>
          <label>
            Nom de l'entreprise <span>*</span>
          </label>
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
          <label>Commercial référent</label>
          <input
            type="text"
            value={commercial}
            onChange={(e) => setCommercial(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            Email <span>*</span>
          </label>
          <input
            type="email"
            value={client.email}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            Téléphone <span>*</span>
          </label>
          <input
            type="text"
            value={client.tel}
            onChange={(e) => setClient({ ...client, tel: e.target.value })}
            required
          />
        </div>

        <h3>Informations de contact pour le site d'intervention</h3>
        <div className={styles.formGroup}>
          <label>
            Nom du site <span>*</span>
          </label>
          <input
            type="text"
            value={site.siteName}
            onChange={(e) => setSite({ ...site, siteName: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            Adresse du site <span>*</span>
          </label>
          <input
            type="text"
            value={site.adresse}
            onChange={(e) => setSite({ ...site, adresse: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            Nom du contact <span>*</span>
          </label>
          <input
            type="text"
            value={site.nomContact}
            onChange={(e) => setSite({ ...site, nomContact: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            Fonction du contact <span>*</span>
          </label>
          <input
            type="text"
            value={site.fonctionContact}
            onChange={(e) =>
              setSite({ ...site, fonctionContact: e.target.value })
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            Téléphone du contact<span>*</span>
          </label>
          <input
            type="text"
            value={site.telContact}
            onChange={(e) => setSite({ ...site, telContact: e.target.value })}
            required
          />
        </div>

        <h3>Plan de prévention</h3>
        {/* // on affiche le lien du plan de prévention si il existe sinon on affiche un input pour l'ajouter */}
        {planPrevention ? (
          (console.log(planPrevention),
          (
            <div className={styles.formGroup}>
              <label>Plan de prévention</label>
              <a href={planPrevention} target="_blank" rel="noreferrer">
                Voir le plan de prévention
              </a>
            </div>
          ))
        ) : (
          <div className={styles.formGroup}>
            <label>Ajouter un plan de prévention</label>
            <input type="file" accept=".pdf" onChange={handlePlanPrevention} />
          </div>
        )}

        <h3>Date(s) d'intervention</h3>
        <div className={styles.formGroup}>
          <label>
            Date de début <span>*</span>
          </label>
          <input
            type="date"
            value={dateStartIntervention}
            onChange={(e) => setDateStartIntervention(e.target.value)}
            required
          />
          <label>
            Date de fin <span>*</span>
          </label>
          <input
            type="date"
            value={dateEndIntervention}
            onChange={(e) => setDateEndIntervention(e.target.value)}
            required
          />
        </div>

        <h3>Intervenant(s)</h3>
        <div className={styles.formGroup}>
          <label>
            Sélectionnez un ou plusieurs intervenants <span>*</span>
          </label>
          {intervenantsExistants.map((intervenant) => (
            <div key={intervenant.id}>
              <input
                type="checkbox"
                value={intervenant.id}
                checked={intervenants.includes(intervenant.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIntervenants([...intervenants, e.target.value]);
                  } else {
                    setIntervenants(
                      intervenants.filter((id) => id !== e.target.value)
                    );
                  }
                }}
              />
              <label>{intervenant.name}</label>
            </div>
          ))}
        </div>

        <h3>Missions </h3>
        {missions.map((mission, index) => (
          <div key={index} className={styles.formGroup}>
            <label>
              Mission {index + 1} <span>*</span>
            </label>
            <input
              type="text"
              value={mission}
              onChange={(e) => {
                const updatedMissions = [...missions];
                updatedMissions[index] = e.target.value;
                setMissions(updatedMissions);
              }}
              required
            />
            <button
              type="button"
              onClick={() => removeMissionField(index)}
              disabled={missions.length <= 1}
              className={styles.removeBtn}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMissionField}
          className={styles.addBtn}
        >
          <i class="fa-solid fa-plus"></i> Ajouter une mission
        </button>

        <h3>Risques / EPI</h3>
        {risqueEPI.map((risque, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Risque / EPI {index + 1} :</label>
            <input
              type="text"
              value={risque}
              onChange={(e) => {
                const updatedRisqueEPI = [...risqueEPI];
                updatedRisqueEPI[index] = e.target.value;
                setRisqueEPI(updatedRisqueEPI);
              }}
            />
            <button
              type="button"
              onClick={() => removeRisqueField(index)}
              disabled={risqueEPI.length <= 1}
              className={styles.removeBtn}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRisqueField}
          className={styles.addBtn}
        >
          <i class="fa-solid fa-plus"></i> Ajouter un risque/EPI
        </button>

        <h3>Commentaire(s) / indication(s) supplémentaire(s)</h3>
        <div className={styles.formGroup}>
          <label>Commentaire(s) :</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          ></textarea>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Enregistrer la mission
        </button>
      </form>
    </div>
  );
}
