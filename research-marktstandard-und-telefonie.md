# Recherche: Marktstandard Voice Agents & echte Telefonie

Stand: 09.04.2026
Kontext: Input vom Chef → "wie machen es andere, was ist Marktstandard, und wie läuft das mit einer echten Nummer (Latenz, Weiterleitung etc.) in der Theorie"

---

## TL;DR

1. **Unser Setup (Birte) liegt im Marktstandard**, mit zwei Ausnahmen: **Temperature 0.5 ist zu hoch** (Standard ist 0.3, gerade bei Tool-lastigen Support-Agents), und wir haben **keine Evals / Success Criteria** konfiguriert — das ist inzwischen der Punkt, den alle ernsthaften Deployments machen.
2. **Latenz ist das einzige, worüber jeder redet.** Zielwert für "fühlt sich menschlich an": **unter 800 ms** End-to-End, ideal 500–700 ms. Darüber wird es spürbar, ab 1,5 s brechen Conversations ab.
3. **Twilio + ElevenLabs Native Integration** ist der Standardweg in Europa. One-Click, unterstützt Conference-Transfer mit Warm-Handoff (Ansage an den Menschen), und SIP REFER für Integration in vorhandene TK-Anlagen. Failover läuft auf Twilio-Ebene, nicht auf ElevenLabs-Ebene.

---

## Teil 1: Wie machen es andere? Marktstandard-Settings

### 1.1 Das Referenz-Beispiel: ElevenLabs Docs Agent

ElevenLabs betreibt selbst einen Voice Agent in ihren eigenen Dokumentations-Seiten. Öffentlich geteilte Zahlen:

- **Handhabt ~80 % der Support-Anfragen** bei ~200 Calls/Tag
- **89 % der relevanten Fragen** werden korrekt beantwortet oder an den richtigen Kanal weitergeleitet
- **Erfolgsrezept laut ElevenLabs selbst:** Iteratives Verbessern auf Basis von Evals. Jeder Call wird nach konfigurierbaren Success Criteria bewertet (`hallucination_kb`, `positive_interaction`, `solved_inquiry`). Daraus entstehen die Prompt-Verbesserungen.

→ Lektion für Birte: **Wir sollten Success Criteria definieren**, bevor wir live gehen. ElevenLabs bietet das als Built-in an, ist kostenlos.

### 1.2 Prompt-Struktur: was gilt als Best Practice

Der ElevenLabs Prompting-Guide (die Quelle der Wahrheit für die Plattform) sagt:

- **Strukturierung mit Markdown-Headings** — das Modell achtet nachweislich stärker auf Sektionen mit klaren Überschriften, besonders `# Guardrails`. Unser Prompt hat das laut Statusdatei schon ansatzweise, aber wir sollten prüfen, ob alle kritischen Regeln unter einer expliziten `# Guardrails`-Sektion stehen.
- **Tool-Parameter explizit beschreiben** — bei Tools mit strukturierten Inputs (Telefonnummern, Auftragsnummern) soll in der Parameter-Beschreibung ein Beispielformat stehen. Relevant für uns bei `auftrag_pruefen` → "Auftragsnummer als 6-stellige Zahl, Beispiel: 260042".
- **Explizite Error-Handling-Anweisungen** im Prompt — was soll der Agent sagen, wenn ein Tool-Call fehlschlägt? Ohne das halluzinieren Agents gerne mal Antworten.
- **Gegen den Use Case validieren** — bei ElevenLabs-intern: Vor jedem Deploy Testszenarien laufen lassen. Haben wir mit `simulate-tests.js` schon.

### 1.3 Agent-Settings: was andere einstellen

Das ist die interessanteste Frage, weil die Zahlen nur in Einzelbeiträgen auftauchen und ich sie hier mal zusammenziehe:

