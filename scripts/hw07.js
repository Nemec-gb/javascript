const GAME_STATUS_STARTED = 'started';
const GAME_STATUS_PAUSED = 'paused';
const GAME_STATUS_STOPPED = 'stopped';

const SNAKE_DIRECTION_UP = 'up';
const SNAKE_DIRECTION_DOWN = 'down';
const SNAKE_DIRECTION_LEFT = 'left';
const SNAKE_DIRECTION_RIGHT = 'right';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;

const config = {
    size: 20
}

const game = {
    status: null,
    score: 0,
    start() {
        switch (game.status) {
            case null:
                game.setGameStatus(GAME_STATUS_STARTED);
                board.render();
                snake.render();
                food.render();
                game.move();
                break;
            default:
                location.reload();
        }
    },

    pause() {
        switch (game.status) {
            case GAME_STATUS_STARTED:
                game.setGameStatus(GAME_STATUS_PAUSED);
                break;
            case GAME_STATUS_PAUSED:
                game.setGameStatus(GAME_STATUS_STARTED);
                game.move()
                break;
        }
    },

    stop() {
        game.setGameStatus(GAME_STATUS_STOPPED);
    },

    move() {
        snake.setDirection(snake.direction);

        let moveTimer = setTimeout(function go() {

            const nextPosition = snake.getNextPosition();
            const foundFood = food.foundPosition(nextPosition);

            if (game.status === GAME_STATUS_STOPPED || game.status === GAME_STATUS_PAUSED) {
                clearTimeout(moveTimer);
                return;
            }

            if (snake.tailCheck(nextPosition)) {
                clearTimeout(moveTimer);
                game.stop();
                return;
            }

            if (foundFood !== -1) {
                game.score += 1;
                snake.speed *= 0.9;
                snake.setPosition(nextPosition, false);
                food.removeItem(foundFood);
                food.generateItem();
                food.render();
            } else {
                snake.setPosition(nextPosition);
            }
            snake.render();

            const scoreNum = document.getElementById("score-value");
            scoreNum.innerText = game.score;

            moveTimer = setTimeout(go, snake.speed);
        }, snake.speed);
    },

    setGameStatus(status) {
        const element = document.getElementById('game');
        element.classList.remove(GAME_STATUS_STARTED, GAME_STATUS_PAUSED, GAME_STATUS_STOPPED);
        element.classList.add(status);
        this.status = status;
    }
};

const board = {

    /**
@returns {HTMLElement}
     */
    getElement() {
        return document.getElementById('board');
    },

    render() {
        const board = this.getElement();

        for (let i = 0; i < config.size ** 2; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            cell.dataset.top = Math.trunc(i / config.size);
            cell.dataset.left = i % config.size;

            board.appendChild(cell);
        }
    }
};

const cells = {

    /**
     * @returns { HTMLCollectionOf.<Element>} 
     */
    getElements() {
        return document.getElementsByClassName('cell');
    },

    /**
     * @param coordinates 
     * @param className 
     */
    renderItems(coordinates, className) {
        const cells = this.getElements();

        for (let cell of cells) {
            cell.classList.remove(className);
        }

        for (let coordinate of coordinates) {
            const cell = document.querySelector(`.cell[data-top="${coordinate.top}"][data-left="${coordinate.left}"]`);
            cell.classList.add(className);
        }
    }
};

const snake = {
    speed: 200,
    tailCheck(nextPosition) {
        for (let part of snake.parts) {
            if (part.left === nextPosition.left && part.top === nextPosition.top) {
                return true;
            }
        }
    },

    direction: SNAKE_DIRECTION_RIGHT,

    parts: [
        { top: 0, left: 2 },
        { top: 0, left: 1 },
        { top: 0, left: 0 },
    ],

    setDirection(event) {

        let direction;

        switch (event.keyCode) {
            case KEY_UP:
                direction = SNAKE_DIRECTION_UP;
                break;
            case KEY_DOWN:
                direction = SNAKE_DIRECTION_DOWN;
                break;
            case KEY_LEFT:
                direction = SNAKE_DIRECTION_LEFT;
                break;
            case KEY_RIGHT:
                direction = SNAKE_DIRECTION_RIGHT;
                break;
            default:
                return;
        }

        if (snake.direction === SNAKE_DIRECTION_UP && direction === SNAKE_DIRECTION_DOWN
            || snake.direction === SNAKE_DIRECTION_DOWN && direction === SNAKE_DIRECTION_UP
            || snake.direction === SNAKE_DIRECTION_LEFT && direction === SNAKE_DIRECTION_RIGHT
            || snake.direction === SNAKE_DIRECTION_RIGHT && direction === SNAKE_DIRECTION_LEFT) {
            return;
        }

        snake.direction = direction;
    },

    getNextPosition() {

        const position = { ...this.parts[0] };

        switch (this.direction) {
            case SNAKE_DIRECTION_UP:
                position.top -= 1;
                break;
            case SNAKE_DIRECTION_DOWN:
                position.top += 1;
                break;
            case SNAKE_DIRECTION_LEFT:
                position.left -= 1;
                break;
            case SNAKE_DIRECTION_RIGHT:
                position.left += 1;
                break;
        }

        if (position.top === -1) {
            position.top = config.size - 1;
        } else if (position.top > config.size - 1) {
            position.top = 0;
        }

        if (position.left === -1) {
            position.left = config.size - 1;
        } else if (position.left > config.size - 1) {
            position.left = 0;
        }

        return position;
    },

    /**
     * @param position 
     * @param shift 
     */
    setPosition(position, shift = true) {
        if (shift) {
            this.parts.pop();
        }

        this.parts.unshift(position);
    },

    render() {
        cells.renderItems(this.parts, 'snake');
    }
};

const food = {

    items: [
        { top: 5, left: 5 }
    ],

    /**
     * @param snakePosition 
     * @returns {number} 
     */
    foundPosition(snakePosition) {
        const comparerFunction = function (item) {
            return item.top === snakePosition.top && item.left === snakePosition.left;
        };

        return this.items.findIndex(comparerFunction);
    },

    /**
     * @param foundPosition 
     */
    removeItem(foundPosition) {
        this.items.splice(foundPosition, 1);
    },

    generateItem() {

        const newItem = {
            top: getRandomNumber(0, config.size - 1),
            left: getRandomNumber(0, config.size - 1)
        };

        if (snake.tailCheck(newItem)) {
            this.generateItem();
        } else {
            this.items.push(newItem);
        }
    },

    render() {
        cells.renderItems(this.items, 'food');
    }
};

function init() {

    const startButton = document.getElementById('button-start');
    const pauseButton = document.getElementById('button-pause');
    const stopButton = document.getElementById('button-stop');

    startButton.addEventListener('click', game.start);
    pauseButton.addEventListener('click', game.pause);
    stopButton.addEventListener('click', game.stop);

    window.addEventListener('keydown', snake.setDirection);
}

/**
 * @param min 
 * @param max 
 * @returns {number} 
 */
function getRandomNumber(min, max) {
    return Math.trunc(Math.random() * (max - min) + min);
}

window.addEventListener('load', init);
