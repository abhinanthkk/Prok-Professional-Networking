import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { postsApi } from './api';

interface MediaPreview {
  url: string;
  type: 'image' | 'video';
}

const PostCreate: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowComments, setAllowComments] = useState(false); // Default: unchecked
  const [isPublic, setIsPublic] = useState(true); // Default: checked
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('PostCreate rendered');

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      setMedia(file);
      const url = URL.createObjectURL(file);
      console.log('Preview URL:', url);
      if (file.type.startsWith('image/')) {
        setMediaPreview({ url, type: 'image' });
      } else if (file.type.startsWith('video/')) {
        setMediaPreview({ url, type: 'video' });
      } else {
        setMediaPreview(null);
        setError('Only image and video files are supported.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setMedia(file);
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) {
        setMediaPreview({ url, type: 'image' });
      } else if (file.type.startsWith('video/')) {
        setMediaPreview({ url, type: 'video' });
      } else {
        setMediaPreview(null);
        setError('Only image and video files are supported.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!body.trim()) {
      setError('Post body is required.');
      return;
    }
    setLoading(true);
    try {
      // Send allowComments and isPublic as part of the post creation payload
      const response = await postsApi.createPost(body, media || undefined, {
        allow_comments: allowComments,
        is_public: isPublic,
        title: title
      });
      console.log('Post create API response:', response);
      setLoading(false);
      setTitle('');
      setBody('');
      setMedia(null);
      setMediaPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Optionally show a toast or success message
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create post.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-xl shadow p-8 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Create Post</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-blue-700 font-medium hover:underline focus:outline-none"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              Preview
            </button>
            <button
              type="submit"
              className="bg-blue-700 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-blue-800 focus:outline-none"
              disabled={loading}
            >
              Post
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={loading}
            maxLength={100}
            placeholder="Enter post title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <ReactQuill
            value={body}
            onChange={setBody}
            readOnly={loading}
            theme="snow"
            placeholder="Write your post..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-400 transition"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{ minHeight: '120px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span>Drag and drop files here or click to upload</span>
            <span className="text-xs text-gray-400 mt-1">Supports images and videos up to 10MB</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              onClick={() => console.log('File input clicked')}
              ref={fileInputRef}
              disabled={loading}
              className="hidden"
            />
            {mediaPreview && (
              <div className="mt-4">
                {mediaPreview.type === 'image' ? (
                  <img src={mediaPreview.url} alt="Preview" className="max-h-40 rounded" />
                ) : (
                  <video src={mediaPreview.url} controls className="max-h-40 rounded" />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">Post Settings</h3>
          <div className="flex gap-8">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={e => setAllowComments(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              Allow Comments
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              Public Post
            </label>
          </div>
        </div>
        {error && <div className="text-red-600 font-medium mt-2">{error}</div>}
        {showPreview && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div className="mb-2 font-bold">{title}</div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: body }} />
            {mediaPreview && (
              <div className="mt-2">
                {mediaPreview.type === 'image' ? (
                  <img src={mediaPreview.url} alt="Preview" className="max-h-40 rounded" />
                ) : (
                  <video src={mediaPreview.url} controls className="max-h-40 rounded" />
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default PostCreate; 