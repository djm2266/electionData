// add your JavaScript/D3 to this file

Promise.all([
  fetch('republican_support.json').then(res => res.json()),
  fetch('democrat_support.json').then(res => res.json())
]).then(([republicanData, democratData]) => {
  const republicanValidData = republicanData.filter(d => d.RepublicanSupport !== undefined);
  republicanValidData.sort((a, b) => b.RepublicanSupport - a.RepublicanSupport);
  let republicanChartData = republicanValidData.slice(0, 5);

  createChart("#republican-chart", republicanChartData, "RepublicanSupport");

  window.addRepublicanBar = function () {
    if (republicanChartData.length < republicanValidData.length) {
      republicanChartData.push(republicanValidData[republicanChartData.length]);
      updateChart("#republican-chart", republicanChartData, "RepublicanSupport");
    }
  };

  window.removeRepublicanBar = function () {
    if (republicanChartData.length > 0) {
      republicanChartData.pop();
      updateChart("#republican-chart", republicanChartData, "RepublicanSupport");
    }
  };

  const democratValidData = democratData.filter(d => d.DemocratSupport !== undefined);
  democratValidData.sort((a, b) => b.DemocratSupport - a.DemocratSupport);
  let democratChartData = democratValidData.slice(0, 5);

  createChart("#democrat-chart", democratChartData, "DemocratSupport");

  window.addDemocratBar = function () {
    if (democratChartData.length < democratValidData.length) {
      democratChartData.push(democratValidData[democratChartData.length]);
      updateChart("#democrat-chart", democratChartData, "DemocratSupport");
    }
  };

  window.removeDemocratBar = function () {
    if (democratChartData.length > 0) {
      democratChartData.pop();
      updateChart("#democrat-chart", democratChartData, "DemocratSupport");
    }
  };
});

function createChart(svgId, data, valueKey) {
  const svg = d3.select(svgId);
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 50, right: 20, bottom: 50, left: 70 };

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.state_po))
    .range([0, width - margin.left - margin.right])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[valueKey])])
    .range([height - margin.top - margin.bottom, 0]);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  chartGroup.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  chartGroup.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  chartGroup.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.state_po))
    .attr("y", d => yScale(d[valueKey]))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.top - margin.bottom - yScale(d[valueKey]));
}

function updateChart(svgId, data, valueKey) {
  const svg = d3.select(svgId);
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 50, right: 20, bottom: 50, left: 70 };

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.state_po))
    .range([0, width - margin.left - margin.right])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[valueKey])])
    .range([height - margin.top - margin.bottom, 0]);

  const chartGroup = svg.select("g");

  chartGroup.select(".x-axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(xScale));

  chartGroup.select(".y-axis")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(yScale));

  const bars = chartGroup.selectAll(".bar")
    .data(data);

  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.state_po))
    .attr("y", yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .merge(bars)
    .transition()
    .duration(1000)
    .attr("x", d => xScale(d.state_po))
    .attr("y", d => yScale(d[valueKey]))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.top - margin.bottom - yScale(d[valueKey]));

  bars.exit()
    .transition()
    .duration(1000)
    .attr("y", yScale(0))
    .attr("height", 0)
    .remove();
}