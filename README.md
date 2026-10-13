# ప్రజా మిత్ర AI (Praja Mitra AI)
### Telugu Regional Voice Assistant for Andhra Pradesh & Telangana Welfare Schemes
*Empowering rural citizens, farmers, and elders with accessible voice-first digital governance.*

---

## 🌾 Overview & Purpose

**Praja Mitra AI** is an accessible, voice-first single-page web application engineered specifically for rural citizens, farmers, village elders, and daily wage workers across **Andhra Pradesh** and **Telangana**.

Most official government portals (such as *Meebhoomi*, *Dharani*, *Navasakam*, *EPDS*, and *PM-Kisan*) are English-centric, dense, and difficult for non-English speakers to navigate. **Praja Mitra AI** breaks down this digital divide:
- Citizens tap **one massive, prominent microphone button**.
- They speak in everyday conversational Telugu.
- The assistant identifies the welfare scheme or land record service, displays a simplified checklist of required physical documents, and **speaks the answer back to them in natural Telugu voice**.

---

## 🚀 Key Highlights & Architecture

- **100% Client-Side Zero-Latency Knowledge Base:** Self-contained JSON knowledge base with dialect-tolerant intent recognition (regex and keyword scoring).
- **Zero Server Dependency & 100% Offline-Ready:** Works with zero API keys or backend servers; reliable during auditorium presentations and live judging without connection drops.
- **Auditorium Failsafe Quick Chips:** Clickable pre-configured query chips below the mic so the demo never fails if background noise interferes with live speech recognition.
- **Speech-to-Text (STT):** Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) explicitly configured for `te-IN` (Telugu - India).
- **Text-to-Speech (TTS):** Native `window.speechSynthesis` with automated `te-IN` voice detection, playback controls (Replay, Stop), and animated sound wave equalizer.
- **WCAG 2.1 AAA Accessibility:** Large touch targets ($\ge 48\text{px}$ to $112\text{px}$), high contrast mode toggle, font size adjusters (`A-`, `A`, `A+`, `A++`), and clear visual document pill cards.

---

## 🏛️ Supported Welfare Domains & Services

