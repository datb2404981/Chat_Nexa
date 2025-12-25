import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from '../../common/decorator/decorators';
import type { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage("Created a new User")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get("search")
  @ResponseMessage("Search User")
  async search(@Query("username") username: string){
    const user = await this.usersService.findUserByUsername(username);
    return {
      _id: user?._id,
      avatar: user?.avatar,
    }
  }


  @Get("me")
  @ResponseMessage("Get Me")
  findOne(@User() user: IUser) {
    return user;
  }

  @Patch('profile')
  @ResponseMessage("Update Profile")
  updateProfile(@User() user: IUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(user.email, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
