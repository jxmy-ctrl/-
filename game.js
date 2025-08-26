
class Minesweeper {
    constructor() {
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'beginner';
        this.board = [];
        this.visibleBoard = [];
        this.flaggedBoard = [];
        this.gameOver = false;
        this.firstClick = true;
        this.minesLeft = 0;
        this.cellsRevealed = 0;
        this.timer = 0;
        this.timerInterval = null;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.minesLeft = mines;
        this.cellsRevealed = 0;
        this.firstClick = true;
        this.gameOver = false;
        
        this.createBoards();
        this.renderBoard();
        this.updateMinesCount();
        this.resetTimer();
    }

    createBoards() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.visibleBoard = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.flaggedBoard = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        gameBoard.className = `grid gap-1 mx-auto`;
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, minmax(0, 1fr))`;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell cell-hidden';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(row, col);
                });
                
                gameBoard.appendChild(cell);
            }
        }
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Ensure first click and surrounding cells are safe
            if ((Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) || 
                this.board[row][col] === -1) {
                continue;
            }
            
            this.board[row][col] = -1;
            minesPlaced++;
            
            // Update adjacent cells
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    if (this.board[r][c] !== -1) {
                        this.board[r][c]++;
                    }
                }
            }
        }
    }

    handleCellClick(row, col) {
        if (this.gameOver || this.flaggedBoard[row][col]) return;
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        if (this.board[row][col] === -1) {
            this.revealMines();
            this.gameOver = true;
            document.getElementById('game-board').classList.add('game-over');
            clearInterval(this.timerInterval);
            setTimeout(() => alert('Game Over! You hit a mine!'), 100);
            return;
        }
        
        this.revealCell(row, col);
        
        if (this.checkWin()) {
            this.gameOver = true;
            clearInterval(this.timerInterval);
            setTimeout(() => alert(`Congratulations! You won in ${this.timer} seconds!`), 100);
        }
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.visibleBoard[row][col]) return;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        this.flaggedBoard[row][col] = !this.flaggedBoard[row][col];
        
        if (this.flaggedBoard[row][col]) {
            cell.classList.add('cell-flagged');
            this.minesLeft--;
        } else {
            cell.classList.remove('cell-flagged');
            this.minesLeft++;
        }
        
        this.updateMinesCount();
    }

    revealCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols || 
            this.visibleBoard[row][col] || this.flaggedBoard[row][col]) {
            return;
        }
        
        this.visibleBoard[row][col] = true;
        this.cellsRevealed++;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('cell-hidden');
        cell.classList.add('cell-revealed');
        
        if (this.board[row][col] > 0) {
            cell.textContent = this.board[row][col];
            cell.classList.add(`number-${this.board[row][col]}`);
        } else if (this.board[row][col] === 0) {
            // Auto-reveal adjacent cells for empty spaces
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r === row && c === col) continue;
                    this.revealCell(r, c);
                }
            }
        }
    }

    revealMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === -1) {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.remove('cell-hidden');
                    cell.classList.add('cell-mine');
                }
            }
        }
    }

    checkWin() {
        return this.cellsRevealed === (this.rows * this.cols - this.mines);
    }

    startTimer() {
        this.timer = 0;
        document.getElementById('timer').textContent = this.timer;
        
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.timer = 0;
        document.getElementById('timer').textContent = '0';
    }

    updateMinesCount() {
        document.getElementById('mines-count').textContent = this.minesLeft;
    }

    setDifficulty(level) {
        this.currentDifficulty = level;
        this.init();
    }

    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.init());
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setDifficulty(btn.dataset.difficulty);
            });
        });
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
