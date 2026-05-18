import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export function convertAudioToMp3(inputPath: string): Promise<{
    outputPath: string;
    filename: string;
}> {
    return new Promise((resolve, reject) => {
        const parsed = path.parse(inputPath);

        const alreadyMp3 = parsed.ext.toLowerCase() === ".mp3";

        if (alreadyMp3) {
            resolve({
                outputPath: inputPath,
                filename: parsed.base,
            });
            return;
        }

        const outputPath = path.join(
            parsed.dir,
            `${parsed.name}-converted.mp3`
        );

        const filename = `${parsed.name}-converted.mp3`;

        ffmpeg(inputPath)
            .audioCodec("libmp3lame")
            .audioBitrate("128k")
            .format("mp3")
            .on("end", () => {
                resolve({
                    outputPath,
                    filename,
                });
            })
            .on("error", reject)
            .save(outputPath);
    });
}