| Welfare Domain | Key Dialect Keywords | Spoken Voice Summary | Physical Documents Checklist | Official Portal Link |
| :--- | :--- | :--- | :--- | :--- |
| **రైతు భరోసా / పీఎం కిసాన్**<br>*(Farmer Investment Support)* | రైతు, భరోసా, కిసాన్, పెట్టుబడి, సాయం, ఎరువులు, సాగు, పంట | ఏటా పెట్టుబడి సాయం నేరుగా బ్యాంక్ ఖాతాలో జమ. ఈ-క్రాప్ బుకింగ్ తప్పనిసరి. | ఆధార్ కార్డు, పట్టాదారు పాస్ బుక్, 1-B నకలు, బ్యాంక్ పాస్ బుక్, CCRC కార్డ్ | [PM-Kisan Portal](https://pmkisan.gov.in) |
| **పట్టాదారు పాస్ బుక్ / మీభూమి / ధరణి**<br>*(Land Records & 1-B)* | పాస్ బుక్, భూమి, పట్టా, ధరణి, మీభూమి, అడంగల్, 1-B, సర్వే నంబర్ | సర్వే నంబర్ లేదా ఆధార్ ద్వారా మీభూమి లేదా ధరణిలో డిజిటల్ పాస్ బుక్ డౌన్లోడ్. | సర్వే నంబర్, ఖాతా సంఖ్య, ఆధార్ నంబర్, రిజిస్టర్డ్ మొబైల్ | [Meebhoomi AP](https://meebhoomi.ap.gov.in) |
| **డా. వైఎస్సార్ ఆరోగ్యశ్రీ / ఆయుష్మాన్ భారత్**<br>*(Free Corporate Healthcare)* | ఆరోగ్యశ్రీ, ఆసుపత్రి, రోగం, ఆపరేషన్, ఉచిత వైద్యం, కార్డు | గుర్తింపు పొందిన నెట్వర్క్ ఆసుపత్రులలో ఉచిత నగదు రహిత చికిత్స మరియు ఆపరేషన్లు. | తెల్ల రేషన్ కార్డు, ఆధార్ కార్డు, ఆరోగ్యశ్రీ కార్డు, రిపోర్టులు | [Aarogyasri Trust](https://ysraarogyasri.ap.gov.in) |
| **సామాజిక భద్రతా పెన్షన్లు**<br>*(Old Age, Widow, Disability)* | పెన్షన్, పింఛన్, వృద్ధాప్య, వికలాంగ, వితంతు, ముసలి, అవ్వ, తాత | సచివాలయంలో దరఖాస్తు; ప్రతి నెలా ఒకటవ తేదీన నేరుగా ఇంటి వద్దకే నగదు అందజేత. | ఆధార్ కార్డు, వయస్సు ధృవీకరణ (60+), సదరం సర్టిఫికేట్, మరణ ధృవీకరణ | [Navasakam AP](https://navasakam.ap.gov.in) |
| **రేషన్ కార్డు / బియ్యం కార్డు**<br>*(Food Security & PDS)* | రేషన్ కార్డు, బియ్యం, కోటా, సచివాలయం, తెల్ల కార్డు, డీలర్ | సచివాలయంలో ఈ-కేవైసీ ద్వారా కొత్త కార్డు లేదా సభ్యుల పేర్ల చేర్పు. డీలర్ వద్ద ఉచిత బియ్యం. | కుటుంబ సభ్యుల ఆధార్ కార్డులు, కరెంట్ బిల్లు, గ్యాస్ వివరాలు | [EPDS AP](https://epdsap.ap.gov.in) |
| **అమ్మ ఒడి & విద్యా దీవెన**<br>*(Student Education Support)* | అమ్మ ఒడి, విద్యా దీవెన, స్కూల్, బడి, పిల్లలు, చదువు, ఫీజు | బడికి వెళ్లే విద్యార్థుల తల్లుల ఖాతాలో అమ్మ ఒడి; కాలేజీ విద్యార్థులకు పూర్తి ఫీజు రీయింబర్స్మెంట్. | తల్లి & విద్యార్థి ఆధార్, బోనఫైడ్, 75% హాజరు, బ్యాంక్ పాస్ బుక్ | [Jnanabhumi](https://jnanabhumi.ap.gov.in) |
| **పేదలందరికీ ఇళ్లు / ఇందిరమ్మ ఇళ్లు**<br>*(Housing Scheme for Poor)* | ఇల్లు, ఇళ్లు, గృహం, ఇందిరమ్మ, జగనన్న కాలనీ, ఇళ్ల స్థలం | సొంత ఇల్లు లేని పేదలకు ఉచిత స్థల పట్టా మరియు పక్కా ఇంటి నిర్మాణానికి దశలవారీ నిధులు. | భార్యాభర్తల ఆధార్ కార్డులు, తెల్ల రేషన్ కార్డు, నివాస పత్రం | [Housing AP](https://housing.ap.gov.in) |
| **ఉపాధి హామీ పథకం (MGNREGA)**<br>*(100 Days Rural Employment)* | ఉపాధి, హామీ, పని, కూలీ, జాబ్ కార్డు, 100 రోజులు | గ్రామీణ కుటుంబాలకు ఏడాదికి కనీసం 100 రోజుల పని మరియు కనీస వేతన గ్యారంటీ. | కుటుంబ సభ్యుల ఆధార్ కార్డులు, జాబ్ కార్డు, బ్యాంక్ పాస్ బుక్ | [MGNREGA](https://nrega.nic.in) |

---

## 🛠️ Project Structure

```text
e:/Telugu_seva/
├── index.html            # Main single-page application interface
├── schemes_data.js       # Preloaded Telugu knowledge base & colloquial synonyms
├── voice_assistant.js    # STT (te-IN), TTS synthesis, intent matching, accessibility
├── styles.css            # Responsive styles, listening ripple pulse, audio waves
├── test_matcher.py       # Sanity verification test script
├── simulate_matcher.py   # Test runner for 27 dialect query scenarios
└── README.md             # Complete documentation and deployment guide
```

---

## 🏃 Quick Start / How to Run Locally

### Option 1: Direct File Launch (No server required)
Double-click `index.html` in your file explorer to open it in **Google Chrome**, **Microsoft Edge**, or **Brave**.
*(Note: Browsers allow speech synthesis and quick chips on local files. For microphone access, modern browsers generally recommend `localhost` or HTTPS).*

### Option 2: Run a Local HTTP Server (Recommended for Mic Testing)
In PowerShell or Terminal:
```powershell
python -m http.server 8000
```
Open your browser and navigate to:
```text
http://localhost:8000
```

---

## 🚢 Deployment Guide

The application is a pure static web app and can be deployed with zero build steps to:

### 1. GitHub Pages
1. Push this directory to a GitHub repository.
2. In Repository Settings $\rightarrow$ **Pages** $\rightarrow$ Source: choose `main` branch / root `/`.
3. Save. Your live site will be ready at `https://<username>.github.io/<repo>/`.

### 2. Vercel
Run `vercel` in the folder or import the GitHub repo. Vercel will automatically serve `index.html` on HTTPS (enabling microphone permissions instantly).

### 3. Netlify
Drag and drop the `Telugu_seva` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 🎤 Audio & Web Speech Compatibility Notes

- **Microphone Recognition (STT):** Best experienced in **Google Chrome** and **Microsoft Edge**, which support native `te-IN` speech recognition.
- **Voice Playback (TTS):** Automatically searches for installed Telugu (`te-IN`), Hindi (`hi-IN`), or Indian English (`en-IN`) voice synthesis engines and speaks with clear rural pacing ($0.92\times$ rate).
- **No-Mic / Auditorium Mode:** If speaking is not possible due to background noise or browser permission policies, simply tap any of the pre-loaded **Emergency Demo Chips** to test the entire interaction pipeline.

---

## 🏛️ Government Helplines Integrated
- **స్పందన / ప్రజావాణి (AP Citizen Grievance):** `1902`
- **మీసేవ టోల్ ఫ్రీ (Meeseva Support):** `1100`
- **ఆరోగ్యశ్రీ వైద్య సలహా (Healthcare Advice):** `104`
- **అత్యవసర అంబులెన్స్ (Emergency Ambulance):** `108`
- **పీడీఎస్ రేషన్ కార్డు సహాయం (PDS Food Security):** `1967`

