/**
 * Strobl Telefonassistent \u2014 Automatisierte Konversations-Simulationen
 * Basierend auf: https://elevenlabs.io/docs/eleven-agents/guides/simulate-conversation
 *
 * Testet alle 10 Demo-Szenarien gegen den Live-Agent.
 * Aufruf: node simulate-tests.js [szenario]
 * Beispiele:
 *   node simulate-tests.js          \u2192 alle Szenarien
 *   node simulate-tests.js 1a       \u2192 nur Szenario 1a
 *   node simulate-tests.js 3b       \u2192 nur Szenario 3b
 */

const API_KEY = 'sk_75d59e0722f2d91c00865560aee237a6bac982a0a5afd6e9';
const AGENT_ID = 'agent_2801kmn2pxf6fgdt2t207deqepe9';

const SZENARIEN = {
  '1a': {
    name: 'Reklamation, Auftragsnummer \u2192 Birte wei\u00df PL + Adresse',
    user_prompt: `Du bist Herr Hoffmann mit einer Reklamation:
- Auftragsnummer 260042
- Monteur hat Fu\u00dfbodenheizung aufgedreht, 2 Wochen Vollgas, enorme Heizkosten
- Du willst Kosten erstattet
- Wenn Birte den PL oder das Projekt proaktiv nennt, best\u00e4tige
- Wenn angeboten wird dich zu verbinden, nimm an
- R\u00fcckruf: 0176 4455667`,
    criteria: [
      { id: 'projekt_proaktiv', name: 'Projekt proaktiv erkannt', prompt: 'Die Agentin hat nach Nennung der Auftragsnummer 260042 PROAKTIV Projektdetails genannt (Adresse Hauptstra\u00dfe und/oder Projektleiter Maier), BEVOR der Anrufer diese Infos geben musste.' },
      { id: 'weiterleitung', name: 'Weiterleitung versucht', prompt: 'Die Agentin hat transfer_to_number aufgerufen.' },
      { id: 'empathisch', name: 'Empathischer Umgang', prompt: 'Die Agentin war verst\u00e4ndnisvoll bei der Reklamation.' }
    ]
  },
  '1b': {
    name: 'Reklamation, Projekt ohne PL \u2192 Birte lernt dazu',
    user_prompt: `Du bist Stefan Hoffmann:
- Parkettboden bei Trocknung besch\u00e4digt
- Auftragsnummer 260078
- Wenn Birte sagt kein PL hinterlegt: "Der hie\u00df glaube ich Wagner, Michael Wagner"
- Telefon: 0176 4455667, Adresse: Bahnhofstra\u00dfe 5, 83209 Prien
- Du willst R\u00fcckruf`,
    criteria: [
      { id: 'projekt_gefunden', name: 'Projekt gefunden', prompt: 'Die Agentin hat das Projekt 260078 im System gefunden (auftrag_pruefen aufgerufen).' },
      { id: 'kein_pl_erkannt', name: 'Fehlenden PL bemerkt', prompt: 'Die Agentin hat bemerkt dass kein Projektleiter hinterlegt ist und danach gefragt.' },
      { id: 'daten_aufgenommen', name: 'Kontaktdaten aufgenommen', prompt: 'Name, Telefonnummer und/oder Adresse wurden aufgenommen.' },
      { id: 'rueckruf', name: 'R\u00fcckruf zugesichert', prompt: 'R\u00fcckruf wurde zugesichert.' }
    ]
  },
  '2a': {
    name: 'R\u00fcckfrage, Auftragsnummer \u2192 Birte kennt Projektdetails',
    user_prompt: `Du bist Hans Meier:
- Auftragsnummer 260089
- Frage: Wurde Freigabe von Versicherung erteilt? Kann Terminierung starten?
- Telefon: 0171 2233445`,
    criteria: [
      { id: 'projekt_proaktiv', name: 'Projektdetails proaktiv', prompt: 'Die Agentin hat nach Auftragsnummer 260089 proaktiv Details genannt (Rosenstra\u00dfe und/oder Wagner).' },
      { id: 'nicht_selbst_beantwortet', name: 'Nicht selbst beantwortet', prompt: 'Die Agentin hat die Frage NICHT selbst beantwortet sondern R\u00fcckruf angeboten.' },
      { id: 'rueckruf', name: 'R\u00fcckruf zugesichert', prompt: 'R\u00fcckruf wurde zugesichert.' }
    ]
  },
  '2b': {
    name: 'Keine Auftragsnr, aber Adresse \u2192 Birte findet trotzdem \u2190 AHA',
    user_prompt: `Du bist Sabine Bauer:
- Vor 3 Wochen Wasserschaden begutachtet, nichts mehr geh\u00f6rt
- Du hast KEINE Auftragsnummer
- Adresse: Rosenstra\u00dfe 8, 83224 Grassau
- Wenn Birte das Projekt findet und Auftragsnummer nennt, best\u00e4tige begeistert
- Telefon: 0151 7788990`,
    criteria: [
      { id: 'auftragsnummer_gefragt', name: 'Nach Auftragsnummer gefragt', prompt: 'Die Agentin hat nach der Auftragsnummer gefragt.' },
      { id: 'adresse_lookup', name: 'Projekt \u00fcber Adresse gefunden', prompt: 'Die Agentin hat auftrag_pruefen mit der Adresse aufgerufen und das Projekt in der Rosenstra\u00dfe gefunden (Auftrag 260089).' },
      { id: 'rueckruf', name: 'R\u00fcckruf zugesichert', prompt: 'R\u00fcckruf wurde zugesichert.' }
    ]
  },
  '3a': {
    name: 'Stromprotokoll, Auftraggeber \u2192 Birte wei\u00df AG aus DB',
    user_prompt: `Du bist Herr Kraus von der Hausverwaltung Berger:
- Stromprotokoll zum Auftrag 260055
- Ihr seid der Auftraggeber
- E-Mail: kraus@berger-hv.de`,
    criteria: [
      { id: 'bestandskunde', name: 'Bestandskunde erkannt', prompt: 'Die Agentin hat kunden_pruefen aufgerufen und die HV Berger als Bestandskunde erkannt.' },
      { id: 'auftraggeber_aus_db', name: 'Auftraggeber aus DB erkannt', prompt: 'Die Agentin hat nach auftrag_pruefen gewusst dass der Auftraggeber f\u00fcr 260055 die Hausverwaltung Berger ist.' },
      { id: 'weiterleitung_akzeptiert', name: 'Protokoll-Weiterleitung zugesagt', prompt: 'Die Agentin hat zugesagt das Stromprotokoll weiterzuleiten.' }
    ]
  },
  '3b': {
    name: 'Stromprotokoll, Mieter \u2192 Birte nennt AG aus DB',
    user_prompt: `Du bist Mieter in der Seestra\u00dfe 15 in Prien:
- Stromprotokoll f\u00fcr Stromrechnung
- Auftragsnummer 260055
- Du bist MIETER
- Wenn nach Auftraggeber gefragt: du wei\u00dft es nicht`,
    criteria: [
      { id: 'mieter_erkannt', name: 'Als Mieter identifiziert', prompt: 'Die Agentin hat erkannt dass der Anrufer Mieter ist.' },
      { id: 'abgelehnt', name: 'Weitergabe abgelehnt', prompt: 'Die Agentin hat die Weitergabe an den Mieter ABGELEHNT.' },
      { id: 'auftraggeber_genannt', name: 'Auftraggeber aus DB genannt', prompt: 'Die Agentin hat den Auftraggeber (Hausverwaltung Berger) aus der Datenbank genannt, damit der Mieter wei\u00df an wen er sich wenden muss.' }
    ]
  },
  '4a': {
    name: 'Rechnung, Auftragsnummer \u2192 Birte kennt PL automatisch',
    user_prompt: `Du hast eine Rechnungsfrage:
- Zum Auftrag 260042
- Position auf der Rechnung unklar
- Wenn Birte den PL proaktiv nennt, best\u00e4tige
- Wenn angeboten wird zu verbinden, nimm an`,
    criteria: [
      { id: 'pl_aus_db', name: 'PL aus DB erkannt', prompt: 'Die Agentin hat nach auftrag_pruefen den Projektleiter (Maier) proaktiv genannt, OHNE dass der Anrufer ihn nennen musste.' },
      { id: 'weiterleitung', name: 'Weiterleitung versucht', prompt: 'Die Agentin hat transfer_to_number aufgerufen.' }
    ]
  },
  '4b': {
    name: 'Angebot, nichts bekannt \u2192 Adress-Lookup',
    user_prompt: `Du bist Martina Fischer:
- Angebot erhalten, Position unklar
- Keine Auftragsnummer
- Schimmelbeseitigung in der Bergstra\u00dfe 12 in Traunstein
- PL unbekannt
- Telefon: 08051 334455`,
    criteria: [
      { id: 'auftragsnummer_gefragt', name: 'Nach Nummer gefragt', prompt: 'Die Agentin hat nach Auftragsnummer gefragt.' },
      { id: 'adresse_lookup', name: 'Adress-Lookup versucht', prompt: 'Die Agentin hat auftrag_pruefen mit der Adresse Bergstra\u00dfe aufgerufen und das Projekt 260101 gefunden.' },
      { id: 'rueckruf', name: 'R\u00fcckruf zugesichert', prompt: 'R\u00fcckruf wurde zugesichert.' }
    ]
  },
  '5a': {
    name: 'Bestandskunde HV Berger \u2192 offene Projekte',
    user_prompt: `Du bist Herr Kraus von der Hausverwaltung Berger:
- Dringend mit Herrn Strobl sprechen
- Wohnanlage Seestra\u00dfe`,
    criteria: [
      { id: 'bestandskunde', name: 'Bestandskunde erkannt', prompt: 'kunden_pruefen wurde aufgerufen und HV Berger erkannt.' },
      { id: 'weiterleitung', name: 'Weiterleitung zu Strobl', prompt: 'transfer_to_number wurde aufgerufen.' }
    ]
  },
  '5b': {
    name: 'Privatperson, Standardabfrage',
    user_prompt: `Du bist Peter Schulze:
- Nachfragen ob Auftrag bearbeitet wird
- KEINE Auftragsnummer
- Adresse: Dorfstra\u00dfe 3, 83278 Traunstein
- Telefon: 0170 1122334`,
    criteria: [
      { id: 'auftragsnummer_gefragt', name: 'Nach Auftragsnummer gefragt', prompt: 'Die Agentin hat nach der Auftragsnummer gefragt.' },
      { id: 'kontaktdaten', name: 'Kontaktdaten erfasst', prompt: 'Name, Adresse und/oder Telefonnummer wurden aufgenommen.' },
      { id: 'rueckruf', name: 'R\u00fcckruf zugesichert', prompt: 'R\u00fcckruf wurde zugesichert.' }
    ]
  }
};

