type Point = [number, number]
type Context = CanvasRenderingContext2D
const H = 800
const TAU = Math.PI * 2
const cap = (x: number) => Math.max(0, Math.min(x, 1))
const ease = (x: number) => { const t = cap(x); return t * t * (3 - 2 * t) }
const hash = (x: number) => { const n = Math.sin(x * 91.732 + 15.87) * 43758.5453; return n - Math.floor(n) }

function polygon(ctx: Context, color: string, ...points: Point[]) {
    ctx.beginPath()
    ctx.moveTo(...points[0])
    for (const point of points.slice(1)) ctx.lineTo(...point)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
}

function oval(ctx: Context, x: number, y: number, rx: number, ry: number, color: string) {
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU)
    ctx.fillStyle = color
    ctx.fill()
}

function wash(ctx: Context, width: number, top: string, middle: string, bottom: string) {
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, top)
    sky.addColorStop(.58, middle)
    sky.addColorStop(1, bottom)
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, width, H)
}

function glow(ctx: Context, x: number, y: number, radius: number, color: string) {
    const light = ctx.createRadialGradient(x, y, 0, x, y, radius)
    light.addColorStop(0, color)
    light.addColorStop(1, 'transparent')
    ctx.fillStyle = light
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
}

function ridge(ctx: Context, width: number, y: number, height: number, color: string, seed: number) {
    const points: Point[] = []
    for (let i = 0; i <= Math.ceil(width / 48) + 1; i++) {
        points.push([i * 48 - 40, y - Math.sin(i * .56 + seed) * height * .44 - hash(i + seed) * height])
    }
    polygon(ctx, color, [-40, H], ...points, [width + 50, H])
    for (let i = 1; i < points.length - 1; i++) {
        const [x, peak] = points[i]
        if (peak > points[i - 1][1] || peak > points[i + 1][1]) continue
        polygon(ctx, '#a5aaca22', points[i - 1], [x, peak], [x - 7, peak + 27], [x + 28, peak + 69],
            [x - 22, peak + 48], [x - 37, peak + 55])
    }
}

function fir(ctx: Context, x: number, feet: number, size: number, shade: string, snow: string, seed: number) {
    ctx.save()
    ctx.translate(x, feet)
    ctx.scale(size / 200, size / 200)
    polygon(ctx, '#21192a', [-10, 0], [-4, -71], [5, -71], [9, 0])
    for (let level = 3; level >= 0; level--) {
        const y = -207 + 38 * level
        const width = 27 + level * 19
        const lean = (hash(seed + level) - .5) * 18
        polygon(ctx, shade, [lean, y], [width * .62, y + 45], [width, y + 63],
            [width * .44, y + 60], [width * .55, y + 71], [0, y + 64],
            [-width * .7, y + 70], [-width * .62, y + 58], [-width, y + 62], [-width * .56, y + 38])
        polygon(ctx, snow, [lean, y + 5], [width * .54, y + 49], [width * .24, y + 43],
            [0, y + 39], [-width * .6, y + 49], [-width * .33, y + 34])
        polygon(ctx, '#141d306b', [lean, y + 12], [width * .58, y + 45], [width, y + 63],
            [width * .41, y + 58], [3, y + 50])
        polygon(ctx, '#c3c9d32a', [-width * .66, y + 47], [-width * .34, y + 27], [-width * .32, y + 39], [-8, y + 41])
    }
    ctx.restore()
}

function mountains(ctx: Context, width: number, t: number, warm = false) {
    wash(ctx, width, '#111528', warm ? '#695369' : '#455678', '#332c43')
    const moonX = width * (warm ? .75 : .59) - t * 2
    glow(ctx, moonX, 152, 146, '#c7b3c467')
    oval(ctx, moonX, 152, 38, 38, '#e8d3bb')
    oval(ctx, moonX - 12, 150, 15, 27, '#b7a7a538')
    oval(ctx, moonX + 5, 173, 12, 8, '#b7a7a538')
    for (let i = 0; i < 65; i++) {
        oval(ctx, hash(i + 20) * width, 22 + hash(i + 51) * 322, .65 + hash(i) * 1.25, .75, '#d9cfea8a')
    }
    ridge(ctx, width, 438, 164, '#4c516b', 3)
    ridge(ctx, width, 510, 108, '#393d59', 8)
    for (let i = -1; i < width / 31 + 1; i++) {
        fir(ctx, i * 31 - t * 1.7, 523 + hash(i + 4) * 45, 37 + hash(i + 79) * 70, '#292d47', '#495471', i)
    }
}

