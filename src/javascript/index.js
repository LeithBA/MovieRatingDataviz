

import Mouse from "./utils/mouse"
import Easing from "./utils/easing"

const canvas = document.querySelector('.main-canvas')
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth * window.devicePixelRatio
canvas.height = window.innerHeight * window.devicePixelRatio
canvas.style.maxWidth = window.innerWidth
canvas.style.maxHeight = window.innerHeight

let canvasWidth = (canvas.width)
let canvasHeight = (canvas.height)
let cW2 = (canvas.width / 2)
let cH2 = (canvas.height / 2)

let maskLoaded = false

let time = 0


// à chaque image : 60fps
const update = () => {
    requestAnimationFrame(update)

    time += .01

    let mouseX = ((Mouse.cursor[0] + 1) / 2) * canvas.width
    let mouseY = ((Mouse.cursor[1] + 1) / 2) * canvas.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let size = 200

    ctx.save()

    ctx.translate(mouseX, mouseY)
    ctx.rotate(time)
    ctx.scale(Math.sin(time), Math.sin(time))

    ctx.beginPath()
    ctx.strokeStyle = '#ffffff'
    ctx.moveTo(-size / 2, size / 2)
    ctx.lineTo(0, -size / 2)
    ctx.lineTo(size / 2, size / 2)
    ctx.lineTo(-size / 2, size / 2)
    ctx.stroke()
    ctx.closePath()

    ctx.restore()

    // 


}
requestAnimationFrame(update)
