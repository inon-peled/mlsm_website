function stopRKey(evnt) {
    const ev = evnt || event;
    const node = ev.target || ev.srcElement;
    return ev.keyCode != 13 || node.type != 'text';
}

document.onkeypress = stopRKey;
