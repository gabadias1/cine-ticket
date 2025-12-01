const HallManager = require('../../src/utils/HallManager');

describe('HallManager', () => {
    describe('assignHallToMovie', () => {
        it('should assign IMAX template for Action movies in SP', () => {
            const movie = { genre: ['Ação'] };
            const cinema = { city: 'São Paulo' };

            const result = HallManager.assignHallToMovie(movie, cinema);

            expect(result.template.type).toBe('IMAX');
            expect(result.features).toContain('Tela IMAX de 300m²');
        });

        it('should assign Standard 3D template for Animation movies in RJ', () => {
            const movie = { genre: ['Animação'] };
            const cinema = { city: 'Rio de Janeiro' };

            const result = HallManager.assignHallToMovie(movie, cinema);

            expect(result.template.type).toBe('3D');
        });

        it('should assign VIP template for High Profile movies', () => {
            const movie = { genre: ['Drama'], isHighProfile: true };
            const cinema = { city: 'Curitiba' };

            const result = HallManager.assignHallToMovie(movie, cinema);

            expect(result.template.type).toBe('VIP');
        });

        it('should fallback to default template if no specific match', () => {
            const movie = { genre: ['Drama'] };
            const cinema = { city: 'Belo Horizonte' };

            const result = HallManager.assignHallToMovie(movie, cinema);

            expect(result.template.name).toBe('Standard 3D RJ');
        });

        it('should throw error for unknown city', () => {
            const movie = { genre: ['Ação'] };
            const cinema = { city: 'Unknown City' };

            expect(() => HallManager.assignHallToMovie(movie, cinema)).toThrow('Configuração não encontrada para a cidade: Unknown City');
        });
    });

    describe('generateHallLayout', () => {
        it('should generate layout correctly', () => {
            const layoutConfig = {
                rowCount: 2,
                seatsPerRow: 2,
                rowSpacing: 10,
                seatSpacing: 10,
                aisles: [],
                specialRows: {},
                curveAngle: 0
            };

            const layout = HallManager.generateHallLayout(layoutConfig);

            expect(layout).toHaveLength(2);
            expect(layout[0]).toHaveLength(2);
            expect(layout[0][0].row).toBe('A');
            expect(layout[0][0].number).toBe(1);
        });

        it('should handle aisles', () => {
            const layoutConfig = {
                rowCount: 1,
                seatsPerRow: 3,
                rowSpacing: 10,
                seatSpacing: 10,
                aisles: [1],
                specialRows: {},
                curveAngle: 0
            };

            const layout = HallManager.generateHallLayout(layoutConfig);

            expect(layout[0][1]).toBeNull();
        });

        it('should handle special rows', () => {
            const layoutConfig = {
                rowCount: 1,
                seatsPerRow: 1,
                rowSpacing: 10,
                seatSpacing: 10,
                aisles: [],
                specialRows: { 'A': { type: 'VIP', wholeRow: true } },
                curveAngle: 0
            };

            const layout = HallManager.generateHallLayout(layoutConfig);

            expect(layout[0][0].type).toBe('VIP');
        });
    });
});
