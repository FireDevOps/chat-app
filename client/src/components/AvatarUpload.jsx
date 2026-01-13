import { useState } from 'react';
import api from '../utils/api';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const res = await api.post('/auth/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onAvatarUpdate(res.data.avatarUrl);
        } catch (err) {
            console.error('Failed to upload avatar:', err);
            alert('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative">
            <label className="cursor-pointer">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden hover:opacity-80 transition">
                    {currentAvatar ? (
                        <img 
                            src={`http://localhost:5000${currentAvatar}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        '?'
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />
            </label>
            {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <span className="text-white text-xs">...</span>
                </div>
            )}
        </div>
    );
};

export default AvatarUpload;