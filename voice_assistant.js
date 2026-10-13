// ============================================================================
// PRAJA MITRA AI (ప్రజా మిత్ర AI) — CONTROLLER & VOICE ENGINE
// Web Speech STT (te-IN) + TTS + Dialect Tolerant Intent Recognition
// ============================================================================

class PrajaMitraAI {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.currentScheme = null;
    this.teluguVoice = null;
    this.speechRate = 0.92; // Slightly paced for optimal rural comprehension

    // DOM Elements
    this.elements = {
      micButton: document.getElementById('micButton'),
      micContainer: document.getElementById('micContainer'),
      micStatusText: document.getElementById('micStatusText'),
      micStatusDot: document.getElementById('micStatusDot'),
      transcriptContainer: document.getElementById('transcriptContainer'),
      transcriptText: document.getElementById('transcriptText'),
      responseContainer: document.getElementById('responseContainer'),
      welcomeCard: document.getElementById('welcomeCard'),
      quickChipsContainer: document.getElementById('quickChipsContainer'),
      manualSearchInput: document.getElementById('manualSearchInput'),
      searchButton: document.getElementById('searchButton'),
      notificationBanner: document.getElementById('notificationBanner'),
      bannerText: document.getElementById('bannerText'),
      highContrastToggle: document.getElementById('highContrastToggle'),
      fontSizeBtns: document.querySelectorAll('[data-font-size]'),
      sttSupportedBadge: document.getElementById('sttSupportedBadge')
    };

