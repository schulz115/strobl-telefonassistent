# CLAUDE.md — Strobl Telefonassistent

> Diese Datei wird automatisch von Claude Code gelesen. Sie enthält den kompletten Projektkontext.

---

## Über den Benutzer (Julien)

- **Name:** Julien, Mitarbeiter bei **MargenHeld GmbH** (KI-Agentur für KMU im DACH-Raum)
- **GitHub:** `schulz115`
- **Arbeitsumgebung:** Claude Code in VS Code auf Windows (PowerShell)
- **Wissensstand:** Kann Befehle eintippen, versteht aber KEINE Entwickler-Konzepte (Git, Branches, Repos, Ordnerstrukturen). Alles muss Schritt für Schritt erklärt werden.

### Kommunikationsregeln — IMMER einhalten:
- **Jeden Schritt einzeln erklären.** Nicht "navigiere zu X" sondern "klicke auf Y, dann auf Z".
- **Keine Fachbegriffe ohne Erklärung.**
- **PowerShell:** Kein `&&` verwenden. Befehle einzeln nacheinander geben.
- **Sprache:** IMMER echte Umlaute (ä, ö, ü, ß) — NIEMALS ae, oe, ue, ss.
- **Julien trifft keine technischen Entscheidungen.** Er sagt was er will, Claude baut es.
- **Git/GitHub:** Claude kümmert sich darum. Julien soll sich damit nicht beschäftigen müssen.

---

## Projektübersicht

Wir bauen einen **Telefonassistenten (Voice Agent)** für den Kunden **Strobl Schadenmanagement GmbH**.

### Architektur (bewährt vom MargenTelefonassistent V1):
- **ElevenLabs** = das "Gehirn" + die Stimme (spricht mit dem Anrufer, entscheidet was zu tun ist)
- **n8n** = das Backend (speichert Daten, bucht Termine, schickt E-Mails etc.)
- Es gibt **KEINEN AI Agent in n8n** — n8n ist reines Daten-Backend

### Über den Kunden — Strobl Schadenmanagement GmbH:
- **Branche:** Gebäudeschadenmanagement / Sanierung
- **Erfahrung:** 25 Jahre, 4 Standorte
- **Telefon:** +49 80 24 / 90 22 70 ("im Schadensfall jederzeit erreichbar")
- **Leistungen:** Wasserschäden, Brandschäden, Schimmelschäden, Leckortung, Gebäudetrocknung, Bauwerksdiagnostik
- **Kunden:** Versicherungen, Hauseigentümer, Immobilienverwalter, Gewerbebetriebe
- **Website:** https://www.strobl-service.de/ (WordPress)

### MVP-Scope: Was der Telefonassistent können soll

**Wichtiger Unterschied zum MargenTelefonassistent:** Bei Strobl rufen Leute mit einem akuten Problem an (Wasser im Keller, Brandschaden). Es gibt kein Lead Scoring — wer einen Schaden meldet, ist automatisch ein potenzieller Kunde. Stattdessen gibt es eine klare Trennung: Schadensmeldungen werden als Schadensfall gespeichert, allgemeine Anfragen/Spam werden NUR im Anruf-Log erfasst (NICHT als Kunde/Schadensfall).

#### 3 Szenarien:

**Szenario 1: Schadensmeldung (Privatperson)** — Der Hauptfall.
Jemand ruft an mit einem akuten Schaden. Der Agent muss erfragen:
- Was für ein Schaden? (Wasser, Brand, Schimmel, Leckage, etc.)
- Wo ist der Schaden? (Adresse)
- Wie dringend? (Steht das Wasser noch? Ist das Gebäude bewohnbar?)
- Name und Rückrufnummer
→ Wird als **Schadensfall** im Backend gespeichert + Benachrichtigung an Strobl.

**Szenario 2: B2B-Anfrage (Versicherung / Hausverwaltung)**
Versicherungen und Hausverwaltungen sind Strobls Hauptkunden. Wollen oft einen Techniker für Begutachtung schicken lassen. Ähnlich wie Szenario 1, aber:
- Professionellerer Tonfall
- Andere Infos: Versicherungsnummer, Objektadresse, Schadennummer
→ Wird ebenfalls als **Schadensfall** gespeichert, mit Zusatz woher die Anfrage kommt.

**Szenario 3: Allgemeine Anfrage / Spam**
Alles was kein Schaden ist — Werbeanrufe abwimmeln, allgemeine Fragen zur Firma beantworten, ggf. Rückruf anbieten.
→ Wird **NUR im Anruf-Log** erfasst. NICHT als Schadensfall oder Kunde gespeichert.

#### n8n Backend (2 Webhook-Flows):

