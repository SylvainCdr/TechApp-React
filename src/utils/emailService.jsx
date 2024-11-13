import emailjs from "emailjs-com";


// Fonction pour envoyer un email de notification de mission aux techniciens
export const sendEmailMission = ({
  to,
  to_name,
  missionId,
  reportId,
  startDate,
  endDate,
  clientName,
  siteName,
}) => {
  // Construire l'URL de la mission et du rapport
  const missionUrl = `https://pixecuritytechapp.web.app/mission/${missionId}`;
  const reportUrl = `https://pixecuritytechapp.web.app/report/${reportId}`;

  // Paramètres pour le modèle d'email
  const templateParams = {
    to_email: to,
    to_name: to_name, // Nom du technicien
    mission_url: missionUrl, // URL de la mission
    report_url: reportUrl, // URL du rapport d'intervention
    start_date: startDate, // Date de début d'intervention
    end_date: endDate, // Date de fin d'intervention
    client_name: clientName, // Nom du client
    site_name: siteName, // Nom du site
  };

  return emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_USER_ID
    )
    .then((response) => {
      console.log("Email envoyé avec succès :", response);
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi de l'email :", error);
    });
};

// Fonction pour envoyer un email de notification lorsque le rapport est clôturé
export const sendClosedReportNotification = ({
  from_name,
  reportId,
  clientName,
  siteName,

}) => {
  // Construire l'URL du rapport
  const reportUrl = `https://pixecuritytechapp.web.app/report/${reportId}`;

  // Paramètres pour le modèle d'email
  const templateParams = {
    to_email: "sylvain.cadoret@pixecurity.com", // Adresse email spécifique pour recevoir la notification
    to_name: "Anaelle", // Nom générique, peut être remplacé par un paramètre si besoin
    from_name: from_name, // Nom de la personne ou service envoyant l'email
    report_url: reportUrl, // URL du rapport d'intervention
    client_name: clientName, // Nom du client
    site_name: siteName, // Nom du site
    
  
  };

  return emailjs
    .send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID2,
      templateParams,
      process.env.REACT_APP_EMAILJS_USER_ID
    )
    .then((response) => {
      console.log("Email envoyé avec succès :", response);
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi de l'email :", error);
    });
};




