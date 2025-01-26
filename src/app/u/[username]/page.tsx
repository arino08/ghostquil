'use client'
import { useState, useEffect, use } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { useCompletion } from 'ai/react'
import { AlertTriangle, Loader2, Send, Sparkles } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

type FormData = z.infer<typeof formSchema>

export default function UserPage({ params }: { params: { username: string } }) {
  const [isAcceptingMessages, setIsAcceptingMessages] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([])
  
  const { complete, completion, isLoading: isSuggestLoading } = useCompletion({
    api: '/api/suggest-messages',
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/send-messages', {
        username: params.username,
        content: data.content
      })
      
      if (response.data.success) {
        form.reset()
        toast({
          title: "Success",
          description: "Message sent successfully!",
          variant: "default",
          duration: 3000,
        })
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setIsAcceptingMessages(false)
        }
        toast({
          title: "Error",
          description: error.response?.data.message ?? 'Failed to send message',
          variant: "destructive",
          duration: 3000,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSuggestedMessages = async () => {
    try {
      const result = await complete('')
      if (result) {
        setSuggestedMessages(result.split('||'))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch suggested messages',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      <div className="w-full max-w-lg">
        {!isAcceptingMessages && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">This user is not accepting messages.</p>
          </div>
        )}

        <div className="space-y-6 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium text-zinc-200">
                      Send message to{' '}
                      <span className="text-violet-400 font-semibold">@{params.username}</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message..."
                        className="min-h-[120px] bg-black/20 border-white/10 backdrop-blur-sm resize-none placeholder:text-zinc-500 text-zinc-200"
                        disabled={!isAcceptingMessages || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!isAcceptingMessages || isLoading}
                  className="flex-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={fetchSuggestedMessages}
                  disabled={isSuggestLoading}
                  className="bg-white/5 hover:bg-white/10 text-zinc-300"
                >
                  {isSuggestLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Ideas
                    </>
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>

          {suggestedMessages.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-zinc-400">Suggested Messages:</h3>
              <div className="space-y-2">
                {suggestedMessages.map((message, index) => (
                  <button
                    key={index}
                    onClick={() => form.setValue('content', message)}
                    className="w-full p-3 text-left text-sm text-zinc-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                  >
                    {message}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}
