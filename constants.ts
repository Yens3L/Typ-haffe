import { Level, LevelId, TestDuration, TranslationLanguage } from "./types";

export const TEST_DURATIONS: TestDuration[] = [30, 60, 90, 0];

export const TRANSLATION_LANGUAGES: Record<TranslationLanguage, string> = {
  es: 'Spanisch',
  en: 'Englisch',
  fr: 'Französisch',
  it: 'Italienisch',
  pt: 'Portugiesisch',
  none: 'Keine',
};

export const TRANSLATION_ADJECTIVES: Record<string, string> = {
    es: 'spanische',
    en: 'englische',
    fr: 'französische',
    it: 'italienische',
    pt: 'portugiesische',
};

export const LEVELS: Record<LevelId, Level> = {
  A1: {
    name: "Anfänger A1",
    phrases: [
      "der", "die", "das", "und", "in", "zu", "den", "ein", "ich", "mit",
      "sich", "auf", "für", "es", "als", "auch", "an", "aus", "er", "hat",
      "nach", "bei", "sie", "oder", "von", "wir", "ist", "sind", "nur", "so",
      "über", "noch", "am", "vor", "durch", "man", "aber", "zum", "haben",
      "kann", "nicht", "dass", "wird", "sein", "werden", "ihr", "doch", "wenn",
      "immer", "um", "wie", "schon", "bis", "mehr", "eine", "einen", "einem",
      "einer", "sehr", "gut", "jetzt", "hier", "da", "was", "wo", "wer", "warum",
      "Hallo", "Danke", "Bitte", "Ja", "Nein", "Entschuldigung",
      "Hilfe", "Wasser", "Essen", "Freund", "Familie", "Haus", "Auto", "Stadt",
      "neu", "alt", "groß", "klein", "gut", "schlecht", "warm", "kalt", "schön"
    ].filter((w, i, a) => a.indexOf(w) === i) // Remove duplicates
  },
  A2: {
    name: "Grundlagen A2",
    phrases: [
      "Ich komme aus Deutschland.",
      "Wie alt bist du?",
      "Was ist Ihr Beruf?",
      "Ich lerne Deutsch.",
      "Das Wetter ist schön.",
      "Er trinkt gerne Kaffee.",
      "Sie liest ein Buch.",
      "Wir gehen ins Kino.",
      "Können Sie mir helfen?",
      "Wo ist der Bahnhof?",
      "Ein Glas Wasser, bitte.",
      "Mein Hobby ist Schwimmen.",
      "Ich fahre mit dem Bus.",
      "Sie hat blaue Augen.",
      "Der Hund schläft.",
      "Ich habe Hunger.",
      "Wann beginnt der Film?",
      "Das Essen schmeckt gut.",
      "Er arbeitet im Büro.",
      "Wir machen Urlaub."
    ]
  },
  B1: {
    name: "Mittelstufe B1",
    phrases: [
      "Ich interessiere mich für die deutsche Kultur und Geschichte.",
      "Könnten Sie das bitte langsamer wiederholen?",
      "Meiner Meinung nach ist Umweltschutz sehr wichtig.",
      "Obwohl es regnet, gehen wir spazieren.",
      "Er hat mir empfohlen, diesen Film anzusehen.",
      "Ich würde gerne eine Reise durch Europa machen.",
      "Es ist notwendig, die Grammatik regelmäßig zu üben.",
      "Sie hat sich entschieden, an der Universität zu studieren.",
      "Wenn ich mehr Zeit hätte, würde ich ein neues Instrument lernen.",
      "Die Besprechung findet morgen um zehn Uhr statt.",
    ]
  },
  B2: {
    name: "Gute Mittelstufe B2",
    phrases: [
      "Es wird empfohlen, sich frühzeitig anzumelden, da die Plätze begrenzt sind.",
      "Die Debatte über den Klimawandel führt zu kontroversen Diskussionen.",
      "Er hat die Fähigkeit, komplexe Sachverhalte verständlich zu erklären.",
      "Anstatt sich zu beschweren, sollte man versuchen, eine Lösung zu finden.",
      "Die fortschreitende Digitalisierung verändert die Arbeitswelt grundlegend.",
      "Die Regierung hat Maßnahmen ergriffen, um die Wirtschaft anzukurbeln.",
      "Es ist von entscheidender Bedeutung, dass wir nachhaltig handeln.",
      "Je mehr man liest, desto größer wird der eigene Wortschatz.",
    ]
  },
  C1: {
    name: "Fortgeschritten C1",
    phrases: [
      "Angesichts der Komplexität des Sachverhalts bedarf es einer differenzierten Betrachtungsweise.",
      "Seine Ausführungen trugen maßgeblich zum Verständnis des Problems bei.",
      "Die Studie liefert stichhaltige Beweise für die aufgestellte Hypothese.",
      "Es ist unerlässlich, sich mit den ethischen Implikationen dieser Technologie auseinanderzusetzen.",
      "Die Globalisierung stellt sowohl eine Chance als auch eine Herausforderung dar.",
      "Die nonverbale Kommunikation spielt eine nicht zu unterschätzende Rolle im Miteinander.",
      "Er plädierte für eine grundlegende Reform des Bildungssystems.",
    ]
  },
  C2: {
    name: "Exzellent C2",
    phrases: [
      "Die hermeneutische Analyse des Textes offenbart eine intertextuelle Verflechtung mit poststrukturalistischen Diskursen.",
      "Sein profundes Wissen auf diesem Gebiet ist schlichtweg beeindruckend.",
      "Die Dichotomie zwischen Theorie und Praxis ist in dieser Disziplin besonders ausgeprägt.",
      "Die eloquent vorgetragene Rede fand bei den Zuhörern großen Anklang.",
      "Der Paradigmenwechsel in der Wissenschaft führte zu neuen Erkenntnissen.",
      "Es bedarf einer präzisen und unmissverständlichen Formulierung, um Missverständnisse zu vermeiden.",
      "Seine Argumentation war stringent und frei von jeglichen logischen Fehlschlüssen.",
    ]
  }
};