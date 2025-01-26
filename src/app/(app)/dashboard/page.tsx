'use client';

import { MessageCard } from '@/components/messageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { UserIcon, MessagesSquare, Settings } from 'lucide-react'
import { Suspense } from 'react'
import DashboardContent from '@/components/dashboardContent'
import Loading from '@/components/loading'



function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(false)
  const [isToggleLoading, setIsToggleLoading] = useState(false)

  const { toast } = useToast();

  

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({
            title: 'Refreshed Messages',
            description: 'Showing latest messages',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );
  const handleToggleMessages = async (checked: boolean) => {
    setIsToggleLoading(true)
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessages: checked
      })
      
      if (response.data.success) {
        setIsAcceptingMessages(response.data.isAcceptingMessage)
        toast({
          title: 'Success',
          description: response.data.message,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message preferences',
        variant: 'destructive',
      })
    } finally {
      setIsToggleLoading(false)
    }
  }

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  useEffect(() => {
    const fetchMessagePreferences = async () => {
      try {
        const response = await axios.get('/api/accept-messages')
        if (response.data.success) {
          setIsAcceptingMessages(response.data.acceptMessages)
        }
      } catch (error) {
        console.error('Error fetching message preferences:', error)
      }
    }
    
    fetchMessagePreferences()
  }, [])


  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Suspense fallback={<Loading />}>
      <div className="mb-6 flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
  <div className="space-y-1">
    <h3 className="text-sm font-medium text-zinc-200">Accept Messages</h3>
    <p className="text-xs text-zinc-400">
      {isAcceptingMessages ? 'Currently accepting messages' : 'Not accepting messages'}
    </p>
  </div>
  <Switch
    checked={isAcceptingMessages}
    onCheckedChange={handleToggleMessages}
    disabled={isToggleLoading}
    className="data-[state=checked]:bg-violet-500"
  />
</div>
        <DashboardContent />
      </Suspense>
    </div>
  )
}


export default UserDashboard;