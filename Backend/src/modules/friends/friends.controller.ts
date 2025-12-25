import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { createFriendRequestDto } from './dto/create-friendResquest.dto';
import type { IUser } from '../users/users.interface';
import { ResponseMessage, User } from '../../common/decorator/decorators';
import { send } from 'process';
import { UsersService } from '../users/users.service';
import { UnfriendDto } from './dto/unfriend.dto';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly usersService: UsersService,
  ) {}

  @Post("request")
  @ResponseMessage("Send Friend Request")
  async sendFriendRequest(
    @Body() createFriendResquestDto: createFriendRequestDto,
    @User() user: IUser
  ) {
    return await this.friendsService.createFriendResquest(createFriendResquestDto,user);
  }

  @Get()
  @ResponseMessage("Get Friend List")
  async getFriendList(@User() user:IUser) {
    return this.friendsService.getAllFriendList(user);
  }
  
  @Get("requests")
  @ResponseMessage("Get Friend Requests")
  async getFriendRequests(@User() user:IUser) {
    return this.friendsService.getAllFriendRequests(user);
  }

  @Patch('requests/:id/accept')
  @ResponseMessage("Accept Friend Request")
  async acceptFriendRequest(
    @Param('id') id: string) {
    return this.friendsService.updateStatusFriendRequest(id,"ACCEPTED");
  }

  @Patch('requests/:id/decline')
  @ResponseMessage("Deline Friend Request")
  async declineFriendRequest(
    @Param('id') id: string) {
    return this.friendsService.updateStatusFriendRequest(id,"REJECTED");
  }

  @Delete('unfriend')
  @ResponseMessage("Unfriend Friend")
  async unfriendFriend(
    @Body() friendRequest: UnfriendDto,
    @User() user:IUser) {
    return this.friendsService.unfriendFriend(friendRequest,user);
  }


}
