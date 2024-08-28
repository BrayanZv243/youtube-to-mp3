"use client";

import React, { useEffect, useState } from "react";
import ReactLogo from "../../../public/react-logo";
import TextArea from "../components/TextArea";
import PulseLoader from "react-spinners/PulseLoader";
import { downloadVideos, searchVideos } from "./api/downloader";

// Función para descargar el video
async function downloadVideo(videosName: string[]) {
    try {
        const urls = await searchVideos(videosName);
        const videos = urls.map((url, index) => ({
            url: url.split("*")[0],
            name: url.split("*")[1] || `video_${index + 1}`,
        }));
        await downloadVideos(videos);
        console.log("---------------------------------------");
        console.log("Downloads ended, thanks for using us :D");
        console.log("---------------------------------------");
    } catch (error) {
        console.error("Failed to download video:", error);
    }
}

function MusicComponent() {
    const [text, setText] = useState<string>("");
    const [songs, setSongs] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

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

    const formatPaste = (query: string): void => {
        const regex = /\]\s+[^:]+:\s+(.+)/g;
        const matches: string[] = [];
        let match;

        while ((match = regex.exec(query)) !== null) {
            matches.push(match[1].trim());
        }

        if (matches.length === 0) {
            // Esto significa que no hubo coincidencias con el match, haz el paste default
            const newString = text + query;
            setText(newString);
            setSongs(newString.split("\n"));
        } else {
            // Hubo coincidencias, modifica el array en base al regex.
            setText(matches.join("\n") + "\n" + text);
            setSongs((songs) => [...songs, ...matches]);
        }
    };

    return (
        <>
            <div className="max-w-screen-xl mx-auto p-8 text-center text-[#fff]">
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
                        <p
                            className={
                                success && !loading ? "text-gray-500" : ""
                            }
                        >
                            {success &&
                                !loading &&
                                "Toda la música fue descargada con éxito"}
                        </p>
                        <p className={error && !loading ? "text-gray-500" : ""}>
                            {error && !loading && "Ocurrió un error inesperado"}
                        </p>
                        {loading && <PulseLoader />}
                    </div>
                </div>
                <TextArea
                    text={text}
                    onTextChange={handleTextChange}
                    onPaste={formatPaste}
                />
            </div>
        </>
    );
}

export default MusicComponent;