function windowLight(ctx: Context, x: number, y: number, w: number, h: number, light: number) {
    ctx.fillStyle = '#291e29'
    ctx.fillRect(x - 3, y - 3, w + 6, h + 7)
    if (light > 0) {
        glow(ctx, x + w / 2, y + h / 2, h * 1.65, '#fca9584c')
        const pane = ctx.createLinearGradient(0, y, 0, y + h)
        pane.addColorStop(0, '#bf6551')
        pane.addColorStop(1, '#ffe0a0')
        ctx.fillStyle = pane
        ctx.fillRect(x, y, w, h)
        ctx.fillStyle = '#745143'
        ctx.fillRect(x + w * .46, y, Math.max(1, w * .08), h)
        ctx.fillRect(x, y + h * .42, w, Math.max(1, h * .06))
    }
    polygon(ctx, '#b8b7c8', [x - 5, y + h], [x + w + 5, y + h], [x + w + 2, y + h + 4], [x - 5, y + h + 4])
}

function house(ctx: Context, x: number, y: number, s: number, seed: number, lit = true) {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(s, s)
    const plaster = ['#75434a', '#644454', '#85575a'][seed % 3]
    polygon(ctx, '#3c3043', [-95, -101], [51, -116], [101, -89], [102, 0], [-94, 0])
    polygon(ctx, plaster, [-95, -99], [46, -110], [50, 0], [-94, 0])
    polygon(ctx, '#2b2335', [-111, -91], [-29, -184], [17, -173], [111, -89], [47, -100], [-31, -166])
    polygon(ctx, '#a6adcb', [-115, -100], [-29, -188], [15, -181], [111, -98], [91, -97], [12, -166],
        [-28, -172], [-65, -124], [-98, -96])
    polygon(ctx, '#302836', [56, -137], [77, -139], [76, -181], [61, -184])
    polygon(ctx, '#c7c2d2', [58, -187], [79, -184], [79, -178], [57, -181])
    for (let i = 0; i < 8; i++) {
        polygon(ctx, '#25182436', [-93, -89 + i * 12], [47, -96 + i * 12], [46, -94 + i * 12], [-93, -88 + i * 12])
    }
    windowLight(ctx, -77, -71, 29, 37, +lit)
    windowLight(ctx, 3, -76, 29, 35, +lit)
    polygon(ctx, '#352733', [-36, 0], [-37, -61], [-7, -66], [-3, 0])
    polygon(ctx, '#b7b7cb', [-102, -3], [-64, -6], [-28, 0], [22, -4], [59, -2], [108, 1], [106, 5], [-108, 5])
    ctx.restore()
}

