"use client";

import React, { useState } from "react";
import ReactLogo from "../../public/react-logo";
import TextArea from "@/app/components/TextArea";
import RadioButton from "./components/RadioButton";
import PulseLoader from "react-spinners/PulseLoader";
import { downloadVideosServer, searchVideos } from "@/pages/api/downloader";

function MusicComponent() {
    const [text, setText] = useState<string>("");
    const [songs, setSongs] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("Initializing");
    const [selectedValue, setSelectedValue] = useState<string>("whatsapp");

    // Función para descargar el video
    async function downloadVideo(videosName: string[]) {
        try {
            setStatus("Searching videos...");
            const urls = await searchVideos(videosName);
            const videos = urls.map((url, index) => ({
                url: url.split("*")[0],
                name: url.split("*")[1] || `video_${index + 1}`,
            }));

            // Download on server
            //await downloadVideosServer(videos);

            // Download on client
            let count = 1;
            for (const video of videos) {
                setStatus(
                    `Downloading ${video.name}... (${count}/${songs.length})`
                );
                await downloadVideosClient(video.url);
                count++;
            }
        } catch (error) {
            console.error("Failed to download video:", error);
        }
    }

    async function downloadVideosClient(videoUrl: string) {
        if (!videoUrl) return;

        try {
            const response = await fetch(
                `/api/downloader?url=${encodeURIComponent(videoUrl)}`
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");

                const contentDisposition = response.headers.get(
                    "Content-Disposition"
                );
                let fileName = "audio.mp3";
                if (contentDisposition) {
                    const fileNameMatch =
                        contentDisposition.match(/filename="(.+)"/);
                    if (fileNameMatch && fileNameMatch[1]) {
                        fileName = fileNameMatch[1];
                    }
                }

                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error("Failed to download video");
            }
        } catch (error) {
            console.error("Error during download:", error);
        }
    }

    const handleTextChange = (newText: string) => {
        const lines = newText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        setText(newText);
        setSongs(lines);
    };

    const handleGetMusic = async () => {
        setLoading(true);
        try {
            await downloadVideo(songs);
            setSuccess(true);
            setError(false);
        } catch (error) {
            console.error("Failed to download video:", error);
            setError(true);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const pasteSelection = (query: string) => {
        switch (selectedValue) {
            case "whatsapp":
                return formatPasteWhatsapp(query);

            case "youtube":
                return formatPasteYoutube(query);

            default:
                console.warn("No valid selection made.");
                return null;
        }
    };

    const formatPasteWhatsapp = (query: string): void => {
        // Ajustar el regex para capturar el texto después del marcador de tiempo y el nombre
        const regex = /\]\s+[^:]+:\s+([\s\S]*?)(?=\n\s*\[|$)/g;

        const matches: string[] = [];
        let match;

        while ((match = regex.exec(query)) !== null) {
            // Eliminar los saltos de línea dentro del texto capturado
            const formattedText = match[1].replace(/\n+/g, " ").trim();
            matches.push(formattedText);
        }

        if (matches.length === 0) {
            const newString = text + query;
            setText(newString);
            setSongs(newString.split("\n"));
        } else {
            setText(matches.join("\n") + "\n" + text);
            setSongs((songs) => [...songs, ...matches]);
        }
    };

    const formatPasteYoutube = (query: string): void => {
        const arrayStrQuery = query.split("\n");
        const matches: string[] = [];
        for (let i = 0; i < arrayStrQuery.length - 1; i++) {
            const element = arrayStrQuery[i];
            const hasNewLine = /^(?:\r?\n|\r)$/.test(element);
            const hasFormatNumber = /\b\d+:\d+\b/.test(element);

            if (
                element.includes("Mixes are playlists Youtube makes for you") ||
                element.includes("Mi Mix") ||
                hasNewLine ||
                hasFormatNumber
            ) {
                continue;
            }
            const title = arrayStrQuery[i];
            const author = arrayStrQuery[i + 1];
            const formattedText = `${title.trim()} - ${author.trim()}`;
            matches.push(formattedText);
            i += 4;
        }

        if (matches.length === 0) {
            const newString = text + query;
            setText(newString);
            setSongs(newString.split("\n"));
        } else {
            // Unir todas las canciones en una sola línea
            setText(matches.join("\n") + "\n" + text);
            setSongs((songs) => [...songs, ...matches]);
        }
    };

    const handleChangeRadioButton = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSelectedValue(event.target.value);
    };

    return (
        <div className="mx-auto p-8 text-center text-[#fff] min-h-screen">
            <div className="flex w-full justify-center">
                <ReactLogo className="h-32 w-32 p-6 transition-filter duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] dark:hover:drop-shadow-[0_0_2em_#61dafbaa]" />
            </div>
            <h1 className="text-4xl font-light leading-tight font-serif">
                Youtube to MP3
            </h1>
            <div className="p-8">
                <button
                    onClick={handleGetMusic}
                    disabled={loading || text.length === 0}
                    className={`border border-transparent rounded-lg px-4 py-2 text-lg font-medium transition-colors duration-300 ${
                        loading
                            ? "cursor-default border-none"
                            : "cursor-pointer"
                    } ${
                        !loading
                            ? "bg-[#1a1a1a] text-white hover:border-[#646cff]"
                            : ""
                    }`}
                >
                    {loading ? "Downloading..." : "Get Music!"}
                </button>

                <div className="mt-2">
                    <p className={success && !loading ? "text-gray-500" : ""}>
                        {success &&
                            !loading &&
                            "Toda la música fue descargada con éxito"}
                    </p>
                    <p className="text-gray-500">{loading && status}</p>

                    <p className={error && !loading ? "text-gray-500" : ""}>
                        {error && !loading && "Ocurrió un error inesperado"}
                    </p>
                    <div className="mt-4">{loading && <PulseLoader />}</div>
                </div>
            </div>
            <div className="flex flex-auto gap-6 justify-center ">
                <TextArea
                    text={text}
                    disabled={loading}
                    onTextChange={handleTextChange}
                    onPaste={pasteSelection}
                />
                <RadioButton
                    selectedValue={selectedValue}
                    onChange={handleChangeRadioButton}
                    disabled={loading}
                />
            </div>
        </div>
    );
}

export default MusicComponent;
