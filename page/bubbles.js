(function(){
	var width=1250,
	height = 1250;

	var svg = d3.select("#chart")
	.append("svg")
	.attr("height",height)
	.attr("width",width)
	.append("g")
	.attr("transform","translate(" + width/2 + "," + height/2 + ")")

	d3.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };

	d3.queue()
	.defer(d3.csv,"architect.csv")
	.await(ready)

	var div = d3.select("body").append("div")
		.attr("class","tooltip")
		.style("opacity",0)

	var lines=[ ["25 Floors",height *2/5],["50 Floors",height *1/7],["75 Floors", - height *1/7],["100 Floors", - height *2/5]]

	function ready(error,datapoints) {

		var forceySplit=d3.forceY(
			function (d) {
				// console.log(d.f_max)
				if(d.f_max<25){
					return 1*height*2/5;
				}
				else if(d.f_max<50){
					return 1*height*1/7;
				}
				else if(d.f_max<75){
					return -1 *height*1/7;
				}
				else return  -1 *height*2/5;
			}).strength(0.05)
		var forcexSplit=d3.forceX().strength(0.01)

		var forcexCombine=d3.forceX().strength(0.03)
		var forceyCombine=d3.forceY().strength(0.03)
	
		var simulation =d3.forceSimulation()
		.force("x",forcexCombine)
		.force("y",forceyCombine)
		.force("collide",d3.forceCollide(function(d){
			return radiusScale(d.buildings)+1;
		}))

		var colorScale=d3.scaleSequential(d3.interpolateReds)
    	.domain([-200, 800])


		var radiusScale = d3.scaleSqrt()
			.domain([0,d3.max(datapoints,function(d){return d.buildings;})])
			.range([10,32])
		
		var circles = svg.selectAll(".architect")
		.data(datapoints)
		.enter().append("circle")
		.attr("class","architect")
		.attr("r",function(d){
			return radiusScale(d.buildings)
			})
		.attr("fill",function(d){
			

			return colorScale((d.year+1)*2 );
		})
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
			div.html("<strong style=font-size:150%;>" + d.architect +"</strong><br/> Buildings Designed: " +d.buildings+"<br/> Last Building Yr: " +d.max_c)
				.style("left",(d3.event.pageX)+"px")
				.style("top",(d3.event.pageY )+"px");
				})
		.on("mousemove", function() {
          return div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
          	})
		
		.on("mouseout",function(d){
			d3.select(this).transition()
				.duration(500)
				.attr("fill",function(d){return colorScale(d.year +1)});
			div.transition()
			.duration(500)
			.style("opacity",0);
		})


		d3.select("#split").on('click', function(){
			console.log("split stuff")
			simulation
				.force("x",forcexSplit)
			 	.force("y",forceySplit)
				.alphaTarget(0.9)
				.restart()
			setTimeout(function(){simulation.alphaTarget(0);},1500);


			var ht_label=svg.selectAll(".ht_lbl")
				.data(lines)
				.enter().append("text")
				.attr("class","ht_lbl")
				.attr("x",-1*width/2.5)
				.attr("y",function(d){return d[1]-5;})
				.text(function(d){return d[0];})
				.attr("font-family", "sans-serif")
	            .attr("font-size", "100")
		        .attr("fill", "silver");

			var ln = svg.selectAll(".lines")
			.data(lines)
			.enter().append("line")
			.attr("class","lines")
			.attr("x1",-1*width/2.5)
			.attr("x2",width/3)
			.attr("y1",function(d){return d[1];})
			.attr("y2",function(d){return d[1];})
			.style("stroke-width","2px")
			.style("stroke","silver")
			ln.moveToBack()
		})

		d3.select("#combine").on('click', function(){
			console.log("combine stuff")
			svg.selectAll(".lines").remove()
			svg
			.selectAll(".ht_lbl").remove()
			simulation
				.force("x",forcexCombine)
				.force("y",forceyCombine)
				.alphaTarget(0.9)
				.restart()
			setTimeout(function(){simulation.alphaTarget(0);},1000);
		
		})
		simulation.nodes(datapoints)
			.alphaTarget(0)
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