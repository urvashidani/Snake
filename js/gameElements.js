(function () {



    var canvas, ctx, lar = 480, alt = 480, gameSpeed = 100, gameRecord = null, tileSize = 10;



    function defineImages() {
        // snake parts
        snakeHeadUp = new Sprite(snakeImage, 194, 2, 61, 59);
        snakeHeadLeft = new Sprite(snakeImage, 194, 66, 61, 59);
        snakeHeadRight = new Sprite(snakeImage, 256, 2, 59, 61);
        snakeHeadDown = new Sprite(snakeImage, 258, 64, 59, 61);

        snakeBodyY = new Sprite(snakeImage, 134, 65, 51, 58);
        snakeBodyX = new Sprite(snakeImage, 70, 6, 58, 51);

        tileUp = new Sprite(snakeImage, 198, 128, 51, 58);
        tileLeft = new Sprite(snakeImage, 192, 198, 58, 51);
        tileDown = new Sprite(snakeImage, 262, 197, 51, 58);
        tileRight = new Sprite(snakeImage, 261, 134, 58, 51);

        curveTL = new Sprite(snakeImage, 134, 134, 51, 51);
        curveBL = new Sprite(snakeImage, 134, 6, 51, 58);
        curveTR = new Sprite(snakeImage, 6, 70, 51, 51);
        curveBR = new Sprite(snakeImage, 6, 6, 51, 58);

        apple = new Sprite(snakeImage, 4, 194, 55, 60);

        noGame = new Sprite(gameSplash, 0, 0, 216, 154);

        fire = new Sprite(burning, 0, 0, 77.78, 156);

        fullHeart = new Sprite(someHearts, 0, 15, 97, 87);
        emptyHeart = new Sprite(someHearts, 595, 15, 97, 87);

        wallMaze1 = new Sprite(mazeImgs, 3, 8, 60, 64);
        gameLoop();
    };

    var game = {
        _stage: 0,
        _state: 'no',
        _pause: false,
        _getSound: false,

        _setSound: function () {
            this._getSound = !this._getSound;
        },

        _setPauseState: function () {
            this._pause = !this._pause;
        },

        _setGameState: function () {
            switch (this._state) {
                case 'no':
                    this._state = 'running';
                    break;
                case 'record':
                    this._state = 'over';
                    break;
                case 'over':
                    this._state = 'no';
            };
        },

        gameEnding: function () {
            pontuacao.decreseLifes();
            if (pontuacao.lifes != 0) {
                snake.restartSnake();
                coin.removeAll();
                this._state = 'running';
            } else {
                if (!gameRecord) gameRecord = localStorage.getItem('snakeRecord') || localStorage.setItem('snakeRecord', [0, 'Computer']);
                if (pontuacao.score > Number(gameRecord.split(',')[0])) {
                    var lastRecord = gameRecord.split(',');
                    var user = prompt('You broke a new record: ' + pontuacao.score, 'What is your name (five characters)');
                    gameRecord = localStorage.setItem('snakeRecord', [
                        pontuacao.score,
                        user.substr(0, 5)
                    ]);
                    this._state = 'record';
                } else this._state = 'over';

                pontuacao.restartScore();
                snake.restartSnake();
                coin.removeAll();
            };
        },

        restartGame: function () { },

        roundValue: function (n) {
            return (n % tileSize) ? n - (n % tileSize) : n;
        }
    };




    function horizontalGradient(color1, color2, high) {
        var gradient = ctx.createLinearGradient(0, 0, high || canvas.height, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };



    function verticalGradient(color1, color2, high) {
        var gradient = ctx.createLinearGradient(0, 0, 0, high || canvas.width);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };



    function drawRect(color, x0, y0, x1, y1) {
        ctx.fillStyle = color;
        ctx.fillRect(x0, y0, x1, y1);
    };

    function loadGameResources() {
        canvas = document.createElement('canvas');
        canvas.width = lar;
        canvas.height = alt;
        canvas.textContent = 'Navegador sem suporte';

        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');

        gameRecord = localStorage.getItem('snakeRecord') || localStorage.setItem('snakeRecord', [0, 'Computer']);

        snake.restartSnake();
        defineImages();

        pontuacao.heartsSequence = [
            [emptyHeart, emptyHeart, emptyHeart],
            [emptyHeart, emptyHeart, fullHeart],
            [emptyHeart, fullHeart, fullHeart],
            [fullHeart, fullHeart, fullHeart]
        ];
    };

    function clearCanvas(newBackgroundColor) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = newBackgroundColor || 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    function gameLoop() {
        if (!game._pause) gameUpdate();
        drawElements();

        setTimeout(gameLoop, gameSpeed);
    };

    function gameUpdate() {
        switch (game._state) {
            case 'running':
                coin.toUpdate();
                snake.toUpdate();
                break;
        };
    };

    function drawElements() {
        clearCanvas('pink');

        switch (game._state) {
            case 'no':
                gameInterfaces.noGame(noGame);
                break;
            case 'running':
                coin.toDraw(apple);
                snake.toDraw();
                pontuacao.drawScores();
                lab.toDraw();
                break;
            case 'record':
                gameInterfaces.recordGame();
                break;
            case 'over':
                gameInterfaces.gameOver();
        };

        if (game._pause) gameInterfaces.pauseGame();
    };

    var gameInterfaces = {
        noGameShow: 0,
        _showing: true,

        noGame: function (imageToDraw) {
            var showW = 216, showH = 154;

            imageToDraw.toDraw((canvas.width - showW) / 2, (canvas.height - showH) / 2, showW, showH);

            if (this._showing) {
                ctx.fillStyle = 'black';
                ctx.textBaseline = 'top';
                ctx.font = '20pt Reenie Beanie';
                ctx.fillText('click or press SPACE to start...', (canvas.width / 2) - (370 / 2), canvas.height * 0.70);
            };

            if (this.noGameShow >= 10) {
                this._showing = !this._showing;
                this.noGameShow = 0;
            } else this.noGameShow++;
        },


        pauseGame: function () {
            drawRect(verticalGradient('rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)'), 0, 0, canvas.width, canvas.height);
            ctx.font = '50pt Reenie Beanie';
            ctx.fillStyle = 'white';
            ctx.fillText('Paused', 160, 100);
            ctx.font = '8pt Open Sans';
            ctx.fillText('© Copyright Urvashi', 150, 460);
        },

        recordGame: function () {
            drawRect('blue', 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.fillText('Well Done!  You made a new Record!!', 50, 50);
        },

        gameOver: function () {
            drawRect('green', 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.fillText('!!Game over!!', 50, 50);
        }
    };

    var lab = {
        toDraw: function () {
            var mz = maze[game._stage];
            for (var i = 0; i < mz.length; i++) {
                if (mz[i].indexOf(1) == -1) continue;
                for (var j = 0; j < mz[i].length; j++) {
                    if (mz[i][j] == 0) continue;
                    wallMaze1.toDraw(j * tileSize, i * tileSize, tileSize, tileSize);
                };
            };
        }
    };

    var pontuacao = {
        score: 0,
        lifes: 3,

        heartsSequence: [],

        heartsPosition: [
            410, 428, 446
        ],

        drawScores: function () {
            ctx.fillStyle = 'blue';
            ctx.textBaseline = 'middle';
            ctx.font = '16pt Contrail One';
            ctx.fillText('$ ' + this.score, 15, 25);

            for (var i = 0; i < this.heartsSequence[this.lifes].length; i++) {
                this.heartsSequence[this.lifes][i].toDraw(this.heartsPosition[i], 20, 15, 15);
            };
        },

        increaseScore: function () {
            this.score += 10;
        },

        decreaseScore: function () {
            this.score -= 10;
        },

        decreseLifes: function () {
            this.lifes--;
        },

        increaseLifes: function () {
            this.lifes++;
        },

        restartScore: function () {
            this.score = 0;
            this.lifes = 3;
        },

        nextStage: function () {
            if (this.score) { };
        }
    };

    var snake = {
        _parts: [],
        _dir: 'down',
        _showing: true,

        toUpdate: function () {
            this.moveSnake(this._dir);
        },

        toDraw: function () {
            for (var i = 0; i < this._parts.length; i++) {
                if (!this._showing) break;

                var atualObj = this._parts[i],
                    prevObj = this._parts[i - 1],
                    nextObj = this._parts[i + 1];

                if (this._parts.indexOf(atualObj) === this._parts.indexOf(this._parts[this._parts.length - 1])) {
                    switch (this._dir) {
                        case 'up':
                            snakeHeadUp.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                            break;
                        case 'left':
                            snakeHeadLeft.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                            break;
                        case 'right':
                            snakeHeadRight.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                            break;
                        case 'down':
                            snakeHeadDown.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                    };
                } else {
                    if (this._parts.indexOf(atualObj) === this._parts.indexOf(this._parts[0])) {
                        // drawing the tail
                        if (nextObj.x == atualObj.x && nextObj.y == (atualObj.y - tileSize) ||
                            nextObj.x == atualObj.x && nextObj.y == (canvas.height - tileSize) && atualObj.y == 0) {
                            // tail rising
                            tileUp.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.y == atualObj.y && nextObj.x == (atualObj.x + tileSize) ||
                            nextObj.y == atualObj.y && nextObj.x == 0 && atualObj.x == (canvas.width - tileSize)) {
                            // tail to right
                            tileRight.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.y == atualObj.y && nextObj.x == (atualObj.x - tileSize) ||
                            nextObj.y == atualObj.y && nextObj.x == (canvas.width - tileSize) && atualObj.x == 0) {
                            // tail to left
                            tileLeft.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.x == atualObj.x && nextObj.y == (atualObj.y + tileSize) ||
                            nextObj.x == atualObj.x && nextObj.y == 0 && atualObj.y == (canvas.height - tileSize)) {
                            // tail down
                            tileDown.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else {
                            drawRect('rgb(106, 158, 104)', atualObj.x, atualObj.y, tileSize, tileSize);
                        }
                    } else {
                        if (nextObj.x == (atualObj.x - tileSize) && prevObj.x == (atualObj.x + tileSize) && prevObj.y == nextObj.y ||
                            nextObj.x == (canvas.width - tileSize) && atualObj.x == 0 && prevObj.x == (atualObj.x + tileSize) && nextObj.y == prevObj.y ||
                            nextObj.x == (atualObj.x - tileSize) && atualObj.x == (canvas.width - tileSize) && prevObj.x == 0 && prevObj.y == nextObj.y ||
                            // going left - going right
                            nextObj.x == (atualObj.x + tileSize) && prevObj.x == (atualObj.x - tileSize) && prevObj.y == nextObj.y ||
                            nextObj.x == 0 && atualObj.x == (canvas.width - tileSize) && prevObj.x == (atualObj.x - tileSize) && prevObj.y == nextObj.y ||
                            nextObj.x == (atualObj.x + tileSize) && atualObj.x == 0 && prevObj.x == (canvas.width - tileSize) && prevObj.y == nextObj.y) {
                            // horizontal body
                            snakeBodyX.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.y == (atualObj.y - tileSize) && prevObj.y == (atualObj.y + tileSize) && nextObj.x == prevObj.x ||
                            nextObj.y == (canvas.height - tileSize) && atualObj.y == 0 && prevObj.y == (atualObj.y + tileSize) && prevObj.x == nextObj.x ||
                            nextObj.y == (atualObj.y - tileSize) && atualObj.y == (canvas.height - tileSize) && prevObj.y == 0 && prevObj.x == nextObj.x ||
                            // going up - going down
                            nextObj.y == (atualObj.y + tileSize) && prevObj.y == (atualObj.y - tileSize) && prevObj.x == nextObj.x ||
                            nextObj.y == 0 && atualObj.y == (canvas.height - tileSize) && prevObj.y == (atualObj.y - tileSize) && prevObj.x == nextObj.x ||
                            nextObj.y == (atualObj.y + tileSize) && atualObj.y == 0 && prevObj.y == (canvas.height - tileSize) && prevObj.x == nextObj.x) {
                            // vertical body
                            snakeBodyY.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.x == (atualObj.x - tileSize) && prevObj.y == (atualObj.y - tileSize) && prevObj.x == (nextObj.x + tileSize) ||
                            nextObj.y == (atualObj.y - tileSize) && prevObj.x == (atualObj.x - tileSize) && prevObj.x == (nextObj.x - tileSize) ||
                            nextObj.x == (canvas.width - tileSize) && atualObj.x == 0 && prevObj.x == 0 && prevObj.y == (atualObj.y - tileSize) ||
                            nextObj.y == (atualObj.y - tileSize) && atualObj.x == 0 && prevObj.x == (canvas.width - tileSize) && nextObj.y == (prevObj.y - tileSize) ||
                            nextObj.y == (canvas.height - tileSize) && atualObj.y == 0 && prevObj.x == (atualObj.x - tileSize) ||
                            nextObj.x == (atualObj.x - tileSize) && atualObj.y == 0 && prevObj.y == (canvas.height - tileSize) ||
                            nextObj.x == (canvas.width - tileSize) && nextObj.y == 0 && atualObj.y == 0 && atualObj.x == 0 && prevObj.x == 0 && prevObj.y == (canvas.height - tileSize) ||
                            prevObj.x == (canvas.width - tileSize) && prevObj.y == 0 && atualObj.y == 0 && atualObj.x == 0 && nextObj.x == 0 && nextObj.y == (canvas.height - tileSize)) {
                            // curve topLeft/leftTop
                            curveTL.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.y == (atualObj.y - tileSize) && nextObj.x == atualObj.x && prevObj.x == (atualObj.x + tileSize) && prevObj.y == atualObj.y ||
                            prevObj.y == (atualObj.y - tileSize) && prevObj.x == atualObj.x && nextObj.x == (atualObj.x + tileSize) && nextObj.y == atualObj.y ||
                            nextObj.x == (atualObj.x + tileSize) && nextObj.y == 0 && atualObj.y == 0 && prevObj.x == atualObj.x && prevObj.y == (canvas.height - tileSize) ||
                            prevObj.x == (atualObj.x + tileSize) && prevObj.y == 0 && atualObj.y == 0 && nextObj.x == atualObj.x && nextObj.y == (canvas.height - tileSize) ||
                            nextObj.x == (canvas.width - tileSize) && nextObj.x == atualObj.x && nextObj.y == (atualObj.y - tileSize) && prevObj.x == 0 && prevObj.y == atualObj.y ||
                            prevObj.x == (canvas.width - tileSize) && prevObj.x == atualObj.x && prevObj.y == (atualObj.y - tileSize) && nextObj.x == 0 && nextObj.y == atualObj.y ||
                            nextObj.x == 0 && nextObj.y == 0 && atualObj.x == (canvas.width - tileSize) && atualObj.y == 0 && prevObj.x == (canvas.width - tileSize) && prevObj.y == (canvas.height - tileSize) ||
                            prevObj.x == 0 && prevObj.y == 0 && atualObj.x == (canvas.width - tileSize) && atualObj.y == 0 && nextObj.x == (canvas.width - tileSize) && nextObj.y == (canvas.height - tileSize)) {
                            // curve topRight/rightTop
                            curveTR.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.x == atualObj.x && nextObj.y == (atualObj.y + tileSize) && prevObj.x == (atualObj.x - tileSize) && prevObj.y == atualObj.y ||
                            prevObj.x == atualObj.x && prevObj.y == (atualObj.y + tileSize) && nextObj.x == (atualObj.x - tileSize) && nextObj.y == atualObj.y ||
                            nextObj.x == (canvas.width - tileSize) && nextObj.y == atualObj.y && prevObj.x == 0 && atualObj.x == 0 && prevObj.y == (atualObj.y + tileSize) ||
                            prevObj.x == (canvas.width - tileSize) && prevObj.y == atualObj.y && nextObj.x == 0 && atualObj.x == 0 && nextObj.y == (atualObj.y + tileSize) ||
                            nextObj.y == 0 && nextObj.x == atualObj.x && atualObj.y == (canvas.width - tileSize) && prevObj.x == (atualObj.x - tileSize) && prevObj.y == atualObj.y ||
                            prevObj.y == 0 && prevObj.x == atualObj.x && atualObj.y == (canvas.width - tileSize) && nextObj.x == (atualObj.x - tileSize) && nextObj.y == atualObj.y ||
                            nextObj.x == (canvas.width - tileSize) && nextObj.y == (canvas.height - tileSize) && atualObj.x == 0 && atualObj.y == (canvas.height - tileSize) && prevObj.x == 0 && prevObj.y == 0 ||
                            prevObj.x == (canvas.width - tileSize) && prevObj.y == (canvas.height - tileSize) && atualObj.x == 0 && atualObj.y == (canvas.height - tileSize) && nextObj.x == 0 && nextObj.y == 0) {
                            // curve bottomLeft/leftBottom
                            curveBL.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else if (nextObj.x == atualObj.x && nextObj.y == (atualObj.y + tileSize) && prevObj.x == (atualObj.x + tileSize) && prevObj.y == atualObj.y && prevObj.y == (nextObj.y - tileSize) ||
                            prevObj.x == atualObj.x && prevObj.y == (atualObj.y + tileSize) && nextObj.x == (atualObj.x + tileSize) && nextObj.y == atualObj.y && nextObj.y == (prevObj.y - tileSize) ||
                            nextObj.x == (atualObj.x + tileSize) && nextObj.y == atualObj.y && atualObj.y == (canvas.height - tileSize) && prevObj.x == atualObj.x && prevObj.y == 0 && prevObj.x == (nextObj.x - tileSize) ||
                            prevObj.x == (atualObj.x + tileSize) && prevObj.y == atualObj.y && atualObj.y == (canvas.height - tileSize) && nextObj.x == atualObj.x && nextObj.y == 0 && nextObj.x == (prevObj.x - tileSize) ||
                            nextObj.x == (canvas.width - tileSize) && nextObj.x == atualObj.x && nextObj.y == (atualObj.y + tileSize) && prevObj.x == 0 && prevObj.y == atualObj.y ||
                            prevObj.x == (canvas.width - tileSize) && prevObj.x == atualObj.x && prevObj.y == (atualObj.y + tileSize) && nextObj.x == 0 && nextObj.y == atualObj.y ||
                            nextObj.x == (canvas.width - tileSize) && nextObj.y == 0 && atualObj.x == (canvas.width - tileSize) && atualObj.y == (canvas.height - tileSize) && prevObj.x == 0 && prevObj.y == (canvas.height - tileSize) ||
                            prevObj.x == (canvas.width - tileSize) && prevObj.y == 0 && atualObj.x == (canvas.width - tileSize) && atualObj.y == (canvas.height - tileSize) && nextObj.x == 0 && nextObj.y == (canvas.height - tileSize)) {
                            // curve bottomRight/rightBottom
                            curveBR.toDraw(atualObj.x, atualObj.y, tileSize, tileSize);
                        } else {
                            drawRect('rgb(106, 158, 104)', atualObj.x, atualObj.y, tileSize, tileSize);
                        };
                    };
                }
            };
        },

        configDir: function (newDir) {
            this._dir = newDir;
        },

        moveSnake: function (direction) {
            var lastObject = this._parts[this._parts.length - 1], addNew, colliders = [snake._parts, maze[game._stage]], collide = true;

            switch (direction) {
                case 'up':
                    addNew = {
                        x: lastObject.x,
                        y: ((lastObject.y == 0) ? canvas.height : lastObject.y) - tileSize
                    };
                    break;
                case 'left':
                    addNew = {
                        y: lastObject.y,
                        x: ((lastObject.x == 0) ? canvas.width : lastObject.x) - tileSize
                    };
                    break;
                case 'right':
                    addNew = {
                        y: lastObject.y,
                        x: ((lastObject.x == canvas.width - tileSize) ? 0 : lastObject.x + tileSize)
                    };
                    break;
                case 'down':
                    addNew = {
                        x: lastObject.x,
                        y: ((lastObject.y == canvas.height - tileSize) ? 0 : lastObject.y + tileSize)
                    };
            };

            for (var i = 0; i < colliders.length; i++) {
                for (var j = 0; j < colliders[i].length; j++) {
                    if (colliders.indexOf(colliders[i]) === colliders.indexOf(maze[game._stage])) {
                        for (var k = 0; k < colliders[i][j].length; k++) {
                            if (colliders[i][j][k] == 0) continue;
                            if (k * tileSize == addNew.x && j * tileSize == addNew.y) {
                                collide = false;
                                break;
                            };
                        };
                        if (!collide) break;
                    } else if (colliders[i][j].x == addNew.x && colliders[i][j].y == addNew.y && snake._parts.indexOf(colliders[i][j]) != 0) {
                        collide = false;
                        break;
                    };
                };
                if (!collide) break;
            };

            (collide) ? this.insertNew(addNew.x, addNew.y) : game.gameEnding();
        },

        changeDirection: function (dir) {
            if (!game._pause && game._state == 'running') {
                var compare1 = this._parts[this._parts.length - 1];
                var compare2 = this._parts[this._parts.length - 2];

                // Internal checks prevent the snake from bending over its own neck
                switch (dir) {
                    case 37:
                    case 65:
                        if (this._dir != 'right' && compare1.y != compare2.y) {
                            this.configDir('left');
                        };
                        break;
                    case 38:
                    case 87:
                        if (this._dir != 'down' && compare1.x != compare2.x) {
                            this.configDir('up');
                        };
                        break;
                    case 39:
                    case 68:
                        if (this._dir != 'left' && compare1.y != compare2.y) {
                            this.configDir('right');
                        };
                        break;
                    case 40:
                    case 83:
                        if (this._dir != 'up' && compare1.x != compare2.x) {
                            this.configDir('down');
                        };
                };
            };
        },

        insertNew: function (posX, posY) {
            this._parts.splice(0, 1);
            this._parts.push({
                x: posX, y: posY
            });
        },

        increaseItem: function () {
            this._parts.unshift({
                x: this._parts[0].x,
                y: this._parts[0].y
            });
        },

        restartSnake: function () {
            this.removeAll();
            this._parts.push({
                x: 30, y: 120
            }, {
                x: 30, y: 130,
            }, {
                x: 30, y: 140
            });
            this.configDir('down');
        },

        removeAll: function () {
            this._parts = [];
        }
    };

    var coin = {
        _coins: [],
        _maxQnt: 2,
        _showing: true,

        toUpdate: function () {
            var snkH = snake._parts[snake._parts.length - 1], _self = this;
            _self._coins.some(food => {
                if (food.x == snkH.x && food.y == snkH.y) {
                    pontuacao.increaseScore();
                    _self.removeItem(food);
                    snake.increaseItem();
                };
            });

            if (_self._coins.length < _self._maxQnt) _self.insertNew();
        },

        toDraw: function (coinImage) {
            for (var i = 0; i < this._coins.length; i++) {
                if (!this._showing) break;
                var elDraw = this._coins[i];

                coinImage.toDraw(elDraw.x, elDraw.y, tileSize, tileSize);
            };
        },

        insertNew: function () {
            var posX, posY, colliders = [snake._parts, this._coins, maze[game._stage]], increase = true;

            while (this._coins.length < this._maxQnt) {
                do {
                    posX = game.roundValue(Math.floor(Math.random() * (canvas.width - 10)));
                    posY = game.roundValue(Math.floor(Math.random() * (canvas.height - 10)));
                } while (posX < 0 || posY < 0 || posX > (canvas.width - tileSize) || posY > (canvas.height - tileSize));

                for (var i = 0; i < colliders.length; i++) {
                    for (var j = 0; j < colliders[i].length; j++) {
                        if (colliders.indexOf(colliders[i]) == colliders.indexOf(maze[game._stage])) {
                            for (var k = 0; k < colliders[i][j].length; k++) {
                                if (j * tileSize == posY && k * tileSize == posX && colliders[i][j][k] != 0) {
                                    increase = false;
                                    break;
                                };
                            };
                        } else if (colliders[i][j].x === posX && colliders[i][j].y === posY) {
                            increase = false;
                            break;
                        };
                        if (!increase) break;
                    };
                    if (!increase) break;
                };

                increase ? this.getItem(posX, posY) : this.insertNew();
            };
        },

        getItem: function (posX, posY, power) {
            this._coins.push({
                x: posX, y: posY
            });
        },

        removeItem: function (indice) {
            this._coins.splice(this._coins.indexOf(indice), 1);
        },

        removeAll: function () {
            this._coins = [];
            this.insertNew();
        }
    };

    window.addEventListener('click', function (e) {
        var posX = ((e.clientX) ? e.clientX : e.pageX) - canvas.offsetLeft;
        var posY = ((e.clientY) ? e.clientY : e.pageY) - canvas.offsetTop;

        if (posX >= 0 && posX <= document.querySelector('canvas').width) {
            if (posY >= 0 && posY <= document.querySelector('canvas').height) {
                game._setGameState();
            };
        };
    }, false);

    window.addEventListener('keyup', function (e) {
        var key = e.keyCode;

        switch (key) {
            case 80:
                // code from char P
                if (game._state == 'running') {
                    game._setPauseState();
                };
                break;
            case 32:
                // code from char ' ' || espace
                if (game._state == 'no') {
                    game._setGameState();
                };
                break;
        };
    }, false);

    window.addEventListener('keydown', event => {
        switch (event.keyCode) {
            case 37: // L
            case 65: // L
            case 38: // U
            case 87: // U
            case 39: // R
            case 68: // R
            case 40: // B
            case 83: // B
                snake.changeDirection(event.keyCode);
        };
    }, false);



















    loadGameResources();
}());