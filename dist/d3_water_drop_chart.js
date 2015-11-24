(function() {
  'use strict';
  var generateMarkup = function(container, data, width, height) {
    var markupContainer        = document.querySelector(container),
        legendsContainer = document.createElement("div"),
        legendsList      = document.createElement("ul"),
        waterDrop        = document.createElement("div"),
        chart            = document.createElement("div");

    chart.setAttribute('class', 'gallery');
    chart.setAttribute('id', 'chart');
    chart.setAttribute('style', 'height:' + height + 'px; width:' + width + 'px');
    markupContainer.appendChild(chart);

    setTimeout(function(){
      waterDrop.setAttribute('id', 'water-drop');
      waterDrop.setAttribute('style', 'background-size:' + (parseInt(width)-10) + 'px ' + (parseInt(height)-10) + 'px');
      chart.appendChild(waterDrop);
    }, 1);

    legendsList.setAttribute('class', 'water-drop-legend-container');

    for(var i = 0; i < data.length; i++){

      var legend, legendContainerWrapper, legendContainer, percentContainer, percentNumberContainer;

      legend = document.createElement("li");
      legend.setAttribute('class', 'legend legend-' + i);
      legendContainerWrapper = document.createElement("div");
      legendContainer = document.createElement("span");
      percentContainer = document.createElement("span");
      percentNumberContainer = document.createElement("span");
      legendContainerWrapper.appendChild(legendContainer);
      percentNumberContainer.appendChild(document.createTextNode(parseInt(data[i][0].y * 100) + "% "));
      percentContainer.appendChild(document.createTextNode(data[i][0].label));
      legendContainer.appendChild(percentNumberContainer);
      legendContainer.appendChild(percentContainer);
      legendContainerWrapper.setAttribute('style', 'width:' + (parseInt(width/2)) + 'px ');
      legend.appendChild(legendContainerWrapper);
      legendsList.appendChild(legend);
    }

    chart.appendChild(legendsList);
  };

  window.startWaterDropChart = function(container, data, config) {
    var m = 1 // number of samples per layer

    generateMarkup(container, data, config.width, config.height);

    var p   = 20,
        w   = config.width,
        h   = config.height - 0.5 - p,
        mx  = m,
        my  = d3.max(data, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      }),
      x = function(d) {
        return d.x * w / mx;
      },
      y0 = function(d) {
        return h - d.y0 * h / my;
      },
      y1 = function(d) {
        return h - (d.y + d.y0) * h / my;
      };

    var vis = d3.select("#chart")
      .append("svg:svg")
      .attr("width", w)
      .attr("height", h + p);

    var layers = vis.selectAll("g.layer")
      .data(data)
      .enter().append("svg:g")
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .style("fill", function(d) {
        return d[0].color;
      })
      .attr("class", function(d, i) {
        return "layer " + "layer-" + i;
      });

    var bars = layers.selectAll("g.bar")
      .data(function(d) {
        return d;
      })
      .enter()
      .append("svg:g")
      .attr("class", "bar")
      .attr("transform", function(d) {
        return "translate(" + x(d) + ",0)";
      })
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(250)
          .style("fill", config.mouseoverColor);
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .transition()
          .duration(250)
          .style("fill", d.color);
      });

    bars.append("svg:rect")
      .attr("width", x({
        x: 0.9
      }))
      .attr("x", 0)
      .attr("y", h)
      .attr("height", 0)
      .transition()
      .attr("y", y1)
      .attr("height", function(d) {
        return y0(d) - y1(d);
      })
      .each("end", function() {
        var items = document.querySelectorAll('.layer .bar rect');
        var height = 0.0;
        for (var i = items.length; i > 0; i--) {
          var idx = i - 1;
          document.querySelector('.legend-' + idx).setAttribute('style', 'top:' + (parseFloat(items[idx].getBoundingClientRect().top) + parseFloat(items[idx].getAttribute('height')) / 2) + 'px;');
        }
      });
  };
})();