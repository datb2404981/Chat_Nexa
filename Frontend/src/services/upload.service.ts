import api from "@/lib/api";

export const uploadService = {
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/files/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Handle both wrapped and unwrapped responses just in case
    // If wrapped by ResponseMessage: { message, statusCode, data: { url, publicId } }
    return res.data?.data || res.data;
  },

  uploadConversationImage: async (file: File, conversationId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversationId);

    const res = await api.post("/files/upload-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data?.data || res.data;
  },
};