| Setting | Unser Wert | Marktstandard | Bemerkung |
|---|---|---|---|
| **LLM** | GPT-4o | GPT-4o, Gemini 2.5 Flash, Claude Sonnet | Für Tool-lastige Agents wird zunehmend **Gemini 2.5 Flash** empfohlen wegen Geschwindigkeit; GPT-4o ist aber solider bei deutscher Sprache |
| **Temperature** | 0.5 | **0.2–0.3** für Support-Agents, 0.5–0.7 für Sales/Conversation | **Wir sollten runter auf 0.3.** Bei 0.5 wird der Agent bei Tool-Aufrufen und Disziplin unzuverlässiger. |
| **TTS Modell** | eleven_v3_conversational | Flash v2.5 (TTFB ~75 ms) oder Turbo v2.5 (bessere Qualität, ~150 ms) | v3_conversational ist **expressiv**, aber etwas langsamer. Für Telefonie wird oft auf Flash v2.5 zurückgewechselt, wenn Latenz zum Problem wird. |
| **Voice Stability** | (unbekannt, prüfen) | 0.5–0.7 für Business-Agents | Unter 0.5 → emotional und dynamisch, aber kann "wackeln". Über 0.7 → stabil, aber monoton. |
| **Voice Similarity** | (unbekannt, prüfen) | ~0.75 | Zu hoch → Verzerrung |
| **Speed** | (unbekannt, prüfen) | 0.9–1.1 für natürlichen Dialog | Bei Hotlines oft 1.0–1.1, da "gefühlt zu langsam" ein häufiger Kritikpunkt ist |
| **Turn Eagerness** | eager | **eager** für Reception/Support, **relaxed** für Therapie/Sales | Passt für uns |
| **Audio-Format (Telefonie)** | n/a (noch Widget) | **μ-law 8000 Hz** ist Pflicht für jede Telefon-Integration | Müssen wir bei Twilio-Anbindung umstellen |

### 1.4 Was ElevenLabs explizit als "Best Practice" dokumentiert

Aus dem offiziellen Voice-Design-Guide:

- Voice mit der gleichen Prompt in mehreren Varianten testen, nicht nur eine Voice ausprobieren
- Deutlich unterscheidbare Voice-IDs für verschiedene Agent-Rollen, falls wir später mal eine "Crew" bauen
- Knowledge Base mit RAG ist eingebaut und wird automatisch reindexiert — wir nutzen das schon

### 1.5 Was uns noch fehlt vs. Marktstandard

Aus der Analyse zusammengezogen, sortiert nach Aufwand:

- [ ] **Success Criteria / Evals** definieren (kostenlos, ElevenLabs Built-in). Z.B.: `auftrag_erkannt`, `kein_halluzinierter_pl`, `korrekte_stromprotokoll_regel`, `hoefliche_verabschiedung`.
- [ ] **Guardrails-Sektion im Prompt** explizit abgrenzen und scharfziehen (Focus + Manipulation stehen laut Statusdatei noch aus — Zitat: "Guardrails: Focus + Manipulation einschalten (kostenlos, latenzfrei)"). **Das ist einer der niedrigsthängenden Früchte.**
- [ ] **Temperature auf 0.3** senken
- [ ] **Error-Handling-Instructions im Prompt:** "Wenn `auftrag_pruefen` fehlschlägt, sage: 'Einen Moment, unser System ist gerade etwas träge. Können Sie mir Ihre Adresse nennen, ich versuche es darüber?'"
- [ ] **Data Collection** konfigurieren — ElevenLabs extrahiert automatisch pro Call konfigurierbare Felder (Name, Firma, Anliegen-Typ, Ergebnis). Das könnte sogar unser `anruf_speichern` ersetzen oder ergänzen.

---

## Teil 2: Latenz — der wichtigste Marktstandard überhaupt

Wenn du dich in die Szene reinliest, ist Latenz **das** Thema. Nicht Voice-Qualität, nicht LLM-Wahl — Latenz.

### 2.1 Die magische Zahl: unter 800 ms

Quer über alle Quellen hinweg konsistent:

- **Menschliche Konversation:** ~200–400 ms Antwort-Gap
- **"Fühlt sich natürlich an":** < 800 ms End-to-End (vom Ende des User-Satzes bis Beginn der Agent-Antwort)
- **"Fühlt sich träge an":** 800–1500 ms
- **"Bricht die Konversation":** > 1500 ms → messbare Abbruchrate

Diese 800 ms sind **die Schwelle**, auf die der gesamte Markt optimiert.

### 2.2 Die Latenz-Pipeline

Ein Voice-Agent ist eine Kette von vier Komponenten. Jeder Schritt frisst Zeit:

```
User spricht zu Ende
  ↓ Endpointing (Erkennen "der User ist fertig")  ~100–300 ms
  ↓ STT / Speech-to-Text                           ~100–300 ms
  ↓ LLM (Time to First Token)                      ~200–800 ms  ← größter Block
  ↓ TTS / Time to First Byte                        ~75–300 ms
  ↓ Netzwerk + Audio-Buffer                        ~50–200 ms
═══════════════════════════════════════════════════════
Summe: typisch 600–1500 ms
```