function drawCourier(ctx: Context, x: number, y: number, s: number, step: number, reach = 0) {
    ctx.save()
    ctx.translate(x, y + Math.abs(Math.sin(step)) * -2 * s)
    ctx.scale(s, s)
    const stride = Math.sin(step) * 17
    oval(ctx, 0, 4, 38, 7, '#221b30a0')
    polygon(ctx, '#262535', [-13, -46], [-5, -40], [stride - 8, -4], [stride + 5, -1], [stride + 4, 5], [stride - 17, 4])
    polygon(ctx, '#433142', [7, -51], [19, -47], [-stride + 10, -7], [-stride + 25, -4], [-stride + 23, 3], [-stride + 2, 2])
    polygon(ctx, '#572e49', [-18, -109], [11, -112], [23, -97], [29, -43], [-27, -42], [-24, -83])
    polygon(ctx, '#883e51', [-11, -106], [13, -108], [24, -91], [20, -50], [-3, -46], [-15, -68])
    polygon(ctx, '#ad7252', [-32, -74], [-5, -78], [2, -44], [-27, -39])
    polygon(ctx, '#e0a365', [-33, -76], [-7, -79], [-4, -69], [-18, -62], [-30, -64])
    polygon(ctx, '#e4a583', [-6, -132], [13, -136], [22, -123], [27, -119], [20, -115], [19, -108], [4, -105], [-8, -116])
    polygon(ctx, '#a46568', [-6, -130], [5, -130], [4, -120], [12, -108], [4, -105], [-8, -116])
    oval(ctx, 17, -124, 1.7, 1.35, '#493345')
    polygon(ctx, '#303648', [-15, -120], [-9, -142], [3, -153], [18, -148], [23, -131], [30, -128], [12, -125])
    polygon(ctx, '#576e83', [-15, -127], [22, -135], [25, -129], [-15, -122])
    const flutter = Math.sin(step * .8) * 7
    polygon(ctx, '#bf4d4a', [-13, -110], [13, -108], [15, -100], [-15, -101], [-33, -88 + flutter], [-53, -91 + flutter], [-45, -101 + flutter], [-24, -104])
    const handX = 25 + reach * 26 + stride * .26
    const handY = -71 - reach * 22
    polygon(ctx, '#9c4e62', [12, -99], [27, -93], [handX + 1, handY - 5], [handX - 4, handY + 6], [14, -79])
    oval(ctx, handX, handY, 7, 6, '#df9d7c')
    for (let i = 0; i < 3; i++) oval(ctx, 5 + i, -93 + i * 9, 1.5, 1.65, '#d28e71')
    ctx.restore()
}

function snowfield(ctx: Context, width: number, y: number, depth: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(width * .22, y - depth, width * .64, y + depth, width, y - depth * .2)
    ctx.lineTo(width, H)
    ctx.lineTo(0, H)
    ctx.fill()
}

function snowDrifts(ctx: Context, width: number, start: number, seed: number) {
    for (let i = 0; i < 31; i++) {
        const x = hash(i + seed) * width
        const y = start + hash(i + seed + 30) * (H - start)
        const length = (12 + hash(i + seed + 60) * 70) * (.45 + y / H)
        polygon(ctx, i % 3 ? '#332c4b1c' : '#e8d4d428', [x - length, y + 2], [x + length * .1, y - 3],
            [x + length, y + 1], [x + length * .25, y + 3])
    }
}

function footprints(ctx: Context, x: number, y: number, steps: number, stepWidth: number) {
    for (let i = 1; i <= steps; i++) {
        const scale = 1 + i / 16
        oval(ctx, x - i * stepWidth + (i % 2 ? 6 : -6), y + i * i * .85, 3.8 * scale, 2.3 * scale, '#514a675e')
    }
}

function forest(ctx: Context, w: number, t: number) {
    mountains(ctx, w, t)
    const c = w / 2
    glow(ctx, c + 34, 475, 129, '#fca5795e')
    for (let i = 0; i < 8; i++) house(ctx, c - 70 + i * 19, 487 + hash(i) * 16, .09 + hash(i + 33) * .09, i)
    snowfield(ctx, w, 560, 88, '#777f9f')
    polygon(ctx, '#b4adc5', [c + 35, 538], [c + 18, 600], [c + 76, 658], [c + 127, 753], [c + 96, 800],
        [c - 129, 800], [c - 9, 720], [c + 14, 663], [c - 18, 604])
    snowDrifts(ctx, w, 570, 3)
    for (let i = 0; i < 15; i++) {
        const side = i % 2 ? 1 : -1
        const distance = 90 + hash(i + 7) * w * .58 + t * (3 + hash(i + 8) * 8)
        const foot = 562 + hash(i + 18) * 255
        fir(ctx, c + side * distance, foot, 120 + (foot - 550) * 1.65, '#1e293e', '#68768e', i)
    }
    const x = c - 44 + 89 * ease(t / 7)
    const y = 733 - t * 11
    footprints(ctx, x, y, 7, 5)
    drawCourier(ctx, x, y, 1.04 - t * .064, t * 10)
}

