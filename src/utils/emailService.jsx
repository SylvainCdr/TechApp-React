import emailjs from 'emailjs-com';

export const sendEmail = ({ to, to_name, missionId, reportId }) => {
    // Construire l'URL de la mission et du rapport
    const missionUrl = `https://pixecuritytechapp.web.app/mission/${missionId}`;
    const reportUrl = `https://pixecuritytechapp.web.app/report/${reportId}`;
  
    // Paramètres pour le modèle d'email
    const templateParams = {
      to_email: to,
      to_name: to_name, // Ajout de la variable to_name pour personnaliser l'email
      mission_url: missionUrl, // URL de la mission
      report_url: reportUrl,   // URL du rapport d'intervention
    };
  
    return emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_USER_ID
    )
    .then((response) => {
      console.log('Email envoyé avec succès :', response);
    })
    .catch((error) => {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    });
};