**Die Verteilung zeigt: Der LLM ist der Engpass.** Deshalb wechseln viele Production-Agents auf schnellere Modelle (Gemini Flash, Llama 4 via Groq), sobald sie in Produktion gehen und Sekundenbruchteile wichtig werden.

### 2.3 Aktuelle Benchmarks der Einzelkomponenten (Stand Anfang 2026)

- **ElevenLabs Flash TTS:** 75–135 ms Time to First Byte — derzeit schnellster verfügbarer TTS-Anbieter
- **Deepgram Nova-3 STT:** ~150 ms
- **GPT-4o Realtime:** ~250–300 ms TTFT
- **Gemini 2.5 Flash:** ~280 ms TTFT

Was das für uns heißt: **Mit ElevenLabs als TTS und GPT-4o als LLM sitzen wir bei gutem Setup in einem Korridor von ~700–1000 ms End-to-End.** Das ist okay für die Demo, aber für Produktion sollte ggf. auf Flash v2.5 TTS umgestellt werden (spart 100–200 ms vs. v3_conversational).

### 2.4 Der oft übersehene Faktor: Tool Calls

Unsere Architektur hat einen Webhook-Roundtrip bei jedem Tool-Call:

```
Birte → n8n (dev.mh-n8n.de) → Google Sheets → zurück
```

Jeder dieser Hops kann 200–500 ms kosten, je nachdem wo die Server stehen. **Das ist latenzkritisch**, weil während ein Tool-Call läuft, der User wartet und Stille hört (oder einen Filler wie "Einen Moment, ich schaue nach...").

**Was andere machen:**
- **"Pre-Emptive Fillers":** Der Agent sagt sofort "Einen Moment, ich schaue das nach", bevor der Tool-Call startet. Das kaschiert die Latenz perfekt. ElevenLabs unterstützt das explizit über Prompt-Instruktionen.
- **Services geografisch nah zusammenlegen:** n8n läuft in EU, ElevenLabs hat EU-Endpoints, Google Sheets ist verteilt. Für Produktion könnte ein eigener Cache (Redis) vor den Sheets sitzen und 200 ms sparen.
- **Response-Pipeline-Parallelisierung:** Streaming STT + speculative LLM — der LLM fängt an zu denken, bevor der User fertig gesprochen hat. ElevenLabs macht das intern schon, wir müssen nichts dafür tun.

---

## Teil 3: Echte Telefonnummer — wie das in der Theorie läuft

Laut Statusdatei ist das der nächste Schritt nach der Demo. Hier die saubere Auslegeordnung:

### 3.1 Die zwei Wege: Native Integration vs. Register Call

ElevenLabs bietet für Twilio **zwei** Integrationspfade. Die Wahl bestimmt, was später möglich ist:

**A) Native Integration (empfohlen für uns)**

- Twilio-Nummer wird direkt in ElevenLabs importiert (One-Click nach Eingabe von Account SID und Auth Token)
- ElevenLabs konfiguriert TwiML automatisch
- **Unterstützt:** Inbound, Outbound, Warm Transfer mit Nachricht an den Menschen, Blind Transfer, Call-Transfer mit Original-Caller-ID
- **Nachteil:** ElevenLabs hat Zugriff auf das Twilio-Konto

**B) Register Call (Advanced)**

- Twilio-Infrastruktur bleibt komplett bei uns, ElevenLabs wird nur als "Brain" aufgerufen
- Full Control über TwiML, Audioformate etc.
- **Nachteil:** `transfer_to_number` funktioniert NICHT, weil ElevenLabs keinen Zugriff auf Twilio hat. Müssten wir selbst über TwiML implementieren.

→ **Für Strobl ist Native Integration die richtige Wahl.** Weniger Code, Weiterleitung funktioniert out-of-the-box, und die Kontrolle, die wir mit Register Call gewinnen würden, brauchen wir nicht.

### 3.2 Weiterleitung: drei Varianten

Das ist der interessanteste Teil für euren Use Case, weil die Weiterleitung zum PL das Kernfeature ist:

**Conference Transfer (Default)**
- Funktionsweise: ElevenLabs ruft die Zielnummer an, beide Parteien kommen in eine Konferenz, dann steigt Birte still aus. Der Anrufer merkt nichts vom Wechsel.
- **Warm Transfer möglich:** Birte kann dem Menschen am anderen Ende eine Ansage vorspielen ("Hallo Herr Maier, ich habe Frau Schmidt von der Allianz mit einer Rückfrage zum Trocknungsprojekt in Grassau — ich verbinde jetzt."), bevor der Anrufer dazugeschaltet wird.
- Funktioniert nur mit Twilio Native Integration.

