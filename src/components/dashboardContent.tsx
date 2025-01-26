'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import axios from 'axios'
import { Copy, Loader2, MessagesSquare, RefreshCcw, Trash2, UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface Message {
  _id: string
  content: string
  createdAt: string
}

interface ApiResponse {
  success: boolean
  messages: Message[]
  message?: string
}



export default function DashboardContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  
  const handleDeleteMessage = async (messageId: string) => {
    setDeletingMessageId(messageId)
    try {
      const response = await axios.delete(`/api/delete-message/${messageId}`)
      
      if (response.data.success) {
        setMessages(messages.filter(message => message._id !== messageId))
        toast({
          title: 'Success',
          description: 'Message deleted successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      })
    } finally {
      setDeletingMessageId(null)
    }
  }

  const fetchMessages = async (showToast: boolean = false) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/get-messages')
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setMessages(data.messages)
        if (showToast) {
          toast({
            title: 'Updated',
            description: 'Messages refreshed successfully',
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const profileUrl = `${baseUrl}/u/${session?.user?.username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast({
      title: 'Copied!',
      description: 'Profile URL copied to clipboard',
    })
  }

  return (
    <div className="flex">
      <div className="w-64 min-h-screen bg-black/20 backdrop-blur-lg p-6 border-r border-white/10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{session?.user?.name}</p>
              <p className="text-xs text-gray-400">@{session?.user?.username}</p>
            </div>
          </div>
          
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Share your profile</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={profileUrl}
                className="text-xs bg-black/20 text-gray-300 p-2 rounded flex-1 truncate"
              />
              <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-gray-400">Total Messages</p>
                <p className="text-2xl font-semibold text-white mt-1">{messages.length}</p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-gray-400">Today's Messages</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {messages.filter(m => 
                    new Date(m.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => fetchMessages(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessagesSquare className="h-5 w-5" />
                Messages
              </h2>
            </div>
            <div className="divide-y divide-white/5">
            {messages.map((message) => (
            <div 
              key={message._id} 
              className="p-4 rounded-lg bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-zinc-200">{message.content}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {format(new Date(message.createdAt), 'PPpp')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMessage(message._id)}
                  disabled={deletingMessageId === message._id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deletingMessageId === message._id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-400" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
            </div>
          </div>
        </div>
      </div>
)}