function village(ctx: Context, w: number, t: number) {
    mountains(ctx, w, 6, true)
    const c = w / 2
    snowfield(ctx, w, 502, 41, '#7d7790')
    ctx.fillStyle = '#b5a4ad'
    ctx.beginPath()
    ctx.moveTo(c - 29, 493)
    ctx.lineTo(c + 34, 493)
    ctx.bezierCurveTo(c + 64, 552, c + w * .19, 726, c + w * .39, H)
    ctx.lineTo(c - w * .44, H)
    ctx.bezierCurveTo(c - w * .22, 723, c - 53, 557, c - 29, 493)
    ctx.fill()
    snowDrifts(ctx, w, 515, 19)
    for (let i = 7; i >= 0; i--) {
        const depth = 1 - i / 8
        const shift = depth * t * 7
        const side = 56 + depth * (w * .47 + 80) + shift
        const base = 510 + depth * 176 + shift + hash(i + 29) * 27
        glow(ctx, c - side * .79, base + 19, 32 + depth * 100, '#f8ae6a55')
        glow(ctx, c + side * .76, base + 26, 35 + depth * 105, '#f8ae6a55')
        house(ctx, c - side, base, .22 + depth * 1.26 + hash(i + 2) * .25, i)
        house(ctx, c + side * .93, base + 12, .2 + depth * 1.3 + hash(i + 6) * .22, i + 9, i !== 1)
    }
    for (let j = 0; j < 3; j++) {
        const spread = 25 + j * 18
        ctx.beginPath()
        ctx.moveTo(c - 8 * spread, 232 + j * 60)
        ctx.quadraticCurveTo(c, 362 + j * 60, c + 8 * spread, 232 + j * 60)
        ctx.strokeStyle = '#2c263b9a'
        ctx.lineWidth = 1.2
        ctx.stroke()
        for (let i = -8; i <= 8; i++) {
            const x = c + i * spread
            const y = 300 + j * 60 - i * i * 1.02
            glow(ctx, x, y, 19, '#ffc57265')
            oval(ctx, x, y, 2.8, 3.8, '#ffda99')
        }
    }
    const x = c - 60 + 141 * ease(t / 7)
    const y = 721 - t * 6.4
    footprints(ctx, x, y, 8, 8)
    drawCourier(ctx, x, y, 1.19 - t * .047, t * 10)
}

