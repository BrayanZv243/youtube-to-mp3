"use server";

import ytdl from "@distube/ytdl-core";
// @ts-ignore
import ffmpeg from "fluent-ffmpeg";
import YouTubeSearchAPI from "youtube-search-api";
import path from "path";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { ProxyAgent } from "undici";

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

            if (response) {
                for (const video of response.items) {
                    if (video.length && video.length.simpleText) {
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

// Función para descargar y convertir un video de YouTube a MP3 (En server)
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
    const proxyUrl = "http://us-ca.proxymesh.com:31280";
    const client = new ProxyAgent(proxyUrl);

    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        res.status(400).json({ error: "Invalid YouTube URL" });
        return;
    }

    try {
        // Cookies de una sesión autenticada
        const cookies =
            "SID=g.a000nQhwr0xQzdfOKDrD_GPmeTmUqGP0H57MoA-NKhDINgwx-daNi4DZtmS-fgZiHLCKyk8dgwACgYKAZgSARMSFQHGX2Mi5cFRvk7SqQeRPAK9HgsxCBoVAUF8yKqCz8ojpRTj8ThKPJdktew50076; HSID=A6KonNxAT4Bzy7jle; SSID=Ao8dDXJxqoHe7EnE6; APISID=VqiDNsI7tywyApiG/ANgrHqH2SNxPU7ol6; SAPISID=qaNMKKddC-pLrX85/A68uH7xH4HprCrWip; YSC=--dqS0Ury2s; LOGIN_INFO=AFmmF2swRQIhAJBqdx8WBOH0D-1PCwADzIT6WH8d2Ic35UUMItM-O-bQAiAJajMVWIDjIKCJ4mylCtrw8PU9e0QmmPhpdlj4Ba_GeQ:QUQ3MjNmd1RlOHR6eTFCOFRKc1hpdGNVTC01UTBQRWl3bUx6NWVmWHU2Tktyd0xNdUxHR0tOUzZqNlpqV1AzenNabDY1X2pPSFpTQjZzSFhMQ2lsaEh4OUZUQVpqVFU5Y2VaQkFmM0xLeDlPcHkyWG1IcDRCQ3AyQzNibkhTcEtlOElhUGhwclgtOVFObW1mVlFWcjJnRkxQVmpxUDBEb3BHU3FXRkhabkFZUlpOcTI5Q3pseWR5cW85RVVFNWdwd3hjX0t0U2ZFcDNsZERZWVJCaXZSazh0azh4SFpwNks5QQ==; PREF=tz=America.Hermosillo&f7=100&f5=30000&volume=5&f6=40000000&f4=4000000;';";

        // Obtener la información del video usando las cookies
        const info = await ytdl.getInfo(videoUrl, {
            requestOptions: {
                headers: {
                    Cookie: cookies,
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
                client,
            } as any,
        });

        const format = ytdl.chooseFormat(info.formats, {
            filter: "audioonly",
        });

        let videoTitle = info.videoDetails.title;
        videoTitle = videoTitle
            .replace(/[^\w\sñÑáéíóúüÁÉÍÓÚÜ\-.]/g, " ")
            .replace(/_+/g, "_")
            .replace(/ +/g, " ")
            .trim();

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${videoTitle}.mp3"`
        );
        res.setHeader("Content-Type", "audio/mpeg");

        // Descarga el stream de audio usando el agente proxy y las cookies
        const audioStream = ytdl(videoUrl, {
            format,
            requestOptions: {
                headers: {
                    Cookie: cookies,
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
                client,
            } as any,
        });
        audioStream.pipe(res);
    } catch (error) {
        console.error(`Error downloading video ${videoUrl}:`, error);
        res.status(500).json({ error: "Failed to download audio" });
    }
}
