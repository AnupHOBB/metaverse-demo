export class MouseEvent
{
    isMouseDown = false
    lastPos = { x: -1, y: -1 }

    constructor(onMoveCallback)
    {
        this.onMoveCallback = onMoveCallback
    }

    onDown(event)
    {
        this.lastPos = { x: event.clientX, y: event.clientY }
        this.isMouseDown = true
    }

    onUp()
    {
        this.lastPos = { x: -1, y: -1 }
        this.isMouseDown = false
    }

    onMove(event)
    {
        if (this.isMouseDown)
        {
            let cursorPos = { x: event.clientX, y: event.clientY }
            this.onMoveCallback(this.lastPos, cursorPos)
            this.lastPos = { x: cursorPos.x, y: cursorPos.y }
        }
    }
}

export class KeyEvent
{
    keyMap = { w : false, s : false, a : false, d : false}

    constructor(onEventCallback)
    {
        this.onEventCallback = onEventCallback
    }

    onDown(event)
    {
        if (event.key == 'w')
            this.keyMap.w = true
        if (event.key == 's')
            this.keyMap.s = true
        if (event.key == 'a')
            this.keyMap.a = true
        if (event.key == 'd')
            this.keyMap.d = true
    }

    onUp(event)
    {
        if (event.key == 'w')
            this.keyMap.w = false
        if (event.key == 's')
            this.keyMap.s = false
        if (event.key == 'a')
            this.keyMap.a = false
        if (event.key == 'd')
            this.keyMap.d = false
    }

    notifyEvent()
    {
        this.onEventCallback(this.keyMap.w, this.keyMap.s, this.keyMap.a, this.keyMap.d)
    }
}