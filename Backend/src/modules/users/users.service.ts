import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, Users } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import type { SoftDeleteModel } from 'mongoose-delete';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) { }
  
  async hashpassword(password : string ) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  isValidPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async create(createUserDto: CreateUserDto) {
    const [existringEmail, existringUser] = await Promise.all([
      this.findUserByEmail(createUserDto.email),
      this.findUserByUsername(createUserDto.username)]);

    if (existringEmail) throw new ConflictException("Email đã tồn tại!");
    if (existringUser) throw new ConflictException("Username đã tồn tại!");

    const password = await this.hashpassword(createUserDto.password);
    const created = await this.userModel.create({ ...createUserDto, password });
    
    return created;
  }


  findAll() {
    return `This action returns all users`;
  }

  findUserByEmail(email: string) {
    return this.userModel.findOne({ email,deleted :{$ne : true} }).lean().exec();
  }
  
  findUserByUsername(username: string) {
    return this.userModel.findOne({ username,deleted :{$ne : true} }).lean().exec();
  }

  async findByRefreshToken(refreshToken:string) {
    return this.userModel.findOne({ refreshToken,deleted :{$ne : true} }).lean().exec();
  }


  async updateProfile(email : string, updateUserDto: any) {
    const update = await this.userModel.updateOne({ email }, updateUserDto);

    if (update.matchedCount === 0) throw new ConflictException("Tài khoản không tồn tại!");
    const user = await this.findUserByEmail(email);
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
