document.addEventListener("DOMContentLoaded", function () {
    d3.csv("SuperStoreUS-2015.csv").then(function (data) {
        // Đếm tổng số loại hình nghệ thuật và lưu vào biến totalTypes
        var totalTypes = data.length;
        // Tính toán số lượng các loại hình nghệ thuật và lưu trữ vào biến typeCounts
        var typeCounts = d3.rollup(data, v => v.length, d => d["Product Category"]);
        // Chuyển đổi typeCounts thành mảng để dễ dàng truy cập và sắp xếp
        var typeData = Array.from(typeCounts, ([type, count]) => ({ type, count }));

        // Sắp xếp dữ liệu theo số lượng giảm dần
        typeData.sort((a, b) => b.count - a.count);

        var customColors = ["#FDCAC9", "#95B3CB", "#7EB47A"];
        var colorScale = d3.scaleOrdinal()
            .domain(typeData.map(d => d.type))
            .range(customColors);

        // Thiết lập kích thước và margin cho biểu đồ
        var width = 550;
        var height = 550;
        var margin = {top: 0, right: 50, bottom: 75, left: 70};

        // Tạo SVG cho biểu đồ pie chart và đặt nó trong div có id "chart-container-task1"
        var svg = d3.select("#chart-container-task1")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Tạo generator để tạo ra các cung cho biểu đồ pie
        var pie = d3.pie()
            .value(d => d.count); // Sử dụng số lượng của Product Category

        // Áp dụng generator pie vào dữ liệu
        var data_ready = pie(typeData);

        // Vẽ các cung của biểu đồ pie và thêm màu sắc
        var arcs = svg.selectAll("path")
            .data(data_ready)
            .enter()
            .append("path")
            .attr("d", d3.arc()
                .innerRadius(0)
                .outerRadius(Math.min(width, height) / 2 - margin.left)
            )
            .attr("fill", d => colorScale(d.data.type)) // Sử dụng màu sắc tương ứng với mỗi loại Product Category
            .attr("stroke", "grey")
            .style("stroke-width", "0.5px");

        // Thêm chú thích về phần trăm của danh mục sản phẩm
        svg.selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('text')
            .text(d => ((d.data.count / totalTypes) * 100).toFixed(2) + "%") // Hiển thị loại hình và phần trăm tương ứng
            .attr("transform", function(d) {
                var pos = d3.arc()
                    .innerRadius(0)
                    .outerRadius(Math.min(width, height) / 2 - margin.left)
                    .centroid(d);
                if (d.index > 1) {
                    var angle = (d.startAngle + d.endAngle) / 2; // Góc trung bình của slice
                    angle = angle * (180 / Math.PI); // Chuyển đổi sang đơn vị độ
                    pos[1] -= 30;
                    pos[0] -= 10;
                    var labelDirection = (angle < 180) ? 1 : -1;
                    return "translate(" + pos + ") rotate(" + (angle + 270 * labelDirection) + ")";
                } else {
                    return "translate(" + pos + ")";
                }
            })
            .style("text-anchor", "middle")
            .style("font-size", 18); // Đặt font size cho chú thích
        
        // Xử lý sự kiện khi di chuột qua các phần của biểu đồ pie để hiển thị biểu đồ cột
        arcs.on("mouseover", function(d) {
            // Xóa biểu đồ cột cũ nếu đã có
            d3.select("#bar-chart-container").selectAll("*").remove();

            // Lọc dữ liệu theo loại Product Category tương ứng
            var subcategoryData = data.filter(item => item["Product Category"] === d.data.type);

            // Đếm số lượng các Subcategory và lưu vào biến subcategoryCounts
            var subcategoryCounts = d3.rollup(subcategoryData, v => v.length, d => d["Product Sub-Category"]);
            // Chuyển đổi subcategoryCounts thành mảng để dễ dàng truy cập và sắp xếp
            var subcategoryDataArray = Array.from(subcategoryCounts, ([subcategory, count]) => ({ subcategory, count }));

            // Tạo SVG cho biểu đồ cột và đặt nó trong div có id "bar-chart-container"
            var barChart = d3.select("#bar-chart-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Thiết lập các scale cho biểu đồ cột
            var x = d3.scaleBand()
                .domain(subcategoryDataArray.map(d => d.subcategory))
                .range([0, width - margin.left - margin.right])
                .padding(0.1);

            var y = d3.scaleLinear()
                .domain([0, d3.max(subcategoryDataArray, d => d.count)])
                .nice()
                .range([height - margin.top - margin.bottom, 0]);

            // Vẽ các cột của biểu đồ cột
            barChart.selectAll(".bar")
                .data(subcategoryDataArray)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.subcategory))
                .attr("y", d => y(d.count))
                .attr("width", x.bandwidth())
                .attr("height", d => height - margin.top - margin.bottom - y(d.count))
                .attr("fill", "steelblue");

            // Thêm các nhãn trên các cột
            barChart.selectAll(".bar-label")
                .data(subcategoryDataArray)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.subcategory) + x.bandwidth() / 2)
                .attr("y", d => y(d.count) - 5)
                .attr("text-anchor", "middle")
                .text(d => d.count)
                .style("font-size", "12px")
                .style("fill", "white");
        });

        // Tạo legend dưới biểu đồ pie
        var legend = svg.selectAll(".legend")
            .data(typeData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { 
                return "translate(" + (-width / 2 + margin.left) + "," + (height / 2 - margin.bottom + i * 30) + ")";
            });

        // Thêm màu sắc cho legend
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => colorScale(d.type));

        // Thêm chú thích cho legend
        legend.append("text")
            .attr("x", 25)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d.type);

    });
});
