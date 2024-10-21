const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Lade das Bild
const chairImage = new Image();
chairImage.src = 'chair.webp'; // Pfad zum Bild

chairImage.onload = function() {
    startAnimation();
};

function startAnimation() {
    // Definiere das Muster des 'R'
    const pattern = [
        // Zeile 1: Obere Linie aus 21 'chair'-Zellen
        Array(21).fill(1),
        // Zeile 2: Erste 2 und letzte 2 Zellen 'chair', Rest 'empty'
        Array(21).fill(0).map((_, i) => ((i < 2 || i >= 19) ? 1 : 0)),
        // Zeile 3: Gleich wie Zeile 2
        Array(21).fill(0).map((_, i) => ((i < 2 || i >= 19) ? 1 : 0)),
        // Zeile 4: Mittlere Linie aus 21 'chair'-Zellen
        Array(21).fill(1),
        // Zeile 5: Erste 2 und Zellen 6 bis 10 'chair', Rest 'empty'
        Array(21).fill(0).map((_, i) => ((i < 2 || (i >= 5 && i <= 10)) ? 1 : 0)),
        // Zeile 6: Diagonale Linie
        Array(21).fill(0).map((_, i) => ((i < 2 || (i >= 11 && i <= 15)) ? 1 : 0)),
        // Zeile 7: Erste 2 und letzte 5 Zellen 'chair', Rest 'empty'
        Array(21).fill(0).map((_, i) => ((i < 2 || i >= 16) ? 1 : 0)),
    ];

    const cellWidth = 50; // Breite einer Zelle
    const cellHeight = 100; // Höhe einer Zelle

    const totalRows = pattern.length;
    const totalCols = pattern[0].length;

    // Speichert die Positionen und Bewegungsrichtungen der Zellen
    const cells = [];

    // Initialisiere die Zellen mit zufälligen Bewegungsrichtungen
    for (let row = 0; row < totalRows; row++) {
        cells[row] = [];
        for (let col = 0; col < totalCols; col++) {
            if (pattern[row][col] === 1) {
                cells[row][col] = {
                    xOffset: 0,
                    yOffset: 0,
                    xDirection: Math.random() * 0.5 - 0.25, // Bewegung zwischen -0.25 und 0.25
                    yDirection: Math.random() * 0.5 - 0.25
                };
            } else {
                cells[row][col] = null;
            }
        }
    }

    function animate() {
        // Canvas löschen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Setze globale Transparenz
        ctx.globalAlpha = 0.8; // 80% Sichtbarkeit

        // Durch jede Zelle im Muster iterieren
        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < totalCols; col++) {
                if (cells[row][col]) {
                    const cell = cells[row][col];

                    // Aktualisiere die Offsets
                    cell.xOffset += cell.xDirection;
                    cell.yOffset += cell.yDirection;

                    // Begrenze die Bewegung, sodass das 'R' sichtbar bleibt
                    const maxOffset = 5; // Maximale Verschiebung in Pixeln

                    if (cell.xOffset > maxOffset || cell.xOffset < -maxOffset) {
                        cell.xDirection *= -1; // Richtung umkehren
                    }
                    if (cell.yOffset > maxOffset || cell.yOffset < -maxOffset) {
                        cell.yDirection *= -1; // Richtung umkehren
                    }

                    const x = col * cellWidth + cell.xOffset;
                    const y = row * cellHeight + (canvas.height - totalRows * cellHeight) / 2 + cell.yOffset;

                    // Zeichne das Bild
                    ctx.drawImage(chairImage, x, y, cellWidth, cellHeight);
                }
            }
        }

        // Setze globale Transparenz zurück
        ctx.globalAlpha = 1.0;

        requestAnimationFrame(animate);
    }

    animate();
}
