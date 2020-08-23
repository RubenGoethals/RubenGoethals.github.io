// data which need to be fetched
let name = "Air Quality";
let value = 34;
let gaugeMaxValue = 200;
let percentValue = value / gaugeMaxValue;
let needleClient;
let needle;
let dataset = [{
  metric: name,
  value: value
}];

let barWidth, chart, chartInset, height, margin,
  numSections, padRad, percent, texts, trX, trY,
  radius, sectionIndx, svg, totalPercent, width;

let centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;

//Utility methods
let percToDeg = (perc) => {
  return perc * 360;
};

let percToRad = (perc) => {
  return degToRad(percToDeg(perc));
};

let degToRad = (deg) => {
  return deg * Math.PI / 180;
};

function displayValue() {
  texts.append("text").text(function() {
      return dataset[0].value;
    })
    .attr('id', "Value")
    .attr('transform', "translate(" + trX + ", " + trY + ")")
    .attr("font-size", 18)
    .style("fill", '#000000')
    .style("font-weight", 700);
}

let repaintGauge = () => {
  perc = 0.5;
  let next_start = totalPercent;
  arcStartRad = percToRad(next_start);
  arcEndRad = arcStartRad + percToRad(perc / 4);
  next_start += perc / 4;


  arc1.startAngle(arcStartRad).endAngle(arcEndRad);

  arcStartRad = percToRad(next_start);
  arcEndRad = arcStartRad + percToRad(perc / 4);
  next_start += perc / 4;

  arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad);

  arcStartRad = percToRad(next_start);
  arcEndRad = arcStartRad + percToRad(perc / 4);
  next_start += perc / 4;

  arc3.startAngle(arcStartRad + padRad).endAngle(arcEndRad);

  arcStartRad = percToRad(next_start);
  arcEndRad = arcStartRad + percToRad(perc / 4);

  arc4.startAngle(arcStartRad + padRad).endAngle(arcEndRad);

  chart.select(".chart-first").attr('d', arc1);
  chart.select(".chart-second").attr('d', arc2);
  chart.select(".chart-third").attr('d', arc3);
  chart.select(".chart-fourth").attr('d', arc4);
};

let Needle = (() => {
  //Helper function that returns the `d` value for moving the needle
  function recalcPointerPos(perc) {
    thetaRad = percToRad(perc / 2);
    centerX = 0;
    centerY = 0;
    topX = centerX - this.len * Math.cos(thetaRad);
    topY = centerY - this.len * Math.sin(thetaRad);
    leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
    leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
    rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
    rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);

    return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
  };

  function Needle(el) {
    this.el = el;
    this.len = width / 2.5;
    this.radius = this.len / 8;
  }

  Needle.prototype.render = function() {
    this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);

    return this.el.append('path').attr('class', 'needle').attr('id', 'client-needle').attr('d', recalcPointerPos.call(this, 0));

  };

  Needle.prototype.moveTo = function(perc) {
    let self, oldValue = this.perc || 0;
    self = this;
    this.perc = perc;
    self = this;

    // Reset pointer position
    if (oldValue == this.perc) {
      this.el.transition().delay(100).ease('quad').duration(200).select('.needle').tween('reset-progress', function() {
        return function(percentOfPercent) {
          let progress = (1 - percentOfPercent) * oldValue;

          repaintGauge(progress);
          return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
        };
      });
    }

    this.el.transition().delay(300).ease('bounce').duration(1500).select('.needle').tween('progress', function() {
      return function(percentOfPercent) {
        let progress = percentOfPercent * perc;

        repaintGauge(progress);
        return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
      };
    });

  };

  return Needle;
})();

function init() {
  percent = percentValue;

  numSections = 1;
  sectionPerc = 1 / numSections / 2;
  padRad = 0;
  chartInset = 10;

  // Orientation of gauge:
  totalPercent = .75;

  el = d3.select('.js-chart-gauge');

  margin = {
    top: 30,
    right: 30,
    bottom: 40,
    left: 30
  };

  width = (el[0][0].offsetWidth / 1.1) - margin.left - margin.right;
  height = width;
  radius = Math.min(width, height) / 2;
  barWidth = 40 * width / 300;

  // Create SVG element
  svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', (height / 2) + margin.top + margin.bottom);

  // Add layer for the panel
  chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left + margin.right) / 2) + ", " + (((height / 1.10) + margin.top + margin.bottom) / 2) + ")");


  chart.append('path').attr('class', "arc chart-first");
  chart.append('path').attr('class', "arc chart-second");
  chart.append('path').attr('class', "arc chart-third");
  chart.append('path').attr('class', "arc chart-fourth");

  arc4 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);
  arc3 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);
  arc2 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);
  arc1 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);

  texts = svg.selectAll("text").data(dataset).enter();

  texts.append("text").text(function() {
      return dataset[0].metric;
    })
    .attr('id', "Name")
    .attr('transform', "translate(" + (width / 2.4) + ", " + (height / 1.4) + ")")
    .attr("font-size", 24)
    .attr("font-weight", 700)
    .style("fill", "#000000");

  //trX = 180 - 210 * Math.cos(percToRad(percent / 2));
  //trY = 195 - 210 * Math.sin(percToRad(percent / 2));
  // (180, 195) are the coordinates of the center of the gauge.

  texts.append("text")
    .text(function() {
      return 0;
    })
    .attr('id', 'scale0')
    .attr('transform', "translate(" + ((width + margin.left) / 14) + ", " + ((height + margin.top) / 1.8) + ")")
    .attr("font-size", 15)
    .style("fill", "#000000");

  // texts.append("text")
  //   .text(function() {
  //     return gaugeMaxValue / 2;
  //   })
  //   .attr('id', 'scale10')
  //   .attr('transform', "translate(" + ((width + margin.left) / 1.98) + ", " + ((height + margin.top) / 10) + ")")
  //   .attr("font-size", 15)
  //   .style("fill", "#000000");


  texts.append("text")
    .text(function() {
      return gaugeMaxValue;
    })
    .attr('id', 'scale20')
    .attr('transform', "translate(" + ((width + margin.left)) + ", " + ((height + margin.top) / 1.8) + ")")
    .attr("font-size", 15)
    .style("fill", "#000000");
}

let showResultGauge = (airquality) => {
  value = airquality;
  percentValue = value / gaugeMaxValue;
  needle.moveTo(percentValue);
  trX = 160 - 145 * Math.cos(percToRad(percentValue / 2));
  trY = 160 - 140 * Math.sin(percToRad(percentValue / 2));
  dataset[0].value = value;
  setTimeout(displayValue, 1350);
};

document.addEventListener('DOMContentLoaded', function() {
  // Function that finds your current location
  init();
  needle = new Needle(chart);
  needle.render();
});
