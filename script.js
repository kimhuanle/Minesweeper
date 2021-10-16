var row = 15;
var col = 15;
var numMine = parseInt(row * col / 10);
var choice = row * col - numMine;
var radius = 35;
var width;
var height;
var board;
var list;
var shown;
var canvas = document.getElementById("board");
var ctx = canvas.getContext("2d");
var lastCell;
var gameOver = false;

$(document).ready(function() {
    init();
});

canvas.onmousemove = function(event) {
    if (!gameOver)
        mousemove(event);
}

canvas.onmouseout = function() {
    if (!gameOver)
        mouseout();
}

canvas.onclick = function(event) {
    if (!gameOver)
        mouseclick(event);
}

canvas.oncontextmenu = function(event) {
    if (!gameOver)
        rightclick(event);
}

function init() {
    canvas.width = radius * col;
    canvas.height = radius * row;
    canvas.style.marginLeft = "auto";
    canvas.style.marginRight = "auto";
    var parentStyle = canvas.parentElement.style;
    parentStyle.textAlign = "center";
    parentStyle.width = "100%";
    width = canvas.width;
    height = canvas.height;
    newGame();
}

function newGame() {
    board = [...Array(row)].map(x => Array(col));
    list = Array.from(Array(row * col).keys());
    list = list.sort(() => Math.random() - 0.5);
    list = list.sort(() => Math.random() - 0.5);
    for (let i = 0; i < row * col; i++) {
        x = parseInt(list[i] / col);
        y = list[i] % col;
        board[x][y] = new Cell(x, y);
        if (i < numMine) {
            board[x][y].value = -1;
        } else {
            board[x][y].value += x > 0 && y > 0 && board[x - 1][y - 1] != null && board[x - 1][y - 1].value == -1;
            board[x][y].value += x > 0 && board[x - 1][y] != null && board[x - 1][y].value == -1;
            board[x][y].value += x > 0 && y < col - 1 && board[x - 1][y + 1] != null && board[x - 1][y + 1].value == -1;
            board[x][y].value += y > 0 && board[x][y - 1] != null && board[x][y - 1].value == -1;
            board[x][y].value += y < col - 1 && board[x][y + 1] != null && board[x][y + 1].value == -1;
            board[x][y].value += x < row - 1 && y > 0 && board[x + 1][y - 1] != null && board[x + 1][y - 1].value == -1;
            board[x][y].value += x < row - 1 && board[x + 1][y] != null && board[x + 1][y].value == -1;
            board[x][y].value += x < row - 1 && y < col - 1 && board[x + 1][y + 1] != null && board[x + 1][y + 1].value == -1;
        }
    }
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            cell = board[i][j];
            if ((i + j) % 2 == 0)
                ctx.fillStyle = "#85d42a";
            else
                ctx.fillStyle = "#a2e332";
            ctx.fillRect(cell.x * radius, cell.y * radius, radius, radius);
        }
    }
}

function mousemove(event) {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
    let x = Math.floor(mouseX / radius);
    let y = Math.floor(mouseY / radius);
    if (x >= 0 && x < col && y >= 0 && y < row) {
        let cell = board[x][y];
        if (lastCell != cell) {
            if (lastCell != null && !lastCell.show) {
                x = lastCell.x;
                y = lastCell.y;
                ctx.fillStyle = (x + y) % 2 == 0 ? "#85d42a" : "#a2e332";
                ctx.fillRect(x * radius, y * radius, radius, radius);
                if (lastCell.flag)
                    drawFlag(x, y);
            }
            if (!cell.show) {
                ctx.fillStyle = "#6cb005";
                ctx.fillRect(cell.x * radius, cell.y * radius, radius, radius);
                if (cell.flag)
                    drawFlag(cell.x, cell.y);
            }
            lastCell = cell;
        }
    }
}

function mouseout() {
    if (!lastCell.show) {
        ctx.fillStyle = (lastCell.x + lastCell.y) % 2 == 0 ? "#85d42a" : "#a2e332";
        ctx.fillRect(lastCell.x * radius, lastCell.y * radius, radius, radius);
    }
}

function mouseclick(event) {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
    let x = Math.floor(mouseX / radius);
    let y = Math.floor(mouseY / radius);
    if (x >= 0 && x < col && y >= 0 && y < row) {
        choose(x, y);
    }
}

