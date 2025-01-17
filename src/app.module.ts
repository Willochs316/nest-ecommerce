import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';


dotenv.config();

@Module({
  imports: [
    // ThrottlerModule.forRoot({
    //   ttl: 10,
    //   limit: 2,
    // }),
    TypeOrmModule.forRoot({
      type: "mysql",
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User],
      synchronize: true, // change to false in production
      // dropSchema: true,
      logging: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, 
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // }
    ],
})
export class AppModule {}
