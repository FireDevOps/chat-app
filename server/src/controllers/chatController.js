const prisma = require('../lib/prisma');

// Get all users ( to start a chat with )
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                id: { not: req.user.userId }, // Give me everyone except myself
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                isOnline: true,
            },
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// create or get existing chat between two users
const getOrCreateChat = async (req, res) => {
    try {
        const { participantId } = req.body;
        const currentUserId = req.user.userId;

        // Check if chat already exists
        const existingChat = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: {
                        some: { userId: currentUserId }
                    }},
                    { participants: {
                        some: { userId: participantId }
                    }},
                ],
            },
            include: {
                participants: {
                    include: { user: {
                        select: { 
                            id: true,
                            username: true,
                            email: true,
                            avatarUrl: true,
                            isOnline: true,
                        },
                    }},
                },
            },
        });
        // Return existing chat if found
        if (existingChat) {
            return res.json(existingChat);
        }

        // If not found, Create new chat
        const newChat = await prisma.conversation.create({
            data: {
                isGroup: false,
                participants: {
                    create: [
                        { userId: currentUserId },
                        { userId: participantId },   
                    ],
                },
            },
            include: {
                participants: {
                    include: { user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            avatarUrl: true,
                            isOnline: true,
                        },
                    }},
                },
            },
        });
        res.status(201).json(newChat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// create a new group chat
const createGroupChat = async (req, res) => {
    try {
        const { name, participantIds } = req.body;
        const currentUserId = req.user.userId;

        // Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        if (!participantIds || participantIds.length < 2) {
            return res.status(400).json({ error: 'At least 2 participants are required to create a group chat' });
        }

        // Include current user in the participants
        const allParticipantIds = Array.from(new Set([...participantIds, currentUserId]));

        // Create group conversation
        const groupChat = await prisma.conversation.create({
            data: {
                name: name.trim(),
                isGroup: true,
                participants: {
                    create: allParticipantIds.map(userId => ({ userId })),
                },

            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                avatarUrl: true,
                                isOnline: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json(groupChat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

// Leave a group chat
const leaveGroup = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.userId;

        // Find the conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (!conversation.isGroup) {
            return res.status(400).json({ error: 'Cannot leave a one-on-one chat' });
        }

        // Remove user from participants
        await prisma.conversationParticipant.deleteMany({
            where: {
                conversationId,
                userId,
            },
        });

        res.json({ message: 'Left the group successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

// Get user's chats
const getUserChats = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId } // Get all conversations where I'm a participant
                },
            },
            include: {
                participants: {
                    include: { user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            avatarUrl: true,
                            isOnline: true,
                        },
                    }},
                },
                messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1, // Get only the latest message
                        },
                _count: {
                    select: {
                        messages: {
                            where: {
                                isRead: false,
                                senderId: { not: userId }, // Only count messages from others
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        
        // Transform to include unreadCount at top level
        const conversationsWithUnread = conversations.map(conv => ({
            ...conv,
            unreadCount: conv._count.messages,
        }));
        
        res.json(conversationsWithUnread);
    } catch (err) {
       console.error(err);
       res.status(500).json({ error: 'Server error' });
    }
};

// Get chat messages
const getChatMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await prisma.message.findMany({
            where: { conversationId }, // Get messages for this conversation
            include: {
                sender: {
                    select:{
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }, // Oldest first, newest last for chat history
        });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Send message (text, image, etc.) (HTTP fallback, handled via Socket.IO)
const sendMessage = async (req, res) => {
    try {
        const { conversationId, content} = req.body;

        const message = await prisma.message.create({
            data: {
                conversationId, // Which conversation this message belongs to
                senderId: req.user.userId, // Who sent this message
                content, // The message text
            },
            include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            avatarUrl: true,
                        }
                    }
                }
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// send file/image message
const sendFileMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Determine file type (image or document)
        const isImage = req.file.mimetype.startsWith('image/');
        const fileType = isImage ? 'image' : 'document';

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: req.user.userId,
                content: content || '', // Optional text content
                fileUrl: `/uploads/messages/${req.file.filename}`,
                fileName: req.file.originalname,
                fileType: fileType,
                fileMimeType: req.file.mimetype,
                fileSize: req.file.size,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.to(conversationId).emit('new-message', message);

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    getAllUsers,
    getOrCreateChat,
    createGroupChat,
    leaveGroup,
    getUserChats,
    getChatMessages,
    sendMessage,
    sendFileMessage,
};