- **Webhook 1: Schadensmeldung speichern** — Nimmt die Schadensdaten entgegen, schreibt sie in Google Sheets (Tab SCHADENSMELDUNGEN), schickt Benachrichtigung an Strobl.
- **Webhook 2: Anruf-Logging** — Jeder Anruf wird geloggt (wer, wann, was, Ergebnis) in Google Sheets (Tab ANRUF LOGGING). Wie beim MargenTelefonassistent.

#### Was bewusst NICHT im MVP ist (kommt später bei Bedarf):
- Kein Lead Scoring (nicht nötig — Anrufer kommen mit konkretem Problem)
- Keine Terminbuchung (kann später ergänzt werden)
- Kein Link-Versand per E-Mail
- Kein Durchstellen zu Mitarbeitern (kommt mit Twilio-Anbindung)

---

## Projektstatus (Stand: 26.03.2026)

### Erledigt:
- ✅ Projektordner erstellt: `C:\Users\marge\Documents\strobl-telefonassistent`
- ✅ Git initialisiert + Author Identity gesetzt (Julien Schulz / schulz115@users.noreply.github.com)
- ✅ GitHub Repo: `schulz115/strobl-telefonassistent` (PRIVAT) — https://github.com/schulz115/strobl-telefonassistent
- ✅ Initial Commit + Push erledigt
- ✅ CLAUDE.md erstellt (diese Datei)
- ✅ ElevenLabs CLI v0.3.4 installiert + authentifiziert

### Noch offen:
- ⬜ ElevenLabs Agent anlegen (neuer Agent für Strobl)
- ⬜ n8n Workflow bauen (2 Webhook-Flows: Schadensmeldung + Anruf-Logging)
- ⬜ Google Sheets einrichten (Tabs SCHADENSMELDUNGEN + ANRUF LOGGING)
- ⬜ Testen + iterieren

---

## Verfügbare Tools und Infrastruktur

### MCP-Server (funktionieren in jedem VS Code Fenster):
- **n8n-MCP:** Workflow CRUD, Validate, Test, Executions (14+ Tools)
- **ElevenLabs MCP:** Agent/Voice/Conversation Management (24 Tools) — KEIN update_agent, KEIN manage_tools (dafür REST API oder CLI nutzen)
- **Gmail MCP:** E-Mail Drafts, Search, Read
- **Google Calendar MCP:** Events, Verfügbarkeit
- **Playwright:** Browser-Automation
- **Context7:** Library-Docs

### ElevenLabs CLI (global installiert):
- `elevenlabs agents push/pull` — Agent-Config hoch-/runterladen
- `elevenlabs tools push/pull` — Tool-Config hoch-/runterladen
- `elevenlabs agents test` — Agent testen
- **Immer `--no-ui` Flag verwenden** (interaktive UI funktioniert nicht in Claude Code)
- Bei Bestätigungs-Prompts: `echo "y" |` vor den Befehl setzen

### n8n Server:
- URL: https://dev.mh-n8n.de
- API Key: in Umgebungsvariablen konfiguriert (N8N_API_KEY)

### ElevenLabs API:
- API Key: `sk_75d59e0722f2d91c00865560aee237a6bac982a0a5afd6e9`
- Agent PATCH ist langsam (~30-60s) — langen Timeout setzen
- Tool-Management geht NICHT über MCP — nur REST API oder CLI
- Bei Windows/Bash: Node.js `fetch` API verwenden (curl hat Encoding-Probleme)

