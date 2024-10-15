import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { db, storage } from "../../firebase/firebase";
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
import { motion } from "framer-motion";

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
        if (client.logoEntreprise && client.planPrevention) {
          const fileName = decodeURIComponent(
            client.logoEnteprise.split("/").pop().split("?")[0],
            client.planPrevention.split("/").pop().split("?")[0]
          );
          const logoRef = ref(storage, `clients/${fileName}`);
          const planPreventionRef = ref(storage, `plansPrevention/${fileName}`);
          await deleteObject(logoRef && planPreventionRef);
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

  return (
    <div className={styles.clientsContainer}>
      <h1>Gestion des Sites</h1>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Fermer le formulaire" : "Ajouter un site"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
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
            <div>
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
             
            </div>
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
            <label>Logo du l'entreprise :</label>
            <input type="file" onChange={handleLogoChange} />
          </div>
          <div>
            <label>Plan de prévention :</label>
            <input
              type="file"
              onChange={(e) => setPlanPrevention(e.target.files[0])}
            />
          </div>
          <div>
                <label>Commercial :</label>
                <input
                  type="text"
                  value={formData.commercial}
                  onChange={(e) =>
                    setFormData({ ...formData, commercial: e.target.value })
                  }
                  required
                />
              </div>
          <button type="submit">{editId ? "Mettre à jour" : "Ajouter"}</button>
        </form>
      )}

      <div className={styles.clientsList}>
        {clients.map((client) => (
          <div key={client.id} className={styles.clientItem}>
            <div className={styles.section1}>
              <h2>{client.siteName}</h2>
              <div className={styles.logoContainer}>
                {client.logoEntreprise && (
                  <motion.img
                    src={client.logoEntreprise}
                    alt={`Logo de ${client.nomEntreprise}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </div>
            <div className={styles.section2}>
              <p>Client: {client.nomEntreprise}</p>
              <p>Tel: {client.tel}</p>
              <p>Email: {client.email}</p>
              <p>Adresse : {client.siteAddress}</p>
              <p>
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
                <p>Commercial(e) : {client.commercial}</p>
              </p>
            </div>

            <div className={styles.buttons}>
              <button
                onClick={() => handleEdit(client)}
                className={styles.editButton}
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(client)}
                className={styles.deleteButton}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}