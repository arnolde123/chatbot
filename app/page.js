'use client'

import { Box, Button, Stack, TextField, ThemeProvider, createTheme } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Create a custom theme with Wendy's colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#e2231a', // Wendy's red
    },
    secondary: {
      main: '#ffc72c', // Wendy's yellow
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Wendy's support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
      >
        <Box
          width={{ xs: '95%', sm: '500px' }}
          height={{ xs: '95vh', sm: '700px' }}
          bgcolor="white"
          borderRadius={4}
          boxShadow={3}
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Box
            p={2}
            bgcolor="primary.main"
            color="white"
            display="flex"
            alignItems="center"
          >
            <img src="/wendy-logo.png" alt="Wendy's Logo" height="30px" style={{ marginRight: '10px' }} />
            <Box fontWeight="bold" fontSize="1.2rem">Wendy's Support Chat</Box>
          </Box>
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            p={2}
            sx={{
              '&::-webkit-scrollbar': {
                width: '0.4em',
              },
              '&::-webkit-scrollbar-track': {
                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,.1)',
                borderRadius: '10px',
              },
            }}
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    display="flex"
                    justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                    mb={1}
                  >
                    <Box
                      bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                      color="white"
                      borderRadius={message.role === 'assistant' ? '20px 20px 20px 5px' : '20px 20px 5px 20px'}
                      p={2}
                      maxWidth="80%"
                    >
                      {message.content}
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Stack>
          <Box p={2} bgcolor="background.default">
            <Stack direction="row" spacing={1}>
              <TextField
                label="Type your message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={isLoading}
                sx={{ minWidth: '100px' }}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}