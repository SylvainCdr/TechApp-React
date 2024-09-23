import jsPDF from 'jspdf';

const img1 = '/assets/pix-bg.png';

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
  
  // Charger les images des actions menées
  const actionImages = await Promise.all(report.actionsDone.map(action => loadImages(action.photos || [])));
  const remarkImages = await Promise.all(report.remarques.map(remarque => loadImages(remarque.photos || [])));

  // 1. Page de couverture
  const imgWidth = doc.internal.pageSize.getWidth();  // Largeur de la page
  const imgHeight = doc.internal.pageSize.getHeight(); // Hauteur de la page
  
  // Ajouter l'image de fond
  doc.addImage(img1, 'PNG', 0, 0, imgWidth, imgHeight); // Image en fond qui occupe toute la page

  doc.setFontSize(22);
  doc.text("Rapport d'intervention", 105, 30, null, null, "center");
  doc.setFontSize(16);
  doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 20, 100);
  doc.text(`Intervenant(s) : ${technicians.map(tech => tech.name).join(", ")}`, 20, 110);
  doc.text("Date(s) : " + new Date(report.interventionStartDate).toLocaleDateString("fr-FR") + " - " + new Date(report.interventionEndDate).toLocaleDateString("fr-FR"), 20, 120);

  // 2. Détails de l'intervention
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Détails de l'intervention", 20, 20);
  doc.setFontSize(12);
  const interventionDetails = [
    { key: "Site", value: report.site?.adresse || "Adresse du site" },
    { key: "Mission", value: report.actionsDone?.map(action => action.description).join(", ") || "Description de la mission" },
    { key: "Risques identifiés", value: report.risques ? "Oui" : "Non" }
  ];

  interventionDetails.forEach((detail, index) => {
    doc.text(`${detail.key} : ${detail.value}`, 20, 40 + index * 10);
  });

  // 4. Actions menées avec photos
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Actions menées", 20, 20);
 
  for (let index = 0; index < report.actionsDone.length; index++) {
    const action = report.actionsDone[index];
    doc.setFontSize(12);
    doc.text(`Action ${index + 1} : ${action.description}`, 20, 40 + (index * 10));
    
    for (let photo of action.photos || []) {
      const img = await getDataUri(photo);
      doc.addImage(img, 'JPEG', 20, 60 + (index * 60), 150, 110);
    }
  }

  // 3. Remarques
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Remarques", 20, 20);
  
  for (let index = 0; index < report.remarques.length; index++) {
    const remarque = report.remarques[index];
    doc.setFontSize(12);
    doc.text(`Remarque ${index + 1} : ${remarque.remarque}`, 20, 40 + (index * 10));
    
    for (let photo of remarque.photos || []) {
      const img = await getDataUri(photo);
      doc.addImage(img, 'JPEG', 20, 60 + (index * 60), 150, 110);
    }
  }

  // 6. Signature du client
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Signature du client", 20, 20);
  doc.setFontSize(12);
  doc.text(`Rapport signé : ${report.isSigned ? "Oui" : "Non"}`, 20, 40);

  // Sauvegarder le PDF
  doc.save(`rapport_intervention_${report.id}.pdf`);
  console.log("Loaded images:", actionImages);
};

export default generateReportPdf;
