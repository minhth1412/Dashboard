// Đọc dữ liệu từ file CSV cho task 1 và vẽ biểu đồ bar chart
d3.csv("SuperStoreUS-2015.csv").then(function (data) {
        // Chuyển đổi ngày tháng
        var parseDate = d3.timeParse("%m/%d/%Y");
        data.forEach(function(d) {
            d["Order Date"] = parseDate(d["Order Date"]);
            d["Order Month"] = d3.timeFormat("%m")(d["Order Date"]); // Định dạng lại thành tháng/năm hoặc theo định dạng mong muốn
        });
    // Đếm số lượng order theo tháng
    const orderByMonth = d3.rollup(data, v => v.length, d => d["Order Month"]);

    const sortedOrders = Array.from(orderByMonth, ([month, count]) => ({ month, count }))
        .sort((a, b) => d3.descending(a.count, b.count))
    //.slice(0, 10);

    const margin = { top: 40, right: 30, bottom: 70, left: 90 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#chart-container-task2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand()
        .domain(sortedOrders.map(d => d.month))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedOrders, d => d.count)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Số lượng Order");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 20)
        .style("text-anchor", "middle")
        .text("Các tháng trong năm");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Số lượng Order");
    
        const color = "#4e79a7";    

    svg.selectAll(".bar")
        .data(sortedOrders)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill",color);

    svg.selectAll(".bar-label")
        .data(sortedOrders)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.month) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 20) 
        .attr("dy", "1em") 
        .attr("text-anchor", "middle")
        .text(d => d.count);

});
