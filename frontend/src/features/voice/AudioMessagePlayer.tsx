import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60);

    return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

async function getAudioPeaks(src: string, barsCount = 48) {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const channelData = audioBuffer.getChannelData(0);

    const blockSize = Math.floor(channelData.length / barsCount);
    const peaks: number[] = [];

    for (let i = 0; i < barsCount; i += 1) {
        const start = i * blockSize;
        const end = start + blockSize;

        let sum = 0;

        for (let j = start; j < end; j += 1) {
            sum += Math.abs(channelData[j] || 0);
        }

        const average = sum / blockSize;
        peaks.push(Math.max(8, Math.min(42, average * 180)));
    }

    await audioContext.close();

    return peaks;
}

type AudioMessagePlayerProps = {
    src: string;
    mimeType?: string | null;
};

export function AudioMessagePlayer({ src, mimeType }: AudioMessagePlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [peaks, setPeaks] = useState<number[]>(
        Array.from({ length: 48 }, () => 12)
    );

    const progress = duration > 0 ? currentTime / duration : 0;

    useEffect(() => {
        let isMounted = true;

        async function loadPeaks() {
            try {
                const nextPeaks = await getAudioPeaks(src);

                if (isMounted) {
                    setPeaks(nextPeaks);
                }
            } catch {
                if (isMounted) {
                    setPeaks(
                        Array.from({ length: 48 }, (_, index) => {
                            return 10 + ((index * 7) % 28);
                        })
                    );
                }
            }
        }

        void loadPeaks();

        return () => {
            isMounted = false;
        };
    }, [src]);

    async function togglePlay() {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            await audio.play();
            setIsPlaying(true);
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    }

    function seekFromBar(index: number) {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const nextTime = (index / peaks.length) * duration;

        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
    }

    return (
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/70 px-4 py-3">
            <button
                type="button"
                onClick={() => void togglePlay()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-sm font-bold hover:bg-fuchsia-600"
            >
                {isPlaying ? "Ⅱ" : "▶"}
            </button>

            <div className="flex flex-1 items-center gap-1">
                {peaks.map((height, index) => {
                    const active = index / peaks.length <= progress;

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => seekFromBar(index)}
                            className={`w-1 rounded-full transition-colors ${
                                active ? "bg-fuchsia-300" : "bg-white/25"
                            }`}
                            style={{ height: `${height}px` }}
                            aria-label={`Aller à ${index}`}
                        />
                    );
                })}
            </div>

            <div className="w-20 shrink-0 text-right font-mono text-xs text-white/60">
                {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <audio
                ref={audioRef}
                preload="metadata"
                onLoadedMetadata={(event) => {
                    setDuration(event.currentTarget.duration || 0);
                }}
                onTimeUpdate={(event) => {
                    setCurrentTime(event.currentTarget.currentTime);
                }}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }}
            >
                <source src={src} type={mimeType || "audio/mpeg"} />
                <source src={src} type="audio/mpeg" />
                <source src={src} type="audio/mp4" />
                <source src={src} type="audio/webm" />
                <source src={src} type="audio/ogg" />
            </audio>
        </div>
    );
}