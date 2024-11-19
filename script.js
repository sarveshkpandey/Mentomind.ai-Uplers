let draggedBox = null, sourceCell = null;
const history = [];
const redoStack = [];

function makeDraggable(box) {
    box.addEventListener('dragstart', e => {
        draggedBox = box;
        sourceCell = box.parentElement;
        box.classList.add('dragging');
        e.dataTransfer.setData('text/plain', '');
    });
    box.addEventListener('dragend', () => {
        draggedBox.classList.remove('dragging');
        draggedBox = null;
        sourceCell = null;
    });
}

function makeDroppable(cell) {
    cell.addEventListener('dragover', e => e.preventDefault());
    cell.addEventListener('drop', () => {
        if (draggedBox && cell !== sourceCell && cell.firstElementChild) {
            const targetBox = cell.firstElementChild;
            const action = {
                type: 'swap',
                fromBox: draggedBox,
                toBox: targetBox,
                fromText: draggedBox.textContent,
                fromColor: draggedBox.style.backgroundColor,
                toText: targetBox.textContent,
                toColor: targetBox.style.backgroundColor
            };
            history.push(action);
            redoStack.length = 0;
            const tempText = draggedBox.textContent;
            const tempColor = draggedBox.style.backgroundColor;
            draggedBox.textContent = targetBox.textContent;
            draggedBox.style.backgroundColor = targetBox.style.backgroundColor;
            targetBox.textContent = tempText;
            targetBox.style.backgroundColor = tempColor;
        }
    });
}

document.querySelectorAll('.box').forEach(box => makeDraggable(box));
document.querySelectorAll('td').forEach(cell => makeDroppable(cell));

document.getElementById('addRow').addEventListener('click', () => {
    const table = document.getElementById('table').querySelector('tbody');
    const rowCount = table.rows.length + 1;
    const row = table.insertRow();
    const newBoxes = [];
    const rowHeader = document.createElement('th');
    rowHeader.textContent = `R${rowCount}`;
    row.style.fontSize = '12px';
    row.appendChild(rowHeader);
    for (let i = 0; i < 3; i++) {
        const cell = row.insertCell();
        const box = document.createElement('div');
        box.className = 'box';
        box.draggable = true;
        box.style.backgroundColor = `hsl(${Math.random() * 360}, 50%, 70%)`;
        box.textContent = rowCount * 100 + i * 100;
        makeDraggable(box);
        makeDroppable(cell);
        cell.appendChild(box);
        newBoxes.push({ box, parent: cell });
    }
    history.push({ type: 'addRow', row });
    redoStack.length = 0;
});

document.getElementById('undo').addEventListener('click', () => {
    if (history.length > 0) {
        const lastAction = history.pop();
        redoStack.push(lastAction);
        if (lastAction.type === 'swap') {
            const { fromBox, toBox, fromText, fromColor, toText, toColor } = lastAction;
            fromBox.textContent = fromText;
            fromBox.style.backgroundColor = fromColor;
            toBox.textContent = toText;
            toBox.style.backgroundColor = toColor;
        } else if (lastAction.type === 'addRow') {
            const { row } = lastAction;
            row.remove();
        }
    }
});

document.getElementById('redo').addEventListener('click', () => {
    if (redoStack.length > 0) {
        const lastRedoAction = redoStack.pop();
        history.push(lastRedoAction);
        if (lastRedoAction.type === 'swap') {
            const { fromBox, toBox, fromText, fromColor, toText, toColor } = lastRedoAction;
            fromBox.textContent = toText;
            fromBox.style.backgroundColor = toColor;
            toBox.textContent = fromText;
            toBox.style.backgroundColor = fromColor;
        } else if (lastRedoAction.type === 'addRow') {
            const { row } = lastRedoAction;
            document.getElementById('table').querySelector('tbody').appendChild(row);
        }
    }
});
