import process from 'process'
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios, {AxiosResponse, AxiosRequestConfig} from "axios"
import * as dotenv from 'dotenv';

dotenv.config();

const SPORTMONKS_API_KEY = process.env.SPORTMONKS_API_KEY;

type EAinput = {
    id: number | string;
    data: {
        fixtureId: number;
    }
}

type EAOutput = {
    jobRunId: string | number;
    statusCode: number;
    data: {
        matchName?: string;
        homeGoal?: number;
        awayGoal?: number;
        winner?: number;
    }
    error?: string
}

const PORT = process.env.PORT || 8080
const app: Express = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send("External Adapters rules!!!")
}) 

app.post("/", async (req: Request, res: Response) => {

    let homeGoal: number;
    let awayGoal: number;
    let winner: number;

    //Getting the fixtureId from the call
    const eaInputData: EAinput = req.body;

    let eaResponse: EAOutput = {
        data: {},
        jobRunId: eaInputData.id,
        statusCode: 0
    }

    const options: AxiosRequestConfig = {
        method: 'GET',
        url: `https://api.sportmonks.com/v3/football/fixtures/${eaInputData.data.fixtureId}?&include=scores;`,
        headers: {
            'Authorization': SPORTMONKS_API_KEY
        }
      };

    try { 
        const apiResponse: AxiosResponse = await axios.request(options)
            //Getting the final ("current") score of the match
            for (let i = 0; i <= 5; i++) {
                let matchPeriod = apiResponse.data.data.scores[i].description;
                if (matchPeriod === "CURRENT") {
                    apiResponse.data.data.scores[i].score.participant === "home" ? 
                    homeGoal =  apiResponse.data.data.scores[i].score.goals :
                    awayGoal = apiResponse.data.data.scores[i].score.goals;        
                } 
            }
            //Calculating the winner of the match
            if (homeGoal! != awayGoal!) {
                (homeGoal! > awayGoal!) ? winner = 1 : winner = 2;
            } else {
                winner! = 0
            }
            //Populating the response after the API call
            eaResponse.data = {
                matchName: apiResponse.data.data.name, 
                homeGoal: homeGoal!, 
                awayGoal: awayGoal!,
                winner: winner!
            };
            eaResponse.statusCode = apiResponse.status;
    } catch (error: any) {
        console.log("API Response error: ", error)
        eaResponse.error = error.message;
        eaResponse.statusCode = error.response.status

    } 

    res.json(eaResponse);
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`)
})