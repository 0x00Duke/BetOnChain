import { Injectable } from '@nestjs/common';
import { startOfWeek, endOfWeek } from 'date-fns';
import { config } from 'dotenv';

config();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getGamesByDates(
    competID: number,
    startDate: string,
    endDate: string,
  ): Promise<JSON> {
    let options = {
      method: 'GET',
      headers: {
        'X-Auth-Token': process.env.API_KEY,
      },
    };

    console.log(startDate);

    let startDateObj = new Date(Date.parse(startDate));
    let endDateObj = new Date(Date.parse(endDate));

    let startDay = startDateObj.getDate().toString().padStart(2, '0');
    let startMonth = (startDateObj.getMonth() + 1).toString().padStart(2, '0');
    let startYear = startDateObj.getFullYear();

    let endDay = endDateObj.getDate().toString().padStart(2, '0');
    let endMonth = (endDateObj.getMonth() + 1).toString().padStart(2, '0');
    let endYear = endDateObj.getFullYear();

    let startDateFormatted = `${startYear}-${startMonth}-${startDay}`;
    let endDateFormatted = `${endYear}-${endMonth}-${endDay}`;

    try {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${competID}/matches?dateFrom=${startDateFormatted}&dateTo=${endDateFormatted}`,
        options,
      );
      const res = await response.json();
      return res;
    } catch (err) {
      return err;
    }
  }

  async getCurrentWeekGames(competId: number): Promise<JSON> {
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, {
      weekStartsOn: 1,
    }).toISOString(); // week starts on Monday
    const lastDayOfWeek = endOfWeek(today, { weekStartsOn: 1 }).toISOString(); // week ends on Sunday

    try {
      const response = await this.getGamesByDates(
        competId,
        firstDayOfWeek,
        lastDayOfWeek,
      );
      return response;
    } catch (err) {
      return err;
    }
  }

  async getNext7DaysGames(competId: number): Promise<JSON> {
    const today = new Date();
    const todayString = today.toISOString();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekLaterString = weekLater.toISOString();

    try {
      const response = await this.getGamesByDates(
        competId,
        todayString,
        weekLaterString,
      );
      return response;
    } catch (err) {
      return err;
    }
  }
}
