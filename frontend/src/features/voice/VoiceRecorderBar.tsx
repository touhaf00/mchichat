function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;

    return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

type VoiceRecorderBarProps = {
    seconds: number;
    levels: number[];
    onCancel: () => void;
    onStop: () => void;
};

export function VoiceRecorderBar({
                                     seconds,
                                     levels,
                                     onCancel,
                                     onStop,
                                 }: VoiceRecorderBarProps) {
    return (
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
                <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
            </div>

            <div className="font-mono text-sm font-semibold text-red-200">
                {formatTime(seconds)}
            </div>

            <div className="flex flex-1 items-center gap-1">
                {levels.map((level, index) => (
                    <span
                        key={index}
                        className="w-1 rounded-full bg-red-300 transition-all duration-75"
                        style={{ height: `${level}px` }}
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={onCancel}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            >
                Annuler
            </button>

            <button
                type="button"
                onClick={onStop}
                className="rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold hover:bg-fuchsia-600"
            >
                Terminer
            </button>
        </div>
    );
}