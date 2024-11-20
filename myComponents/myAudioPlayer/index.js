import { ButterchurnVisualizer} from '../butterchurn/index.js';

// Create an audio player component that uses web audio and the audio context.
// It should expose its output node
class MyAudioPlayer extends HTMLElement {
    constructor() {
        super();

        // Create shadow DOM
        const shadow = this.attachShadow({ mode: 'open' });

        // Create audio element
        this.audio = document.createElement('audio');
        this.audio.controls = true;
        this.audio.crossOrigin = 'anonymous';
        this.audio.src = this.getAttribute('audio-src');
        this.audio.id = 'audio';
        this.audio.crossOrigin = 'anonymous';
        this.audio.style.zIndex = 100;

        this.audio.onplay = () => {
            
            console.log('play');
            this.audioContext.resume();
        }
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                position: relative;
                width: 100%;
                height: 400px;
            }
            #audio {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        `;
        shadow.appendChild(style);
        shadow.appendChild(this.audio);

        // Initialize variables
        this.audioContext = new AudioContext();
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.output = this.audioContext.createGain();
        this.source.connect(this.output);
        this.output.connect(this.audioContext.destination);

        // connect the output to the butterchurn component
        this.butterchurn = new ButterchurnVisualizer(this.audioContext);
    }

    connectedCallback() {
        // à remplacer par un ajout dans le HTML
        this.shadowRoot.appendChild(this.butterchurn);
        this.butterchurn.connectVisualizerToExternalSource(this.output);

    }
}

// Define the custom element
customElements.define('my-audio-player', MyAudioPlayer);