type Voice = "felt" | "strings" | "bell"

const beat = .72
const bars = [
    { bass: 38, chord: [57, 62, 65], melody: [69, 0, 74, 77, 76, 0, 74, 0] },
    { bass: 34, chord: [58, 62, 65], melody: [72, 0, 69, 0, 65, 0, 67, 0] },
    { bass: 41, chord: [57, 60, 65], melody: [69, 0, 72, 0, 77, 76, 72, 0] },
    { bass: 36, chord: [55, 60, 64], melody: [67, 72, 74, 0, 76, 0, 72, 0] },
    { bass: 38, chord: [57, 62, 65], melody: [69, 0, 74, 77, 76, 0, 69, 0] },
    { bass: 34, chord: [58, 62, 65], melody: [70, 0, 74, 0, 72, 69, 65, 0] },
    { bass: 43, chord: [58, 62, 67], melody: [67, 0, 70, 0, 74, 72, 70, 0] },
    { bass: 36, chord: [58, 60, 64], melody: [67, 72, 76, 0, 77, 76, 74, 0] },
    { bass: 41, chord: [57, 60, 65], melody: [77, 0, 81, 84, 82, 0, 81, 0] },
    { bass: 41, chord: [57, 60, 65], melody: [79, 0, 77, 0, 72, 0, 77, 0] },
]

const harmonics: Record<Voice, readonly (readonly [number, number])[]> = {
    felt: [[1, 1], [2.001, .18], [3.004, .05]],
    strings: [[1, 1], [1.003, .48], [2, .13]],
    bell: [[1, 1], [2.01, .32], [3.99, .14], [5.43, .085]],
}

const frequency = (note: number) => 440 * 2 ** ((note - 69) / 12)

export function playChristmasSoundtrack(context: AudioContext, elapsed: number) {
    if (elapsed >= 29.85 || context.state !== "running") return

    const initialTime = context.currentTime + .025
    const origin = initialTime - elapsed
    const end = origin + 30
    const sources: AudioScheduledSourceNode[] = []
    const output = context.createGain()
    const score = context.createGain()
    const room = context.createConvolver()
    const roomLevel = context.createGain()

    const impulse = context.createBuffer(2, Math.round(context.sampleRate * 1.25), context.sampleRate)
    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
        const samples = impulse.getChannelData(channel)
        for (let i = 0; i < samples.length; i++) {
            samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length) ** 3
        }
    }
    room.buffer = impulse
    roomLevel.gain.value = .24
    score.connect(output)
    score.connect(room).connect(roomLevel).connect(output)
    output.connect(context.destination)

    output.gain.setValueAtTime(0, initialTime)
    output.gain.linearRampToValueAtTime(.72, Math.min(initialTime + .12, end))
    output.gain.linearRampToValueAtTime(.72, Math.max(initialTime + .12, end - .85))
    output.gain.linearRampToValueAtTime(0, Math.max(initialTime + .12, end))

    const bounds = (at: number, duration: number) => ({
        from: Math.max(initialTime, origin + at),
        to: Math.min(end, origin + at + duration),
    })

    function note(at: number, length: number, pitch: number, volume: number, voice: Voice) {
        const { from, to } = bounds(at, length)
        if (to - from < .025) return
        const held = voice === "strings"
        const attack = Math.min(held ? .35 : .018, (to - from) / 3)
        const offset = Math.max(0, elapsed - at)
        const level = volume * (held ? 1 : .28 ** (offset / length))
        const envelope = context.createGain()
        envelope.connect(score)
        envelope.gain.setValueAtTime(.0001, from)
        envelope.gain.exponentialRampToValueAtTime(level, from + attack)
        if (held) envelope.gain.setValueAtTime(level, Math.max(from + attack, to - .39))
        envelope.gain.exponentialRampToValueAtTime(.0001, to)
        for (const [ratio, strength] of harmonics[voice]) {
            const oscillator = context.createOscillator()
            const overtone = context.createGain()
            oscillator.frequency.value = frequency(pitch) * ratio
            overtone.gain.value = strength
            oscillator.connect(overtone).connect(envelope)
            oscillator.start(from)
            oscillator.stop(to)
            sources.push(oscillator)
        }
    }

    bars.forEach(({ bass, chord, melody }, index) => {
        const at = index * beat * 4
        const swell = index < 2 ? .75 : index >= 8 ? 1.22 : 1
        note(at, 2.75, bass, .065 * swell, "felt")
        chord.forEach((pitch, i) => {
            note(at + i * .035, 2.92, pitch, .018 * swell, "strings")
            note(at + (.65 + i * .55) * beat, 1.12, pitch, .056 * swell, "felt")
        })
        melody.forEach((pitch, i) => {
            if (pitch) note(at + i * beat / 2, i % 2 ? .75 : 1.2, pitch, .079 * swell, "felt")
        })
    })
    note(28.8, 1.18, 65, .064, "felt")

    const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const samples = noise.getChannelData(0)
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1

    function foley(at: number, length: number, volume: number, low: number, high: number, attack = .017) {
        const { from, to } = bounds(at, length)
        if (to - from < .025) return
        const sample = context.createBufferSource()
        const filter = context.createBiquadFilter()
        const envelope = context.createGain()
        sample.buffer = noise
        sample.loop = true
        filter.type = "bandpass"
        filter.Q.value = .75
        filter.frequency.setValueAtTime(low, from)
        filter.frequency.exponentialRampToValueAtTime(high, to)
        envelope.gain.setValueAtTime(.0001, from)
        envelope.gain.exponentialRampToValueAtTime(volume, from + Math.min(attack, (to - from) / 2))
        envelope.gain.exponentialRampToValueAtTime(.0001, to)
        sample.connect(filter).connect(envelope).connect(output)
        sample.start(from, at % noise.duration)
        sample.stop(to)
        sources.push(sample)
    }

    foley(0, 7.1, .09, 470, 180, 1.4)
    foley(4.3, 3.1, .055, 320, 140, .48)
    for (const [start, steps, level] of [[.55, 18, .071], [7.32, 20, .05], [14.15, 6, .075], [19.7, 6, .063]]) {
        for (let i = 0; i < steps; i++) {
            foley(start + i * .322, .19, level * (i % 2 ? .7 : 1), 220 + i % 3 * 98, 165)
        }
    }
    note(15.77, .13, 43, .085, "felt")
    note(15.98, .16, 42, .072, "felt")
    foley(16.13, 1.26, .115, 180, 715, .18)
    note(16.2, .75, 41, .037, "strings")
    foley(17.43, .37, .12, 1150, 585, .041)
    foley(18.32, .29, .073, 1310, 770)
    foley(18.55, .21, .062, 1100, 900)

    for (const [at, pitch, volume] of [
        [23.1, 72, .062], [23.47, 77, .07], [23.9, 81, .082], [24.3, 84, .09],
        [24.76, 88, .057], [25.5, 84, .089], [25.81, 81, .059], [26.25, 77, .079],
        [27.05, 72, .058], [28.7, 77, .053],
    ]) {
        note(at, 2.05, pitch, volume, "bell")
    }

    return () => {
        const now = context.currentTime
        output.gain.cancelScheduledValues(now)
        output.gain.setTargetAtTime(0, now, .012)
        for (const source of sources) source.stop(now + .055)
        window.setTimeout(() => output.disconnect(), 75)
    }
}
