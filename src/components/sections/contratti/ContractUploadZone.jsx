import { useState, useRef } from 'react'
import { extractPdfText, extractContractFields, validateExtractedData } from '../../../services/contractAIExtraction'
import './ContractUploadZone.css'

/**
 * ContractUploadZone - Drag-and-drop PDF upload with AI extraction
 * Handles file upload, extraction of contract metadata, and validation
 */
export default function ContractUploadZone({ onContractExtracted, onError }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const processFile = async (file) => {
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      onError('Solo file PDF sono supportati')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      onError('File troppo grande (max 10MB)')
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)
    setExtractedData(null)
    setValidationResult(null)

    try {
      // Extract text from PDF
      const pdfText = await extractPdfText(file)

      // Extract contract fields
      const extracted = extractContractFields(pdfText)

      // Validate extracted data
      const validation = validateExtractedData(extracted)

      setExtractedData(extracted)
      setValidationResult(validation)

      // Call callback with extracted data
      if (onContractExtracted) {
        onContractExtracted({
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          ...extracted,
          validation,
        })
      }
    } catch (error) {
      onError('Errore durante l\'elaborazione del PDF: ' + error.message)
      setUploadedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  const handleReset = () => {
    setUploadedFile(null)
    setExtractedData(null)
    setValidationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="contract-upload-zone">
      {!uploadedFile ? (
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📄</div>
          <h3>Carica contratto in PDF</h3>
          <p>Trascina e rilascia il file qui o fai clic per selezionare</p>
          <button className="upload-button" onClick={handleClickUpload} disabled={isProcessing}>
            {isProcessing ? 'Elaborazione...' : 'Seleziona file'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
        </div>
      ) : (
        <div className="upload-result">
          <div className="result-header">
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <div className="file-name">{uploadedFile.name}</div>
                <div className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</div>
              </div>
            </div>
            <button className="result-reset-btn" onClick={handleReset} title="Carica un altro file">
              ✕
            </button>
          </div>

          {isProcessing ? (
            <div className="extraction-loading">
              <div className="spinner" />
              <p>Estrazione dati in corso...</p>
            </div>
          ) : extractedData && validationResult ? (
            <div className="extraction-result">
              {validationResult.isValid ? (
                <div className="extraction-success">
                  <div className="success-icon">✓</div>
                  <p>Dati estratti con successo</p>
                </div>
              ) : (
                <div className="extraction-warning">
                  <div className="warning-icon">⚠</div>
                  <p>Alcuni campi non sono stati trovati</p>
                </div>
              )}

              <div className="extraction-fields">
                <div className="field-group">
                  <label>Numero Contratto</label>
                  <div className="field-value">
                    {extractedData.contrattoNum}
                    <span className="confidence-badge">{Math.round(validationResult.confidence.contrattoNum * 100)}%</span>
                  </div>
                </div>

                <div className="field-group">
                  <label>Fornitore</label>
                  <div className="field-value">
                    {extractedData.fornitore}
                    <span className="confidence-badge">{Math.round(validationResult.confidence.fornitore * 100)}%</span>
                  </div>
                </div>

                <div className="field-group">
                  <label>Data Inizio</label>
                  <div className="field-value">
                    {extractedData.dataInizio || 'Non trovata'}
                    <span className="confidence-badge">{Math.round(validationResult.confidence.dataInizio * 100)}%</span>
                  </div>
                </div>

                <div className="field-group">
                  <label>Data Scadenza</label>
                  <div className="field-value">
                    {extractedData.dataFine || 'Non trovata'}
                    <span className="confidence-badge">{Math.round(validationResult.confidence.dataFine * 100)}%</span>
                  </div>
                </div>

                <div className="field-group">
                  <label>Importo Annuale</label>
                  <div className="field-value">
                    €&nbsp;{parseFloat(extractedData.importoAnnuale).toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="confidence-badge">{Math.round(validationResult.confidence.importoAnnuale * 100)}%</span>
                  </div>
                </div>

                <div className="field-group">
                  <label>Tipo</label>
                  <div className="field-value">
                    {extractedData.tipo}
                    <span className="confidence-badge">{Math.round(validationResult.confidence.tipo * 100)}%</span>
                  </div>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <div className="extraction-errors">
                  <div className="errors-title">Campi mancanti:</div>
                  <ul>
                    {validationResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                  <p className="errors-note">I dati mancanti possono essere completati manualmente durante il salvataggio.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
