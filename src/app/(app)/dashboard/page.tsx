'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import DashboardContent from '@/components/dashboardContent'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { CheckCircle, XCircle, ChevronDown } from "lucide-react"



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

  const { setValue } = form;


  

const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get('/api/accept-messages');
      const isAccepting = response.data.isAcceptingMessage ?? false;
      setIsAcceptingMessages(isAccepting);
      setValue('acceptMessages', isAccepting);
    } catch (error) {
      console.error('Error fetching message preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch message preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [toast]);

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


  useEffect(() => {
    if (!session?.user) return;
    fetchAcceptMessages();
    fetchMessages();
  }, [session?.user, fetchAcceptMessages, fetchMessages]);

  


  const handleToggleMessages = async (checked: boolean) => {
    setIsToggleLoading(true);
    try {
      const response = await axios.post('/api/accept-messages', {
        acceptMessages: checked,
      });
      setIsAcceptingMessages(response.data.isAcceptingMessage ?? checked);
      toast({
        title: 'Success',
        description: 'Preference updated',
      });
    } catch (error) {
      console.error('Error updating message preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message preferences',
        variant: 'destructive',
      });
    } finally {
      setIsToggleLoading(false);
    }
  };




  if (!session || !session.user) {
    return <div></div>;
  }

  return (
    
      <div className="p-6 bg-zinc-950 border border-zinc-800/40 shadow-lg">
        <div className="flex items-center rounded-xl justify-between">
          <div className="space-y-1.5 pb-4">
            <h3 className="text-sm font-medium text-zinc-100 tracking-tight">
              Message Status
            </h3>
            <p className="text-xs text-zinc-400">
              Control who can send you messages
            </p>
          </div>
          
          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button 
      variant="outline" 
      className="relative px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800/50
        border border-zinc-800/50 hover:border-zinc-700/50
        text-zinc-100 transition-all duration-200 backdrop-blur-sm"
      disabled={isToggleLoading}
    >
      <span className="text-sm">Change Message Status</span>
      <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    className="w-56 bg-zinc-900/95 backdrop-blur-lg border border-zinc-800/50 
      shadow-xl rounded-lg overflow-hidden"
  >
    <DropdownMenuItem
      onClick={() => handleToggleMessages(true)}
      className="group flex items-center px-3 py-2 text-sm
        text-zinc-300 hover:text-emerald-400 
        hover:bg-zinc-800/50 transition-all duration-200"
    >
      <CheckCircle className="h-4 w-4 mr-2 group-hover:text-emerald-400" />
      Accept Messages
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={() => handleToggleMessages(false)}
      className="group flex items-center px-3 py-2 text-sm
        text-zinc-300 hover:text-rose-400 
        hover:bg-zinc-800/50 transition-all duration-200"
    >
      <XCircle className="h-4 w-4 mr-2 group-hover:text-rose-400" />
      Disable Messages
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
        </div>
        <DashboardContent />
      </div>
    
  );
}


export default UserDashboard;