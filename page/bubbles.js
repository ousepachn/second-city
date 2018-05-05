(function(){
	var width=850,
	height = 850;

	var svg = d3.select("#chart")
	.append("svg")
	.attr("height",height)
	.attr("width",width)
	.append("g")
	.attr("transform","translate(" + height/2 + "," + width/2 + ")")


	d3.queue()
	.defer(d3.csv,"architect.csv")
	.await(ready)

	var div = d3.select("body").append("div")
		.attr("class","tooltip")
		.style("opacity",0)

	function ready(error,datapoints) {

		var simulation =d3.forceSimulation()
		.force("x",d3.forceX().strength(0.005))
		.force("y",d3.forceY().strength(0.005))
		.force("collide",d3.forceCollide(function(d){
			return radiusScale(d.buildings)+1;
		}))

		var radiusScale = d3.scaleSqrt()
			.domain([0,d3.max(datapoints,function(d){return d.buildings;})])
			.range([10,35])
		
		var circles = svg.selectAll(".architect")
		.data(datapoints)
		.enter().append("circle")
		.attr("class","architect")
		.attr("r",function(d){
			return radiusScale(d.buildings)
			})
		.attr("fill","lightblue")
		.on("click",function(d){
			console.log(d);}
			)
		.on("mouseover",function(d){
			d3.select(this).transition()
				.duration(200)
				.attr("fill","orange");
			div.transition()
				.duration(200)
				.style("opacity",0.9);
			div.html("<strong style=font-size:150%;>" + d.architect +"</strong><br/> Buildings Designed: " +d.buildings+"<br/> Last Building Yr: " +d.last)
				.style("left",(d3.event.pageX)+"px")
				.style("top",(d3.event.pageY )+"px");
				})
		.on("mousemove", function() {
          return div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
          	})
		
		.on("mouseout",function(d){
			d3.select(this).transition()
				.duration(500)
				.attr("fill","lightblue");
			div.transition()
			.duration(500)
			.style("opacity",0);
		})

		simulation.nodes(datapoints)
			.on('tick',ticked) 


		function ticked() {
			circles
				.attr ("cx",function(d){
					return d.x
				})
				.attr("cy",function(d){
					return d.y 
				})

		}
	

	}




})();