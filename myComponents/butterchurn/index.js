import "./libs/butterchurn.js";
import "./libs/butterchurn-presets.js";

export class ButterchurnVisualizer extends HTMLElement {
    constructor(ctx) {
        super();

        this.ctx = ctx;

        // Create shadow DOM
        const shadow = this.attachShadow({ mode: 'open' });

        // Create and style canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'butterchurn-canvas';

        // Create dropdown menu
        this.presetDropdown = document.createElement('select');
        this.presetDropdown.id = 'preset-dropdown';

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #butterchurn-canvas {
                position: absolute;
                top: 0;
                left: 0;
                
                z-index: -1;
                pointer-events: none;
            }
            :host {
                display: block;
                position: relative;
                width: 100%;
                height: 100%;
            }
            #preset-dropdown {
                position: absolute;
                top: 60px;
                left: 10px;
                z-index: 10;
                padding: 5px;
                font-size: 14px;
                zIndex: 80;
            }
        `;
        shadow.appendChild(style);
        shadow.appendChild(this.canvas);
        shadow.appendChild(this.presetDropdown);

        // Initialize variables
        this.visualizer = null;
        this.autoResize = true; // Resize canvas dynamically
    }

    async connectedCallback() {
        await this.initVisualizer();
        await this.populatePresets();
    }

    async initVisualizer() {
        let audioContext;

        if (!this.ctx) {
            this.ctx = new AudioContext();
        } else {
            audioContext = this.ctx
        }

        const visualizer = butterchurn.default.createVisualizer(
            audioContext,
            this.canvas,
            {
                width: this.canvas.width,
                height: this.canvas.height,
            }
        );

        this.visualizer = visualizer;

        this.startRendering();
        this.handleResize();
    }

    connectVisualizerToExternalSource(source) {
        this.visualizer.connectAudio(source);
    }

    startRendering() {
        const renderLoop = () => {
            if (this.visualizer) {
                this.visualizer.render();
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop();
    }

    handleResize() {
        const onResize = () => {
            if (!this.autoResize) return;
            const width = innerWidth * window.devicePixelRatio;
            const height = innerHeight * window.devicePixelRatio;

            this.canvas.width = width;
            this.canvas.height = height;

            if (this.visualizer) {
                this.visualizer.setRendererSize(width, height);
            }
        };

        window.addEventListener('resize', onResize);
        onResize(); // Trigger resize initially
    }

    async populatePresets() {
        // Get presets
        const presets = butterchurnPresets.getPresets();

        // Populate dropdown
        for (const [presetName] of Object.entries(presets)) {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetName;
            this.presetDropdown.appendChild(option);
        }

        // Set default preset
        const defaultPreset = Object.keys(presets)[0];
        this.visualizer.loadPreset(presets[defaultPreset], 0.0);

        // Handle preset changes
        this.presetDropdown.addEventListener('change', (event) => {
            const selectedPreset = event.target.value;
            this.visualizer.loadPreset(presets[selectedPreset], 0.0);
        });
    }
}

// Define the custom element
customElements.define('butterchurn-visualizer', ButterchurnVisualizer);