**Blind Transfer**
- Direkte Weiterleitung, keine Ansage, Original-Caller-ID bleibt erhalten
- Muss aktuell per JSON-Editor konfiguriert werden (`"transfer_type": "blind"`)
- Für Strobl-Use-Case **nicht ideal**, weil PL sollten den Kontext bekommen

**SIP REFER**
- Für Kunden mit eigener TK-Anlage (SIP-Trunk)
- Protokoll-Level-Transfer, enterprise-tauglich
- **Für Strobl overkill**, aber gut zu wissen falls später mal integriert werden muss

→ **Empfehlung: Conference Transfer mit Warm-Message.** Das ist exakt das, was die Fallbeispiele im Kundendokument verlangen (Fall 1, 2, 4).

### 3.3 Rufumleitung als Quick-Start — ja, das ist Marktstandard

Der Plan aus der Statusdatei ("Strobls bestehende Nummer leitet an KI-Nummer weiter, kein Porting") ist **genau das, was fast alle ElevenLabs-Deployments in Europa machen**, wenn sie schnell live wollen.

Warum:
- **Kein Porting-Aufwand** (dauert in DE bis zu 6 Wochen und ist riskant)
- **Sofort reversibel:** Bei Problemen Rufumleitung deaktivieren → alles wie vorher
- **Zweiter Kanal parallel testbar:** Strobl kann die KI-Nummer direkt anrufen um zu testen, während die Altnummer noch aufs Festnetz läuft

Der einzige Nachteil: Der Anrufer sieht in seiner Anrufliste u.U. die KI-Nummer statt der Strobl-Nummer — je nach Rufumleitungstyp bei der Telekom. Die meisten Fritzbox/Business-Varianten leiten die CallerID transparent weiter.

### 3.4 Failover: was passiert wenn ElevenLabs down ist?

**Das ist das einzige echte Problem an der ganzen Architektur.** Wenn ElevenLabs einen Ausfall hat (kommt vor — Status-Inzidenz alle paar Monate), ist die Hotline tot.

Die Markt-Lösung: **Failover wird auf Twilio-Ebene gebaut, nicht auf ElevenLabs-Ebene.** Varianten:

1. **Twilio Studio Flow als Wrapper:** Eingehender Call geht zuerst in einen Twilio Flow. Der versucht ElevenLabs zu erreichen; wenn Timeout oder Error → Fallback-Branch leitet an Strobls Handy weiter. Aufwand: ~2 Stunden einmalig.
2. **DNS/SIP-Failover auf Telefonie-Provider-Ebene:** Komplexer, aber unsichtbar für den Anrufer. Für unseren Maßstab overkill.
3. **"Tot heißt tot"-Ansatz:** Telekom-Rufumleitung mit "Bei nicht erreichbar" → direkt auf Strobls Handy. Billigste Lösung, aber hat eine spürbare Verzögerung (es klingelt 20 Sekunden bei der KI-Nummer, bevor umgeleitet wird).

→ **Empfehlung: Twilio Studio Flow Fallback.** Sauber, schnell, professionell.

### 3.5 Nummer-Standort und Latenz-Implikation

Wichtiger Punkt, der oft übersehen wird: **Wo die Twilio-Nummer "sitzt", beeinflusst die Latenz.**

- Twilio hat Regional Endpoints (`ie1` = Dublin für Europa, `de1` = Frankfurt gerade im Rollout)
- ElevenLabs hat ebenfalls EU-Endpoints
- **Wenn Twilio-Region und ElevenLabs-Region in EU sitzen**, sparst du 150–250 ms gegenüber einem US-Routing

→ **Für Strobl:** Deutsche +49 Nummer über Twilio, Region `ie1` (Dublin) oder bald `de1` (Frankfurt). **Nicht** `us1`.

### 3.6 Geschäftszeiten und Bürozeiten-Logik

Marktstandard ist, das **im Twilio Studio Flow** zu regeln, nicht im ElevenLabs-Prompt. Gründe:

- Routing-Entscheidungen sollten deterministisch sein, nicht vom LLM getroffen werden
- Twilio bietet Time-of-Day-Branching out-of-the-box
- Mailbox-Fallback nachts ist mit Twilio ein Klick

Typischer Flow für einen Betrieb wie Strobl:

