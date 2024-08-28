"use server";

import ytdl from "@distube/ytdl-core";
// @ts-ignore
import ffmpeg from "fluent-ffmpeg";
import YouTubeSearchAPI from "youtube-search-api";
import path from "path";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

const MAX_DURATION = 55;
const SEPARATOR_URL = "*";

// Función para convertir la duración en formato 'hh:mm:ss' o 'mm:ss' a minutos
function convertDurationToMinutes(duration: string): number {
    const parts = duration.split(":");

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (parts.length === 3) {
        [hours, minutes, seconds] = parts.map((part) => parseFloat(part));
    } else if (parts.length === 2) {
        [minutes, seconds] = parts.map((part) => parseFloat(part));
    } else if (parts.length === 1) {
        seconds = parseFloat(parts[0]);
    } else {
        console.error("Unrecognized duration format:", duration);
        return NaN;
    }

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        console.error("Invalid number in duration:", duration);
        return NaN;
    }

    return hours * 60 + minutes + seconds / 60;
}

// Función para buscar videos en YouTube por nombre
export async function searchVideos(videosName: string[]): Promise<string[]> {
    try {
        const urls: string[] = [];

        for (const videoName of videosName) {
            const response = await YouTubeSearchAPI.GetListByKeyword(videoName);
            let found = false;

            for (const video of response.items) {
                const durationInMinutes = convertDurationToMinutes(
                    video.length.simpleText
                );
                if (durationInMinutes <= MAX_DURATION) {
                    urls.push(
                        `https://www.youtube.com/watch?v=${video.id}${SEPARATOR_URL}${video.title}`
                    );

                    found = true;
                    break;
                }
            }

            if (!found) {
                console.warn(`No suitable video found for: ${videoName}`);
            }
        }

        return urls;
    } catch (error) {
        console.error("Error searching for videos:", error);
        throw error;
    }
}

// Función para descargar y convertir un video de YouTube a MP3
export async function downloadVideo(url: string, videoName: string) {
    try {
        const outputFile = path.join("downloads", `${videoName}.mp3`);

        const video = ytdl(url, {
            quality: "highestaudio",
            filter: "audioonly",
            requestOptions: {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            },
        });

        if (!fs.existsSync("downloads")) {
            fs.mkdirSync("downloads");
        }

        return new Promise<void>((resolve, reject) => {
            ffmpeg(video)
                .audioCodec("libmp3lame")
                .audioBitrate(192)
                .save(outputFile)
                .on("end", () => {
                    console.log(`Conversion finished for: ${videoName}`);
                    resolve();
                })
                .on("error", (err: any) => {
                    console.error("Error during conversion:", err);
                    reject(err);
                });
        });
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

// Función para descargar múltiples videos
export async function downloadVideosServer(
    videos: { url: string; name: string }[]
) {
    console.log("Downloads has started, please wait...");
    for (const video of videos) {
        await downloadVideo(video.url, video.name);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const videoUrl = req.query.url as string;
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        res.status(400).json({ error: "Invalid YouTube URL" });
        return;
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        const format = ytdl.chooseFormat(info.formats, {
            filter: "audioonly", // Filtra solo los formatos de audio
        });

        let videoTitle = `${info.videoDetails.title}`;
        videoTitle = videoTitle
            .replace(/[^\w\sñÑáéíóúüÁÉÍÓÚÜ\-.]/g, " ")
            .replace(/_+/g, "_")
            .replace(/ +/g, " ")
            .trim()
            .replace(/\s+$/, "");

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${videoTitle}.mp3"`
        );
        res.setHeader("Content-Type", "audio/mpeg"); // Cambia a audio/mpeg para MP3

        const audioStream = ytdl(videoUrl, { format });
        audioStream.pipe(res);
    } catch (error) {
        const info = await ytdl.getInfo(videoUrl);
        const videoTitle = info.videoDetails.title;
        console.error(`Error downloading video ${videoTitle}`, error);
        res.status(500).json({ error: "Failed to download audio" });
    }
}
