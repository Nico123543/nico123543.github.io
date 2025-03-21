document.addEventListener("DOMContentLoaded", async function () {
    const apiUrl = "http://70.34.210.155:3490/biological/profit";
    const colors = {
        yield_booster: "#ff6b6b",  // Soft red
        stress_buster: "#ffa94d"   // Soft orange
    };

    const maxPercentage = 30;
    const maxBarHeight = 200;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        renderChart(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }

    function renderChart(data) {
        if (!data) {
            console.warn("No data available.");
            return;
        }

        const successContainer = document.getElementById("success-container");
        successContainer.innerHTML = `
            <div class="chart-container"></div>
            <div class="caption">Performance of Biological Products in Different Crops</div>
        `;

        const chartContainer = successContainer.querySelector(".chart-container");

        Object.keys(data).forEach((key) => {
            const totalValue = data[key].yield_booster + data[key].stress_buster;
            const normalizedHeight = (totalValue / maxPercentage) * maxBarHeight;

            const barWrapper = document.createElement("div");
            barWrapper.className = "bar-wrapper";

            const bar = document.createElement("div");
            bar.className = "bar";
            bar.style.height = "0px";

            Object.entries(data[key]).forEach(([subKey, subValue]) => {
                if (subValue > 0) {
                    const segment = document.createElement("div");
                    segment.className = "bar-segment";
                    segment.style.height = `${(subValue / totalValue) * normalizedHeight}px`;
                    segment.style.backgroundColor = colors[subKey];
                    bar.appendChild(segment);
                }
            });

            const value = document.createElement("div");
            value.className = "value";
            value.innerText = `${totalValue}%`;

            const label = document.createElement("div");
            label.className = "label";
            label.innerText = key;

            barWrapper.appendChild(bar);
            barWrapper.appendChild(value);
            barWrapper.appendChild(label);
            chartContainer.appendChild(barWrapper);

            setTimeout(() => {
                bar.style.height = `${normalizedHeight}px`;
            }, 100);
        });
    }
});
