import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('gamesByDates/')
  getGamesByDates(
    @Query('leagueId') leagueId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<JSON> {
    return this.appService.getGamesByDates(leagueId, startDate, endDate);
  }

  @Get('next7days/')
  getOddsMapping(@Query('leagueId') leagueId: number) {
    return this.appService.getNext7DaysGames(leagueId);
  }

  @Get('currentweek/')
  getCurrentWeekGames(@Query('leagueId') leagueId: number) {
    return this.appService.getCurrentWeekGames(leagueId);
  }
}
