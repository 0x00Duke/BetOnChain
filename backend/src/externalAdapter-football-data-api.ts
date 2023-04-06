import process from 'process'
import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios, {AxiosResponse, AxiosRequestConfig} from "axios"
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;

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
        homeTeam?: string;
        awayTeam?: string;
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
    let homeTeam: string;
    let awayTeam: string;
    
    //Getting the fixtureId from the call
    const eaInputData: EAinput = req.body;
    eaInputData.data = {fixtureId: 327117}

    let eaResponse: EAOutput = {
        data: {},
        jobRunId: eaInputData.id,
        statusCode: 0
    }

    const options: AxiosRequestConfig = {
        method: 'GET',
        url: `https://api.football-data.org/v4/matches/${eaInputData.data.fixtureId};`,
        headers: {
            'Authorization': API_KEY
        }
      };

    try { 
        const apiResponse: AxiosResponse = await axios.request(options)
            //Getting the final ("current") score of the match

                homeGoal = apiResponse.data.score.fullTime.home;
                awayGoal = apiResponse.data.score.fullTime.away;        
                awayTeam = apiResponse.data.awayTeam.name;
                homeTeam = apiResponse.data.homeTeam.name;

            //Calculating the winner of the match
            if (homeGoal! != awayGoal!) {
                (homeGoal! > awayGoal!) ? winner = 1 : winner = 2;
            } else {
                winner! = 0
            }
            //Populating the response after the API call
            eaResponse.data = {
                homeTeam: homeTeam!,
                awayTeam: awayTeam!, 
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


