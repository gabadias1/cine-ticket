const { hallTemplates, cinemaConfigurations } = require('../config/hallTemplates');

class HallManager {
  static assignHallToMovie(movie, cinema) {
    const cityConfig = cinemaConfigurations[cinema.city];
    if (!cityConfig) {
      throw new Error(`Configuração não encontrada para a cidade: ${cinema.city}`);
    }

    let appropriateTemplate;
    
    if (movie.genre.includes('Ação') || movie.genre.includes('Aventura')) {
      appropriateTemplate = hallTemplates.find(t => 
        cityConfig.availableTemplates.includes(t.name) &&
        (t.type === 'IMAX' || t.type === 'STADIUM')
      );
    }
    
    else if (movie.genre.includes('Animação') || movie.rating === 'L') {
      appropriateTemplate = hallTemplates.find(t => 
        cityConfig.availableTemplates.includes(t.name) &&
        t.type === 'Standard 3D RJ'
      );
    }
    
    else if (movie.isHighProfile) {
      appropriateTemplate = hallTemplates.find(t => 
        cityConfig.availableTemplates.includes(t.name) &&
        t.type === 'VIP'
      );
    }
    
    if (!appropriateTemplate) {
      appropriateTemplate = hallTemplates.find(t => 
        cityConfig.availableTemplates.includes(t.name)
      );
    }

    const hallLayout = this.generateHallLayout(appropriateTemplate.layout);

    return {
      template: appropriateTemplate,
      layout: hallLayout,
      features: [...appropriateTemplate.features, ...cityConfig.defaultFeatures]
    };
  }

  static generateHallLayout(layoutConfig) {
    const layout = [];
    const { rowSpacing, seatSpacing, aisles, specialRows, curveAngle } = layoutConfig;

    for (let row = 0; row < layoutConfig.rowCount; row++) {
      const rowSeats = [];
      const rowLetter = String.fromCharCode(65 + row); 
      
      for (let seat = 0; seat < layoutConfig.seatsPerRow; seat++) {
        if (aisles.includes(seat)) {
          rowSeats.push(null); 
          continue;
        }

        let seatType = 'STANDARD';
        if (specialRows[rowLetter]) {
          if (specialRows[rowLetter].wholeRow) {
            seatType = specialRows[rowLetter].type;
          } else if (specialRows[rowLetter].positions.includes(seat)) {
            seatType = specialRows[rowLetter].type;
          }
        }

        const angle = (seat - layoutConfig.seatsPerRow / 2) * (curveAngle / layoutConfig.seatsPerRow);
        const x = seat * seatSpacing * Math.cos(angle * Math.PI / 180);
        const y = row * rowSpacing + (seat * seatSpacing * Math.sin(angle * Math.PI / 180));

        rowSeats.push({
          row: rowLetter,
          number: seat + 1,
          type: seatType,
          position: { x, y },
          isAccessible: seatType === 'WHEELCHAIR',
          isLoveseat: seatType === 'LOVESEAT'
        });
      }
      
      layout.push(rowSeats);
    }

    return layout;
  }
}

module.exports = HallManager;