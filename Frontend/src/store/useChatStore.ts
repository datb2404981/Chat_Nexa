import { persist } from 'zustand/middleware';
import type { ChatState } from './../types/store';
import { create } from "zustand";
import { chatService } from '@/services/chatService';
import { useAuthStore } from './useAuthStore';
import { userService } from '@/services/userService';
import { uploadService } from '@/services/upload.service';
import { toast } from "sonner";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      friends: [],
      friendRequests: [],
      sentFriendRequests: [],
      isLoadingRequests: false,
      messages: {},
      activeConversationId:null,
      convoLoading: false,
      messageLoading: false,
      onlineUserIds: [],
      isSearching: false,
      setSearching: (isSearching) => set({ isSearching }),
      
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      fetchFriends: async () => {
        try {
          const friends = await userService.getFriends();
          const { onlineUserIds } = get();
          const onlineSet = new Set(onlineUserIds);

          const mappedFriends = friends.map(f => ({
            ...f,
            isOnline: onlineSet.has(f._id)
          }));

          set({ friends: mappedFriends });
        } catch (error) {
          console.error("Failed to fetch friends:", error);
        }
      },
      reset: () => {
        set({
          conversations: [],
          friends: [],
          friendRequests: [],
          sentFriendRequests: [],
          isLoadingRequests: false,
          messages: {},
          activeConversationId:null,
          convoLoading: false,
          messageLoading: false,
          onlineUserIds: [],
        })
      },

      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();
          const { onlineUserIds } = get();
          const onlineSet = new Set(onlineUserIds);
          
          const mappedConversations = conversations.map(c => {
               // Update Participants
               const updatedParticipants = c.participants.map(p => ({
                   ...p,
                   status: (onlineSet.has(p._id) ? "online" : "offline") as "online" | "offline"
               }));
               
               // Update Receiver
               let updatedReceiver = c.receiver;
               if (c.receiver) {
                   const isOnline = onlineSet.has(c.receiver._id);
                   updatedReceiver = {
                       ...c.receiver,
                       isOnline,
                       status: (isOnline ? "online" : "offline") as "online" | "offline"
                   }
               }

               return {
                   ...c,
                   participants: updatedParticipants,
                   receiver: updatedReceiver
               }
          });

          set({ conversations: mappedConversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchConversation:", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => { 
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId=  conversationId ?? activeConversationId;
        if (!convoId) return;
        
        // Handle temporary "friend" conversations (optimistic UI)
        // These don't exist on backend yet, so don't fetch.
        if (convoId.startsWith("temp_")) {
            set((state) => ({
                messageLoading: false,
                messages: {
                    ...state.messages,
                    [convoId]: { items: [], hasMore: false, nextCursor: null }
                }
            }));
            return;
        }

        const current = messages?.[convoId];
        const nextCursor = current?.nextCursor === undefined ? "" : current?.nextCursor;

        if (nextCursor === null) return;
        set({ messageLoading: true });

        try {
          const { message : fetched, cursor } = await chatService.fetchMessages(convoId, nextCursor);

          const processed = fetched.map((m: any) => {
            // 1. Get raw sender (could be 'senderID' from backend or 'senderId')
            const senderRaw = m.senderID || m.senderId;
            
            // 2. Normalize to string ID
            const senderId = (typeof senderRaw === 'object' && senderRaw !== null && '_id' in senderRaw) 
                ? senderRaw._id 
                : senderRaw;
            
            const userId = user?._id;

            const isOwn = !!(senderId && userId && senderId.toString() === userId.toString());

            return {
              ...m,
              senderId: senderId, // Normalize for component use
              isOwn,
            }
          });

          set((state) =>{
            const prev = state.messages?.[convoId]?.items ?? [];
            // Assuming nextCursor === "" means initial fetch. If pagination is implemented differently (e.g. infinite scroll upwards), logic might need adjustment.
            // But usually initial load is nextCursor=""
            const isInitialLoad = nextCursor === "";
            
            // To be super safe against duplicates, we can also use a Set or filter by ID, but resetting on initial load is standard behavior.
            const merged = isInitialLoad ? processed : [...processed, ...prev];
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              }
            }
          })
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages:", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      createDirectConversation: async (recipientId: string) => { 
        try {
          const { onlineUserIds } = get();
          const { user: currentUser } = useAuthStore.getState();

          const response = await chatService.createDirectConversation(recipientId);

          if (response?.conversation) {
             const rawConvo = response.conversation;
             const members = rawConvo.members || [];
             
             // 1. Identify Receiver (The one who is NOT me)
             const receiverInfo = members.find((m: any) => m._id?.toString() !== currentUser?._id?.toString());

             // 2. Map Online Status
             const onlineSet = new Set(onlineUserIds);

             // 3. Construct Mapped Conversation
             const mappedConvo = {
                 ...rawConvo,
                 // Map members -> participants with status
                 participants: members.map((p: any) => ({
                     ...p,
                     status: onlineSet.has(p._id) ? "online" : "offline"
                 })),
                 // Manually create receiver field
                 receiver: receiverInfo ? {
                     ...receiverInfo,
                     status: onlineSet.has(receiverInfo._id) ? "online" : "offline",
                     isOnline: onlineSet.has(receiverInfo._id)
                 } : undefined
             };

             set((state) => {
               const exists = state.conversations.find(c => c._id === mappedConvo._id);
               // If existing, update it. If not, add to top.
               const updatedList = exists 
                  ? state.conversations.map(c => c._id === mappedConvo._id ? { ...c, ...mappedConvo } : c)
                  : [mappedConvo, ...state.conversations];
               
               return { conversations: updatedList };
             });
             
             return mappedConvo; 
          }
        } catch (error) {
          console.error("Lỗi xảy ra khi direct message", error);
        }
      },

      createGroupConversation: async (name: string, members: string[]) => {
        try {
          // Calling the correct service method for creating group conversation
          const newGroup = await chatService.createGroupConversation(name, members);

          if (newGroup) {
             set((state) => ({
                 conversations: [newGroup, ...state.conversations],
                 activeConversationId: newGroup._id
             }));
            toast.success("Tạo nhóm thành công!");
            
          }
        } catch (error) {
          console.error("Lỗi xảy ra khi tạo nhóm", error);
          toast.error("Tạo nhóm thất bại");
        }
       },

      accessConversation: async (userId: string) => {
        const { conversations, setActiveConversation, createDirectConversation } = get();
        const { user: currentUser } = useAuthStore.getState();

        // 1. Check if conversation already exists (Robust ID comparison)
        const existingConvo = conversations.find(c => 
            !c.isGroup && (
                (c.receiver && (c.receiver._id === userId || c.receiver._id?.toString() === userId.toString())) ||
                (c.participants && c.participants.some(p => 
                    (p._id === userId || p._id?.toString() === userId.toString()) && 
                    p._id?.toString() !== currentUser?._id?.toString()
                ))
            )
        );

        if (existingConvo) {
            setActiveConversation(existingConvo._id);
        } else {
            // 2. Create new conversation if not exists
            const newConvo = await createDirectConversation(userId);
            if (newConvo) {
                setActiveConversation(newConvo._id);
            }
        }
      },

      sendMessage: async (conversationId, content, type = "TEXT", imgUrl) => {
        try {
          const sentMessage = await chatService.sendMessage(conversationId, content, type, imgUrl);

          if (sentMessage?.message) {
            // Normalize message structure to match frontend expectations
            const normalizedMessage = {
              ...sentMessage.message,
              senderId: sentMessage.message.senderID?._id || sentMessage.message.senderID,
            };
            
            await get().addMessage(normalizedMessage);
          }

           set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === conversationId ? { ...c, seenBy: [] } : c
            )
          }));
        } catch (error) {
           console.error("Lỗi xảy ra khi gửi tin nhắn:", error);
        }
      },

      sendImageMessage: async (conversationId: string, file: File) => {
        const tempId = `temp_${Date.now()}`;
        const previewUrl = URL.createObjectURL(file);
        const { user } = useAuthStore.getState();

        // 1. Create Optimistic Message
        const optimisticMessage: any = {
           _id: tempId,
           conversationId,
           senderId: user?._id || "me",
           content: "Đang gửi ảnh...",
           imgUrl: previewUrl,
           type: "IMAGE",
           createdAt: new Date().toISOString(),
           isOwn: true,
           status: "sending"
        };
        
        // Add valid status to Message type if not already present or cast as needed
        await get().addMessage(optimisticMessage);

        try {
           // 2. Upload Image
           const { url } = await uploadService.uploadConversationImage(file, conversationId);
           
           // 3. Send Real Message
           const sentMessage = await chatService.sendMessage(conversationId, "Đã gửi một ảnh", "IMAGE", url);

           if (sentMessage?.message) {
               const realMessage = {
                   ...sentMessage.message,
                   senderId: sentMessage.message.senderID?._id || sentMessage.message.senderID,
                   isOwn: true,
                   status: "sent"
               };

               // 4. Update Store: Remove Temp or Replace with Real
               set((state) => {
                   const items = state.messages[conversationId]?.items || [];
                   const realExists = items.some(m => m._id === realMessage._id);
                   
                   let newItems;
                   if (realExists) {
                       newItems = items.filter(m => m._id !== tempId);
                   } else {
                       newItems = items.map(m => m._id === tempId ? realMessage : m);
                   }
                   
                   return {
                       messages: {
                           ...state.messages,
                           [conversationId]: {
                               ...state.messages[conversationId],
                               items: newItems
                           }
                       }
                   };
               });
           }
        } catch (error) {
           console.error("Image upload failed", error);
           toast.error("Gửi ảnh thất bại");
           // Mark temp message as error
           set((state) => {
               const items = state.messages[conversationId]?.items || [];
               const newItems = items.map(m => m._id === tempId ? { ...m, status: "error" as const, content: "Lỗi gửi ảnh" } : m);
                return {
                       messages: {
                           ...state.messages,
                           [conversationId]: {
                               ...state.messages[conversationId],
                               items: newItems
                           }
                       }
                   };
           });
        }
      },

      uploadFile: async (file) => {
         try {
            return await chatService.uploadFile(file);
         } catch (error) {
            console.error("Upload failed:", error);
            throw error;
         }
      },

      updateUserStatus: (userId, isOnline) => {
        set((state) => {
          const currentOnline = new Set(state.onlineUserIds);
          if (isOnline) currentOnline.add(userId);
          else currentOnline.delete(userId);

          const statusString = (isOnline ? "online" : "offline") as "online" | "offline";
          
          return {
            onlineUserIds: Array.from(currentOnline),
            
            // Update Friends List
            friends: state.friends.map((f) => 
              f._id === userId ? { ...f, isOnline } : f
            ),
            
            // Update Conversations List (Participants & Receiver)
            conversations: state.conversations.map((c) => {
              // Check Participants
              const updatedParticipants = c.participants.map(p => 
                p._id === userId ? { ...p, status: statusString } : p
              );

              // Check Receiver (for direct chats)
              let updatedReceiver = c.receiver;
              if (c.receiver && c.receiver._id === userId) {
                updatedReceiver = { ...c.receiver, isOnline, status: statusString };
              }

              // Return updated conversation if anything changed
              return {
                ...c,
                participants: updatedParticipants,
                receiver: updatedReceiver
              };
            })
          }
        })
      },

      sendFriendRequest: async (receiverId, message) => {
         try {
           await userService.sendFriendRequest(receiverId, message);
           toast.success("Lời mời kết bạn đã được gửi");
         } catch (error: any) {
           toast.error(error.response?.data?.message || "Gửi lời mời thất bại");
         }
      },

      fetchFriendRequests: async () => {
         set({ isLoadingRequests: true });
         try {
           const requests: any = await userService.fetchFriendRequests(); // Expecting { sent: [], received: [] }
           set({ 
             friendRequests: requests.received || [],
             sentFriendRequests: requests.sent || []
           });
         } catch (error) {
           console.error("Failed to fetch friend requests:", error);
         } finally {
           set({ isLoadingRequests: false });
         }
      },

      acceptFriendRequest: async (requestId) => {
          try {
             await userService.acceptFriendRequest(requestId);
             set((state) => ({
                friendRequests: state.friendRequests.filter(r => r._id !== requestId)
             }));
             toast.success("Đã chấp nhận lời mời kết bạn");
             get().fetchFriends(); // Refresh friends list
          } catch (error) {
             toast.error("Thao tác thất bại");
          }
      },

      declineFriendRequest: async (requestId) => {
          try {
             await userService.declineFriendRequest(requestId);
             set((state) => ({
                friendRequests: state.friendRequests.filter(r => r._id !== requestId)
             }));
             toast.success("Đã từ chối lời mời");
          } catch (error) {
             toast.error("Thao tác thất bại");
          }
      },

      cancelFriendRequest: async (requestId) => {
          try {
             // Assuming there is an endpoint for cancelling
             await userService.cancelFriendRequest(requestId);
             set((state) => ({
                sentFriendRequests: state.sentFriendRequests.filter(r => r._id !== requestId)
             }));
             toast.success("Đã hủy lời mời");
          } catch (error) {
             toast.error("Thao tác thất bại");
          }
      },

      addFriendRequest: (request) => {
          // Normalize sender/senderId
          const sender = request.sender || request.senderId;
          const normalizedRequest = { ...request, sender };

          set((state) => ({
             friendRequests: [...state.friendRequests, normalizedRequest]
          }));
          
          if (sender && sender.username) {
             toast.info(`Bạn có lời mời kết bạn mới từ ${sender.username}`);
          }
      },

      onFriendRequestAccepted: (request) => {
          get().fetchFriends();
          const friendName = request.receiverId?.username || "Một người bạn";
          toast.success(`${friendName} đã chấp nhận lời mời kết bạn của bạn!`);
      },

      setOnlineUsers: (userIds: string[]) => {
        set((state) => {
          const onlineSet = new Set(userIds);
          
          return {
            onlineUserIds: userIds, // Save to cache

            friends: state.friends.map(f => ({
                ...f,
                isOnline: onlineSet.has(f._id)
            })),
            conversations: state.conversations.map(c => {
                 const updatedParticipants = (c.participants || []).map(p => ({
                    ...p,
                    status: (onlineSet.has(p._id) ? "online" : "offline") as "online" | "offline"
                 }));

                 let updatedReceiver = c.receiver;
                 if (c.receiver) {
                    const isOnline = onlineSet.has(c.receiver._id);
                    updatedReceiver = { 
                        ...c.receiver, 
                        isOnline, 
                        status: (isOnline ? "online" : "offline") as "online" | "offline"
                    };
                 }

                 return {
                    ...c,
                    participants: updatedParticipants,
                    receiver: updatedReceiver
                 }
            })
          }
        })
      },
      addMessage: async (message) => {
          const state = get();
          // Check if message already exists
          const existingMessages = state.messages[message.conversationId]?.items || [];
          if (existingMessages.some(m => m._id === message._id)) return;
          
          set((state) => {
            const currentMessages = state.messages[message.conversationId] || { items: [], hasMore: false, isLoading: false };
            return {
              messages: {
                ...state.messages,
                [message.conversationId]: {
                  ...currentMessages,
                  items: [...currentMessages.items, message]
                }
              }
            };
          });

          if (state.activeConversationId === message.conversationId) {
              get().markConversationAsRead(message.conversationId);
          }
      },

       updateConversation: async (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c
          )
        }))
       },

       markConversationAsRead: async (conversationId) => {
         try {
           await chatService.markAsRead(conversationId);
         } catch (error) {
           console.error("Mark as read failed", error);
         }
       },

       onConversationSeen: (conversationId, userId, lastSeenAt) => {
         set((state) => ({
           conversations: state.conversations.map((c) => {
             if (c._id !== conversationId) return c;
             
             // Strategy to find User Object:
             // 0. Check Current User (Auth Store) - Highest Priority for "My" updates
             const { user: currentUser } = useAuthStore.getState();
             let userObj: any = null;
             
             // Robust comparison for current user
             if (currentUser && userId && currentUser._id.toString() === userId.toString()) {
                 userObj = currentUser;
             }

             // 1. Look in participants
             if (!userObj) {
                 userObj = c.participants?.find((p) => p && p._id.toString() === userId.toString());
             }

             // 2. Look in existing readBy list (to preserve data)
             if (!userObj) {
                const oldEntry = c.readBy?.find(r => {
                    const rId = (r.userId as any)._id || r.userId;
                    return rId?.toString() === userId.toString();
                });
                if (oldEntry && typeof oldEntry.userId === 'object') {
                    userObj = oldEntry.userId;
                }
             }

             // 3. Look in receiver (if DM)
             if (!userObj && !c.isGroup && c.receiver?._id.toString() === userId.toString()) {
                 userObj = c.receiver;
             }

             // 4. Look in friends list
             if (!userObj) {
                 userObj = state.friends.find(f => f._id === userId);
             }

             // 5. Fallback
             if (!userObj) {
                 userObj = { 
                     _id: userId, 
                     username: 'User', 
                     displayName: 'User', 
                     avatar: '/default.jpg', 
                     email: '' 
                 };
             }

             // Filter out OLD entry for this user
             const newReadBy = (c.readBy || []).filter(r => {
                 const rId = (r.userId as any)._id || r.userId;
                 return rId?.toString() !== userId.toString();
             });
             
             // Ensure lastSeenAt is string
             const seenAtStr = lastSeenAt instanceof Date ? lastSeenAt.toISOString() : lastSeenAt as string;

             return {
               ...c,
               readBy: [...newReadBy, { userId: userObj, lastSeenAt: seenAtStr }],
               unreadCounts: {
                  ...c.unreadCounts,
                  [userId]: 0
               }
             };
           })
         }));
       },

       onNewConversation: (conversation) => {
          const { onlineUserIds } = get();
          const { user: currentUser } = useAuthStore.getState();
          const onlineSet = new Set(onlineUserIds);

          // Prevent duplicates
          const exists = get().conversations.some(c => c._id === conversation._id);
          if (exists) return;

          // Process conversation (add receiver field if direct, map online status)
          let processedConvo = { ...conversation };

          // 1. Update Participants Status
          if (processedConvo.participants) {
             processedConvo.participants = processedConvo.participants.map(p => ({
                 ...p,
                 status: (onlineSet.has(p._id) ? "online" : "offline") as "online" | "offline"
             }));
          }

          // 2. Add Receiver Field if missing (helper for frontend)
          if (!processedConvo.receiver && !processedConvo.isGroup) {
              const partner = processedConvo.participants?.find(p => p._id !== currentUser?._id);
              if (partner) {
                  processedConvo.receiver = {
                      ...partner,
                      isOnline: onlineSet.has(partner._id),
                      status: (onlineSet.has(partner._id) ? "online" : "offline") as "online" | "offline"
                  };
              }
          }

          // 3. Update existing receiver status if present
          if (processedConvo.receiver) {
               const isOnline = onlineSet.has(processedConvo.receiver._id);
               processedConvo.receiver = {
                   ...processedConvo.receiver,
                   isOnline,
                   status: (isOnline ? "online" : "offline") as "online" | "offline"
               };
          }

          // Prepend to list
          set(state => ({
              conversations: [processedConvo, ...state.conversations]
          }));
          
          toast.success(!conversation.isGroup ? "Tin nhắn mới!" : `Bạn được thêm vào nhóm "${conversation.group?.name || 'Mới'}"`);
       }
    
    }), {
      name: "chat-storage",
      partialize:(state)=>({conversations: state.conversations})

    }
))