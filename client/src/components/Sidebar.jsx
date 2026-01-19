import Avatar from "./Avatar";

const Sidebar = ({
    conversations,
    selectedConversation,
    onSelectConversation,
    users,
    showUsers,
    setShowUsers,
    onStartConversation,
    currentUserId,
    typingUsers,
    onCreateGroup,
}) => {
    // Get the other participant's info from a conversation
    const getOtherUser = (conversation) => {
        const otherParticipant = conversation.participants.find(
            (p) => p.user.id !== currentUserId
        );
        return otherParticipant?.user;
    };

    return (
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 dark:bg-gray-800">
                <button 
                    onClick={() => setShowUsers(!showUsers)}
                    className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                    <span className="text-xl">+</span>
                    <span>{showUsers ? 'Back to Chats' : 'New Chat'}</span>
                </button>

                <button
                    onClick={onCreateGroup}
                    className="w-full mt-2 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                >
                    <span className="text-xl">👥</span>
                    <span>New Group</span>
                </button>
            </div>
            
            {showUsers && (
                <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                        Start a conversation
                    </div>
                    {users.length === 0 ? (
                        <p className="p-4 text-gray-500 dark:text-gray-400">No users found.</p>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => onStartConversation(user.id)}
                                className="p-4 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                            >
                                <Avatar user={user} size="md" />
                                <div className="flex-1">
                                    <p className="font-medium dark:text-white">{user.username}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                                {user.isOnline && (
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="flex-1 overflow-y-auto dark:bg-gray-800">
                {conversations.length === 0 ? (
                    <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
                        No conversations yet. Start a new chat!
                    </p>
                ) : (
                    conversations.map((conversation) => {
                        const otherUser = getOtherUser(conversation);
                        const isSelected = selectedConversation?.id === conversation.id;
                        const lastMessage = conversation.messages?.[0];
                        const isGroup = conversation.isGroup;

                        return (
                            <div
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation)}
                                className={`p-4 border-b dark:border-gray-700 cursor-pointer flex items-center gap-3 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {/* Avatar - Group icon or user avatar */}
                                {isGroup ? (
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        👥
                                    </div>
                                ) : (
                                    <Avatar user={otherUser} size="md" />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate dark:text-white">
                                            {isGroup ? conversation.name : (otherUser?.username || 'Unknown User')}
                                        </p>
                                        {/* Unread message count badge */}
                                        {conversation.unreadCount > 0 && (
                                            <div className="min-w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center px-1.5">
                                                <span className="text-xs text-white font-bold">
                                                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {typingUsers[conversation.id] ? (
                                            <span className="text-blue-500 italic animate-pulse">Typing...</span>
                                        ) : (
                                            lastMessage?.content || 'No messages yet.'
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Sidebar;