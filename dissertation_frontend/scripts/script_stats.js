async function loadChartData() {
    const response = await fetch('statistics.json');
    const jsonData = await response.json();

    const mathSC = jsonData[0];
    const scieSC = jsonData[1];
    const scieAS = jsonData[2];
    const mathsAS = jsonData[3];
    const scieEC = jsonData[4];
    const mathEC = jsonData[5];

    createChart(scieSC, 'scieSCChart', '#4fe8e9', '#FF90BC', 'Mean Self Control Score', 'Mean PV1SCIE Score', 'SCScie', 'Science');
    createChart(mathSC, 'mathsSCChart', '#4fe8e9', '#FF90BC', 'Mean Self Control Score', 'Mean PV1MATH Score', 'SCMaths', 'Maths');
    createChart(scieAS, 'scieASChart', '#4fe8e9', '#FF90BC', 'Mean Assertiveness Score', 'Mean PV1SCIE Score', 'ASScie', 'Science');
    createChart(mathsAS, 'mathsASChart', '#4fe8e9', '#FF90BC', 'Mean Assertiveness Score', 'Mean PV1MATH Score', 'ASMaths', 'Maths');
    createChart(scieEC, 'scieECChart', '#4fe8e9', '#FF90BC', 'Mean Emotional Control Score', 'Mean PV1SCIE Score', 'ECScie', 'Science');
    createChart(mathEC, 'mathsECChart', '#4fe8e9', '#FF90BC', 'Mean Emotional Control Score', 'Mean PV1MATH Score', 'ECMaths', 'Maths');
}

function createChart(data, canvasId, pointColor, lineColor, xAxisLabel, yAxisLabel, category, subject) {
    let scatterData = [];

    if (category == "SCScie") {
        scatterData = data.map(item => ({
            x: item.meanTotalSC,
            y: item.mean_PV1SCIE,
            country: item.Country
        }));
    } else if(category == "SCMaths") {
        scatterData = data.map(item => ({
            x: item.meanTotalSC,
            y: item.mean_PV1MATH,
            country: item.Country
        }));
    } else if(category == "ASScie") {
        scatterData = data.map(item => ({
            x: item.meanTotalAS,
            y: item.mean_PV1SCIE,
            country: item.Country
        }));
    } else if (category == "ASMaths") {
        scatterData = data.map(item => ({
            x: item.meanTotalAS,
            y: item.mean_PV1MATH,
            country: item.Country
        }));
    } else if(category == "ECScie") {
        scatterData = data.map(item => ({
            x: item.meanTotalEC,
            y: item.mean_PV1SCIE,
            country: item.Country
        }));
    }else if(category == "ECMaths") {
        scatterData = data.map(item => ({
            x: item.meanTotalEC,
            y: item.mean_PV1MATH,
            country: item.Country
        }));
    }

    console.log(scatterData)

    function calculateRegressionLine(data) {
        const n = data.length;
        const sumX = data.reduce((sum, point) => sum + point.x, 0);
        const sumY = data.reduce((sum, point) => sum + point.y, 0);
        const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
        const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    const regression = calculateRegressionLine(scatterData);

    const ctx = document.getElementById(canvasId).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: `Mean Total Self Control vs Mean PV1 ${subject}`,
                data: scatterData,
                backgroundColor: pointColor,
                borderColor: pointColor,
                showLine: false,
                pointRadius: 5,
            }, {
                label: 'Regression Line',
                data: [],
                type: 'line',
                fill: false,
                backgroundColor: lineColor,
                borderColor: lineColor,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 10,
                    title: {
                        display: true,
                        text: xAxisLabel
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                }
            },
            animation: {
                onProgress: function(animation) {
                    const chartInstance = animation.chart;
                    const dataset = chartInstance.data.datasets[1];
                    const progress = animation.currentStep / animation.numSteps;

                    const maxX = Math.max(...scatterData.map(d => d.x));
                    const currentX = progress * maxX;
                    const currentY = regression.slope * currentX + regression.intercept;

                    dataset.data = [
                        { x: 0, y: regression.slope * 0 + regression.intercept },
                        { x: currentX, y: currentY }
                    ];
                    chartInstance.update('none');
                },
                duration: 2000,
                easing: 'linear'
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            if (context.dataset.label === 'Regression Line') {
                                return `Regression: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                            }
                            return `Country: ${point.country}, X: ${point.x}, Y: ${point.y}`;
                        }
                    }
                }
            }
        }
    });
}

loadChartData();