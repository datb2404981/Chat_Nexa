import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import mongooseDelete from 'mongoose-delete';
import { APP_GUARD } from '@nestjs/core';
import { FriendsModule } from '../friends/friends.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationModule } from '../conversation/conversation.module';
import { MessagesModule } from '../messages/messages.module';
import { FilesModule } from '../files/files.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.plugin(mongooseDelete, {
            deletedAt: true,
            deletedBy: true,
            overrideMethods: 'all', // or true
          });
          return connection;
        },
      }),
    }),
    UsersModule,
    AuthModule,
    FriendsModule,
    ConversationModule,
    MessagesModule,
    FilesModule,
    GatewayModule,
  ],
  controllers: [],
  providers: [{
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },],
})
export class AppModule {}