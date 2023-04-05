import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicBetOnChain } from './ContractInteraction/PublicBetOnChain';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PublicBetOnChain],
})
export class AppModule {}
