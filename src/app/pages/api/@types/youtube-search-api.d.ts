// src/@types/youtube-search-api.d.ts

declare module "youtube-search-api" {
    export default class YouTubeSearchAPI {
        static GetListByKeyword(query: string): Promise<any>;
        static GetVideoByID(query: string): Promise<any>;
    }
}
