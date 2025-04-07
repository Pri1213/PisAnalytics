document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".sidebar a");
    const sections = document.querySelectorAll(".content");

    function navigate() {
        const hash = window.location.hash || "#dashboard";
        links.forEach(link => {
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
        sections.forEach(section => {
            if ("#" + section.id === hash) {
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        });
    }

    window.addEventListener("hashchange", navigate);
    navigate();

    const sideMenu = document.querySelector('aside');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');

    const darkMode = document.querySelector('.dark-mode');

    menuBtn.addEventListener('click', () => {
        sideMenu.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        sideMenu.style.display = 'none';
    });

    darkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode-variables');
        darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
        darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
    })

    async function loadChartData() {
        const response = await fetch('../statistics.json');
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

    am5.ready(function() {

        var root = am5.Root.new("chartdiv");
      
        root.setThemes([
          am5themes_Animated.new(root)
        ]);
      
        var chart = root.container.children.push(am5map.MapChart.new(root, {
          panX: "translateX",
          panY: "translateY",
          projection: am5map.geoMercator()
        }));
      
        var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata_worldLow,
          exclude: ["AQ"]
        }));
      
        polygonSeries.mapPolygons.template.setAll({
          tooltipText: "{name}",
          toggleKey: "active",
          interactive: true
        });
      
        polygonSeries.mapPolygons.template.states.create("hover", {
          fill: root.interfaceColors.get("primaryButtonHover")
        });
      
        polygonSeries.mapPolygons.template.states.create("active", {
          fill: root.interfaceColors.get("primaryButtonHover")
        });
      
        var previousPolygon;
      
        polygonSeries.mapPolygons.template.on("active", function (active, target) {
          if (previousPolygon && previousPolygon != target) {
            previousPolygon.set("active", false);
          }
          if (target.get("active")) {
            polygonSeries.zoomToDataItem(target.dataItem);
          } else {
            chart.goHome();
          }
          previousPolygon = target;
        });
      
        polygonSeries.mapPolygons.template.events.on("click", function(ev) {
          var countryName = ev.target.dataItem.dataContext.name;
      
          fetch('../pisa_scores.json')
            .then(response => response.json())
            .then(data2 => {
              let countryData2 = data2.find(country => country.country === countryName);
              if (countryData2) {
                var tooltipText = `${countryName}\nOverall PISA Score 2022: ${countryData2.OverallPisaScore2022}\n` +
                                  `Math Score 2022: ${countryData2.PISAScoresMathScore2022}\n` +
                                  `Science Score 2022: ${countryData2.PISAScoresScienceScore2022}\n` +
                                  `Reading Score 2022: ${countryData2.PISAScoresReadingScore2022}`;
      
                ev.target.set("tooltipText", tooltipText);
                ev.target.showTooltip();
              } else {
                ev.target.set("tooltipText", countryName);
                ev.target.showTooltip();
              }
            });
        });
      
        var zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
        zoomControl.homeButton.set("visible", true);
      
        chart.chartContainer.get("background").events.on("click", function() {
          chart.goHome();
        });
      
        chart.appear(1000, 100);
      
      });

      const tableBody = document.querySelector('.pisa-scores tbody');
      const showAllLink = document.querySelector('#show-all');
      let data = [];
      let currentIndex = 0;
      const rowsPerPage = 30;
  
      fetch('../pisa_scores.json')
          .then(response => response.json())
          .then(jsonData => {
              data = jsonData;
              loadRows();
          })
          .catch(error => {
              console.error('Error loading the JSON data:', error);
          });
  
      function loadRows() {
          const endIndex = Math.min(currentIndex + rowsPerPage, data.length);
          const rowsToLoad = data.slice(currentIndex, endIndex);
  
          rowsToLoad.forEach(item => {
              const row = document.createElement('tr');
  
              Object.keys(item).forEach(key => {
                  const cell = document.createElement('td');
                  cell.textContent = item[key];
                  row.appendChild(cell);
              });
  
              tableBody.appendChild(row);
          });
  
          currentIndex = endIndex;
  
          // Show "Show All" link only if there are more rows to load
          if (currentIndex < data.length) {
              showAllLink.style.display = 'block';
          } else {
              showAllLink.style.display = 'none';
          }
      }
  
      showAllLink.addEventListener('click', (event) => {
          event.preventDefault();
          loadRows();
      });
      
});
