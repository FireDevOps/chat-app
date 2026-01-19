import { useState } from 'react';
import Avatar from './Avatar';

const CreateGroupModal = ({ users, onCreate, onClose }) => {
    const [groupName, setGroupName ] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Toggle user selection
    const toggleUserSelection = (userId) => {
        setSelectedUsers((prev) => 
            prev.includes(userId)
                ? prev.filter((id) => id !== userId) // Remove if already selected
                : [...prev, userId] // Add if not selected
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            alert('Please enter a group name');
            return;
        }
        if (selectedUsers.length < 2) {
            alert('Please select at least two members');
            return;
        }
        onCreate(groupName, selectedUsers);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">Create Group</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Group Name Input */}
                    <div className="p-4 border-b dark:border-gray-700">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Group name..."
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* User Selection */}
                    <div className="p-4 flex-1 overflow-y-auto">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Select members ({selectedUsers.length} selected)
                        </p>
                        <div className="space-y-2">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => toggleUserSelection(user.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedUsers.includes(user.id)
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Avatar user={user} size="md" />
                                    <span className="flex-1 dark:text-white">{user.username}</span>
                                    {selectedUsers.includes(user.id) && (
                                        <span className="text-blue-500 text-xl">✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="p-4 border-t dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={!groupName.trim() || selectedUsers.length < 2}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Create Group ({selectedUsers.length} members)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;