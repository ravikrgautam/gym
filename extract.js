const fs = require('fs');
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("c:/Users/Ravi Gautam/Desktop/gym/phase4_spec.txt", pdfParser.getRawTextContent());
    console.log("Done");
});

pdfParser.loadPDF("c:/Users/Ravi Gautam/Desktop/gym/pdf file/Phase_4_Full_Gym_SaaS_Spec.pdf");
