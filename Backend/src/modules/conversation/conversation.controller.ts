import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateDirectConversationDto, CreateGroupConversationDto } from './dto/create-conversation.dto';
import { ResponseMessage, User } from '../../common/decorator/decorators';
import type { IUser } from '../users/users.interface';
import { MessagesService } from '../messages/messages.service';

@Controller('conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messagesService: MessagesService
  ) {}

  @Post('direct')
  @ResponseMessage("Create Direct Conversation")
  async createDirectConversation(
    @Body() createDirectConversationDto: CreateDirectConversationDto,
    @User() user: IUser) {
    return this.conversationService.createDirectConversation(createDirectConversationDto,user);
  }

  @Post('group')
  @ResponseMessage("Create Group Conversation")
  async createGroupConversation(
    @Body() createGroupConversationDto: CreateGroupConversationDto,
    @User() user: IUser){
    return this.conversationService.createGroupConversation(createGroupConversationDto,user);
  }

  @Get()
  @ResponseMessage("Get Conversations")
  findAlConversations(
    @Query("page") currentPage: number,
    @Query("limit") limit: number,
    @User() user: IUser
  ) {
    return this.conversationService.findAllConversations(currentPage, limit,user);
  }

  @Get(':id')
  @ResponseMessage("Get Conversation Detail")
  findOneConversation(@Param('id') id: string) {
    return this.conversationService.findConversation(id);
  }

  @Get(':id/messages')
  @ResponseMessage("Get Conversation Detail")
  getHistoryMessage(
    @Param('id') id: string,
    @Query("cursor") currentPage: number,
    @Query("limit") limit: number,) {
    return this.messagesService.getHistoryMessage(id,currentPage,limit);
  }

  @Patch(':id')
  @ResponseMessage("Mark Message")
  markMessage(@Param('id') id: string,@User() user: IUser) {
    return this.conversationService.markAsRead(id,user);
  }

  @Delete(':id')
  @ResponseMessage("Get Conversation Detail")
  deleteConversation(@Param('id') id: string,@User() user: IUser) {
    return this.conversationService.deleteConversation(id,user);
  }
}
