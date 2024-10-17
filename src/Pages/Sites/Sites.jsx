import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { db, storage, auth } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import styles from "./style.module.scss";
import AOS from "aos";
import { use } from "framer-motion/client";

export default function Sites() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    nomEntreprise: "",
    tel: "",
    email: "",
    siteName: "",
    siteAddress: "",
    commercial: "",
    logoEntreprise: "",
    planPrevention: "",
  });
  const [editId, setEditId] = useState(null);
  const [logo, setLogo] = useState(null);
  const [planPrevention, setPlanPrevention] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const authorizedUserIds = process.env.REACT_APP_AUTHORIZED_USER_IDS
    ? process.env.REACT_APP_AUTHORIZED_USER_IDS.split(",")
    : [];

  // Fonction pour récupérer les clients depuis Firestore
  const fetchClients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const clientsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // on trie par nomEntreprise
      clientsList.sort((a, b) => a.nomEntreprise.localeCompare(b.nomEntreprise));
      setClients(clientsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients : ", error);
    }
  };

  useEffect(() => {
    fetchClients();
    AOS.init({ duration: 1500 });
    
  }, []);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let logoURL = formData.logoEntreprise;
      let planPreventionURL = formData.planPrevention;

      if (logo) {
        // Téléversement du logo dans Firebase Storage
        const logoRef = ref(storage, `clients/${logo.name}`);
        await uploadBytes(logoRef, logo); // Téléverse le fichier
        logoURL = await getDownloadURL(logoRef); // Récupère l'URL téléchargeable
      }

      if (planPrevention) {
        // Téléversement du plan de prévention dans Firebase Storage
        const planPreventionRef = ref(
          storage,
          `plansPrevention/${planPrevention.name}`
        );
        await uploadBytes(planPreventionRef, planPrevention);
        planPreventionURL = await getDownloadURL(planPreventionRef);
      }

      const data = {
        ...formData,
        logoEntreprise: logoURL,
        planPrevention: planPreventionURL,
      };

      if (editId) {
        // Mise à jour d'un client existant
        const clientRef = doc(db, "clients", editId);
        await updateDoc(clientRef, data);
        Swal.fire({
          title: "Succès",
          text: "Client mis à jour avec succès !",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        // Création d'un nouveau client
        await addDoc(collection(db, "clients"), data);
        Swal.fire({
          title: "Succès",
          text: "Client ajouté avec succès !",
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      // Réinitialisation du formulaire et des états
      resetForm();
      fetchClients();
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout ou de la mise à jour du client : ",
        error
      );
      Swal.fire({
        title: "Erreur",
        text: "Une erreur est survenue lors de la soumission du formulaire.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nomEntreprise: "",
      tel: "",
      email: "",
      siteName: "",
      siteAddress: "",
      commercial: "",
      logoEntreprise: "",
      planPrevention: "",
    });
    setLogo(null);
    setPlanPrevention(null);
    setEditId(null);
    setShowForm(false);
  };

  // Fonction pour remplir le formulaire pour la modification
  const handleEdit = (client) => {
    setFormData({
      nomEntreprise: client.nomEntreprise,
      tel: client.tel,
      email: client.email,
      siteName: client.siteName,
      siteAddress: client.siteAddress,
      commercial: client.commercial,
      logoEntreprise: client.logoEntreprise,
      planPrevention: client.planPrevention,
    });
    setEditId(client.id);
    setShowForm(true);
  };

  // Fonction pour gérer le changement de logo
  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  // Fonction pour gérer la suppression d'un client
  const handleDelete = async (client) => {
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
        // Supprimer le logo associé
        if (client.logoEntreprise) {
          const logoRef = ref(storage, client.logoEntreprise);
          await deleteObject(logoRef);
        }
        if (client.planPrevention) {
          const planPreventionRef = ref(storage, client.planPrevention);
          await deleteObject(planPreventionRef);
        }

        // Supprimer le client de Firestore
        const clientRef = doc(db, "clients", client.id);
        await deleteDoc(clientRef);

        Swal.fire("Supprimé !", "Le client a été supprimé.", "success");
        fetchClients();
      } catch (error) {
        console.error("Erreur lors de la suppression du client : ", error);
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue lors de la suppression.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };



  // Composant Modal
  const Modal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <span className={styles.closeButton} onClick={onClose}>
            &times;
          </span>
          <h2>{editId ? "Modifier le Site" : "Ajouter un Site"}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Les champs du formulaire ici */}
            <div>
              <label>Nom du Site :</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Nom du client :</label>
              <input
                type="text"
                value={formData.nomEntreprise}
                onChange={(e) =>
                  setFormData({ ...formData, nomEntreprise: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Téléphone :</label>
              <input
                type="tel"
                value={formData.tel}
                onChange={(e) =>
                  setFormData({ ...formData, tel: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Email :</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Adresse du site :</label>
              <input
                type="text"
                value={formData.siteAddress}
                onChange={(e) =>
                  setFormData({ ...formData, siteAddress: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Logo de l'entreprise :</label>
              <input type="file" onChange={handleLogoChange} />
            </div>
            <div>
              <label>Plan de prévention :</label>
              <input
                type="file"
                onChange={(e) => setPlanPrevention(e.target.files[0])}
              />
            </div>
            <button type="submit">Soumettre</button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.clientsContainer}>
      <Modal show={showForm} onClose={resetForm} />
      <h1>Gestion des Sites</h1>
      <button
        onClick={() => setShowForm(true)}
        className={styles.addButton}
      >
        Ajouter un Site
      </button>

      <div className={styles.clientsList}>
        {clients.map((client) => (
          <div key={client.id} className={styles.clientItem} data-aos="fade-up"
         >
            <div className={styles.section1}>
              <h2>{client.siteName}</h2>
              <div className={styles.logoContainer}>
                {client.logoEntreprise && (
                  <img
                    src={client.logoEntreprise}
                    alt={`Logo de ${client.nomEntreprise}`}
                data-aos="zoom-out"
                  />
                )}
              </div>
            </div>
            <div className={styles.section2}>
              <p><i className="fa-regular fa-id-card"></i> Client: {client.nomEntreprise}</p>
              <p> <i className="fa-solid fa-phone"></i>Tel: {client.tel}</p>
              <p> <i className="fa-solid fa-at"></i>Email: {client.email}</p>
              <p> <i className="fa-solid fa-location-dot"></i> Adresse : {client.siteAddress}</p>
              <p> <i class="fa-solid fa-file"></i>
                Plan de prévention :{" "}
                {client.planPrevention ? "" : "Non transmis"}
                {client.planPrevention && (
                  <a
                    href={client.planPrevention}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {" "}
                    Consulter{" "}
                  </a>
                )}
                <p> <i class="fa-solid fa-user-tie"></i>Commercial(e) : {client.commercial}</p>
              </p>
            </div>

            <div className={styles.buttons} data-aos="zoom-in">
              <button
                onClick={() => handleEdit(client)}
                className={styles.editButton}
              >
                Modifier
              </button>
              {authorizedUserIds.includes(auth.currentUser.uid) && (
              <button
                onClick={() => handleDelete(client)}
                className={styles.deleteButton}
              >
                Supprimer
              </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