function delivery(ctx: Context, w: number, t: number) {
    const c = w / 2
    wash(ctx, w, '#1c1b33', '#5d4a6a', '#897d9b')
    ridge(ctx, w, 535, 122, '#4a405e', 19)
    for (let i = 0; i < 6; i++) {
        fir(ctx, c + (i % 2 ? 1 : -1) * (226 + hash(i) * w * .28),
            635 + hash(i + 4) * 34, 150 + hash(i + 17) * 273, '#292439', '#6f667f', i)
    }
    polygon(ctx, '#714650', [c - 250, 204], [c - 43, 84], [c + 246, 145], [c + 246, 670], [c - 250, 700])
    for (let i = 0; i < 22; i++) {
        const y = 167 + i * 24
        polygon(ctx, '#34253868', [c - 249, y + 35], [c + 247, y], [c + 247, y + 3], [c - 249, y + 39])
    }
    polygon(ctx, '#39293d', [c - 277, 203], [c - 57, 58], [c + 254, 130], [c + 270, 166], [c - 53, 99], [c - 268, 233])
    polygon(ctx, '#b8b7cc', [c - 281, 199], [c - 58, 50], [c + 254, 121], [c + 263, 140], [c - 55, 72], [c - 264, 210])
    windowLight(ctx, c + 60, 212, 86, 118, 1)
    const open = ease((t - 2.1) / 1.5)
    glow(ctx, c + 34, 480, 220 * open + 1, '#f3a4508c')
    polygon(ctx, '#2b2335', [c - 20, 607], [c - 18, 346], [c + 101, 332], [c + 110, 613])
    polygon(ctx, '#ffe1a7', [c - 15, 603], [c - 14, 351], [c - 14 + open * 105, 341], [c - 11 + open * 104, 608])
    polygon(ctx, '#523a43', [c - 14 + open * 105, 341], [c + 104, 338], [c + 108, 608], [c - 11 + open * 104, 608])
    snowfield(ctx, w, 671, 58, '#aaa4be')
    snowDrifts(ctx, w, 679, 41)
    ctx.globalAlpha = open
    polygon(ctx, '#ffcf914f', [c - 13, 605], [c + 95, 608], [c + 186, 797], [c - 155, 797])
    glow(ctx, c + 32, 652, 130, '#ffb77063')
    ctx.globalAlpha = 1
    polygon(ctx, '#63617b', [c - 33, 608], [c + 126, 606], [c + 161, 660], [c - 61, 670])
    polygon(ctx, '#c8bbc9', [c - 52, 659], [c + 154, 649], [c + 159, 661], [c - 58, 676])
    if (open > .15) {
        ctx.globalAlpha = open
        polygon(ctx, '#714655', [c + 55, 470], [c + 79, 460], [c + 95, 550], [c + 43, 550])
        const arm = ease((t - 3.9) / .9)
        polygon(ctx, '#714655', [c + 58, 474], [c + 63, 486], [c + 61 - arm * 31, 501 - arm * 7], [c + 53 - arm * 27, 495 - arm * 8])
        oval(ctx, c + 53 - arm * 25, 497 - arm * 7, 4.8, 4, '#b67968')
        oval(ctx, c + 65, 449, 15, 21, '#b67968')
        polygon(ctx, '#65414d', [c + 47, 448], [c + 48, 430], [c + 65, 421], [c + 80, 433], [c + 84, 446])
        ctx.globalAlpha = 1
    }
    const x = c - 191 + ease(t / 2.1) * 120 - ease((t - 5.6) / 1.65) * 135
    const reach = ease((t - 2.6) / 1.1) * (1 - ease((t - 5.2) / .5))
    const step = t < 2.1 || t > 5.6 ? t * 11 : 0
    drawCourier(ctx, x, 677, 1.63, step, reach)
    if (t >= 2.5 && t < 5.1) {
        const handover = ease((t - 4.15) / .9)
        const mailX = x + (25 + reach * 26) * 1.63 + 16 * handover
        const mailY = 677 + (-71 - reach * 22) * 1.63 - 26 * handover
        polygon(ctx, '#fff1d3', [mailX - 10, mailY - 8], [mailX + 17, mailY - 11], [mailX + 20, mailY + 8], [mailX - 7, mailY + 11])
        polygon(ctx, '#d7ad91', [mailX - 10, mailY - 8], [mailX + 6, mailY + 1], [mailX + 17, mailY - 11], [mailX + 6, mailY - 2])
        oval(ctx, mailX + 6, mailY, 3, 3, '#ab514d')
    }
}

function star(ctx: Context, x: number, y: number, size: number) {
    const points: Point[] = Array.from({ length: 16 }, (_, i) => {
        const angle = i * Math.PI / 8 - Math.PI / 2
        const radius = i % 2 ? size * .21 : i % 4 === 0 ? size : size * .55
        return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]
    })
    polygon(ctx, '#fff2bd', ...points)
}

