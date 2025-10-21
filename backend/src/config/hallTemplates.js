const hallTemplates = [
  {
    name: "IMAX Premium SP",
    type: "IMAX",
    rowCount: 15,
    seatsPerRow: 20,
    features: [
      "Tela IMAX de 300m²",
      "Som Dolby Atmos",
      "Poltronas reclináveis premium",
      "Suporte para bebidas",
      "Carregadores USB"
    ],
    layout: {
      rowSpacing: 120, 
      seatSpacing: 75, 
      aisles: [5, 15], 
      specialRows: {
        "A": { type: "WHEELCHAIR", positions: [3, 4, 16, 17] },
        "B": { type: "LOVESEAT", positions: [7, 8, 9, 10, 11, 12] },
        "K": { type: "VIP", wholeRow: true }
      },
      curveAngle: 15
    }
  },
  {
    name: "Standard 3D RJ",
    type: "3D",
    rowCount: 12,
    seatsPerRow: 16,
    features: [
      "Projeção 3D Digital",
      "Som Surround 7.1",
      "Poltronas reclináveis",
      "Porta-copos"
    ],
    layout: {
      rowSpacing: 100,
      seatSpacing: 65,
      aisles: [8], 
      specialRows: {
        "A": { type: "WHEELCHAIR", positions: [7, 8, 9] },
        "F": { type: "LOVESEAT", positions: [3, 4, 13, 14] }
      },
      curveAngle: 10
    }
  },
  {
    name: "VIP Experience Curitiba",
    type: "VIP",
    rowCount: 8,
    seatsPerRow: 12,
    features: [
      "Serviço de comida no assento",
      "Poltronas super premium",
      "Menu gourmet exclusivo",
      "Carregadores wireless",
      "Manta e travesseiro",
      "Chamada de atendente"
    ],
    layout: {
      rowSpacing: 150, 
      seatSpacing: 90, 
      aisles: [6], 
      specialRows: {
        "A": { type: "WHEELCHAIR", positions: [5, 6, 7] },
        all: { type: "VIP", wholeRow: true } 
      },
      curveAngle: 5
    }
  },
  {
    name: "Mega Stadium BH",
    type: "STADIUM",
    rowCount: 20,
    seatsPerRow: 25,
    features: [
      "Tela gigante curva",
      "Som surround personalizado",
      "Poltronas escalonadas",
      "Visão perfeita de qualquer lugar"
    ],
    layout: {
      rowSpacing: 110,
      seatSpacing: 70,
      aisles: [8, 17], 
      specialRows: {
        "A": { type: "WHEELCHAIR", positions: [7, 8, 9, 16, 17, 18] },
        "B": { type: "LOVESEAT", positions: [4, 5, 12, 13, 20, 21] },
        "J": { type: "VIP", wholeRow: true },
        "K": { type: "VIP", wholeRow: true }
      },
      curveAngle: 20
    }
  }
];

const cinemaConfigurations = {
  "São Paulo": {
    availableTemplates: ["IMAX Premium SP", "VIP Experience Curitiba"],
    defaultFeatures: ["Bomboniere premium", "Estacionamento com manobrista"]
  },
  "Rio de Janeiro": {
    availableTemplates: ["Standard 3D RJ", "VIP Experience Curitiba"],
    defaultFeatures: ["Bomboniere", "Café gourmet"]
  },
  "Curitiba": {
    availableTemplates: ["VIP Experience Curitiba", "Standard 3D RJ"],
    defaultFeatures: ["Bomboniere premium", "Lounge exclusivo"]
  },
  "Belo Horizonte": {
    availableTemplates: ["Mega Stadium BH", "Standard 3D RJ"],
    defaultFeatures: ["Bomboniere", "Espaço kids"]
  }
};

module.exports = {
  hallTemplates,
  cinemaConfigurations
};