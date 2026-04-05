# Fermopoint Control Tower — Manuale Utente
**Versione:** 0.11.0 | **Aggiornato:** 2026-04-05

---

## Indice

1. [Introduzione](#introduzione)
2. [Accesso e Login](#accesso-e-login)
3. [Panoramica (Overview)](#panoramica)
4. [Spedizioni](#spedizioni)
5. [Giri e Ottimizzazione](#giri-e-ottimizzazione)
6. [PUDO (Punti di Ritiro)](#pudo)
7. [Flotta](#flotta)
8. [Filiali](#filiali)
9. [Contratti](#contratti)
10. [Utenti](#utenti)
11. [Eccezioni](#eccezioni)
12. [Report](#report)
13. [Impostazioni](#impostazioni)

---

## 1. Introduzione

**Fermopoint Control Tower** è la piattaforma di gestione logistica integrata per il network DPD/Fermopoint. Permette di monitorare spedizioni, ottimizzare i giri di consegna, gestire PUDO, flotta, filiali, contratti e utenti da un'unica interfaccia.

### Funzionalità principali
- **Dashboard real-time** con KPI aggregati
- **Importazione spedizioni** da AS/400 o file CSV/Excel
- **Ottimizzazione giri** tramite integrazione OptimoRoute
- **Gestione PUDO** con mappa interattiva e Indice di Copertura (CI)
- **Monitoraggio flotta** con carburanti e manutenzioni
- **Gestione contratti** con estrazione AI da PDF
- **Tutorial interattivi** per onboarding guidato

---

## 2. Accesso e Login

### Credenziali Demo
| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | admin@fermopoint.it | qualsiasi |
| Manager | manager@fermopoint.it | qualsiasi |

> **Nota:** In ambiente demo, la password non viene verificata. In produzione sarà integrata con il sistema SSO aziendale.

### Sessione
La sessione viene mantenuta nel browser tramite `localStorage`. Per uscire, usare il pulsante logout (→) in alto a destra nell'header.

---

## 3. Panoramica

La sezione **Panoramica** è la home page dell'applicazione. Mostra:

- **KPI Principali:** spedizioni totali, PUDO attivi, giri pianificati, CI medio
- **Grafico giri per filiale:** distribuzione dei giri per sede operativa
- **Eccezioni aperte:** lista delle anomalie non risolte con priorità
- **Attività recente:** ultime azioni eseguite nel sistema

### Indice di Copertura (CI)
Il CI misura l'efficienza di un punto di ritiro PUDO:
- **CI ≥ 4.0** (verde): ottima copertura, PUDO ad alta redditività
- **CI 2.5–3.9** (arancio): copertura media, da monitorare
- **CI < 2.5** (blu): bassa copertura, valutare interventi

---

## 4. Spedizioni

### Importazione
Accedere a **Spedizioni → Importa spedizioni** per caricare nuovi dati:

**Modalità API (AS/400):**
1. Selezionare il numero di mesi di storico
2. Scegliere le province da includere
3. Confermare — il sistema simula la sincronizzazione

**Modalità File:**
1. Selezionare CSV o Excel
2. Trascinare il file nella zona di upload
3. Il sistema importa automaticamente le colonne standard

### Filtri e Ricerca
- **Barra di ricerca:** cerca per ID spedizione, destinatario o nome PUDO
- **Filtro Tipo:** consegna / ritiro (multiselect)
- **Filtro PUDO:** filtra per punto di ritiro specifico
- **Ordinamento:** data, peso, volume (crescente/decrescente)

### Paginazione
15 spedizioni per pagina. Navigare con i pulsanti «‹›» o cliccando direttamente il numero di pagina.

---

## 5. Giri e Ottimizzazione

### Tab Giri
Lista completa dei giri con filtri per filiale, stato e data. Ogni giro mostra:
- Nome, filiale, autista, mezzo
- Numero di tappe e distanza totale
- Stato (Pianificato / In corso / Completato)

**Espandere un giro** cliccando la riga per vedere tutte le tappe in sequenza.

### Tab Template
I template sono giri riutilizzabili, salvati come configurazioni standard. Utili per:
- Giri ricorrenti con le stesse tappe
- Configurazioni stagionali
- Base per la creazione di nuovi scenari

Per usare un template: **Usa template** → viene aperto il wizard con i parametri precompilati.

### Tab Scenari — Ottimizzazione OptimoRoute

Il **Wizard di Creazione Scenario** guida in 5 passi:

**Step 1 — Area e Filiale**
- Selezionare la filiale di partenza
- Scegliere le province da coprire
- Impostare il periodo per il calcolo del CI (7/14/30/60 giorni)
- Definire il CI minimo dei PUDO da includere
- Impostare il raggio massimo dalla filiale

**Step 2 — Selezione PUDO**
- Mappa interattiva con tutti i PUDO filtrati dai criteri dello Step 1
- Selezione/deselezione manuale con checkbox
- Colori: verde (CI alto), arancio (CI medio), blu (CI basso)

**Step 3 — Pianificazione**
- Data di esecuzione dei giri
- Finestra oraria del turno
- Numero di mezzi disponibili
- Durata media fermata PUDO

**Step 4 — Parametri OptimoRoute**
- Bilanciamento del carico (Off / Bilanciato / Forzato)
- Criterio di bilanciamento (ore lavoro / numero fermate)
- Peso e volume massimi per mezzo
- Opzioni clustering geografico e rientro deposito

**Step 5 — Conferma**
- Riepilogo completo di tutti i parametri
- Possibilità di salvare lo scenario come **preferito** (❤️)
- Invio a OptimoRoute per l'ottimizzazione

### Tab Preferiti ❤️
Raccoglie tutti gli scenari salvati come preferiti. Per aggiungere un preferito, usare il pulsante ❤️ nell'ultimo step del wizard.

---

## 6. PUDO (Punti di Ritiro)

### Vista Lista
Tabella con tutti i PUDO con:
- Nome, indirizzo, tipo (negozio / locker)
- CI calcolato sul periodo selezionato
- Stato (Attivo / Inattivo)

### Vista Mappa
Mappa interattiva Leaflet con marker colorati in base al CI:
- 🟢 Verde: CI ≥ 4
- 🟠 Arancio: CI 2.5–3.9
- 🔵 Blu: CI < 2.5

Cliccando un marker si aprono i dettagli del PUDO.

### Filtri
- **Periodo CI:** 7 / 14 / 30 / 60 giorni
- **CI Minimo:** slider per filtrare PUDO sotto soglia
- **Tipo:** negozio / locker

---

## 7. Flotta

### Tab Veicoli
Catalogo completo della flotta con specifiche tecniche di ogni mezzo:
- Portata massima (kg) e volume (m³)
- Tipo carburante, consumo medio
- Stato: Disponibile / In servizio / Manutenzione

### Tab Carburanti
Monitoraggio dei rifornimenti:
- KPI: spesa totale, litri, costo medio al litro, CO₂
- Grafico storico a barre per periodo (7/14/30/60 giorni)
- Registro rifornimenti con data, mezzo, importo

### Tab Manutenzioni
Scadenziario manutenzioni programmata e straordinarie.

---

## 8. Filiali

Gestione delle sedi operative Fermopoint:

- **Lista filiali** con KPI: superficie, punti ritiro, stato
- **Dettaglio filiale:** mappa posizione, contatti, responsabile
- **Associazione PUDO:** lista dei PUDO nel raggio della filiale

Filiali attive: Roma Laurentina, Napoli Centro, Milano Bovisa, Stezzano (BG).

---

## 9. Contratti

La sezione Contratti gestisce tutti i documenti contrattuali suddivisi per tipologia.

### 3 Categorie
| Tab | Descrizione |
|-----|-------------|
| 🚚 Noleggio Mezzi | Contratti di noleggio veicoli e allestimenti |
| 👤 Corrieri Dipendenti/Esterni | Accordi con corrieri e cooperative |
| ⚙️ Operatori Handling | Contratti operatori magazzino e handling |

### Caricamento PDF con AI
1. Trascina il PDF nella zona upload (o clicca **Seleziona file**)
2. Il sistema estrae automaticamente:
   - Numero contratto
   - Fornitore/contraente
   - Date inizio e scadenza
   - Importo annuale
3. Viene mostrata la **confidenza** dell'estrazione per ogni campo (0–100%)
4. I campi mancanti possono essere completati manualmente
5. Il contratto viene salvato nella categoria appropriata

### Status Contratti
- 🟢 **Attivo:** scadenza > 30 giorni
- 🟠 **In scadenza:** scadenza < 30 giorni
- 🔴 **Scaduto:** data scadenza superata

I contratti sono persistiti nel browser (`localStorage`). In produzione saranno sincronizzati con il backend.

---

## 10. Utenti

Gestione degli accessi al sistema:

- Lista utenti con ruolo e stato
- Filtro per ruolo (Admin / Manager / Operatore)
- Creazione e modifica utenti (solo Admin)
- Reset password (solo Admin)

> Solo gli utenti con ruolo **Admin** vedono la sezione Utenti nel menu.

---

## 11. Eccezioni

Monitoraggio delle anomalie operative:

- **Priorità Alta:** richiede intervento immediato
- **Priorità Media:** da gestire entro la giornata
- **Priorità Bassa:** segnalazione informativa

Ogni eccezione può essere:
- Visualizzata in dettaglio
- Assegnata a un operatore
- Risolta (chiusa)

Il contatore delle eccezioni aperte appare in rosso nel menu laterale.

---

## 12. Report

Dashboard reportistica con grafici aggregati:

- **Spedizioni per periodo:** trend giornaliero/settimanale/mensile
- **Performance filiali:** confronto KPI tra sedi
- **Efficienza flotta:** km percorsi, consumi, CO₂
- **CI medio PUDO:** andamento dell'Indice di Copertura nel tempo

---

## 13. Impostazioni

Accessibili dall'icona ⚙️ nell'header.

### Tab Tutorial
- **Abilita/disabilita** tutti i tutorial con un toggle
- Lista dei tutorial disponibili con stato (Attivo / Ignorato)
- **Riabilita** singoli tutorial già visti
- **Ripristina tutti** i tutorial per rivedere l'onboarding completo

### Tab Interfaccia
- **Lingua:** Italiano 🇮🇹 / English 🇬🇧 (la preferenza viene salvata)
- **Dark mode:** in arrivo in v0.12.0

### Tab Info
- Versione dell'applicazione
- Data ultimo aggiornamento
- Status ambiente (Production Demo)

---

## Note Tecniche

| Parametro | Valore |
|-----------|--------|
| Versione | 0.11.0 |
| Framework | React 18.3 + Vite 6.4 |
| Mappe | Leaflet 1.9 + OpenStreetMap |
| Storage | localStorage (browser) |
| Ottimizzazione | OptimoRoute API (mock) |
| Estrazione PDF | AI regex-based (mock) |

### Chiavi localStorage
| Chiave | Contenuto |
|--------|-----------|
| `fp_ct_user` | Sessione utente corrente |
| `fp_ct_user_settings` | Preferenze tutorial e interfaccia |
| `fp_ct_language` | Lingua selezionata |
| `fp_ct_menu_state` | Stato collapse gruppi sidebar |
| `fp_ct_contracts` | Contratti caricati |
| `fp_ct_scenario_favorites` | ID scenari preferiti |

---

*Fermopoint Control Tower — © 2026 Fermopoint S.r.l. | Documento interno*
