import * as http from "http";
import * as https from 'https';
import { URL } from "url";

export class HttpRequest {
    static async get(url: string, params?: Map<string, string>): Promise<string> {

        const urlObj = new URL(url);
        if (params) {
            const searchParams = urlObj.searchParams;
            params.forEach((value, key) => {
                searchParams.append(key, value);
            });
        }

        const promise = new Promise<any>((resolve, reject) => {
            const responseFunc = (response: http.IncomingMessage) => {
                let responseString = "";

                response.on('data', (chunk) => {
                    responseString += chunk;
                });

                response.on('end', () => {
                    resolve(responseString);
                });
            };

            const errorFunc = (error: Error) => {
                reject(error);
            };

            if (urlObj.protocol == "http:") {
                http.get(urlObj, responseFunc).on('error', errorFunc);
            } else if (urlObj.protocol == "https:") {
                https.get(urlObj, responseFunc).on('error', errorFunc);
            } else {
                reject(new Error("Not supported protocol on URL " + urlObj.protocol));
            }
        });

        return promise;
    }
}