function choose(x, y) {
    let cell = board[x][y];
    val = cell.value;
    if (!cell.show && !cell.flag) {
        if (val < 0)
            showMine();
        else if (val == 0) {
            borderList = floodfill(x, y, []);
            for (const a of borderList)
                border(a.x, a.y, true, true);
        } else {
            cell.show = true;
            ctx.fillStyle = (x + y) % 2 == 0 ? "#c9c1a9" : "#e8e0c8";
            ctx.fillRect(x * radius, y * radius, radius, radius);
            ctx.font = "bold 28px Arial";
            ctx.fillStyle = "#0079eb";
            ctx.fillText(board[x][y].value, x * radius + radius / 3.5, y * radius + radius / 1.3);
            border(x, y, true, false);
            choice -= 1;
        }
        if (choice <= 0) {
            gameOver = true;
        }
    }
}

function showMine() {
    for (let i = 0; i < numMine; i++) {
        let x = parseInt(list[i] / col);
        let y = list[i] % col;
        let cell = board[x][y];
        ctx.fillStyle = "#868686";
        ctx.beginPath();
        ctx.arc(cell.x * radius + radius / 2, cell.y * radius + radius / 2, radius / 2 - 7, 0, 2 * Math.PI);
        ctx.fill();
        cell.show = true;
    }
    gameOver = true;
}

function floodfill(x, y, list) {
    if (x < 0 || y < 0 || x >= col || y >= row) return list;
    cell = board[x][y];
    if (cell.value > 0 && cell.show) {
        list.push({ x: x, y: y });
        return list;
    }
    if (cell.show || cell.value < 0) return list;
    ctx.fillStyle = (x + y) % 2 == 0 ? "#c9c1a9" : "#e8e0c8";
    ctx.fillRect(x * radius, y * radius, radius, radius);
    cell.show = true;
    choice -= 1;
    if (cell.value > 0) {
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#0079eb";
        ctx.fillText(board[x][y].value, x * radius + radius / 3.5, y * radius + radius / 1.3);
        list.push({ x: x, y: y });
        return list;
    }
    list = floodfill(x - 1, y - 1, list);
    list = floodfill(x + 1, y + 1, list);
    list = floodfill(x + 1, y - 1, list);
    list = floodfill(x - 1, y + 1, list);
    list = floodfill(x, y + 1, list);
    list = floodfill(x, y - 1, list);
    list = floodfill(x - 1, y, list);
    list = floodfill(x + 1, y, list);
    return list;
}

function rightclick(event) {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
    let x = Math.floor(mouseX / radius);
    let y = Math.floor(mouseY / radius);
    if (x >= 0 && x < col && y >= 0 && y < row) {
        let cell = board[x][y];
        if (!cell.show) {
            cell.flag = !cell.flag;
            if (cell.flag)
                drawFlag(x, y);
            else {
                ctx.fillStyle = (x + y) % 2 == 0 ? "#85d42a" : "#a2e332";
                ctx.fillRect(x * radius, y * radius, radius, radius);
            }
        } else if (cell.value > 0) {
            floodFlag(x, y);
        }
    }
    if (mouseX < canvas.width && mouseY < canvas.height) {
        event.preventDefault();
    }
}

function drawFlag(x, y) {
    ctx.fillStyle = "#ff0000";
    x = x * radius + 8;
    y = y * radius + 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20, y + 8);
    ctx.lineTo(x, y + 16);
    ctx.fill();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 22);
    ctx.lineTo(x + 5, y + 22);
    ctx.lineTo(x - 5, y + 22);
    ctx.stroke();
}

