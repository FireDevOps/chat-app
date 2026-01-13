const Avatar = ({ user, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    };

    if (user?.avatarUrl) {
        return (
            <img
                src={`http://localhost:5000${user.avatarUrl}`}
                alt={user.username}
                className={`${sizeClasses[size]} rounded-full object-cover`}
            />
        );
    }

    return (
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full flex items-center justify-center text-white font-bold`}>
            {user?.username?.[0]?.toUpperCase() || '?'}
        </div>
    );
};

export default Avatar;