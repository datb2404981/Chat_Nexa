import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MessageDocument, Message } from './schema/message.schema';
import type { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from '../users/users.interface';
import { ConversationDocument, Conversations } from '../conversation/schema/conversation.schema';
import { Types } from 'mongoose';
import { NotFoundError } from 'rxjs';
import { ChatGateway } from '../gateway/chat.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: SoftDeleteModel<MessageDocument>,
    @InjectModel(Conversations.name)
    private conversationModel: SoftDeleteModel<ConversationDocument>,
    private chatGateway: ChatGateway
  ){ }

  async createMessage(createMessageDto: CreateMessageDto, user: IUser) {
    const { conversationId, content, imgUrl,type } = createMessageDto;

    //tạo và lưu tin nhắn mới
    const newMessage = await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      content,
      imgUrl,
      senderID: new Types.ObjectId(user._id),
      type: type || "TEXT",
    });

    //cập nhập tin nhắn mới cho conversation
    const conversation = await this.conversationModel.findById(conversationId);
    if(conversation) {
      const incUpdate: Record<string, number> = {};
      conversation.members.forEach((memberId) => {
          if(memberId.toString() !== user._id.toString()){
              incUpdate[`unreadCounts.${memberId}`] = 1;
          }
      });

      await this.conversationModel.updateOne(
        { _id: conversationId }, {
        lastMessage: {
          _id: newMessage._id,
          content: type === "IMAGE" ? "Đã gửi một ảnh" : content,
          sender: {
              _id: user._id,
              username: user.username,
              avatar: user.avatar
          },
          createdAt: newMessage.createdAt
          },
          readBy: [{ userId: user._id, lastSeenAt: new Date() }],
          $inc: incUpdate,
      });
    }
    
    const populateMessage = await newMessage.populate("senderID", "username avatar isOnline")
    const updatedConversation = await this.conversationModel.findById(conversationId).lean().exec();

    this.chatGateway.server
      .to(conversationId)
      .emit('new_message', {
          message: populateMessage, 
          conversation: updatedConversation 
      });
    return {
      message: populateMessage,
      success: true
    };
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  async removeMessage(id: string, user: IUser) {
    //kiểm tra tin nhắn có tồn tại
    const message = await this.messageModel.findOne({_id: id,deleted :{$ne:true}});
    if (!message) { 
      throw new NotFoundException("Tin nhắn không tồn tại!");
    }

    //kiểm tra có phải user là người gửi không
    if (message.senderID.toString() !== user._id.toString()) {
      throw new ForbiddenException("Bạn không có quyền xóa tin nhắn này!");
    }

    //xóa message
    const success = await this.messageModel.deleteById(id);
    if (!success) { 
      throw new BadRequestException("Xóa tin nhắn thất bại!");
    }
    return {
      "success": true,
      "message": "Thu hồi tin nhắn thành công!",
    }
  }

  async getHistoryMessage(id: string, currentPage: number, limit: number) {
    const defaultLimit = limit ? limit : 15;
    const page = currentPage ? currentPage : 1;
    const skip = (page - 1) * defaultLimit;

    //tạo điều kiện
    const filter = {
      conversationId: new Types.ObjectId(id),
      deleted: { $ne: true },
    };


    const [total, messages] = await Promise.all([
      this.messageModel.countDocuments(filter),
      this.messageModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(defaultLimit)
        .populate("senderID", "username avatar isOnline")
        .lean().exec()
    ]);

    const orderedMessages = messages.reverse();//đạo ngược mảng lại cho Frontend 
    return {
      message: orderedMessages,
      meta: {
        nextCursor: page+1,
        pageSize: defaultLimit,
        pages: Math.ceil(total / defaultLimit),
        total: total,
      }
    }
  }
}
