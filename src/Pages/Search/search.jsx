import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./style.module.scss";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { motion } from "framer-motion";


export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState([]);

  // Fonction de filtrage des rapports sur le champ nomEntreprise uniquement
    const filteredReports = reports.filter((report) =>
        report.client.nomEntreprise.toLowerCase().includes(searchTerm.toLowerCase())
    );


 // Fonction pour récupérer les rapports d'intervention depuis Firestore
 const fetchReports = async () => {
  try {
    // Requête pour récupérer les rapports triés par date de création (createdAt) décroissante
    const q = query(collection(db, "interventionReports"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const reportsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReports(reportsList);
  } catch (error) {
    console.error("Erreur lors de la récupération des rapports : ", error);
  }
};

    useEffect(() => {
        fetchReports();
    }
    , []);

  return (
    <div className={styles.searchContainer}>

        <h1> Recherche de rapport</h1>
      <input
        type="text"
        placeholder= "Rechercher par nom d'entreprise"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      {filteredReports.length > 0 ? (
        <motion.table className={styles.reportTable}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}>
          <thead>
            <tr>
              <th>Nom de l'entreprise</th>
              <th>Date(s)</th>
              
              <th>Intervenant(s)</th>
              <th>Actions</th>
              
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.client.nomEntreprise}</td>
                <td>{report.interventionStartDate} / {report.interventionEndDate}</td>
              
                <td>
                  {report.intervenants && report.intervenants.length > 0 ? (
                    report.intervenants.map((intervenant, index) => (
                      <span key={index}>
                        {intervenant}
                        {index < report.intervenants.length - 1 ? ", " : ""}
                      </span>
                    ))
                  ) : (
                    <span>Aucun intervenant</span>
                  )}
                </td>
                <td>
                  <Link to={`/report/${report.id}`} className={styles.viewBtn}><i class="fa-solid fa-eye"></i></Link>
                  <Link to ={`/reports/edit/${report.id}`}  className={styles.editBtn}><i class="fa-solid fa-edit"></i></Link>
                 
                </td>
              </tr>
            ))}
          </tbody>
        </motion.table>
      ) : (
        <p>Aucun rapport trouvé</p>
      )}
    </div>
  );
}