async function simulateSzenario(id, szenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SZENARIO ${id}: ${szenario.name}`);
  console.log('='.repeat(60));

  const body = {
    simulation_specification: {
      simulated_user_config: {
        prompt: {
          prompt: szenario.user_prompt,
          llm: 'gpt-4o',
          temperature: 0.3
        }
      },
      dynamic_variables: {
        system__conversation_id: `sim-${id}-${Date.now()}`
      }
    },
    extra_evaluation_criteria: szenario.criteria.map(c => ({
      id: c.id,
      name: c.name,
      conversation_goal_prompt: c.prompt,
      use_knowledge_base: false
    }))
  };

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}/simulate-conversation`,
      {
        method: 'POST',
        headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.log(`FEHLER: ${res.status} ${res.statusText}`);
      console.log(err.substring(0, 500));
      return { id, name: szenario.name, status: 'error', error: res.statusText };
    }

    const data = await res.json();

    // Transkript
    console.log('\nTRANSKRIPT:');
    const history = data.simulated_conversation || [];
    history.forEach((turn) => {
      const role = turn.role === 'agent' ? 'BIRTE' : 'USER ';
      const msg = turn.message || '';
      if (msg) console.log(`  ${role}: ${msg.substring(0, 150)}`);
      if (turn.tool_call) {
        console.log(`  [TOOL] ${turn.tool_call.tool_name || ''}: ${JSON.stringify(turn.tool_call.params || turn.tool_call.arguments || {}).substring(0, 120)}`);
      }
    });

    // Evaluation
    console.log('\nEVALUATION:');
    const analysis = data.analysis || {};
    const criteria = analysis.evaluation_criteria_results_list || Object.values(analysis.evaluation_criteria_results || {});
    let passed = 0;
    let total = criteria.length;
    criteria.forEach(c => {
      const icon = c.result === 'success' ? '\u2705' : '\u274C';
      console.log(`  ${icon} ${c.criteria_id || c.id}: ${c.result} \u2014 ${(c.rationale || '').substring(0, 120)}`);
      if (c.result === 'success') passed++;
    });

    if (analysis.transcript_summary) {
      console.log(`\nZUSAMMENFASSUNG: ${analysis.transcript_summary.substring(0, 200)}`);
    }
    console.log(`CALL SUCCESSFUL: ${analysis.call_successful || 'unbekannt'}`);
    console.log(`\nERGEBNIS: ${passed}/${total} Kriterien bestanden`);

    return { id, name: szenario.name, status: 'done', passed, total };
  } catch (err) {
    console.log(`FEHLER: ${err.message}`);
    return { id, name: szenario.name, status: 'error', error: err.message };
  }
}

