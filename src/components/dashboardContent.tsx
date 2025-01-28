import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Trash, UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Message {
  _id: string;
  content: string;
  createdAt: string;
}

const DashboardContent: React.FC = () => {
  const { data: session } = useSession(); // Access session data
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isToggleLoading, setIsToggleLoading] = useState<boolean>(false);
  const [acceptMessages, setAcceptMessages] = useState<boolean>(false);
  
  // State for Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/get-messages');
      setMessages(response.data.messages);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data.message || 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAcceptMessages = useCallback(async () => {
    try {
      const response = await axios.get('/api/accept-messages');
      setAcceptMessages(response.data.acceptMessages);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data.message || 'Failed to fetch preferences');
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetchAcceptMessages();
    fetchMessages();
  }, [session?.user, fetchAcceptMessages, fetchMessages]);

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    try {
      await axios.delete(`/api/delete-message/${messageToDelete}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageToDelete));
      toast.success('Message deleted successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data.message || 'Failed to delete message');
    } finally {
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const profileUrl = `${baseUrl}/u/${session?.user?.username}`; // Dynamically set username
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied to clipboard');
  };

  const handleToggleMessages = async (checked: boolean) => {
    setIsToggleLoading(true);
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessages: checked,
      });
      setAcceptMessages(response.data.acceptMessages ?? checked);
      toast.success('Preference updated successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data.message || 'Failed to update preferences');
    } finally {
      setIsToggleLoading(false);
    }
  };

  if (!session?.user) {
    return <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <motion.div
        className="w-64 min-h-screen bg-zinc-900/80 p-6 border-r border-zinc-800/40 backdrop-blur-md shadow-inner"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center transition-transform hover:scale-105">
              <UserIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">{session.user.name}</p> {/* Dynamic username */}
              <p className="text-sm text-zinc-400">@{session.user.username}</p> {/* Dynamic username */}
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={copyToClipboard}
            className="w-full text-left text-sm bg-zinc-800/60 hover:bg-zinc-800/80 rounded-md px-4 py-2 transition-colors duration-300"
          >
            Copy Profile URL
          </button>

        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-zinc-400">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-zinc-400">No messages found.</p>
          ) : (
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div
                  key={msg._id}
                  className="bg-zinc-900/70 p-4 rounded-lg shadow-md flex justify-between items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <p className="text-sm text-zinc-200">{msg.content}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMessageToDelete(msg._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-rose-500 hover:text-rose-600 transition-colors duration-300"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-zinc-800 rounded-lg p-6 w-80"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">Confirm Deletion</h3>
              <p className="text-sm text-zinc-400 mb-6">Are you sure you want to delete this message?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded-md hover:bg-zinc-600 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMessage}
                  className="px-4 py-2 bg-rose-600 text-zinc-100 rounded-md hover:bg-rose-700 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardContent;