/* eslint-disable @typescript-eslint/no-explicit-any */
import {IVideo} from '@/models/video'

export type VideoFormData = Omit<IVideo, "_id">
type FetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE"
    body?: any
    headers?: Record<string, string>
}

class ApiClient{
    private async fetch<T>(endPoint: string, options: FetchOptions = {}): Promise<T> {
        const {method = "GET", body, headers} = options
        const defaultHeaders = {
            "content-type": "application/json",
            ...headers,
        }
        const res = await fetch(`/api${endPoint}`, {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: defaultHeaders,
        })
        return res.json()
    }
    async getVideos(): Promise<any> {
        return this.fetch<any>("/video");
    }

   async createVideo(videoData: IVideo): Promise<any> {
        return this.fetch<any>("/video", {
            method: "POST",
            body: videoData,
        });
    }

}

export const apiClient = new ApiClient()