/**
 * Contract AI Extraction Service
 * Mock implementation for extracting contract metadata from PDF content
 * In production, would integrate with AWS Textract or similar service
 */

/**
 * Mock AI extraction - uses regex patterns to extract common contract fields
 * @param {string} pdfText - Extracted text content from PDF
 * @returns {object} Extracted contract metadata
 */
export function extractContractFields(pdfText) {
  if (!pdfText || pdfText.length === 0) {
    return null
  }

  const text = pdfText.toUpperCase()
  const extracted = {}

  // Extract Contract Number
  // Looks for patterns like: "Contratto n. 12345", "Contract #ABC-2025-001", "CN: 2025-5678"
  const contrattoMatch = text.match(/(?:CONTRAT|CONTRA|CN)[\s:]*[Nn]°?\.?\s*([A-Z0-9\-\/]+)/i)
  extracted.contrattoNum = contrattoMatch ? contrattoMatch[1].trim() : 'N/A'

  // Extract Supplier/Fornitore
  // Looks for patterns like: "Fornitore:", "Supplier:", "A favore di:", "Contraente:", company names
  const fornitorePat = /(?:FORNITUR|SUPPLIER|CONTRAENT|DITTA|RAGIONE SOCIAL)[\s:]*\n*\s*([A-Z\s&,\.]+?)(?:\n|\d{5}|VIA|TEL|EMAIL)/i
  const fornitoreMatch = text.match(fornitorePat)
  extracted.fornitore = fornitoreMatch ? fornitoreMatch[1].trim().replace(/\s+/g, ' ') : 'Non specificato'

  // Extract Start Date
  // Looks for patterns like: "01/01/2025", "01-01-2025", "1 gennaio 2025", "valid from", "effective date"
  const dataInizioMatch = text.match(/(?:INIZIO|VALID|EFFECT|DECOR|DA|FROM)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)
  extracted.dataInizio = dataInizioMatch ? dataInizioMatch[1] : ''

  // Extract End Date
  // Looks for patterns like: "SCADENZA", "EXPIRY", "TERMINA", "FINO AL", "UNTIL", "TO"
  const dataFineMatch = text.match(/(?:SCADENZ|EXPIR|TERMIN|FINO|UNTIL|TO)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i)
  extracted.dataFine = dataFineMatch ? dataFineMatch[1] : ''

  // Extract Annual Amount
  // Looks for patterns like: "€ 50.000,00", "$100,000", "Amount: 75000", "IMPORTO: 120.000"
  const importoMatch = text.match(/(?:IMPORT|AMOUNT|€|\$)[\s:]*([0-9\.,]+)(?:\s*(?:EUR|€|$|USD))?/i)
  if (importoMatch) {
    // Clean up the amount string (remove spaces, commas if used as thousands separator)
    let amountStr = importoMatch[1].replace(/\s/g, '')
    // Handle different decimal separators
    if (amountStr.includes(',') && amountStr.includes('.')) {
      // Has both - likely European format with . for thousands and , for decimals
      amountStr = amountStr.replace(/\./g, '').replace(',', '.')
    } else if (amountStr.includes(',')) {
      // Only comma - could be European decimal or thousands separator
      // If 2 digits after comma, it's decimal
      const parts = amountStr.split(',')
      if (parts[1] && parts[1].length === 2) {
        amountStr = amountStr.replace(',', '.')
      } else {
        amountStr = amountStr.replace(/,/g, '')
      }
    }
    extracted.importoAnnuale = parseFloat(amountStr).toFixed(2)
  } else {
    extracted.importoAnnuale = '0.00'
  }

  // Extract contract type (if mentioned)
  const tipoMatch = text.match(/(?:TIPO|TYPE|CATEGORIA)[\s:]*([A-Z\s\-]+?)(?:\n|IMPORTO|FORNITORE)/i)
  extracted.tipo = tipoMatch ? tipoMatch[1].trim() : 'Noleggio'

  // Confidence scores for each extracted field (0-1)
  const confidence = {
    contrattoNum: contrattoMatch ? 0.95 : 0.3,
    fornitore: fornitoreMatch ? 0.85 : 0.2,
    dataInizio: dataInizioMatch ? 0.9 : 0.1,
    dataFine: dataFineMatch ? 0.9 : 0.1,
    importoAnnuale: importoMatch ? 0.85 : 0.1,
    tipo: tipoMatch ? 0.7 : 0.3,
  }

  return {
    ...extracted,
    confidence,
    extractedAt: new Date().toISOString(),
  }
}

/**
 * Mock PDF text extraction
 * In production, would use pdfjs-dist or similar library
 * @param {File} pdfFile - PDF file object
 * @returns {Promise<string>} Extracted text content
 */
export async function extractPdfText(pdfFile) {
  return new Promise((resolve) => {
    // Mock implementation - in production would actually parse PDF
    // For now, we'll simulate extraction by reading file name and adding mock text
    setTimeout(() => {
      const mockText = `
        CONTRATTO DI NOLEGGIO VEICOLI
        Numero Contratto: CT-${Date.now()}-001
        Data: ${new Date().toLocaleDateString('it-IT')}

        FORNITORE PRINCIPALE:
        ${pdfFile.name.replace('.pdf', '').toUpperCase()} S.R.L.
        Via Roma 123, 00100 Roma
        Tel: 06-123456

        PERIODO DI VALIDITÀ:
        Inizio: ${new Date().toLocaleDateString('it-IT')}
        Scadenza: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT')}

        IMPORTO ANNUALE:
        € 50.000,00

        SERVIZI INCLUSI:
        - Noleggio 5 veicoli
        - Manutenzione ordinaria e straordinaria
        - Assicurazione RCA
        - Carburante

        CLAUSOLE:
        1. Il contratto è valido per 12 mesi
        2. Rinnovamento automatico salvo disdetta con 30 giorni di preavviso
        3. Penali per danno veicoli come da tariffario allegato
      `
      resolve(mockText)
    }, 500)
  })
}

/**
 * Validate extracted contract data
 * @param {object} extracted - Extracted contract data
 * @returns {object} Validation result { isValid, errors }
 */
export function validateExtractedData(extracted) {
  const errors = []

  if (!extracted.contrattoNum || extracted.contrattoNum === 'N/A') {
    errors.push('Numero contratto non trovato')
  }

  if (!extracted.fornitore || extracted.fornitore === 'Non specificato') {
    errors.push('Fornitore non identificato')
  }

  if (!extracted.dataInizio) {
    errors.push('Data inizio non trovata')
  }

  if (!extracted.dataFine) {
    errors.push('Data scadenza non trovata')
  }

  if (!extracted.importoAnnuale || extracted.importoAnnuale === '0.00') {
    errors.push('Importo non trovato')
  }

  return {
    isValid: errors.length === 0,
    errors,
    confidence: extracted.confidence,
  }
}