function square(ctx: Context, w: number, t: number) {
    const c = w / 2
    mountains(ctx, w, 7, true)
    snowfield(ctx, w, 568, 39, '#867993')
    snowDrifts(ctx, w, 592, 91)
    for (let j = 5; j >= 0; j--) {
        const x = 112 + j * Math.max(58, w * .092)
        house(ctx, c - x, 607 - j * 3, .75 + j * .14, j, t > j * .3)
        house(ctx, c + x, 591 - j * 4, .78 + j * .14, j + 2, t > j * .35)
    }
    const light = ease((t - .3) / 2.5)
    glow(ctx, c, 515, 280, 'rgba(246,165,86,' + light * .44 + ')')
    oval(ctx, c, 624, 205, 24, '#41384d5c')
    fir(ctx, c, 612, 421, '#253b43', '#8a9eab', 29)
    for (let i = 0; i < 102; i++) {
        const tier = i % 4
        const branch = hash(i + 25) * 2 - 1
        const x = c + branch * (39 + tier * 32)
        const y = 265 + tier * 80 + (Math.abs(branch) - .5) * 28 + hash(i + 70) * 31
        const on = cap((t - (.4 + (610 - y) / 220 + hash(i) * .7)) * 2.1)
        if (on <= 0) continue
        ctx.globalAlpha = on * (.76 + Math.sin(t * 3.8 + i) * .24)
        const radius = 1.6 + hash(i + 7) * 2.5
        glow(ctx, x, y, radius * 5, '#ffc67d64')
        oval(ctx, x, y, radius, radius, i % 7 === 0 ? '#ee8875' : '#ffe6a3')
    }
    ctx.globalAlpha = ease((t - 1.6) / 1.2)
    glow(ctx, c, 176, 120, '#ffca6d95')
    star(ctx, c, 176, 29 + Math.sin(t * 2) * 3)
    ctx.globalAlpha = 1
    drawCourier(ctx, c - 128, 666, .59, 0)
}

const shots = [
    { start: 0, draw: forest },
    { start: 7, draw: village },
    { start: 14, draw: delivery },
    { start: 22, draw: square },
]

function drawSnow(ctx: Context, w: number, time: number) {
    for (let i = 0; i < 97; i++) {
        const depth = hash(i + 491)
        const y = ((hash(i) * H + time * (25 + depth * 89)) % (H + 28)) - 14
        const x = ((hash(i + 18) * w + time * (11 + depth * 44) + Math.sin(time * 1.3 + i) * 18 + w) % w)
        oval(ctx, x, y, .7 + depth * 2.45, .6 + depth * 1.78, depth > .76 ? '#fff4dcad' : '#e0e9f97a')
    }
}

export function createChristmasRenderer(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return null

    const texture = document.createElement('canvas')
    texture.width = texture.height = 128
    const grain = texture.getContext('2d')
    if (grain) {
        const pixels = grain.createImageData(128, 128)
        for (let i = 0; i < pixels.data.length; i += 4) {
            const value = hash(i)
            pixels.data.fill(value > .5 ? 255 : 0, i, i + 3)
            pixels.data[i + 3] = Math.round(hash(i + 27) * 22)
        }
        grain.putImageData(pixels, 0, 0)
    }
    const pattern = ctx.createPattern(texture, 'repeat')
    let width = 0
    let height = 0

    return (time: number, still = false) => {
        if (width !== canvas.clientWidth || height !== canvas.clientHeight) {
            width = canvas.clientWidth
            height = canvas.clientHeight
            const scale = Math.min(window.devicePixelRatio || 1, 1.5, 1600 / Math.max(width, 1))
            canvas.width = Math.max(1, Math.round(width * scale))
            canvas.height = Math.max(1, Math.round(height * scale))
        }
        const w = H * canvas.width / canvas.height
        ctx.setTransform(canvas.height / H, 0, 0, canvas.height / H, 0, 0)
        let i = shots.length - 1
        while (i > 0 && time < shots[i].start) i--
        shots[i].draw(ctx, w, time - shots[i].start)
        if (!still) {
            drawSnow(ctx, w, time)
            const start = shots[i].start
            const end = shots[i + 1]?.start ?? 30
            ctx.fillStyle = 'rgba(19,20,34,' + (1 - ease(Math.min(time - start, end - time) / .46)) * .88 + ')'
            ctx.fillRect(0, 0, w, H)
        }
        if (pattern) {
            ctx.fillStyle = pattern
            ctx.fillRect(0, 0, w, H)
        }
    }
}