### Config-as-Code Referenz (im n8n-mcp Projekt):
Die MargenTelefonassistent-Configs liegen in `C:\Users\marge\Documents\n8n-mcp\elevenlabs\`:
```
elevenlabs/
├── agents.json
├── agent_configs/
│   └── MargenTelefonassistent-V1.json    (41KB, komplette Config)
├── tools.json
├── tool_configs/
│   ├── kunden_pruefen.json               (→ /webhook/va-kern)
│   ├── nachricht_speichern.json          (→ /webhook/mod-nachricht)
│   ├── termin_buchen.json                (→ /webhook/mod-termin)
│   ├── link_senden.json                  (→ /webhook/mod-link)
│   ├── evaluate_caller.json              (Gatekeeper V1 — NICHT ANFASSEN)
│   ├── identify_caller.json              (Gatekeeper V1 — NICHT ANFASSEN)
│   └── restaurant_booking.json           (Osteria Agent — NICHT ANFASSEN)
└── test_configs/
```

---

## Referenz: MargenTelefonassistent V1 (als Vorlage)

Der bestehende Telefonassistent für MargenHeld selbst. Funktioniert seit 02.03.2026.

### Architektur:
- ElevenLabs Agent: `agent_0701khbxw6ckezw8xbz9gxqdwjdw`
- Voice: 6CS8keYmkwxkspesdyA7 (deutsch)
- LLM: claude-haiku-4-5 (temp 0.5) — **Gemini 2.5 Flash NICHT geeignet** (halluziniert Tool-Calls)
- n8n Workflow: "MargenTelefonassistent V1" (ID: RzBX3kBNLmyRAjpwH8wgS) — 32 Nodes, 4 Webhook-Flows

### 4 Szenarien:
1. **Bestandskunde** → Transfer zu Mitarbeiter oder Termin buchen
2. **Spam** → abwimmeln + loggen
3. **Ausraster** → Transfer zu "Kollege"
4. **Lead** → 4.1 konkret (wie Bestandskunde), 4.2 Interesse (Cases-Link per Email)

### 4 Webhook-Flows:
- `POST /va-kern` → Kunden-Check + Anruf-Logging
- `POST /mod-nachricht` → Nachricht speichern + Lead Scoring
- `POST /mod-termin` → Termin buchen (Google Calendar + Meet) + Lead Scoring
- `POST /mod-link` → Link senden (Gmail) + Lead Scoring

### Tool-Settings (bewährtes Pattern):
- Alle Tools: `disable_interruptions=true`, `tool_call_sound=null`
- Alle Webhook-Tools: `execution_mode=immediate`, `force_pre_tool_speech=true`
- Alle Tools haben `anruf_id` mit `dynamic_variable: "system__conversation_id"`

### Prompt-Learnings (WICHTIG für Strobl!):
- Haiku braucht Freiheit (keine Ban-Listen), aber klare Beispiele
- Few-Shot-Beispiele sind der EINZIGE zuverlässige Fix für persistente LLM-Phrasen
- Negative Verbote verstärken das Problem (Pink-Elephant-Effekt)
- Metaphern geben dem LLM ein mentales Modell ("wie jemand der Akte aufschlägt")
- Anaphoric Bridging: Post-Tool-Phrase muss Pre-Tool-Phrase spiegeln

### Daten-Tracking:
- Google Sheets als "Datenbank"
  - Tab ANRUF LOGGING: anruf_id, zeitstempel, name, telefon, firma, bestandskunde_check, ergebnis
  - Tab LEAD SCORING: anruf_id, name, telefon, firma, anliegen, score, score_details, status
- `anruf_id` = ElevenLabs conversation_id — verknüpft beide Tabellen
- Scoring: 0-29 kalt, 30-59 warm, 60-100 heiß

---

## Andere ElevenLabs Agents — NICHT ANFASSEN

- Gatekeeper V1: `agent_2201kgs6337nfeds37pj2p12dd3t`
- Gatekeeper V2: `agent_4101kh5yax4yfr0b2dkger54kn8r`
- Gatekeeper statisch: `agent_6401kgq34ccsega9nv0mb1jc80hf`
- Osteria Agent V3: `agent_4301kgpnjbk5fjprazdyfqf1w1vy`
- MargenTelefonassistent V1: `agent_0701khbxw6ckezw8xbz9gxqdwjdw` (Referenz, NICHT verändern)

---

## n8n Learnings (WICHTIG!)

- toolWorkflow v2 mit `source: "database"` funktioniert NICHT für via API erstellte Sub-Workflows
- AI Agent `systemMessage` braucht `=` Präfix damit `{{ }}` Expressions ausgewertet werden
- Neue Webhook-Pfade werden nur registriert wenn Workflow im n8n-UI aktiviert wird
- Bestehende Webhook-Pfade bleiben nach Workflow-Update funktional

---

## Nächste Schritte

1. ~~**Scope definieren**~~ — ✅ Erledigt (siehe MVP-Scope oben)
2. **ElevenLabs Agent anlegen** — neuen Agent für Strobl erstellen (Voice, LLM, Prompt)
3. **n8n Workflow bauen** — 2 Webhook-Flows: Schadensmeldung speichern + Anruf-Logging
4. **Google Sheets einrichten** — Tabs für SCHADENSMELDUNGEN und ANRUF LOGGING
5. **Testen + iterieren** — wie beim MargenTelefonassistent

---

## Wichtige Regeln

- **Datenschutz:** Das GitHub-Repo ist PRIVAT. Keine Kundendaten in öffentlichen Repos. Das n8n-mcp Repo (czlonkowski/n8n-mcp) ist PUBLIC — dort KEINE Strobl-Daten committen.
- **Sprache:** IMMER echte Umlaute (ä, ö, ü, ß) — NIEMALS ae, oe, ue, ss
- **Kommunikation:** Schritt-für-Schritt erklären, keine kompakten Einzeiler. Jeden Befehl einzeln.
- **PowerShell:** Kein `&&` verwenden. Befehle einzeln nacheinander.
- **ElevenLabs CLI:** Immer `--no-ui` Flag verwenden.
- **Git:** Claude kümmert sich um Commits/Pushes. Julien muss sich damit nicht beschäftigen.
