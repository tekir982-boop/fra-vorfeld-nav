// app.js — FRA Vorfeld Navigator
// Frankfurt Airport (EDDF) GSE Navigation PWA

// ============================================================
// POSITIONS — Gate/Stand/Cargo positions
// ============================================================
const POSITIONS = [
  // Terminal T1 Gates A
  { id: "A1",  lat: 50.049500, lng: 8.568500, cat: "terminal", desc: "T1 Gate A1" },
  { id: "A2",  lat: 50.049450, lng: 8.569000, cat: "terminal", desc: "T1 Gate A2" },
  { id: "A3",  lat: 50.049350, lng: 8.569500, cat: "terminal", desc: "T1 Gate A3" },
  { id: "A4",  lat: 50.049244, lng: 8.569909, cat: "terminal", desc: "T1 Gate A4" },
  { id: "A5",  lat: 50.049150, lng: 8.570400, cat: "terminal", desc: "T1 Gate A5" },
  { id: "A6",  lat: 50.049050, lng: 8.570900, cat: "terminal", desc: "T1 Gate A6" },
  { id: "A7",  lat: 50.048950, lng: 8.571400, cat: "terminal", desc: "T1 Gate A7" },
  { id: "A8",  lat: 50.048850, lng: 8.571900, cat: "terminal", desc: "T1 Gate A8" },
  { id: "A9",  lat: 50.048750, lng: 8.572400, cat: "terminal", desc: "T1 Gate A9" },
  { id: "A10", lat: 50.048650, lng: 8.572900, cat: "terminal", desc: "T1 Gate A10" },
  { id: "A11", lat: 50.048550, lng: 8.573400, cat: "terminal", desc: "T1 Gate A11" },
  { id: "A12", lat: 50.048450, lng: 8.573900, cat: "terminal", desc: "T1 Gate A12" },
  { id: "A13", lat: 50.048350, lng: 8.574400, cat: "terminal", desc: "T1 Gate A13" },
  { id: "A14", lat: 50.048250, lng: 8.574900, cat: "terminal", desc: "T1 Gate A14" },
  { id: "A15", lat: 50.048150, lng: 8.575400, cat: "terminal", desc: "T1 Gate A15" },
  { id: "A16", lat: 50.048050, lng: 8.575900, cat: "terminal", desc: "T1 Gate A16" },
  { id: "A17", lat: 50.047950, lng: 8.576400, cat: "terminal", desc: "T1 Gate A17" },
  { id: "A18", lat: 50.047850, lng: 8.576900, cat: "terminal", desc: "T1 Gate A18" },
  { id: "A19", lat: 50.047750, lng: 8.577400, cat: "terminal", desc: "T1 Gate A19" },
  { id: "A20", lat: 50.047650, lng: 8.577900, cat: "terminal", desc: "T1 Gate A20" },
  { id: "A21", lat: 50.047550, lng: 8.578400, cat: "terminal", desc: "T1 Gate A21" },
  { id: "A22", lat: 50.047450, lng: 8.578900, cat: "terminal", desc: "T1 Gate A22" },
  { id: "A23", lat: 50.047350, lng: 8.579400, cat: "terminal", desc: "T1 Gate A23" },
  { id: "A24", lat: 50.047250, lng: 8.579900, cat: "terminal", desc: "T1 Gate A24" },
  { id: "A25", lat: 50.047150, lng: 8.580400, cat: "terminal", desc: "T1 Gate A25" },
  { id: "A26", lat: 50.047050, lng: 8.580900, cat: "terminal", desc: "T1 Gate A26" },
  { id: "A28", lat: 50.046900, lng: 8.581800, cat: "terminal", desc: "T1 Gate A28" },
  { id: "A30", lat: 50.046750, lng: 8.582700, cat: "terminal", desc: "T1 Gate A30" },
  { id: "A32", lat: 50.046600, lng: 8.583600, cat: "terminal", desc: "T1 Gate A32" },
  { id: "A34", lat: 50.046450, lng: 8.584500, cat: "terminal", desc: "T1 Gate A34" },
  { id: "A36", lat: 50.046300, lng: 8.585400, cat: "terminal", desc: "T1 Gate A36" },
  { id: "A38", lat: 50.046150, lng: 8.586300, cat: "terminal", desc: "T1 Gate A38" },
  { id: "A40", lat: 50.046000, lng: 8.587200, cat: "terminal", desc: "T1 Gate A40" },
  { id: "A42", lat: 50.045850, lng: 8.588100, cat: "terminal", desc: "T1 Gate A42" },
  { id: "A44", lat: 50.045700, lng: 8.589000, cat: "terminal", desc: "T1 Gate A44" },
  { id: "A46", lat: 50.045550, lng: 8.589900, cat: "terminal", desc: "T1 Gate A46" },
  { id: "A50", lat: 50.045300, lng: 8.591500, cat: "terminal", desc: "T1 Gate A50" },
  { id: "A52", lat: 50.045150, lng: 8.592400, cat: "terminal", desc: "T1 Gate A52" },
  { id: "A54", lat: 50.045000, lng: 8.593300, cat: "terminal", desc: "T1 Gate A54" },
  { id: "A56", lat: 50.044850, lng: 8.594200, cat: "terminal", desc: "T1 Gate A56" },
  { id: "A58", lat: 50.044700, lng: 8.595100, cat: "terminal", desc: "T1 Gate A58" },
  { id: "A60", lat: 50.044550, lng: 8.596000, cat: "terminal", desc: "T1 Gate A60" },
  { id: "A62", lat: 50.044400, lng: 8.596900, cat: "terminal", desc: "T1 Gate A62" },
  { id: "A64", lat: 50.044250, lng: 8.597800, cat: "terminal", desc: "T1 Gate A64" },
  { id: "A66", lat: 50.044100, lng: 8.598700, cat: "terminal", desc: "T1 Gate A66" },

  // Terminal T1 Gates B
  { id: "B1",  lat: 50.048800, lng: 8.568500, cat: "terminal", desc: "T1 Gate B1" },
  { id: "B2",  lat: 50.048750, lng: 8.569000, cat: "terminal", desc: "T1 Gate B2" },
  { id: "B4",  lat: 50.048650, lng: 8.569800, cat: "terminal", desc: "T1 Gate B4" },
  { id: "B6",  lat: 50.048550, lng: 8.570600, cat: "terminal", desc: "T1 Gate B6" },
  { id: "B8",  lat: 50.048450, lng: 8.571400, cat: "terminal", desc: "T1 Gate B8" },
  { id: "B10", lat: 50.048350, lng: 8.572200, cat: "terminal", desc: "T1 Gate B10" },
  { id: "B12", lat: 50.048250, lng: 8.573000, cat: "terminal", desc: "T1 Gate B12" },
  { id: "B14", lat: 50.048150, lng: 8.573800, cat: "terminal", desc: "T1 Gate B14" },
  { id: "B16", lat: 50.048050, lng: 8.574600, cat: "terminal", desc: "T1 Gate B16" },
  { id: "B18", lat: 50.047950, lng: 8.575400, cat: "terminal", desc: "T1 Gate B18" },
  { id: "B20", lat: 50.047850, lng: 8.576200, cat: "terminal", desc: "T1 Gate B20" },
  { id: "B22", lat: 50.047750, lng: 8.577000, cat: "terminal", desc: "T1 Gate B22" },
  { id: "B24", lat: 50.047650, lng: 8.577800, cat: "terminal", desc: "T1 Gate B24" },
  { id: "B26", lat: 50.047550, lng: 8.578600, cat: "terminal", desc: "T1 Gate B26" },
  { id: "B28", lat: 50.047450, lng: 8.579400, cat: "terminal", desc: "T1 Gate B28" },
  { id: "B30", lat: 50.047350, lng: 8.580200, cat: "terminal", desc: "T1 Gate B30" },
  { id: "B32", lat: 50.047250, lng: 8.581000, cat: "terminal", desc: "T1 Gate B32" },
  { id: "B34", lat: 50.047150, lng: 8.581800, cat: "terminal", desc: "T1 Gate B34" },
  { id: "B36", lat: 50.047050, lng: 8.582600, cat: "terminal", desc: "T1 Gate B36" },
  { id: "B38", lat: 50.046950, lng: 8.583400, cat: "terminal", desc: "T1 Gate B38" },
  { id: "B40", lat: 50.046850, lng: 8.584200, cat: "terminal", desc: "T1 Gate B40" },
  { id: "B42", lat: 50.046750, lng: 8.585000, cat: "terminal", desc: "T1 Gate B42" },
  { id: "B44", lat: 50.046650, lng: 8.585800, cat: "terminal", desc: "T1 Gate B44" },
  { id: "B46", lat: 50.046550, lng: 8.586600, cat: "terminal", desc: "T1 Gate B46" },
  { id: "B48", lat: 50.046450, lng: 8.587400, cat: "terminal", desc: "T1 Gate B48" },
  { id: "B50", lat: 50.046350, lng: 8.588200, cat: "terminal", desc: "T1 Gate B50" },
  { id: "B52", lat: 50.046250, lng: 8.589000, cat: "terminal", desc: "T1 Gate B52" },
  { id: "B54", lat: 50.046150, lng: 8.589800, cat: "terminal", desc: "T1 Gate B54" },
  { id: "B56", lat: 50.046050, lng: 8.590600, cat: "terminal", desc: "T1 Gate B56" },

  // Terminal T1 Gates C
  { id: "C1",  lat: 50.049800, lng: 8.574000, cat: "terminal", desc: "T1 Gate C1" },
  { id: "C2",  lat: 50.049750, lng: 8.574500, cat: "terminal", desc: "T1 Gate C2" },
  { id: "C4",  lat: 50.049650, lng: 8.575500, cat: "terminal", desc: "T1 Gate C4" },
  { id: "C6",  lat: 50.049550, lng: 8.576500, cat: "terminal", desc: "T1 Gate C6" },
  { id: "C8",  lat: 50.049450, lng: 8.577500, cat: "terminal", desc: "T1 Gate C8" },
  { id: "C10", lat: 50.049350, lng: 8.578500, cat: "terminal", desc: "T1 Gate C10" },
  { id: "C11", lat: 50.049300, lng: 8.579000, cat: "terminal", desc: "T1 Gate C11" },
  { id: "C12", lat: 50.049250, lng: 8.579500, cat: "terminal", desc: "T1 Gate C12" },
  { id: "C13", lat: 50.049200, lng: 8.580000, cat: "terminal", desc: "T1 Gate C13" },
  { id: "C14", lat: 50.049150, lng: 8.580500, cat: "terminal", desc: "T1 Gate C14" },
  { id: "C15", lat: 50.049504, lng: 8.581211, cat: "terminal", desc: "T1 Gate C15" },
  { id: "C16", lat: 50.049050, lng: 8.581500, cat: "terminal", desc: "T1 Gate C16" },
  { id: "C17", lat: 50.049000, lng: 8.582000, cat: "terminal", desc: "T1 Gate C17" },
  { id: "C18", lat: 50.048950, lng: 8.582500, cat: "terminal", desc: "T1 Gate C18" },
  { id: "C19", lat: 50.048900, lng: 8.583000, cat: "terminal", desc: "T1 Gate C19" },
  { id: "C20", lat: 50.048850, lng: 8.583500, cat: "terminal", desc: "T1 Gate C20" },

  // Terminal T2 Gates D/E
  { id: "D1",  lat: 50.049000, lng: 8.588000, cat: "terminal", desc: "T2 Gate D1" },
  { id: "D2",  lat: 50.048950, lng: 8.588500, cat: "terminal", desc: "T2 Gate D2" },
  { id: "D4",  lat: 50.048850, lng: 8.589500, cat: "terminal", desc: "T2 Gate D4" },
  { id: "D5",  lat: 50.048800, lng: 8.590000, cat: "terminal", desc: "T2 Gate D5" },
  { id: "D6",  lat: 50.048750, lng: 8.590500, cat: "terminal", desc: "T2 Gate D6" },
  { id: "D8",  lat: 50.048650, lng: 8.591500, cat: "terminal", desc: "T2 Gate D8" },
  { id: "E2",  lat: 50.049200, lng: 8.588000, cat: "terminal", desc: "T2 Gate E2" },
  { id: "E4",  lat: 50.049100, lng: 8.589000, cat: "terminal", desc: "T2 Gate E4" },
  { id: "E5",  lat: 50.049050, lng: 8.589500, cat: "terminal", desc: "T2 Gate E5" },
  { id: "E6",  lat: 50.049000, lng: 8.590000, cat: "terminal", desc: "T2 Gate E6" },
  { id: "E8",  lat: 50.048900, lng: 8.591000, cat: "terminal", desc: "T2 Gate E8" },
  { id: "E9",  lat: 50.048850, lng: 8.591500, cat: "terminal", desc: "T2 Gate E9" },

  // Terminal T3 Gates G/H/J
  { id: "G1",  lat: 50.031800, lng: 8.585000, cat: "terminal", desc: "T3 Gate G1" },
  { id: "G2",  lat: 50.031449, lng: 8.585597, cat: "terminal", desc: "T3 Gate G2" },
  { id: "G3",  lat: 50.031100, lng: 8.586200, cat: "terminal", desc: "T3 Gate G3" },
  { id: "G4",  lat: 50.030800, lng: 8.586800, cat: "terminal", desc: "T3 Gate G4" },
  { id: "G5",  lat: 50.030500, lng: 8.587400, cat: "terminal", desc: "T3 Gate G5" },
  { id: "H1",  lat: 50.032500, lng: 8.579500, cat: "terminal", desc: "T3 Gate H1" },
  { id: "H2",  lat: 50.032200, lng: 8.580200, cat: "terminal", desc: "T3 Gate H2" },
  { id: "H3",  lat: 50.031900, lng: 8.580900, cat: "terminal", desc: "T3 Gate H3" },
  { id: "H4",  lat: 50.031600, lng: 8.581600, cat: "terminal", desc: "T3 Gate H4" },
  { id: "H5",  lat: 50.031300, lng: 8.582300, cat: "terminal", desc: "T3 Gate H5" },
  { id: "J1",  lat: 50.029966, lng: 8.577374, cat: "terminal", desc: "T3 Gate J1" },
  { id: "J2",  lat: 50.029700, lng: 8.578000, cat: "terminal", desc: "T3 Gate J2" },
  { id: "J3",  lat: 50.029400, lng: 8.578600, cat: "terminal", desc: "T3 Gate J3" },
  { id: "J4",  lat: 50.029100, lng: 8.579200, cat: "terminal", desc: "T3 Gate J4" },
  { id: "J5",  lat: 50.028800, lng: 8.579800, cat: "terminal", desc: "T3 Gate J5" },

  // Cargo F Stands
  { id: "F201", lat: 50.041000, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F201" },
  { id: "F202", lat: 50.040900, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F202" },
  { id: "F203", lat: 50.040800, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F203" },
  { id: "F204", lat: 50.040700, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F204" },
  { id: "F205", lat: 50.040600, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F205" },
  { id: "F206", lat: 50.040500, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F206" },
  { id: "F207", lat: 50.040400, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F207" },
  { id: "F208", lat: 50.040300, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F208" },
  { id: "F209", lat: 50.040200, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F209" },
  { id: "F210", lat: 50.040100, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F210" },
  { id: "F211", lat: 50.040000, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F211" },
  { id: "F212", lat: 50.039900, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F212" },
  { id: "F213", lat: 50.040133, lng: 8.545750, cat: "cargo", desc: "Cargo · Stand F213" },
  { id: "F214", lat: 50.039700, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F214" },
  { id: "F215", lat: 50.039600, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F215" },
  { id: "F216", lat: 50.039500, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F216" },
  { id: "F217", lat: 50.039400, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F217" },
  { id: "F218", lat: 50.039300, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F218" },
  { id: "F219", lat: 50.039200, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F219" },
  { id: "F220", lat: 50.039100, lng: 8.545000, cat: "cargo", desc: "Cargo · Stand F220" },

  // Vorfeld Ost V Stands
  { id: "V101", lat: 50.048800, lng: 8.583500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V101" },
  { id: "V102", lat: 50.048800, lng: 8.584000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V102" },
  { id: "V103", lat: 50.048800, lng: 8.584500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V103" },
  { id: "V104", lat: 50.048800, lng: 8.585000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V104" },
  { id: "V105", lat: 50.048800, lng: 8.585500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V105" },
  { id: "V106", lat: 50.048800, lng: 8.586000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V106" },
  { id: "V107", lat: 50.048800, lng: 8.586500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V107" },
  { id: "V108", lat: 50.048800, lng: 8.587000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V108" },
  { id: "V109", lat: 50.048800, lng: 8.587500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V109" },
  { id: "V110", lat: 50.048800, lng: 8.588000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V110" },
  { id: "V111", lat: 50.048800, lng: 8.588500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V111" },
  { id: "V112", lat: 50.048800, lng: 8.589000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V112" },
  { id: "V113", lat: 50.048800, lng: 8.589500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V113" },
  { id: "V114", lat: 50.048800, lng: 8.590000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V114" },
  { id: "V115", lat: 50.049246, lng: 8.588577, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V115" },
  { id: "V116", lat: 50.048800, lng: 8.591000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V116" },
  { id: "V117", lat: 50.048800, lng: 8.591500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V117" },
  { id: "V118", lat: 50.048800, lng: 8.592000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V118" },
  { id: "V119", lat: 50.048800, lng: 8.592500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V119" },
  { id: "V120", lat: 50.048800, lng: 8.593000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V120" },
  { id: "V121", lat: 50.049000, lng: 8.593500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V121" },
  { id: "V122", lat: 50.049200, lng: 8.594000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V122" },
  { id: "V123", lat: 50.049400, lng: 8.594500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V123" },
  { id: "V124", lat: 50.049600, lng: 8.595000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V124" },
  { id: "V125", lat: 50.049800, lng: 8.595500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V125" },
  { id: "V126", lat: 50.050000, lng: 8.596000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V126" },
  { id: "V127", lat: 50.050200, lng: 8.596500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V127" },
  { id: "V128", lat: 50.050400, lng: 8.597000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V128" },
  { id: "V129", lat: 50.050600, lng: 8.597500, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V129" },
  { id: "V130", lat: 50.050800, lng: 8.598000, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand V130" },

  // Vorfeld West W Stands
  { id: "W1",  lat: 50.048500, lng: 8.555000, cat: "vorfeld-s", desc: "Vorfeld West · Stand W1" },
  { id: "W2",  lat: 50.048500, lng: 8.555500, cat: "vorfeld-s", desc: "Vorfeld West · Stand W2" },
  { id: "W3",  lat: 50.048500, lng: 8.556000, cat: "vorfeld-s", desc: "Vorfeld West · Stand W3" },
  { id: "W4",  lat: 50.048500, lng: 8.556500, cat: "vorfeld-s", desc: "Vorfeld West · Stand W4" },
  { id: "W5",  lat: 50.048500, lng: 8.557000, cat: "vorfeld-s", desc: "Vorfeld West · Stand W5" },
  { id: "W6",  lat: 50.048500, lng: 8.557500, cat: "vorfeld-s", desc: "Vorfeld West · Stand W6" },
  { id: "W7",  lat: 50.048500, lng: 8.558000, cat: "vorfeld-s", desc: "Vorfeld West · Stand W7" },
  { id: "W8",  lat: 50.048500, lng: 8.558500, cat: "vorfeld-s", desc: "Vorfeld West · Stand W8" },
  { id: "W9",  lat: 50.048500, lng: 8.559000, cat: "vorfeld-s", desc: "Vorfeld West · Stand W9" },
  { id: "W10", lat: 50.048500, lng: 8.559500, cat: "vorfeld-s", desc: "Vorfeld West · Stand W10" },

  // GA / General Aviation
  { id: "GA-N", lat: 50.051000, lng: 8.585000, cat: "ga", desc: "GA · North Apron" },
  { id: "GA-S", lat: 50.035000, lng: 8.585000, cat: "ga", desc: "GA · South Apron" },

  // Landmarks
  { id: "TOWER", lat: 50.037500, lng: 8.560000, cat: "landmark", desc: "FRA Tower" },
  { id: "CARGO-C", lat: 50.041500, lng: 8.548000, cat: "landmark", desc: "Cargo City" },
  { id: "FRACENTER", lat: 50.052000, lng: 8.570000, cat: "landmark", desc: "FRACenter" },
];

// ============================================================
// I18N
// ============================================================
const I18N = {
  de: {
    title: "FRA Vorfeld Navigator",
    subtitle: "FRAPORT · EDDF",
    searchPlaceholder: "Position, Gate oder Stand...",
    gpsOff: "GPS: Aus",
    gpsDemo: "GPS: Demo",
    gpsOn: "GPS: Aktiv",
    btnDemo: "Demo",
    btnMenu: "Menü",
    btnCenter: "Center",
    btnLayer: "Layer",
    btnZoomIn: "+",
    btnZoomOut: "−",
    settings: "Einstellungen",
    language: "Sprache",
    vehicleType: "Fahrzeugtyp",
    basemap: "Kartenstil",
    showZones: "Zonen anzeigen",
    showBuildings: "Gebäude anzeigen",
    close: "Schließen",
    routeApprox: "(approximiert)",
    routeViaRoads: "(via Service Roads)",
    distance: "Entfernung",
    meters: "m",
    kilometers: "km",
    schengen: "Schengen",
    nonSchengen: "Non-Schengen",
    noRoute: "Keine Route gefunden",
    selectDest: "Ziel auswählen",
  },
  en: {
    title: "FRA Vorfeld Navigator",
    subtitle: "FRAPORT · EDDF",
    searchPlaceholder: "Position, Gate or Stand...",
    gpsOff: "GPS: Off",
    gpsDemo: "GPS: Demo",
    gpsOn: "GPS: Active",
    btnDemo: "Demo",
    btnMenu: "Menu",
    btnCenter: "Center",
    btnLayer: "Layer",
    btnZoomIn: "+",
    btnZoomOut: "−",
    settings: "Settings",
    language: "Language",
    vehicleType: "Vehicle Type",
    basemap: "Basemap",
    showZones: "Show Zones",
    showBuildings: "Show Buildings",
    close: "Close",
    routeApprox: "(approximated)",
    routeViaRoads: "(via Service Roads)",
    distance: "Distance",
    meters: "m",
    kilometers: "km",
    schengen: "Schengen",
    nonSchengen: "Non-Schengen",
    noRoute: "No route found",
    selectDest: "Select destination",
  }
};

// ============================================================
// APP STATE
// ============================================================
let map = null;
let currentPos = null; // [lat, lng]
let targetPos = null;
let routeLine = null;
let routeOutline = null;
let startMarker = null;
let destMarker = null;
let gpsWatchId = null;
let demoInterval = null;
let demoIndex = 0;
let currentLang = localStorage.getItem('fra-lang') || 'de';
let showZones = localStorage.getItem('fra-zones') === 'true';
let showBuildings = localStorage.getItem('fra-buildings') === 'true';
let zoneLayers = [];
let buildingLayers = [];

// Demo route points (simulated GPS track on service roads)
const DEMO_TRACK = [
  [50.0467, 8.5700], [50.0467, 8.5710], [50.0467, 8.5720], [50.0467, 8.5730],
  [50.0467, 8.5740], [50.0467, 8.5750], [50.0467, 8.5760], [50.0467, 8.5770],
  [50.0467, 8.5780], [50.0467, 8.5790], [50.0467, 8.5800], [50.0467, 8.5810],
  [50.0467, 8.5820], [50.0467, 8.5830], [50.0467, 8.5840], [50.0467, 8.5850],
  [50.0467, 8.5860], [50.0467, 8.5870], [50.0467, 8.5880], [50.0467, 8.5890],
  [50.0467, 8.5900], [50.0465, 8.5905], [50.0460, 8.5910], [50.0455, 8.5905],
  [50.0450, 8.5900], [50.0445, 8.5895], [50.0440, 8.5890], [50.0435, 8.5885],
  [50.0430, 8.5880], [50.0425, 8.5875], [50.0420, 8.5870], [50.0415, 8.5865],
  [50.0410, 8.5860], [50.0405, 8.5855], [50.0400, 8.5850], [50.0395, 8.5845],
  [50.0390, 8.5840], [50.0385, 8.5835], [50.0380, 8.5830], [50.0375, 8.5830],
  [50.0370, 8.5830], [50.0365, 8.5830], [50.0360, 8.5830], [50.0355, 8.5830],
  [50.0350, 8.5830], [50.0345, 8.5830], [50.0340, 8.5830], [50.0335, 8.5830],
  [50.0330, 8.5830], [50.0325, 8.5830], [50.0320, 8.5830], [50.0315, 8.5830],
  [50.0310, 8.5830], [50.0305, 8.5830], [50.0300, 8.5830]
];

// ============================================================
// ROUTING ENGINE
// ============================================================

function projectOntoRoad(lat, lng) {
  const { nodes, edges } = ROAD_GRAPH_DATA;
  let bestDist = Infinity, bestEdge = null, bestT = 0;

  for (const [i, j, _dist] of edges) {
    const [x1, y1] = nodes[i];
    const [x2, y2] = nodes[j];
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx*dx + dy*dy;
    if (len2 === 0) continue;
    let t = ((lat - x1) * dx + (lng - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const projLat = x1 + t * dx;
    const projLng = y1 + t * dy;
    const d = haversine(lat, lng, projLat, projLng);
    if (d < bestDist) {
      bestDist = d;
      bestEdge = [i, j];
      bestT = t;
    }
  }

  if (!bestEdge) return { nodeIdx: 0, lat, lng, dist: Infinity };

  const [i, j] = bestEdge;
  const [x1, y1] = nodes[i];
  const [x2, y2] = nodes[j];
  const projLat = x1 + bestT * (x2 - x1);
  const projLng = y1 + bestT * (y2 - y1);

  // If on rollfeld, snap NORTH to HBS
  if (isRollfeld(lat, lng) && !isInCarveOut(lat, lng)) {
    const snappedLat = Math.max(lat, 50.0467);
    return projectOntoRoad(snappedLat, lng);
  }

  return {
    nodeIdx: bestT < 0.5 ? i : j,
    lat: projLat,
    lng: projLng,
    dist: bestDist,
    edge: bestEdge,
    t: bestT
  };
}

function buildAdjList() {
  const { nodes, edges } = ROAD_GRAPH_DATA;
  const adj = Array.from({ length: nodes.length }, () => []);
  for (const [i, j, dist] of edges) {
    adj[i].push([j, dist]);
    adj[j].push([i, dist]);
  }
  return adj;
}

function computeRoute(fromLatLng, toLatLng, destMeta) {
  const fromSnap = projectOntoRoad(fromLatLng[0], fromLatLng[1]);
  const toSnap = projectOntoRoad(toLatLng[0], toLatLng[1]);

  if (fromSnap.dist > 500 || toSnap.dist > 500) {
    // Fallback: straight line if too far from graph
    const dist = haversine(fromLatLng[0], fromLatLng[1], toLatLng[0], toLatLng[1]);
    return {
      latlngs: [fromLatLng, toLatLng],
      dist: Math.round(dist),
      viaRoads: false,
      startSnap: fromSnap,
      endSnap: toSnap,
      midTaxiCount: 0
    };
  }

  const adj = buildAdjList();
  const startNodes = [fromSnap.nodeIdx];
  if (fromSnap.edge) {
    startNodes.push(fromSnap.edge[0], fromSnap.edge[1]);
  }

  const destId = destMeta?.id || '';
  const isCargo = destId.match(/^F\d/) || destMeta?.cat === 'cargo';
  const isT3 = destMeta?.cat === 'terminal' && toLatLng[0] < 50.0375 && toLatLng[1] >= 8.56 && toLatLng[1] <= 8.596;

  // A*
  const openSet = new Set(startNodes);
  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();

  for (const s of startNodes) {
    gScore.set(s, 0);
    fScore.set(s, haversine(ROAD_GRAPH_DATA.nodes[s][0], ROAD_GRAPH_DATA.nodes[s][1], toLatLng[0], toLatLng[1]));
  }

  let bestEnd = null, bestEndScore = Infinity;

  while (openSet.size > 0) {
    let current = null, currentF = Infinity;
    for (const node of openSet) {
      const f = fScore.get(node) ?? Infinity;
      if (f < currentF) { currentF = f; current = node; }
    }
    if (current === null) break;

    openSet.delete(current);

    if (current === toSnap.nodeIdx || haversine(ROAD_GRAPH_DATA.nodes[current][0], ROAD_GRAPH_DATA.nodes[current][1], toLatLng[0], toLatLng[1]) < 80) {
      bestEnd = current;
      break;
    }

    for (const [neighbor, edgeDist] of adj[current]) {
      const [nLat, nLng] = ROAD_GRAPH_DATA.nodes[neighbor];

      // Hard ban: tunnel edges for T1/T2
      const isTunnel = __TUNNEL_EDGE_PAIRS.some(([a,b]) => (a===current&&b===neighbor)||(a===neighbor&&b===current));
      if (isTunnel && !isT3) continue;

      // Cost modifiers
      let cost = edgeDist;

      // Rollfeld penalty
      if (isRollfeld(nLat, nLng) && !isInCarveOut(nLat, nLng)) {
        cost += 5000; // heavy penalty
      }

      // Mid-taxi penalty
      if (isMidTaxi(nLat, nLng) && !isInCarveOut(nLat, nLng)) {
        cost += 3000;
      }

      // Cargo: ban NS bridges, prefer west
      if (isCargo) {
        if (nsBridgeNodes.has(neighbor)) cost += 8000;
        if (cargoWNodes.has(neighbor)) cost *= 0.5;
        if (hbsNodes.has(neighbor)) cost *= 0.8;
      }

      // T3: prefer NS bridges, ban western cargo detour
      if (isT3) {
        if (nsBridgeNodes.has(neighbor)) cost *= 0.4;
        if (cargoWNodes.has(neighbor)) cost += 6000;
      }

      // T1/T2 local: stay north
      if (!isCargo && !isT3) {
        if (nLat < 50.042) cost += 2000;
      }

      const tentativeG = (gScore.get(current) ?? Infinity) + cost;
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + haversine(nLat, nLng, toLatLng[0], toLatLng[1]));
        openSet.add(neighbor);
      }
    }
  }

  if (bestEnd === null) {
    // Fallback straight line
    const dist = haversine(fromLatLng[0], fromLatLng[1], toLatLng[0], toLatLng[1]);
    return {
      latlngs: [fromLatLng, toLatLng],
      dist: Math.round(dist),
      viaRoads: false,
      startSnap: fromSnap,
      endSnap: toSnap,
      midTaxiCount: 0
    };
  }

  // Reconstruct path
  const path = [];
  let node = bestEnd;
  while (node !== undefined) {
    path.unshift(ROAD_GRAPH_DATA.nodes[node]);
    node = cameFrom.get(node);
  }

  // Add exact start/end
  if (path.length > 0) {
    path[0] = [fromLatLng[0], fromLatLng[1]];
    path[path.length - 1] = [toLatLng[0], toLatLng[1]];
  }

  // Densify
  const densified = [];
  for (let i = 0; i < path.length - 1; i++) {
    densified.push(path[i]);
    const d = haversine(path[i][0], path[i][1], path[i+1][0], path[i+1][1]);
    if (d > 25) {
      const segs = Math.ceil(d / 20);
      for (let s = 1; s < segs; s++) {
        const t = s / segs;
        densified.push([
          path[i][0] + (path[i+1][0]-path[i][0])*t,
          path[i][1] + (path[i+1][1]-path[i][1])*t
        ]);
      }
    }
  }
  densified.push(path[path.length - 1]);

  // Count mid-taxi violations
  let midTaxiCount = 0;
  for (const [lat, lng] of densified) {
    if (isMidTaxi(lat, lng) && !isInCarveOut(lat, lng)) midTaxiCount++;
  }

  const totalDist = gScore.get(bestEnd) ?? haversine(fromLatLng[0], fromLatLng[1], toLatLng[0], toLatLng[1]);

  return {
    latlngs: densified,
    dist: Math.round(totalDist),
    viaRoads: true,
    startSnap: fromSnap,
    endSnap: toSnap,
    midTaxiCount
  };
}

// ============================================================
// UI / MAP
// ============================================================

function t(key) {
  return I18N[currentLang][key] || key;
}

function initMap() {
  map = L.map('map', {
    center: [50.042, 8.57],
    zoom: 14,
    zoomControl: false,
    attributionControl: false
  });

  // Base layers
  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, subdomains: 'abc'
  });
  const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
  });
  const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, subdomains: 'abcd'
  });

  osmLayer.addTo(map);

  window.baseLayers = { 'OSM': osmLayer, 'Satellite': satLayer, 'Dark': darkLayer };

  // Draw road graph (subtle gray lines)
  drawRoadGraph();

  // Draw position markers
  drawPositionMarkers();

  // Draw zones if enabled
  if (showZones) drawZones();
  if (showBuildings) drawBuildings();

  updateUI();
}

function drawRoadGraph() {
  const { nodes, edges } = ROAD_GRAPH_DATA;
  for (const [i, j] of edges) {
    const [lat1, lng1] = nodes[i];
    const [lat2, lng2] = nodes[j];
    L.polyline([[lat1, lng1], [lat2, lng2]], {
      color: '#555555', weight: 1.5, opacity: 0.4
    }).addTo(map);
  }
}

function drawZones() {
  // Schengen zone (approximate polygons)
  const schengenPoly = L.polygon([
    [50.0495, 8.5680], [50.0495, 8.5750], [50.0480, 8.5750], [50.0480, 8.5680]
  ], { color: '#00c2e0', weight: 1, fillColor: '#00c2e0', fillOpacity: 0.08 })
    .bindPopup('Schengen A/B');
  zoneLayers.push(schengenPoly);
  schengenPoly.addTo(map);

  const schengenC = L.polygon([
    [50.0498, 8.5740], [50.0498, 8.5820], [50.0485, 8.5820], [50.0485, 8.5740]
  ], { color: '#00c2e0', weight: 1, fillColor: '#00c2e0', fillOpacity: 0.08 })
    .bindPopup('Schengen C');
  zoneLayers.push(schengenC);
  schengenC.addTo(map);

  const nonSchengen = L.polygon([
    [50.0490, 8.5860], [50.0490, 8.5930], [50.0475, 8.5930], [50.0475, 8.5860]
  ], { color: '#ff6b6b', weight: 1, fillColor: '#ff6b6b', fillOpacity: 0.08 })
    .bindPopup('Non-Schengen D/E');
  zoneLayers.push(nonSchengen);
  nonSchengen.addTo(map);

  const t3Zone = L.polygon([
    [50.0330, 8.5750], [50.0330, 8.5920], [50.0280, 8.5920], [50.0280, 8.5750]
  ], { color: '#ffd93d', weight: 1, fillColor: '#ffd93d', fillOpacity: 0.08 })
    .bindPopup('T3 G/H/J');
  zoneLayers.push(t3Zone);
  t3Zone.addTo(map);

  const cargoZone = L.polygon([
    [50.0430, 8.5400], [50.0430, 8.5650], [50.0390, 8.5650], [50.0390, 8.5400]
  ], { color: '#95e1d3', weight: 1, fillColor: '#95e1d3', fillOpacity: 0.08 })
    .bindPopup('Cargo F');
  zoneLayers.push(cargoZone);
  cargoZone.addTo(map);
}

function drawBuildings() {
  const buildings = [
    { name: 'T1 A/B/C', lat: 50.0490, lng: 8.5750 },
    { name: 'T2 D/E', lat: 50.0490, lng: 8.5890 },
    { name: 'T3 G/H/J', lat: 50.0310, lng: 8.5830 },
    { name: 'Cargo City', lat: 50.0410, lng: 8.5480 },
    { name: 'Tower', lat: 50.0375, lng: 8.5600 },
    { name: 'FRACenter', lat: 50.0520, lng: 8.5700 },
    { name: 'ASO', lat: 50.0480, lng: 8.5720 },
    { name: 'AUEW', lat: 50.0475, lng: 8.5780 },
    { name: 'BSO', lat: 50.0485, lng: 8.5880 },
    { name: 'BNS', lat: 50.0480, lng: 8.5910 },
  ];

  for (const b of buildings) {
    const marker = L.marker([b.lat, b.lng], {
      icon: L.divIcon({
        className: 'building-label',
        html: `<span style="background:rgba(0,0,0,0.7);color:#fff;padding:2px 6px;border-radius:3px;font-size:10px;white-space:nowrap;">${b.name}</span>`,
        iconSize: [80, 16],
        iconAnchor: [40, 8]
      })
    }).addTo(map);
    buildingLayers.push(marker);
  }
}

function clearRoute() {
  if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
  if (routeOutline) { map.removeLayer(routeOutline); routeOutline = null; }
  if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
  if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
}

function drawRoute(route, destMeta) {
  clearRoute();

  if (!route || route.latlngs.length < 2) {
    document.getElementById('route-info').textContent = t('noRoute');
    return;
  }

  // Outline
  routeOutline = L.polyline(route.latlngs, {
    color: '#003344', weight: 8, opacity: 0.8
  }).addTo(map);

  // Main cyan line
  routeLine = L.polyline(route.latlngs, {
    color: '#00c2e0', weight: 5, opacity: 0.95
  }).addTo(map);

  // Start marker (blue)
  startMarker = L.circleMarker(route.latlngs[0], {
    radius: 8, color: '#0066ff', fillColor: '#0066ff', fillOpacity: 1, weight: 2
  }).addTo(map);

  // Dest marker (red)
  destMarker = L.circleMarker(route.latlngs[route.latlngs.length - 1], {
    radius: 8, color: '#ff3333', fillColor: '#ff3333', fillOpacity: 1, weight: 2
  }).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

  // Info
  const distKm = route.dist >= 1000 ? (route.dist / 1000).toFixed(1) + ' ' + t('kilometers') : route.dist + ' ' + t('meters');
  const approx = route.viaRoads ? t('routeViaRoads') : t('routeApprox');
  document.getElementById('route-info').innerHTML = `${t('distance')}: <strong>${distKm}</strong> ${approx}`;
}

function selectTarget(idOrMeta) {
  let pos;
  if (typeof idOrMeta === 'string') {
    pos = POSITIONS.find(p => p.id === idOrMeta);
  } else {
    pos = idOrMeta;
  }
  if (!pos) return;

  targetPos = [pos.lat, pos.lng];

  // Offset gate coords toward apron (south ~30-50m) for routing target
  let routeTarget = [pos.lat, pos.lng];
  if (pos.cat === 'terminal') {
    routeTarget = [pos.lat - 0.00035, pos.lng]; // ~40m south toward apron
  }

  if (currentPos) {
    const route = computeRoute(currentPos, routeTarget, pos);
    drawRoute(route, pos);
  }

  // Update search input
  document.getElementById('search-input').value = pos.id;
  closeSearchDropdown();
}

// ============================================================
// GPS / DEMO
// ============================================================

function startGPS() {
  stopDemo();
  if (!navigator.geolocation) {
    updateGPSStatus('off');
    return;
  }
  gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      currentPos = [pos.coords.latitude, pos.coords.longitude];
      updateGPSStatus('on');
      if (targetPos) {
        const p = POSITIONS.find(p => p.lat === targetPos[0] && p.lng === targetPos[1]);
        selectTarget(p || targetPos);
      }
    },
    (err) => {
      console.error('GPS error:', err);
      updateGPSStatus('off');
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
}

function stopGPS() {
  if (gpsWatchId) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
}

function startDemo() {
  stopGPS();
  demoIndex = 0;
  currentPos = DEMO_TRACK[0];
  updateGPSStatus('demo');

  demoInterval = setInterval(() => {
    demoIndex++;
    if (demoIndex >= DEMO_TRACK.length) demoIndex = 0;
    currentPos = DEMO_TRACK[demoIndex];

    // Update start marker if route exists
    if (startMarker && routeLine) {
      startMarker.setLatLng(currentPos);
    }

    if (targetPos) {
      const p = POSITIONS.find(p => Math.abs(p.lat - targetPos[0]) < 0.0001 && Math.abs(p.lng - targetPos[1]) < 0.0001);
      selectTarget(p || { lat: targetPos[0], lng: targetPos[1], cat: 'terminal' });
    }
  }, 800);
}

function stopDemo() {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
  }
}

function updateGPSStatus(status) {
  const el = document.getElementById('gps-status');
  if (status === 'on') {
    el.textContent = t('gpsOn');
    el.className = 'gps-status gps-on';
  } else if (status === 'demo') {
    el.textContent = t('gpsDemo');
    el.className = 'gps-status gps-demo';
  } else {
    el.textContent = t('gpsOff');
    el.className = 'gps-status gps-off';
  }
}

// ============================================================
// SEARCH
// ============================================================

function initSearch() {
  const input = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');

  input.addEventListener('input', (e) => {
    const val = e.target.value.toUpperCase().trim();
    if (val.length < 1) {
      closeSearchDropdown();
      return;
    }
    const matches = POSITIONS.filter(p =>
      p.id.toUpperCase().includes(val) ||
      p.desc.toUpperCase().includes(val)
    ).slice(0, 15);

    dropdown.innerHTML = '';
    if (matches.length === 0) {
      dropdown.innerHTML = '<div class="search-item" style="color:#888;padding:10px;">No results</div>';
    } else {
      for (const m of matches) {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `<strong>${m.id}</strong> <span style="color:#888;font-size:12px;">${m.desc}</span>`;
        div.onclick = () => selectTarget(m);
        dropdown.appendChild(div);
      }
    }
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      closeSearchDropdown();
    }
  });
}

function closeSearchDropdown() {
  document.getElementById('search-dropdown').style.display = 'none';
}

// ============================================================
// SETTINGS
// ============================================================

function toggleSettings() {
  const panel = document.getElementById('settings-panel');
  panel.classList.toggle('open');
}

function closeSettings() {
  document.getElementById('settings-panel').classList.remove('open');
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('fra-lang', lang);
  updateUI();
}

function setBasemap(name) {
  const layers = window.baseLayers;
  for (const key in layers) {
    if (key === name) {
      map.addLayer(layers[key]);
    } else {
      map.removeLayer(layers[key]);
    }
  }
}

function toggleZones(checked) {
  showZones = checked;
  localStorage.setItem('fra-zones', checked);
  if (checked) {
    drawZones();
  } else {
    for (const l of zoneLayers) map.removeLayer(l);
    zoneLayers = [];
  }
}

function toggleBuildings(checked) {
  showBuildings = checked;
  localStorage.setItem('fra-buildings', checked);
  if (checked) {
    drawBuildings();
  } else {
    for (const l of buildingLayers) map.removeLayer(l);
    buildingLayers = [];
  }
}

function updateUI() {
  document.getElementById('app-title').textContent = t('title');
  document.getElementById('app-subtitle').textContent = t('subtitle');
  document.getElementById('search-input').placeholder = t('searchPlaceholder');
  document.getElementById('settings-title').textContent = t('settings');
  document.getElementById('label-lang').textContent = t('language');
  document.getElementById('label-basemap').textContent = t('basemap');
  document.getElementById('label-zones').textContent = t('showZones');
  document.getElementById('label-buildings').textContent = t('showBuildings');
  document.getElementById('btn-close-settings').textContent = t('close');

  const gpsEl = document.getElementById('gps-status');
  if (gpsEl.textContent.includes('Aus') || gpsEl.textContent.includes('Off')) {
    gpsEl.textContent = t('gpsOff');
  } else if (gpsEl.textContent.includes('Demo')) {
    gpsEl.textContent = t('gpsDemo');
  } else {
    gpsEl.textContent = t('gpsOn');
  }
}

// ============================================================
// ZOOM
// ============================================================

function zoomIn() {
  map.zoomIn();
}

function zoomOut() {
  map.zoomOut();
}

function centerMap() {
  if (currentPos) {
    map.setView(currentPos, 16);
  } else {
    map.setView([50.042, 8.57], 14);
  }
}


// ============================================================
// POSITION MARKERS
// ============================================================
let positionMarkers = [];
let positionMarkersVisible = true;

const CAT_COLORS = {
  terminal: '#00c2e0',
  cargo: '#95e1d3',
  'vorfeld-n': '#ffd93d',
  'vorfeld-s': '#ff9f43',
  ga: '#a8e6cf',
  landmark: '#ff6b6b'
};

const CAT_LABELS = {
  terminal: 'Terminal',
  cargo: 'Cargo',
  'vorfeld-n': 'Vorfeld N',
  'vorfeld-s': 'Vorfeld S',
  ga: 'GA',
  landmark: 'Landmark'
};

function drawPositionMarkers() {
  // Clear existing
  for (const m of positionMarkers) map.removeLayer(m);
  positionMarkers = [];

  for (const pos of POSITIONS) {
    const color = CAT_COLORS[pos.cat] || '#888';

    // Small circle marker
    const marker = L.circleMarker([pos.lat, pos.lng], {
      radius: pos.cat === 'landmark' ? 7 : 5,
      color: color,
      fillColor: color,
      fillOpacity: 0.85,
      weight: 1.5,
      opacity: 1
    }).addTo(map);

    // Popup with info
    const popupContent = `
      <div style="font-family:sans-serif;font-size:13px;">
        <strong style="font-size:15px;color:${color};">${pos.id}</strong><br>
        <span style="color:#888;font-size:11px;">${pos.desc}</span><br>
        <span style="color:#666;font-size:10px;">${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}</span><br>
        <button onclick="selectTarget('${pos.id}')" style="margin-top:6px;padding:4px 10px;background:#00c2e0;border:none;border-radius:4px;color:#000;font-weight:600;font-size:11px;cursor:pointer;">Route →</button>
      </div>
    `;
    marker.bindPopup(popupContent);

    // Tooltip (label) - only show for landmarks and some key gates at zoom >= 15
    if (pos.cat === 'landmark' || pos.id.match(/^[A-C]\d+$/)) {
      marker.bindTooltip(pos.id, {
        permanent: false,
        direction: 'top',
        offset: [0, -8],
        className: 'pos-tooltip'
      });
    }

    // Click to route
    marker.on('click', () => {
      selectTarget(pos.id);
    });

    positionMarkers.push(marker);
  }
}

function togglePositionMarkers(visible) {
  positionMarkersVisible = visible;
  for (const m of positionMarkers) {
    if (visible) {
      map.addLayer(m);
    } else {
      map.removeLayer(m);
    }
  }
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initSearch();

  // Set initial GPS to demo hotspot
  currentPos = [50.0458, 8.5800];
  updateGPSStatus('off');

  // Load saved settings
  document.getElementById('check-zones').checked = showZones;
  document.getElementById('check-buildings').checked = showBuildings;

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.error('SW registration failed:', err));
  }
});
