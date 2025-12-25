import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import type { IUser } from '../users/users.interface';
import { ResponseMessage, User } from '../../common/decorator/decorators';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ResponseMessage("Send Message")
  crecreateMessageate(
    @Body() createMessageDto: CreateMessageDto,
    @User() user: IUser,) {
    return this.messagesService.createMessage(createMessageDto, user);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  @ResponseMessage("Soft Delete Message")
  remove(
    @Param('id') id: string,
    @User()user : IUser) {
    return this.messagesService.removeMessage(id,user);
  }
}
