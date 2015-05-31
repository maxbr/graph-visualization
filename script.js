window.onload = function() {
  var game = new Phaser.Game(700, 500, Phaser.CANVAS, 'game_container', {preload: preload, create: create, update: update, render: render });

  var vertices = [];
  var edges = [];
  var counter = 0;

  var modes = ['просмотр', 'добавление вершины', 'удаление вершины', 'добавление ребра', 'удаление ребра'];
  var currentMode = 0;
  var modeView = document.getElementById('modeView');

  var viewButton = document.getElementById('viewButton');
  viewButton.onclick = function() {
    setMode(this, 0);
  }

  var addVertex = document.getElementById('addVertex');
  addVertex.onclick = function() {
    setMode(this, 1);
  }

  var removeVertex = document.getElementById('removeVertex');
  removeVertex.onclick = function() {
    setMode(this, 2);
  }

  var addEdge = document.getElementById('addEdge');
  addEdge.onclick = function() {
    setMode(this, 3);
  }

  var removeEdge = document.getElementById('removeEdge');
  removeEdge.onclick = function() {
    setMode(this, 4);
  }

  // save functionality implementation
  var clickToSave = document.getElementById('saveCanvas');

  function saveCanvas() {
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
  };

  clickToSave.onclick = function(){
    saveCanvas();
  };
  // end

  setMode = function(btn, mode) {
    buttons = document.getElementById('modeButtons').childNodes;
    for (i = 0; i < buttons.length; i++) {
      buttons[i].className = "btn btn-primary btn-block";
    }

    if (btn == null) btn = viewButton;

    btn.className = "btn btn-info btn-block";
    currentMode = mode;
  }

  // delete graph 
  var clickToDelete = document.getElementById('clearCanvas');
  clickToDelete.onclick = function(){
    for (i = 0; i < vertices.length; i++) {
      game.world.remove(vertices[i].source());
    }
    vertices = [];
    edges = [];
    counter = 0;
    setMode(null, 0);
  };
  // end

  function preload() {
    game.load.spritesheet('balls', 'vertex.png', 32, 32);
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
     game.stage.backgroundColor = '#b1b1A1';
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
        } 
        else if ( (twoLastActiveVerticesForAdd.length == 1) && (vertices[activeVertexIndex] != twoLastActiveVerticesForAdd[0]) ) {
          twoLastActiveVerticesForAdd.push(vertices[activeVertexIndex]);

          edges.push(twoLastActiveVerticesForAdd);

          twoLastActiveVerticesForAdd = [];
        } 

        break;

      case 4:
        if (edges.length == 0) return;

        twoLastActiveVerticesForAdd = [];

        if (twoLastActiveVerticesForDel.length == 0) {
          twoLastActiveVerticesForDel.push(vertices[activeVertexIndex]);
        }
        else if (twoLastActiveVerticesForDel.length == 1) {
          twoLastActiveVerticesForDel.push(vertices[activeVertexIndex]);

          for (i = 0; i < edges.length; i++) {
            if ( (edges[i][0] == twoLastActiveVerticesForDel[0] && edges[i][1] == twoLastActiveVerticesForDel[1]) || 
                 (edges[i][0] == twoLastActiveVerticesForDel[1] && edges[i][1] == twoLastActiveVerticesForDel[0]) ) {

              edges.splice(i, 1);
              twoLastActiveVerticesForDel = [];

              return;
            }
          }
        }

        break;
    }
  }

  function update() {

  }

  function render() {
    if (edges.length > 0) {
      game.context.strokeStyle = 'rgb(0,0,255)';
      game.context.beginPath();
      
      for (i = 0; i < edges.length; i++) {
        if ( (edges[i][0] != null) && edges[i][1] != null ) {
          game.context.moveTo(edges[i][0].x(), edges[i][0].y());
          game.context.lineTo(edges[i][1].x(), edges[i][1].y());
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
  }
};