    this.init();
  }

  init() {
    this.setupSpeechRecognition();
    this.setupSpeechSynthesis();
    this.renderQuickDemoChips();
    this.bindEvents();
    this.initAccessibility();

    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // 1. SPEECH RECOGNITION (STT) SETUP (te-IN)
  // ==========================================================================
  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser.");
      if (this.elements.sttSupportedBadge) {
        this.elements.sttSupportedBadge.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <i data-lucide="info" class="w-3.5 h-3.5"></i>
            వాయిస్ సపోర్ట్ లేదు (టైప్ లేదా బటన్లు వాడండి)
          </span>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'te-IN'; // Explicit Telugu - India
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      // Event: Recording started
      this.recognition.onstart = () => {
        this.isListening = true;
        this.stopSpeaking(); // Silence TTS if currently speaking
        this.updateMicUIState('listening');
      };

      // Event: Interim and Final Speech Results
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const displayText = finalTranscript || interimTranscript;
        if (displayText) {
          this.showTranscript(displayText, !finalTranscript);
        }

        if (finalTranscript) {
          this.handleQuery(finalTranscript.trim());
        }
      };

      // Event: Graceful Error Handling
      this.recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        this.isListening = false;
        this.updateMicUIState('idle');

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            this.showBanner(
              "మైక్రోఫోన్ అనుమతి తిరస్కరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో మైక్ అనుమతించండి లేదా కింద ఉన్న బటన్లపై నొక్కండి.",
              "error"
            );
            break;
          case 'no-speech':
            this.showBanner(
              "ఏమీ వినపడలేదు! దయచేసి మైక్ బటన్ నొక్కి మళ్ళీ మాట్లాడండి.",
              "warning"
            );
            break;
          case 'audio-capture':
            this.showBanner(
              "మైక్రోఫోన్ కనుగొనబడలేదు. ఆడియో పరికరాన్ని తనిఖీ చేయండి.",
              "error"
            );
            break;
          case 'network':
            this.showBanner(
              "నెట్‌వర్క్ అంతరాయం ఏర్పడింది. దయచేసి ఇంటర్నెట్ తనిఖీ చేయండి లేదా కింద ఉన్న సూచన బటన్లను వాడండి.",
              "warning"
            );
            break;
          default:
            this.showBanner(
              "వాయిస్ రికగ్నిషన్‌లో సమస్య ఉంది. కింద ఉన్న ప్రశ్నల బటన్లను నొక్కండి.",
              "warning"
            );
        }
      };

      // Event: Recording ended
      this.recognition.onend = () => {
        this.isListening = false;
        if (this.elements.micContainer.classList.contains('is-listening')) {
          this.updateMicUIState('idle');
        }
      };
    } catch (err) {
      console.error("Failed to initialize Speech Recognition:", err);
    }
  }

  toggleListening() {
    if (!this.recognition) {
      this.showBanner("ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి క్రోమ్ బ్రౌజర్ వాడండి లేదా కింద ఉన్న ప్రశ్నల బటన్లను నొక్కండి.", "warning");
      this.elements.manualSearchInput.focus();
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateMicUIState('idle');
    } else {
      try {
        this.hideBanner();
        this.recognition.start();
      } catch (e) {
        console.warn("Recognition already active or restart error:", e);
        this.recognition.stop();
      }
    }
  }

  // ==========================================================================
  // 2. SPEECH SYNTHESIS (TTS) SETUP (te-IN with Fallbacks)
  // ==========================================================================
  setupSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech Synthesis is not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for Telugu voice (te-IN or te)
      this.teluguVoice = voices.find(v => v.lang === 'te-IN' || v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu'))
        || voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'))
        || voices.find(v => v.lang === 'en-IN')
        || voices[0];
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  speak(text) {
    if (!('speechSynthesis' in window) || !text) return;

    // Cancel any running speech before starting new speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'te-IN';
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    if (this.teluguVoice) {
      utterance.voice = this.teluguVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.updateSpeakingUI(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateSpeakingUI(false);
    };

    utterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      this.isSpeaking = false;
      this.updateSpeakingUI(false);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.updateSpeakingUI(false);
    }
  }

  replayCurrentVoice() {
    if (this.currentScheme && this.currentScheme.voiceResponse) {
      this.speak(this.currentScheme.voiceResponse);
    }
  }

  // ==========================================================================
  // 3. DIALECT-TOLERANT INTENT & KEYWORD MATCHER
  // ==========================================================================
  matchIntent(rawText) {
    if (!rawText || !rawText.trim()) return null;

    const normalized = rawText
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"|]/g, " ")
      .trim();

    const tokens = normalized.split(/\s+/).filter(Boolean);

    let bestMatch = null;
    let highestScore = 0;

    for (const scheme of SCHEMES_DATABASE) {
      let score = 0;

      // Exact substring match in Telugu title
      if (normalized.includes(scheme.titleTelugu.toLowerCase())) {
        score += 50;
      }

      // Check keywords and synonyms
      for (const kw of scheme.keywords) {
        const kwLower = kw.toLowerCase();
        
        // Full phrase match within spoken query
        if (normalized.includes(kwLower)) {
          // Give higher weight to specific terms (e.g. "ఆరోగ్యశ్రీ", "పాస్ బుక్", "కిసాన్")
          score += kwLower.length > 5 ? 15 : 10;
        }

        // Token-level match
        for (const token of tokens) {
          if (token === kwLower) {
            score += 12;
          } else if (token.length >= 4 && kwLower.includes(token)) {
            score += 5; // Partial stem match
          }
        }
      }

      // Colloquialisms & domain heuristics
      if (scheme.id === 'rythu-bharosa-pmkisan') {
        if (/ఎరువు|విత్తన|పంట|ఖాతాలో|పెట్టుబడి|రైతు|సాగు/i.test(normalized)) score += 10;
      } else if (scheme.id === 'land-records-passbook') {
        if (/భూమి|పట్టా|1-b|1b|అడంగల్|పహణీ|సర్వే|మీభూమి|ధరణి/i.test(normalized)) score += 10;
      } else if (scheme.id === 'arogyasri-ayushman') {
        if (/ఆస్పత్రి|ఆసుపత్రి|రోగం|జబ్బు|ఆపరేషన్|వైద్యం|డాక్టర్|చికిత్స/i.test(normalized)) score += 10;
      } else if (scheme.id === 'social-pensions') {
        if (/వృద్ధాప్య|ముసలి|అవ్వ|తాత|వికలాంగ|దివ్యాంగ|వితంతు|పింఛను|పెన్షన్/i.test(normalized)) score += 10;
      } else if (scheme.id === 'ration-card-rice') {
        if (/రేషన్|బియ్యం|కోటా|డీలర్|సరుకులు|తెల్లకార్డు|ఈ-కేవైసీ/i.test(normalized)) score += 10;
      } else if (scheme.id === 'amma-vodi-vidya-deevena') {
        if (/స్కూల్|బడి|కాలేజీ|చదువు|ఫీజు|హాజరు|అమ్మ ఒడి/i.test(normalized)) score += 10;
      } else if (scheme.id === 'housing-indira-jagananna') {
        if (/ఇల్లు|ఇళ్ళు|ఇళ్లు|గృహ|కాలనీ|స్థలం|నిర్మాణం|పట్టా/i.test(normalized)) score += 10;
      } else if (scheme.id === 'mgnrega-employment') {
        if (/ఉపాధి|కూలీ|పని|జాబ్ కార్డు|వంద రోజులు/i.test(normalized)) score += 10;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = scheme;
      }
    }

    // Minimum threshold for confident match
    if (highestScore >= 10 && bestMatch) {
      return bestMatch;
    }

    return null;
  }

  // ==========================================================================
  // 4. QUERY PROCESSOR & UI RENDERER
  // ==========================================================================
  handleQuery(queryText) {
    if (!queryText || !queryText.trim()) return;

    this.showTranscript(queryText, false);
    this.updateMicUIState('processing');

    setTimeout(() => {
      const match = this.matchIntent(queryText);
      if (match) {
        this.currentScheme = match;
        this.renderSchemeResponse(match);
        this.speak(match.voiceResponse);
      } else {
        this.currentScheme = FALLBACK_RESPONSE;
        this.renderFallbackResponse(queryText);
        this.speak(FALLBACK_RESPONSE.voiceResponse);
      }
      this.updateMicUIState('idle');
    }, 250);
  }

  renderSchemeResponse(scheme) {
    if (this.elements.welcomeCard) {
      this.elements.welcomeCard.classList.add('hidden');
    }

    const container = this.elements.responseContainer;
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 md:p-8 fade-in-up transition-all duration-300">
        
        <!-- Header: Category & Title -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
              <i data-lucide="${scheme.icon || 'shield-check'}" class="w-4 h-4 text-emerald-700"></i>
              ${scheme.categoryTelugu}
            </span>
            <span class="text-xs text-slate-500 font-medium hidden sm:inline">
              ${scheme.categoryEnglish}
            </span>
          </div>

          <!-- Helpline Badge -->
          <div class="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-900 text-xs font-semibold">
            <i data-lucide="phone-call" class="w-3.5 h-3.5 text-amber-600"></i>
            <span>సహాయం: ${scheme.helpline}</span>
          </div>
        </div>

        <!-- Scheme Main Title -->
        <div class="mt-5">
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            ${scheme.titleTelugu}
          </h2>
          <p class="text-sm text-slate-500 font-medium mt-1">
            ${scheme.titleEnglish}
          </p>
        </div>

        <!-- Spoken Voice Answer Box (Natural Audio Guidance) -->
        <div class="mt-6 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50/50 border-2 border-emerald-300/80 shadow-sm relative overflow-hidden">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <i data-lucide="volume-2" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <span>వాయిస్ సమాధానం (Voice Explanation)</span>
                  <div class="equalizer-container text-emerald-700" id="cardEqualizer">
                    <span class="equalizer-bar"></span>
                    <span class="equalizer-bar"></span>
                    <span class="equalizer-bar"></span>
                    <span class="equalizer-bar"></span>
                    <span class="equalizer-bar"></span>
                  </div>
                </span>
              </div>
              <p class="text-slate-900 font-medium text-base md:text-lg leading-relaxed">
                "${scheme.voiceResponse}"
              </p>
            </div>
          </div>

          <!-- Audio Playback Controls Bar -->
          <div class="mt-4 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <button id="btnReplayAudio" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm active:scale-95 touch-target-lg">
                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                <span>మళ్ళీ వినండి (Replay)</span>
              </button>
              <button id="btnStopAudio" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition active:scale-95 touch-target-lg">
                <i data-lucide="square" class="w-4 h-4 text-slate-600"></i>
                <span>ఆపండి (Stop)</span>
              </button>
            </div>
            
            <div class="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
              గ్రామీణ రైతులకు సరళీకరించిన వివరణ
            </div>
          </div>
        </div>

        <!-- Detailed Description -->
        <div class="mt-6 text-slate-700 text-base leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
          <p class="font-medium">${scheme.detailedSummary}</p>
        </div>

        <!-- VISUAL DOCUMENT CHECKLIST (కావలసిన పత్రాలు) -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="file-check-2" class="w-5 h-5 text-emerald-600"></i>
              <span>కావలసిన పత్రాలు / కాగితాలు (Required Documents Checklist):</span>
            </h3>
            <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              సచివాలయానికి తీసుకెళ్లండి
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${scheme.documents.map(doc => `
              <div class="doc-pill p-3.5 rounded-2xl bg-white border-2 border-slate-200/80 flex items-start gap-3 shadow-sm hover:border-emerald-500 transition-colors">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="${doc.icon || 'file-text'}" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm leading-snug">${doc.name}</h4>
                  <p class="text-xs text-slate-500 mt-0.5">${doc.note || 'ధృవీకరణ పత్రం'}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- STEP-BY-STEP APPLICATION GUIDE -->
        <div class="mt-8">
          <h3 class="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
            <i data-lucide="list-ordered" class="w-5 h-5 text-emerald-600"></i>
            <span>ఎలా దరఖాస్తు చేసుకోవాలి? (Step-by-Step Procedure):</span>
          </h3>
          <div class="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            ${scheme.stepsTelugu.map((step, idx) => `
              <div class="flex items-start gap-3 text-slate-800 text-sm md:text-base">
                <div class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ${idx + 1}
                </div>
                <p class="font-medium pt-0.5">${step}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ACTION FOOTER: Official Portal & Share -->
        <div class="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <a href="${scheme.portalUrl}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm md:text-base shadow-lg shadow-emerald-600/20 active:scale-95 transition touch-target-lg">
            <span>అధికారిక వెబ్‌సైట్ ఓపెన్ చేయండి (Visit Official Portal)</span>
            <i data-lucide="external-link" class="w-4 h-4"></i>
          </a>

          <div class="flex items-center gap-2">
            <button id="btnShareWhatsApp" class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-sm transition touch-target-lg">
              <i data-lucide="share-2" class="w-4 h-4 text-emerald-700"></i>
              <span>వాట్సాప్‌లో పంపండి</span>
            </button>
            <button id="btnCopyDetails" class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition touch-target-lg">
              <i data-lucide="copy" class="w-4 h-4 text-slate-600"></i>
              <span>కాపీ చేయండి</span>
            </button>
          </div>
        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Bind card buttons
    document.getElementById('btnReplayAudio')?.addEventListener('click', () => this.replayCurrentVoice());
    document.getElementById('btnStopAudio')?.addEventListener('click', () => this.stopSpeaking());
    document.getElementById('btnShareWhatsApp')?.addEventListener('click', () => this.shareOnWhatsApp(scheme));
    document.getElementById('btnCopyDetails')?.addEventListener('click', () => this.copySchemeDetails(scheme));

    // Scroll smoothly to response card
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderFallbackResponse(queryText) {
    if (this.elements.welcomeCard) {
      this.elements.welcomeCard.classList.add('hidden');
    }

    const container = this.elements.responseContainer;
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="bg-white rounded-3xl shadow-xl border border-amber-200 p-6 md:p-8 fade-in-up">
        
        <div class="flex items-center gap-3 border-b border-amber-100 pb-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <i data-lucide="help-circle" class="w-6 h-6"></i>
          </div>
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-slate-900">
              ${FALLBACK_RESPONSE.titleTelugu}
            </h2>
            <p class="text-xs text-slate-500 font-medium">
              ${FALLBACK_RESPONSE.titleEnglish}
            </p>
          </div>
        </div>

        <div class="mt-5 p-5 rounded-2xl bg-amber-50/80 border border-amber-200">
          <p class="text-slate-800 text-base md:text-lg font-medium leading-relaxed">
            "${FALLBACK_RESPONSE.voiceResponse}"
          </p>
          <div class="mt-4 flex items-center gap-2">
            <button id="btnReplayAudio" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition touch-target-lg">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>మళ్ళీ వినండి</span>
            </button>
            <button id="btnStopAudio" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm transition touch-target-lg">
              <i data-lucide="square" class="w-4 h-4"></i>
              <span>ఆపండి</span>
            </button>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-emerald-600"></i>
            <span>మీరు ఈ క్రింది ముఖ్యమైన విషయాల గురించి అడగవచ్చు (Suggested Topics):</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${FALLBACK_RESPONSE.suggestedChips.map(chip => `
              <button onclick="window.prajaMitra.handleQuery('${chip.query}')"
                class="chip-hover-effect p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left flex items-center gap-3 transition">
                <i data-lucide="${chip.icon}" class="w-5 h-5 text-emerald-600 shrink-0"></i>
                <span class="text-sm font-bold text-slate-800">${chip.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>ప్రభుత్వ సమాచార సహాయం కొరకు టోల్ ఫ్రీ <strong>1902</strong> కి కాల్ చేయవచ్చు.</span>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    document.getElementById('btnReplayAudio')?.addEventListener('click', () => this.replayCurrentVoice());
    document.getElementById('btnStopAudio')?.addEventListener('click', () => this.stopSpeaking());
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ==========================================================================
  // 5. QUICK DEMO CHIPS (EMERGENCY AUDITORIUM FAILSAFE)
  // ==========================================================================
  renderQuickDemoChips() {
    const container = this.elements.quickChipsContainer;
    if (!container) return;

    container.innerHTML = QUICK_DEMO_CHIPS.map(chip => `
      <button type="button" 
        data-query="${chip.query}"
        class="quick-chip-btn chip-hover-effect shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-emerald-50 active:bg-emerald-100 border-2 border-emerald-200/90 hover:border-emerald-500 text-slate-800 hover:text-emerald-900 text-xs md:text-sm font-bold shadow-sm transition touch-target-lg cursor-pointer">
        <i data-lucide="${chip.icon}" class="w-4 h-4 text-emerald-600"></i>
        <span>${chip.label}</span>
      </button>
    `).join('');

    // Attach click handlers to chips
    container.querySelectorAll('.quick-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const query = btn.getAttribute('data-query');
        if (query) {
          this.handleQuery(query);
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // 6. UI STATE & VISUAL HELPERS
  // ==========================================================================
  updateMicUIState(state) {
    const btn = this.elements.micButton;
    const container = this.elements.micContainer;
    const statusText = this.elements.micStatusText;
    const statusDot = this.elements.micStatusDot;

    container.classList.remove('is-listening');
    statusDot.className = 'w-3 h-3 rounded-full';

    if (state === 'listening') {
      container.classList.add('is-listening');
      statusText.textContent = "వింటున్నాను... స్పష్టంగా మాట్లాడండి";
      statusDot.className = 'w-3 h-3 rounded-full bg-red-500 animate-ping';
      btn.setAttribute('aria-label', 'వాయిస్ రికార్డింగ్ ఆపండి');
    } else if (state === 'processing') {
      statusText.textContent = "ఆలోచిస్తున్నాను... పథకం వివరాలు తెస్తున్నాను...";
      statusDot.className = 'w-3 h-3 rounded-full bg-amber-500 animate-bounce';
      btn.setAttribute('aria-label', 'ప్రాసెస్ అవుతోంది');
    } else {
      // idle
      statusText.textContent = "మైక్ సిద్ధంగా ఉంది — మాట్లాడటానికి నొక్కండి";
      statusDot.className = 'w-3 h-3 rounded-full bg-emerald-500';
      btn.setAttribute('aria-label', 'మాట్లాడటానికి మైక్ బటన్ నొక్కండి');
    }
  }

  updateSpeakingUI(isSpeaking) {
    const cardEqualizer = document.getElementById('cardEqualizer');
    if (cardEqualizer) {
      if (isSpeaking) {
        cardEqualizer.classList.add('is-speaking');
      } else {
        cardEqualizer.classList.remove('is-speaking');
      }
    }
  }

  showTranscript(text, isInterim = false) {
    const container = this.elements.transcriptContainer;
    const textEl = this.elements.transcriptText;
    if (!container || !textEl) return;

    container.classList.remove('hidden');
    textEl.textContent = text;

    if (isInterim) {
      textEl.classList.add('text-slate-500', 'italic');
      textEl.classList.remove('text-slate-900', 'font-bold');
    } else {
      textEl.classList.remove('text-slate-500', 'italic');
      textEl.classList.add('text-slate-900', 'font-bold');
    }
  }

  showBanner(message, type = "info") {
    const banner = this.elements.notificationBanner;
    const text = this.elements.bannerText;
    if (!banner || !text) return;

    text.textContent = message;
    banner.classList.remove('hidden', 'bg-amber-100', 'text-amber-900', 'border-amber-300', 'bg-red-100', 'text-red-900', 'border-red-300');

    if (type === "error") {
      banner.classList.add('bg-red-100', 'text-red-900', 'border-red-300');
    } else {
      banner.classList.add('bg-amber-100', 'text-amber-900', 'border-amber-300');
    }

    banner.classList.remove('hidden');
  }

  hideBanner() {
    if (this.elements.notificationBanner) {
      this.elements.notificationBanner.classList.add('hidden');
    }
  }

  // ==========================================================================
  // 7. SHARE & COPY HELPERS
  // ==========================================================================
  shareOnWhatsApp(scheme) {
    const text = `📢 *ప్రజా మిత్ర AI - ప్రభుత్వ సంక్షేమ పథక సమాచారం*\n\n` +
      `*పథకం:* ${scheme.titleTelugu}\n` +
      `*వివరణ:* ${scheme.voiceResponse}\n\n` +
      `*కావలసిన పత్రాలు:* ${scheme.documents.map(d => d.name).join(', ')}\n\n` +
      `*అధికారిక పోర్టల్:* ${scheme.portalUrl}\n` +
      `*హెల్ప్‌లైన్:* ${scheme.helpline}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  copySchemeDetails(scheme) {
    const text = `ప్రజా మిత్ర AI - ${scheme.titleTelugu}\n\nవివరణ: ${scheme.voiceResponse}\n\nకావలసిన పత్రాలు: ${scheme.documents.map(d => d.name).join(', ')}\nపోర్టల్: ${scheme.portalUrl}\nసహాయం: ${scheme.helpline}`;
    navigator.clipboard.writeText(text).then(() => {
      this.showBanner("వివరాలు క్లిప్‌బోర్డ్‌కి కాపీ చేయబడ్డాయి!", "info");
      setTimeout(() => this.hideBanner(), 3000);
    }).catch(() => {
      alert("కాపీ చేయడం సాధ్యం కాలేదు.");
    });
  }

  // ==========================================================================
  // 8. EVENT BINDINGS & ACCESSIBILITY
  // ==========================================================================
  bindEvents() {
    // Microphone Button Click
    this.elements.micButton?.addEventListener('click', () => {
      this.toggleListening();
    });

    // Manual Search Input Form
    const handleManualSearch = () => {
      const q = this.elements.manualSearchInput.value.trim();
      if (q) {
        this.handleQuery(q);
      }
    };

    this.elements.searchButton?.addEventListener('click', handleManualSearch);
    this.elements.manualSearchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleManualSearch();
      }
    });

    // High Contrast Toggle
    this.elements.highContrastToggle?.addEventListener('click', () => {
      const isHighContrast = document.documentElement.classList.toggle('high-contrast');
      localStorage.setItem('praja_high_contrast', isHighContrast ? 'true' : 'false');
    });

    // Font Size Scaling Buttons
    this.elements.fontSizeBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-font-size');
        this.setFontSize(size);
      });
    });
  }

  initAccessibility() {
    // Restore High Contrast
    if (localStorage.getItem('praja_high_contrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
    }

    // Restore Font Size
    const savedSize = localStorage.getItem('praja_font_size') || 'md';
    this.setFontSize(savedSize);
  }

  setFontSize(size) {
    document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    document.documentElement.classList.add(`font-scale-${size}`);
    localStorage.setItem('praja_font_size', size);

    // Active state on buttons
    this.elements.fontSizeBtns.forEach(btn => {
      if (btn.getAttribute('data-font-size') === size) {
        btn.classList.add('bg-emerald-600', 'text-white');
        btn.classList.remove('bg-slate-100', 'text-slate-700');
      } else {
        btn.classList.remove('bg-emerald-600', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-700');
      }
    });
  }
}

// Global bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.prajaMitra = new PrajaMitraAI();
});

