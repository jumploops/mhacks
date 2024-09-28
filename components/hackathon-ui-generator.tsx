'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HackathonUiGenerator() {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value)
  }

  const handleSubmit = async () => {
    setIsGenerating(true)
    const response = await fetch('/api/generate-ui', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    })

    if (!response.body) {
      console.error('No response body')
      setIsGenerating(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let html = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value)
      updateIframe(html)
    }

    setIsGenerating(false)
  }

  const updateIframe = (html: string) => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    }
  }

  useEffect(() => {
    // Initialize iframe with a loading message
    updateIframe('<html><body><h1>Waiting for UI generation...</h1></body></html>')
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      <Card className="w-1/2 m-4 flex flex-col">
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <Textarea
            className="flex-grow mb-4 resize-none"
            placeholder="Enter your project description here..."
            value={description}
            onChange={handleDescriptionChange}
          />
          <Button onClick={handleSubmit} className="w-full" disabled={isGenerating}>
            {isGenerating ? 'Generating UI...' : 'Generate UI'}
          </Button>
        </CardContent>
      </Card>

      <Card className="w-1/2 m-4 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>UI Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title="UI Preview"
          />
        </CardContent>
      </Card>
    </div>
  )
}