```
Eingehender Call
  ↓
Mo-Fr 7:00-18:00? 
  ├─ JA  → ElevenLabs Agent (Birte)
  └─ NEIN → Notfall? (per DTMF) 
             ├─ JA  → Direktweiterleitung Strobl-Handy
             └─ NEIN → Mailbox mit Rückruf-Zusage
```

### 3.7 DSGVO-Pflichten bei echter Telefonie

Das ist in DE **kein Marketing-Thema, sondern Compliance**:

- **Einwilligungsansage ist Pflicht**, sobald Aufzeichnung oder Transkription stattfindet. Muster: "Zur Qualitätssicherung wird dieses Gespräch aufgezeichnet. Wenn Sie nicht einverstanden sind, bleiben Sie bitte dran, Sie werden mit einem Mitarbeiter verbunden."
- **KI-Offenlegung:** Seit EU AI Act (Art. 50) muss offengelegt werden, dass der Anrufer mit einem KI-System spricht. Birte tut das bereits sinngemäß über die Begrüßung, aber das könnte noch expliziter werden: "Ich bin eine Sprach-KI" oder ähnlich.
- **Auftragsverarbeitungsvertrag (AVV)** mit ElevenLabs und Twilio ist nötig. ElevenLabs bietet AVV inkl. EU Data Residency und Zero Retention Mode.

---

## Zusammenfassung in Form einer Handlungsliste

### Sofort umsetzbar (vor der Demo)

- [ ] Temperature von 0.5 auf 0.3 senken
- [ ] Guardrails-Sektion im Prompt explizit als `# Guardrails` markieren und scharfziehen
- [ ] Focus + Manipulation Guardrails einschalten (stand sowieso schon auf der Liste)
- [ ] Voice Settings prüfen: Stability ~0.6, Similarity ~0.75, Speed 1.0–1.1
- [ ] Pre-Emptive Filler im Prompt: "Bevor du ein Tool aufrufst, sage kurz 'Einen Moment, ich schaue nach.'"
- [ ] Error-Handling-Instruktionen für Tool-Failures in Prompt aufnehmen

### Für Produktion (nach der Demo)

- [ ] Success Criteria / Evals definieren → in ElevenLabs konfigurieren
- [ ] Data Collection konfigurieren (ggf. ersetzt `anruf_speichern`)
- [ ] Twilio Native Integration einrichten, deutsche +49 Nummer, Region Dublin
- [ ] Conference Transfer mit Warm-Message pro PL einrichten
- [ ] Twilio Studio Flow als Wrapper bauen (Geschäftszeiten + Failover)
- [ ] Rufumleitung Strobl-Altnummer → Twilio-Nummer einrichten
- [ ] DSGVO: Einwilligungsansage + KI-Offenlegung in Begrüßung
- [ ] AVV mit ElevenLabs und Twilio unterzeichnen
- [ ] EU Data Residency + Zero Retention Mode in ElevenLabs aktivieren (falls Plan das hergibt)

### Für später (Optimierung)

- [ ] Migration von v3_conversational auf Flash v2.5 TTS prüfen, falls Latenz zum Thema wird
- [ ] n8n-Webhook-Performance messen; ggf. Redis-Cache vor Google Sheets
- [ ] A/B-Test: GPT-4o vs. Gemini 2.5 Flash auf deutschen Dialogen

---

## Quellen

- ElevenLabs Prompting Guide: https://elevenlabs.io/docs/eleven-agents/best-practices/prompting-guide
- ElevenLabs "Building an Agent for our own Docs": https://elevenlabs.io/blog/building-an-agent-for-our-own-docs
- ElevenLabs Voice Design Guide: https://elevenlabs.io/docs/agents-platform/customization/voice/best-practices/conversational-voice-design
- ElevenLabs Twilio Native Integration: https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration
- ElevenLabs Transfer-to-Number Docs: https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/transfer-to-number
- Twilio "Core Latency in AI Voice Agents": https://www.twilio.com/en-us/blog/developers/best-practices/guide-core-latency-ai-voice-agents
- Cresta "Engineering for Real-Time Voice Agent Latency": https://cresta.com/blog/engineering-for-real-time-voice-agent-latency
- Introl "Voice AI Infrastructure" (Benchmarks): https://introl.com/blog/voice-ai-infrastructure-real-time-speech-agents-asr-tts-guide-2025
- Telnyx "Voice AI Agents Compared on Latency": https://telnyx.com/resources/voice-ai-agents-compared-latency