async function main() {
  const filter = process.argv[2];
  const ids = filter ? [filter] : Object.keys(SZENARIEN);

  console.log(`Strobl Telefonassistent \u2014 Konversations-Simulation`);
  console.log(`Agent: ${AGENT_ID}`);
  console.log(`Szenarien: ${ids.join(', ')}`);
  console.log(`Zeitpunkt: ${new Date().toISOString()}`);

  const results = [];
  for (const id of ids) {
    if (!SZENARIEN[id]) { console.log(`\nUnbekanntes Szenario: ${id}`); continue; }
    results.push(await simulateSzenario(id, SZENARIEN[id]));
  }

  // Zusammenfassung
  console.log(`\n${'='.repeat(60)}`);
  console.log('ZUSAMMENFASSUNG');
  console.log('='.repeat(60));
  results.forEach(r => {
    if (r.status === 'done') {
      const icon = r.passed === r.total ? '\u2705' : '\u26A0\uFE0F';
      console.log(`${icon} ${r.id}: ${r.name} \u2014 ${r.passed}/${r.total}`);
    } else {
      console.log(`\u274C ${r.id}: ${r.name} \u2014 FEHLER: ${r.error}`);
    }
  });

  const totalPassed = results.filter(r => r.status === 'done').reduce((sum, r) => sum + r.passed, 0);
  const totalCriteria = results.filter(r => r.status === 'done').reduce((sum, r) => sum + r.total, 0);
  console.log(`\nGesamt: ${totalPassed}/${totalCriteria} Kriterien bestanden`);
}

main();
