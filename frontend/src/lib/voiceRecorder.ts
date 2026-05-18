export type VoiceRecordingResult = {
    file: File;
    previewUrl: string;
};

type StartVoiceRecordingOptions = {
    onLevels?: (levels: number[]) => void;
    onTick?: (seconds: number) => void;
};

type ActiveRecording = {
    recorder: MediaRecorder;
    stream: MediaStream;
    chunks: Blob[];
    mimeType: string;
    audioContext?: AudioContext;
    animationFrameId?: number;
    timerId?: number;
    startedAt: number;
};

let activeRecording: ActiveRecording | null = null;

function getSupportedMimeType() {
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const firefoxTypes = ["audio/ogg;codecs=opus", "audio/webm;codecs=opus", "audio/webm"];
    const safariTypes = ["audio/mp4", "audio/aac"];
    const chromeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

    const candidates = isFirefox ? firefoxTypes : isSafari ? safariTypes : chromeTypes;

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function getExtension(mimeType: string) {
    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("mp4")) return "m4a";
    if (mimeType.includes("aac")) return "aac";
    return "webm";
}

function cleanup(recording: ActiveRecording) {
    if (recording.animationFrameId) {
        cancelAnimationFrame(recording.animationFrameId);
    }

    if (recording.timerId) {
        window.clearInterval(recording.timerId);
    }

    recording.stream.getTracks().forEach((track) => track.stop());

    void recording.audioContext?.close();
}

function startVoiceVisualizer(
    recording: ActiveRecording,
    options?: StartVoiceRecordingOptions
) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(recording.stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    recording.audioContext = audioContext;

    const draw = () => {
        analyser.getByteFrequencyData(dataArray);

        const bars = 28;
        const chunkSize = Math.floor(dataArray.length / bars);

        const levels = Array.from({ length: bars }, (_, index) => {
            const start = index * chunkSize;
            const chunk = dataArray.slice(start, start + chunkSize);
            const average =
                chunk.reduce((sum, value) => sum + value, 0) / Math.max(chunk.length, 1);

            return Math.max(8, Math.min(42, Math.round((average / 255) * 42)));
        });

        options?.onLevels?.(levels);

        recording.animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    recording.timerId = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - recording.startedAt) / 1000);
        options?.onTick?.(seconds);
    }, 250);
}

export async function startVoiceRecording(options?: StartVoiceRecordingOptions) {
    if (!window.isSecureContext) {
        throw new Error("Le micro nécessite HTTPS ou localhost.");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Le micro n'est pas disponible.");
    }

    if (!window.MediaRecorder) {
        throw new Error("Ton navigateur ne supporte pas les messages vocaux.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
    });

    const mimeType = getSupportedMimeType();

    const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

    const chunks: Blob[] = [];

    recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    });

    activeRecording = {
        recorder,
        stream,
        chunks,
        mimeType: recorder.mimeType || mimeType || "audio/webm",
        startedAt: Date.now(),
    };

    startVoiceVisualizer(activeRecording, options);

    recorder.start(1000);
}

export function stopVoiceRecording(): Promise<VoiceRecordingResult> {
    return new Promise((resolve, reject) => {
        if (!activeRecording) {
            reject(new Error("Aucun enregistrement en cours."));
            return;
        }

        const recording = activeRecording;

        recording.recorder.addEventListener(
            "stop",
            () => {
                cleanup(recording);

                const blob = new Blob(recording.chunks, {
                    type: recording.mimeType,
                });

                activeRecording = null;

                if (blob.size < 1000) {
                    reject(new Error("Le vocal est trop court ou vide."));
                    return;
                }

                const extension = getExtension(recording.mimeType);

                const file = new File([blob], `voice-message.${extension}`, {
                    type: recording.mimeType,
                });

                resolve({
                    file,
                    previewUrl: URL.createObjectURL(file),
                });
            },
            { once: true }
        );

        recording.recorder.stop();
    });
}

export function cancelVoiceRecording() {
    if (!activeRecording) return;

    const recording = activeRecording;

    cleanup(recording);

    if (recording.recorder.state !== "inactive") {
        recording.recorder.stop();
    }

    activeRecording = null;
}