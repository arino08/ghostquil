'use client'
import { useState, useEffect, use } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { useCompletion } from 'ai/react'
import { AlertTriangle, Loader2, Send } from 'lucide-react'
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
      await axios.post(`/api/messages/${params.username}`, data)
      toast({
        title: 'Success',
        description: 'Message sent successfully!',
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setIsAcceptingMessages(false)
        }
        toast({
          title: 'Error',
          description: error.response?.data.message ?? 'Failed to send message',
          variant: 'destructive',
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg space-y-6">
        {!isAcceptingMessages && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">This user is not accepting messages.</p>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-base font-medium">
                    <span>Send message to</span>
                    <span className="text-primary font-semibold">@{params.username}</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message..."
                      className="min-h-[120px]"
                      disabled={!isAcceptingMessages || isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={!isAcceptingMessages || isLoading}
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
                variant="outline"
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
              >
                {isSuggestLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Get Ideas'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>

        {suggestedMessages.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Suggested Messages:</h3>
            <div className="space-y-2">
              {suggestedMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => form.setValue('content', message)}
                  className="w-full p-3 text-left text-sm bg-white hover:bg-gray-50 rounded-lg border transition-colors"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
