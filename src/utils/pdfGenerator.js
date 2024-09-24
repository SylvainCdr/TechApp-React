import jsPDF from 'jspdf';

const coverImg = '/assets/pix-bg.png';
const footerImg = '/assets/pix-footer.png';
const headerImg = '/assets/pix-header.png';

const interventionDates = (report) => {
  const startDate = new Date(report.interventionStartDate).toLocaleDateString("fr-FR");
  const endDate = new Date(report.interventionEndDate).toLocaleDateString("fr-FR");
  return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
}

const loadImages = async (photos) => {
  return Promise.all(photos.map(photo => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Important pour les images CORS
      img.src = photo;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Image load error for ${photo}`));
    });
  }));
};

const getDataUri = (url) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous'; // Important pour les images CORS
    image.onload = () => resolve(image);
    image.src = url;
  });
};

const generateReportPdf = async (report, technicians) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();  // Largeur de la page
  const pageHeight = doc.internal.pageSize.getHeight(); // Hauteur de la page

  // -------------------------------------------------------------------------------------------------------
  // PAGE 1 : COUVERTURE DU RAPPORT
  doc.addImage(coverImg, 'PNG', 0, 0, pageWidth, pageHeight); // Image en fond qui occupe toute la page
  doc.setFontSize(25);
  doc.setTextColor(255, 255, 255); 
  doc.text("Rapport d'intervention", 105, 50, null, null, "center");
  doc.setFontSize(14);
  doc.text("Date(s) : " + interventionDates(report), 105, 60, null, null, "center");
  doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant
  doc.setFontSize(25);
  doc.text(`${report.client?.nomEntreprise || "Nom du client"}`, 145, 275);

  doc.addPage(); // Ajoute la page 2

  // -------------------------------------------------------------------------------------------------------
  // PAGE 2 : INFORMATIONS INTERVENTION
  doc.addImage(headerImg, 'PNG', 0, 0, 220, 0); 
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); 
  doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
  doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
  doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant

  // Informations du client
  doc.setFontSize(18);
  doc.text("Informations client", 10, 50);
  doc.setFontSize(10);

  // Tableau des informations client
  const clientDetails = [
    { key: "Client", value: report.client?.nomEntreprise || "Nom du client" },
    { key: "Email", value: report.client?.email || "Email du client" },
    { key: "Téléphone", value: report.client?.tel || "Téléphone du client" },
  ];

  let startY = 60;
  const keyColumnWidth = 60;  
  const valueColumnWidth = 130;  
  clientDetails.forEach((detail, index) => {
    doc.setFontSize(12);
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240); 
    doc.rect(10, startY + (index * 10), keyColumnWidth, 10, 'FD');
    doc.rect(10 + keyColumnWidth, startY + (index * 10), valueColumnWidth, 10, 'FD');
    doc.text(detail.key, 12, startY + 7 + (index * 10));
    doc.text(detail.value, 12 + keyColumnWidth, startY + 7 + (index * 10));
  });

  // Détails de l'intervention
  doc.setFontSize(18);
  doc.text("Détails de l'intervention", 10, startY + 50);
  doc.setFontSize(10);

  const interventionDetails = [
    { key: "Site", value: report.site?.adresse || "Adresse du site" },
    { key: "Nom du contact sur site", value: report.site?.nomContact || "Nom du contact" },
    { key: "Fonction du contact", value: report.site?.fonctionContact || "Fonction du contact" },
    { key: "Téléphone du contact", value: report.site?.telContact || "Téléphone du contact" },
    { key: "Intervenant(s) Pixecurity", value: technicians.map(tech => tech.name).join(", ") },
    { key: "Risques identifiés", value: report.risques ? "Oui" : "Non" }
  ];

  let interventionStartY = startY + 60;
  interventionDetails.forEach((detail, index) => {
    doc.setFontSize(12);
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240); 
    doc.rect(10, interventionStartY + (index * 10), keyColumnWidth, 10, 'FD');
    doc.rect(10 + keyColumnWidth, interventionStartY + (index * 10), valueColumnWidth, 10, 'FD');
    doc.text(detail.key, 12, interventionStartY + 7 + (index * 10));
    doc.text(detail.value, 12 + keyColumnWidth, interventionStartY + 7 + (index * 10));
  });

  doc.addImage(footerImg, 'PNG', 0, 255, 220, 0); 

  // -------------------------------------------------------------------------------------------------------
  // PAGE 3 : ACTIONS MENÉES AVEC PHOTOS
  const imgWidth = 90; 
  const imgHeight = 60; 

  doc.addPage(); // Ajoute la page 3
  doc.addImage(headerImg, 'PNG', 0, 0, 220, 0); 
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); 
  doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
  doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
  doc.setTextColor(0, 0, 0); 

  doc.setFontSize(18);
  doc.text("Actions menées", 20, 40);

  let yPosition = 50; 
  const maxHeightPerPage = 260; 
  const spaceBetweenImages = 5; 

  for (let index = 0; index < report.actionsDone.length; index++) {
    const action = report.actionsDone[index];
    const actionText = `Action ${index + 1} : ${action.description}`;

    doc.setFontSize(12);
    doc.text(actionText, 20, yPosition);
    yPosition += 3; 

    for (let photo of action.photos || []) {
      const img = await getDataUri(photo);
      console.log ("img", img);

      // Vérifie si la position Y dépasse la limite de la page
      if (yPosition + imgHeight > maxHeightPerPage) {
        // Ajouter le pied de page avant de changer de page
        doc.addImage(footerImg, 'PNG', 0, 255, 220, 0); 

        // Ajouter une nouvelle page
        doc.addPage();
        doc.addImage(headerImg, 'PNG', 0, 0, 220, 0); 
        doc.setTextColor(255, 255, 255); 
        doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
        doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
        doc.setTextColor(0, 0, 0); 
        doc.setFontSize(18);
        doc.text("Actions menées (suite)", 20, 40); 
        yPosition = 60; // Réinitialise la position Y pour la nouvelle page
      }

      // Ajoute l'image des actions menées restantes sur la page
      doc.addImage(img, 'JPEG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + spaceBetweenImages;
    }

    // Ajoutez un espace après chaque action
    yPosition += spaceBetweenImages; 
  }

  // Ajouter le pied de page à la dernière page des actions
  doc.addImage(footerImg, 'PNG', 0, 255, 220, 0);

  // -------------------------------------------------------------------------------------------------------
  // PAGE 4 : REMARQUES AVEC PHOTOS
  doc.addPage(); // Ajoute la page suivante
  doc.addImage(headerImg, 'PNG', 0, 0, 220, 0); 
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); 
  doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
  doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
  doc.setTextColor(0, 0, 0); 

  doc.setFontSize(18);
  doc.text("Remarques", 20, 40);

  yPosition = 50; // Réinitialise la position Y pour les remarques

  for (let index = 0; index < report.remarques.length; index++) {
    const remarque = report.remarques[index];
    doc.setFontSize(12);
    doc.text(`Remarque ${index + 1} : ${remarque.remarque}`, 20, yPosition);
    yPosition += 10; 

    for (let photo of remarque.photos || []) {
      const img = await getDataUri(photo);
      console.log("img", img);

      // Vérifie si la position Y dépasse la limite de la page
      if (yPosition + imgHeight > maxHeightPerPage) {
        // Ajouter le pied de page avant de changer de page
        doc.addImage(footerImg, 'PNG', 0, 255, 220, 0); 

        // Ajouter une nouvelle page
        doc.addPage();
        doc.addImage(headerImg, 'PNG', 0, 0, 220, 0); 
        doc.setTextColor(255, 255, 255); 
        doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
        doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
        doc.setTextColor(0, 0, 0); 
        doc.setFontSize(18);
        doc.text("Remarques (suite)", 20, 40); 
        yPosition = 60; // Réinitialise la position Y pour la nouvelle page
      }

      // Ajoute l'image des remarques restantes sur la page
      doc.addImage(img, 'JPEG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + spaceBetweenImages;
    }

    // Ajoutez un espace après chaque remarque
    yPosition += spaceBetweenImages; 
  }

  // Ajouter le pied de page à la dernière page des remarques
  doc.addImage(footerImg, 'PNG', 0, 255, 220, 0); 

  // -------------------------------------------------------------------------------------------------------
  // SIGNATURE DU CLIENT
  doc.addPage(); // Ajoute la page suivante
  doc.setFontSize(18);
  doc.text("Signature du client", 20, 20);
  doc.setFontSize(12);
  doc.text(`Rapport signé : ${report.isSigned ? "Oui" : "Non"}`, 20, 40);
  doc.text(`Nom du signataire : ${report.signataireNom || "Nom du signataire"}`, 20, 50);

  // Intégration de l'image de signature en base64
  const imgSign = await getDataUri(report.signatureUrl);
  doc.addImage(imgSign, 'JPEG', 20, 60, 70, 0);

  // Ajouter le pied de page à la dernière page
  doc.addImage(footerImg, 'PNG', 0, 255, 220, 0);

  // -------------------------------------------------------------------------------------------------------
  // AJOUT DE LA PAGINATION
  // Maintenant que toutes les pages sont créées, vous pouvez obtenir le nombre total de pages
  const totalPages = doc.getNumberOfPages();

  // Parcourez chaque page pour ajouter le numéro de page
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - 30, pageHeight - 10); // Positionne au bas de la page à droite
  }

  // Sauvegarder le PDF
  doc.save(`rapport_intervention_${report.id}.pdf`);
};

export default generateReportPdf;
