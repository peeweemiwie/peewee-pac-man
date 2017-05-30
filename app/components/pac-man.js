import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
  levelNumber: 1,
  score: 0,
  x: 1,
  y: 2,
  squareSize: 40,
  ctx: Ember.computed(()=>{
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    return ctx;
  }),

  screenHeight: Ember.computed(function(){
    return this.get('grid.length');
  }),

  screenWidth: Ember.computed(function(){
    return this.get('grid.firstObject.length');
  }),

  screenPixelWidth: Ember.computed(function(){
    return this.get('screenWidth') * this.get('squareSize');
  }),

  screenPixelHeight: Ember.computed(function(){
    return this.get('screenHeight') * this.get('squareSize');
  }),

  clearScreen: function(){
    let ctx = this.get('ctx');
    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },

  drawCircle(x, y, radiusDivisor, color){
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    let pixelX = (x+1/2) * squareSize;
    let pixelY = (y+1/2) * squareSize;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, squareSize/radiusDivisor, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },

  drawPac(){
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;
    let color = '#f97f7f';
    this.drawCircle(x, y, radiusDivisor, color);
  },

  drawPellet(x, y) {
    let radiusDivisor = 6;
    let color = '#4cdae2';
    this.drawCircle(x, y, radiusDivisor, color);
  },

  didInsertElement(){
    this.drawWall();
    this.drawGrid();
    this.drawPellet();
    this.drawPac();
  },

  movePacMan(direction, amount){
    this.incrementProperty(direction, amount);

    // if(this.collidedWithBorder()) {
    //   this.decrementProperty(direction, amount);
    // }

    if(this.collidedWithBorder() || this.collidedWithWall()){
      this.decrementProperty(direction, amount)
    }

    this.processAnyPellets();

    this.clearScreen();
    this.drawGrid();
    this.drawPac();
  },

  processAnyPellets(){
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');

    if (grid[y][x] == 2){
      grid[y][x] = 0;
      this.incrementProperty('score');

      if(this.levelComplete()){
        this.incrementProperty('levelNumber');
        this.restartLevel();
      }
    }
  },

  collidedWithBorder(){
    let x = this.get('x');
    let y = this.get('y');
    let screenHeight = this.get('screenHeight');
    let screenWidth = this.get('screenWidth');

    let pacOutOfBounds =  x < 0 ||
                          y < 0 ||
                          x >= screenWidth ||
                          y >= screenHeight;

    return pacOutOfBounds;
  },

  collidedWithWall(){
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');

    return grid[y][x] == 1
  },

  keyboardShortcuts: {
    up(){
      this.movePacMan('y', -1);
    },
    down(){
      this.movePacMan('y', 1);
    },
    left(){
      this.movePacMan('x', -1);
    },
    right(){
      this.movePacMan('x', 1);
    },
  },

  grid: [
    [2,2,2,2,2,2,2,1],
    [2,1,2,1,2,2,2,1],
    [2,2,1,2,2,2,2,1],
    [2,2,2,2,2,2,2,1],
    [2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
  ],

  drawWall(x, y){
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    ctx.fillStyle = '#777';
    ctx.fillRect(
      x * squareSize,
      y * squareSize,
      squareSize,
      squareSize)
  },

  drawGrid(){
    let grid = this.get('grid');
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if(cell == 1) {
          this.drawWall(columnIndex, rowIndex);
        }
        if(cell == 2) {
          this.drawPellet(columnIndex, rowIndex);
        }
      })
    })
  },

  levelComplete(){
    let hasPelletsLeft = false;
    let grid = this.get('grid');

    grid.forEach((row)=> {
      row.forEach((cell)=>{
        if(cell == 2) {
          hasPelletsLeft = true;
        }
      })
    })
    return !hasPelletsLeft;
  },

  restartLevel(){
    this.set('x', 0);
    this.set('y', 0);

    let grid = this.get('grid');
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if(cell == 0){
          grid[rowIndex][columnIndex] = 2
        }
      })
    })
  },

});
