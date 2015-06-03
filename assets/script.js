window.onload = function() {
	var game = new Phaser.Game(700, 500, Phaser.CANVAS, 'graph-container', { preload: preload, create: create, update: update, render: render });

	var vertices = [];
	var edges = [];
	var weights = [];
	var counter = 0;

	var modes = ['просмотр', 'добавление вершины', 'удаление вершины', 'добавление ребра', 'удаление ребра', 'добавление дуги', 'изменение веса ребра'];
	var currentMode = 0;
	var weighed = false;
	var modeView = document.getElementById('modeView');

	$("#graph-type").click(function() {
		if (!weighed) {
			$(this).text("Взвешенный граф");
			weighed = true;
		} else {
			weighed = false;
			$(this).text("Невзвешенный граф");
		}
	});

	$("#viewButton").click(function() {
		setMode(this, 0);
	});

	$("#addVertex").click(function() {
		setMode(this, 1);
	});

	$("#removeVertex").click(function() {
		setMode(this, 2);
	});

	$("#addEdge").click(function() {
		setMode(this, 3);
	});

	$("#removeEdge").click(function() {
		setMode(this, 4);
	});

	$("#addArc").click(function() {
		setMode(this, 5);
	});
	
	$("#changeCost").click(function() {
		twoLastActiveVerticesForDel = [];
		setMode(this, 6);
	});

	$("#saveCanvas").click(function() {
		if (vertices.length == 0) {
			alert('Область пуста');
			return;
		}

		url = document.getElementsByTagName("canvas")[0].toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
		// save image as png
		var link = document.createElement('a');
		link.download = "image.png";
		link.href = url;
		link.click();
	});

	$("#clearCanvas").click(function() {
		for (i = 0; i < vertices.length; i++) {
			game.world.remove(vertices[i].source());
		}
		vertices = [];
		edges = [];
		weights = [];
		counter = 0;
		setMode(null, 0);
	});

	setMode = function(btn, mode) {
		buttons = document.getElementById('modeButtons').childNodes;
		for (i = 0; i < buttons.length; i++) {
			buttons[i].className = "btn btn-primary btn-block";
		}

		if (btn == null) btn = $("#viewButton");

		btn.className = "btn btn-info btn-block";
		currentMode = mode;
	}

	function preload() {
		game.load.spritesheet('balls', 'assets/vertex.png', 32, 32);
	}

	function Vertex(number) {
		this.number = number;
		
		this.sprite = game.add.sprite(game.input.activePointer.position.x, game.input.activePointer.position.y, 'balls', 0);

		this.sprite.anchor.set(0.5);
		this.sprite.inputEnabled = true;
		this.sprite.input.enableDrag(true);
		this.sprite.defaultCursor = "move";

		var text = game.add.text(-5, -10, this.number, {font: "20px Arial", fill: "#ffffff", align: "center" });
		this.sprite.addChild(text);

		this.x = function() {
			return this.sprite.x;
		}

		this.y = function() {
			return this.sprite.y;
		} 

		this.source = function() {
			return this.sprite;
		}
	}

	function create() {
		 game.stage.backgroundColor = '#ffffff';//'#b1b1A1';
		 vertices = [];
		 game.input.onTap.add(onTapHandler, this);
	}

	function getActiveVertex() {
		mouseX = game.input.activePointer.position.x;
		mouseY = game.input.activePointer.position.y;

		for (i = 0; i < vertices.length; i++) {
			if ( (Math.abs(vertices[i].x() - mouseX) < 16) && (Math.abs(vertices[i].y() - mouseY) < 16) ) {
				return i;        
			}
		}
	}

	twoLastActiveVerticesForAdd = [];
	twoLastActiveVerticesForDel = [];

	function onTapHandler() {
		var activeVertexIndex = getActiveVertex();
	if (activeVertexIndex == null && currentMode > 2) {
		twoLastActiveVerticesForDel = [];
		twoLastActiveVerticesForAdd = [];
		return;
	}
	
		switch(currentMode) 
		{
			case 1:
				vertices.push(new Vertex(counter + 1));
				counter++;

				break;

			case 2:
				if (vertices.length == 0) return;

				for (i = 0; i < edges.length; i++) {
					if ( (edges[i][0] == vertices[activeVertexIndex]) || (edges[i][1] == vertices[activeVertexIndex]) ) {
						edges.splice(i, 1);
						i--;
					}
				}

				game.world.remove(vertices[activeVertexIndex].source());
				vertices.splice(activeVertexIndex, 1);

				break;

			case 3:
				if (vertices.length < 2) return;

				twoLastActiveVerticesForDel = [];

				if (twoLastActiveVerticesForAdd.length == 0) {
					twoLastActiveVerticesForAdd.push(vertices[activeVertexIndex]);

				} else if ( (twoLastActiveVerticesForAdd.length == 1) && (vertices[activeVertexIndex] != twoLastActiveVerticesForAdd[0]) ) {
					twoLastActiveVerticesForAdd.push(vertices[activeVertexIndex]);
			
					var cost = 1.0;

					if (weighed) {
						cost = prompt("Вес ребра", 1 );                      
					}

					if (cost) {
						edges.push(twoLastActiveVerticesForAdd);
						var inverseEdge = twoLastActiveVerticesForAdd.concat([]);
						edges.push(inverseEdge.reverse());
						weights.push(cost);
						weights.push(cost);
					}

					twoLastActiveVerticesForAdd = [];
				} 

				break;

			case 4:
				if (edges.length == 0) return;

				twoLastActiveVerticesForAdd = [];

				if (twoLastActiveVerticesForDel.length == 0) {
					twoLastActiveVerticesForDel.push(vertices[activeVertexIndex]);
				
				} else if (twoLastActiveVerticesForDel.length == 1) {
					twoLastActiveVerticesForDel.push(vertices[activeVertexIndex]);

					for (i = 0; i < edges.length; i++) {
						if ( (edges[i][0] == twoLastActiveVerticesForDel[0] && edges[i][1] == twoLastActiveVerticesForDel[1]) || 
							   (edges[i][0] == twoLastActiveVerticesForDel[1] && edges[i][1] == twoLastActiveVerticesForDel[0]) ) {

							edges.splice(i, 1);
							i--;
						}
					}
					twoLastActiveVerticesForDel = [];
				}

				break;

		case 5:
			if (vertices.length < 2) return;

			twoLastActiveVerticesForDel = [];

			if (twoLastActiveVerticesForAdd.length == 0) {
				twoLastActiveVerticesForAdd.push(vertices[activeVertexIndex]);
			
			} else if ( (twoLastActiveVerticesForAdd.length == 1) && (vertices[activeVertexIndex] != twoLastActiveVerticesForAdd[0]) ) {
				
				twoLastActiveVerticesForAdd.push(vertices[activeVertexIndex]);
				
				var cost = 1.0;
				
				if (weighed) {
					cost = prompt("Вес ребра", 1 );                      
				}
				
				if (cost) {
					for (i = 0; i < edges.length; i++) {
						if ( (edges[i][0] == twoLastActiveVerticesForAdd[0] && edges[i][1] == twoLastActiveVerticesForAdd[1])|| 
							   (edges[i][0] == twoLastActiveVerticesForAdd[1] && edges[i][1] == twoLastActiveVerticesForAdd[0]) ) {
								weights[i] = cost;
						}
					}
					
					edges.push(twoLastActiveVerticesForAdd);
					weights.push(cost);
				}

				twoLastActiveVerticesForAdd = [];
			} 

			break;

		case 6:
			if (edges.length == 0) return;

			twoLastActiveVerticesForAdd = [];

			if (twoLastActiveVerticesForDel.length == 0) {
				twoLastActiveVerticesForDel.push(vertices[activeVertexIndex]);
			
			} else if (twoLastActiveVerticesForDel.length == 1) {
				twoLastActiveVerticesForDel.push(vertices[activeVertexIndex]);
				
				var newWeight = prompt("Вес ребра");
				
				if (newWeight) {
					for (i = 0; i < edges.length; i++) {
						if ( (edges[i][0] == twoLastActiveVerticesForDel[0] && edges[i][1] == twoLastActiveVerticesForDel[1])|| 
								 (edges[i][0] == twoLastActiveVerticesForDel[1] && edges[i][1] == twoLastActiveVerticesForDel[0]) ) {

							weights[i] = newWeight;
						}
					}
				}
				twoLastActiveVerticesForDel = [];
			}
			break;
		}
	}

	function update() {
	}

	var texts = [];

	function render() {
		
		for (var i = 0; i < texts.length; i++) {
			texts[i].destroy();  
		}

		texts = [];
		
		if (edges.length > 0) {
			game.context.strokeStyle = 'rgb(0,0,255)';
			game.context.beginPath();
			
			for (i = 0; i < edges.length; i++) {
				if ( (edges[i][0] != null) && (edges[i][1] != null) ) {
					// edge case
					if (arcExists(edges[i][1], edges[i][0])) {
						game.context.moveTo(edges[i][0].x(), edges[i][0].y());
						game.context.lineTo(edges[i][1].x(), edges[i][1].y());
					} else {
						game.context.moveTo(edges[i][0].x(), edges[i][0].y());
						game.context.lineTo(edges[i][1].x(), edges[i][1].y());
						
						// pointer
						var dx = edges[i][1].x() - edges[i][0].x();
						var dy = edges[i][1].y() - edges[i][0].y();
						var k = 30 / Math.sqrt(dx * dx + dy * dy);
						var angle = Math.acos(dx / Math.sqrt(dx * dx + dy * dy)) * Math.sign(dy) - Math.PI;
						game.context.arc(edges[i][1].x() - k * dx, edges[i][1].y() - k * dy, 5, angle - Math.PI / 2, angle + Math.PI / 2, true);
						game.context.lineTo(edges[i][1].x(), edges[i][1].y());
					}
					if (weighed) {
						texts.push(game.add.text((edges[i][1].x() + edges[i][0].x()) / 2, 
												(edges[i][1].y() + edges[i][0].y()) / 2, 
												weights[i], 
												{ font: "18px Arial", fill: "#ff0000", align: "center" }));
					}
				}
			}

			game.context.stroke();
			game.context.closePath();

			if (twoLastActiveVerticesForAdd.length == 1) {
				game.context.fillStyle = 'rgb(255,255,0)';
				game.context.fillRect(twoLastActiveVerticesForAdd[0].x(), twoLastActiveVerticesForAdd[0].y(), 6, 6);
			}

			if (twoLastActiveVerticesForDel.length == 1) {
				game.context.fillStyle = 'rgb(0,255,255)';
				game.context.fillRect(twoLastActiveVerticesForDel[0].x(), twoLastActiveVerticesForDel[0].y(), 6, 6);
			}
		}

		modeView.innerHTML = modes[currentMode];

		$("#input-text").html('');

		if (inputType == 0) {
			var adjaciencyMatrix = adjMat();
			
			for (var i = 0; i < adjaciencyMatrix.length; i++) {
				for (var j = 0; j < adjaciencyMatrix[i].length; j++) {
					$("#input-text").append(parseAdjMatPattern(adjaciencyMatrix[i][j], getEdgeWeight(vertices[i], vertices[j])));
				}
				$("#input-text").append("<br>");
			}

		} else if (inputType == 1) {
			var adjaciencyList = adjList();
			
			for (var i = 0; i < adjaciencyList.length; i++) {
				$("#input-text").append(parseAdjListPattern(adjaciencyList[i][0], adjaciencyList[i][1], adjaciencyList[i][2]) + "<br>");
			}
		}
	}

	// input type
	// 0 - adj. matrix
	// 1 - adj. list
	var inputType = 0;
	
	function getEdgeWeight(a, b) {
		for (var i = 0; i < edges.length; i++) {
			if (edges[i][0] == a && edges[i][1] == b) {
				return weights[i];
			}
		}	
		return "inf";
	}

	function arcExists(a, b) {
		for (var i = 0; i < edges.length; i++) {
			if (edges[i][0] == a && edges[i][1] == b) {
				return true;
			}
		}	
		return false;
	}

	function adjMat() {
		var adj = [];
		for (var i = 0; i < vertices.length; i++) {
			var adjForCur = [];
			for (var  j = 0; j < vertices.length; j++) {
				if (arcExists(vertices[i], vertices[j])) {
					adjForCur.push(1);
				} else {
					adjForCur.push(0);
				}
			}
			adj.push(adjForCur);
		}
		return adj;
	}
	
	function adjList() {
		var adj = [];
		for (var i = 0; i < vertices.length; i++) {
			var adjVertices = [];
			var adjWeights = [];
			for (var  j = 0; j < vertices.length; j++) {
				if (arcExists(vertices[i], vertices[j])) {
					adjVertices.push(vertices[j].number);
					adjWeights.push(getEdgeWeight(vertices[i], vertices[j]));
				}
			}
			adj.push([vertices[i].number, adjVertices, adjWeights]);
		}
		return adj;
	}
	
	function parseAdjMatPattern(isAdj, c) {
		var pattern = document.getElementById("ms-pattern").value;
		return pattern.replace("%isAdj%", isAdj).replace("%c%", c);
	}
	
	// v1 - number of vertex
	// v2 - list of adj. vertices
	// c - list of weight of adj. vertices
	function parseAdjListPattern(v1, v2, c) {

		var pattern = document.getElementById("ss-pattern").value;
		var regExp = /{.*}/g;
		var elemPattern;

		try {
			elemPattern = (regExp.exec(pattern)[0]);
		} catch(e) {
			return "";
		}
		
		elemPattern = elemPattern.substring(1, elemPattern.length - 1);
		pattern = pattern.replace(regExp, "");
		pattern = pattern.replace("%v1%", v1);
		for (var i = 0; i < v2.length; i++) {
			var elem = elemPattern.replace("%v2%", v2[i]).replace("%c%", c[i]);
			pattern += elem;
		}
		return pattern;
	}

	var inputTypeRadio = document.getElementsByName("input-type");
	for(var i = 0; i < inputTypeRadio.length; i++){
		inputTypeRadio[i].onclick = function() {
			if(this.value == "ms") {
				inputType = 0;
				$("#ss-info").hide();
				$("#ms-info").show();
			}
			else {
				inputType = 1;
				$("#ms-info").hide();
				$("#ss-info").show();
			}
		};
	}
	
	$(".panel-heading").click(function() {
		$("#panel-body").toggle(500);
	});
};

