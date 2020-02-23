import './App.scss';

type Samples = { x: number, y: number }[];

const audioContext = new AudioContext();
const audioElement = document.getElementById('audio') as HTMLMediaElement;
const source = audioContext.createMediaElementSource(audioElement);
const processor = audioContext.createScriptProcessor(512);
const gain = audioContext.createGain();

source.connect(processor);
processor.connect(gain);
gain.connect(audioContext.destination);

let buffer: AudioBuffer = undefined;
processor.addEventListener('audioprocess', (e) => {
    buffer = e.inputBuffer;

    // Copying the output back so we can hear the audio.
    e.outputBuffer.copyToChannel(e.inputBuffer.getChannelData(0), 0);
    e.outputBuffer.copyToChannel(e.inputBuffer.getChannelData(1), 1);
})

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
let oldSamples: Samples[] = [];

function draw() {
    ctx.fillStyle = 'rgb(5, 5, 5)';
    ctx.fillRect(0, 0, 800, 800);
    ctx.fillStyle = 'rgb(0, 255, 0)';


    if (buffer) {
        let samples: { x: number, y: number }[] = [];
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);

        for (let i = 0; i < leftChannel.length; i++) {
            samples.push({ x: leftChannel[i], y: rightChannel[i] });
        }

        oldSamples.push(samples);
        if (oldSamples.length > 30) {
            oldSamples.shift();
        }

        for (let i = oldSamples.length - 1; i >= 0; i--) {
            ctx.fillStyle = 'rgb(0, ' + (i * 10) + ', 0)';
            
            for (let sample of oldSamples[i]) {
                ctx.fillRect((sample.x + 1) * canvas.width/2, (sample.y + 1) * canvas.height/2, 2, 2);
            }
        }
    }

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

const filePicker = document.getElementById('file') as HTMLInputElement;
filePicker.addEventListener('change', (e: InputEvent) => {
    if (filePicker.files[0]) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            audioElement.src = reader.result as string;
        });
        reader.readAsDataURL(filePicker.files[0]);
    }
})