function border(x, y, first, flood) {
    if (first) {
        if (x > 0 && board[x - 1][y].value > 0 && board[x - 1][y].show)
            border(x - 1, y, false, false);
        if (y > 0 && board[x][y - 1].value > 0 && board[x][y - 1].show)
            border(x, y - 1, false, false);
        if (x < col - 1 && board[x + 1][y].value > 0 && board[x + 1][y].show)
            border(x + 1, y, false, false);
        if (y < row - 1 && board[x][y + 1].value > 0 && board[x][y + 1].show)
            border(x, y + 1, false, false);
        ctx.fillStyle = (x + y) % 2 == 0 ? "#c9c1a9" : "#e8e0c8";
        if (x > 0 && y > 0 && board[x - 1][y - 1].value > 0 && board[x - 1][y - 1].show && board[x - 1][y].show && board[x][y - 1].show)
            ctx.fillRect(x * radius - 2, y * radius - 2, 2, 2);
        if (y > 0 && x < col - 1 && board[x + 1][y - 1].value > 0 && board[x + 1][y - 1].show && board[x][y - 1].show && board[x + 1][y].show)
            ctx.fillRect((x + 1) * radius, y * radius - 2, 2, 2);
        if (x < col - 1 && y < row - 1 && board[x + 1][y + 1].value > 0 && board[x + 1][y + 1].show && board[x][y + 1].show && board[x + 1][y].show)
            ctx.fillRect((x + 1) * radius, (y + 1) * radius, 2, 2);
        if (y < row - 1 && x > 0 && board[x - 1][y + 1].value > 0 && board[x - 1][y + 1].show && board[x][y + 1].show && board[x - 1][y].show)
            ctx.fillRect(x * radius - 2, (y + 1) * radius, 2, 2);
    }
    if (!first && !flood) {
        ctx.fillStyle = (x + y) % 2 == 0 ? "#c9c1a9" : "#e8e0c8";
        ctx.fillRect(x * radius, y * radius, radius, radius);
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#0079eb";
        ctx.fillText(board[x][y].value, x * radius + radius / 3.5, y * radius + radius / 1.3);
    }
    ctx.strokeStyle = "#106610";
    ctx.lineWidth = 2;
    if (x > 0 && !board[x - 1][y].show) {
        ctx.beginPath();
        if (y > 0 && board[x - 1][y - 1].show && board[x][y - 1].show)
            ctx.moveTo(x * radius + 1, y * radius - 2);
        else
            ctx.moveTo(x * radius + 1, y * radius);
        if (y < row - 1 && board[x - 1][y + 1].show && board[x][y + 1].show)
            ctx.lineTo(x * radius + 1, (y + 1) * radius + 2);
        else
            ctx.lineTo(x * radius + 1, (y + 1) * radius);
        ctx.stroke();
    }
    if (y > 0 && !board[x][y - 1].show) {
        ctx.beginPath();
        if (x > 0 && board[x - 1][y - 1].show && board[x - 1][y].show)
            ctx.moveTo(x * radius - 2, y * radius + 1);
        else
            ctx.moveTo(x * radius, y * radius + 1);
        if (x < col - 1 && board[x + 1][y - 1].show && board[x + 1][y].show)
            ctx.lineTo((x + 1) * radius + 2, y * radius + 1);
        else
            ctx.lineTo((x + 1) * radius, y * radius + 1);
        ctx.stroke();
    }
    if (x < col - 1 && !board[x + 1][y].show) {
        ctx.beginPath();
        if (y > 0 && board[x + 1][y - 1].show && board[x][y - 1].show)
            ctx.moveTo((x + 1) * radius - 1, y * radius - 2);
        else
            ctx.moveTo((x + 1) * radius - 1, y * radius);
        if (y < row - 1 && board[x + 1][y + 1].show && board[x][y + 1].show)
            ctx.lineTo((x + 1) * radius - 1, (y + 1) * radius + 2);
        else
            ctx.lineTo((x + 1) * radius - 1, (y + 1) * radius);
        ctx.stroke();
    }
    if (y < row - 1 && !board[x][y + 1].show) {
        ctx.beginPath();
        if (x > 0 && board[x - 1][y + 1].show && board[x - 1][y].show)
            ctx.moveTo(x * radius - 2, (y + 1) * radius - 1);
        else
            ctx.moveTo(x * radius, (y + 1) * radius - 1);
        if (x < col - 1 && board[x + 1][y + 1].show && board[x + 1][y].show)
            ctx.lineTo((x + 1) * radius + 2, (y + 1) * radius - 1);
        else
            ctx.lineTo((x + 1) * radius, (y + 1) * radius - 1);
        ctx.stroke();
    }
}

function floodFlag(x, y) {
    let count = 0;
    let list = [];
    for (let i = -1; i < 2; i++) {
        x1 = x - 1;
        y1 = y + i;
        x2 = x + 1;
        y2 = y + i;
        if (x1 >= 0 && y1 >= 0 && y1 < row) {
            let cell = board[x1][y1];
            if (cell.flag)
                count++;
            else
                list.push({ x: x1, y: y1 });
        }
        if (x2 < col && y2 >= 0 && y2 < row) {
            let cell = board[x2][y2];
            if (cell.flag)
                count++;
            else
                list.push({ x: x2, y: y2 });
        }
    }
    if (y > 0) {
        let cell = board[x][y - 1];
        if (cell.flag)
            count++;
        else
            list.push({ x: x, y: y - 1 });
    }
    if (y < row - 1) {
        let cell = board[x][y + 1];
        if (cell.flag)
            count++;
        else
            list.push({ x: x, y: y + 1 });
    }
    if (count == board[x][y].value) {
        for (const a of list)
            choose(a.x, a.y);
    }
}
