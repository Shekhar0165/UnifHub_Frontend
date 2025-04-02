'use client'
import React, { useRef, useEffect } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { useTheme } from 'next-themes'

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null)
  const { theme, systemTheme } = useTheme()
  
  // Determine if dark mode is active
  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
  
  // Effect to update editor when theme changes
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      if (isDarkMode) {
        editor.dom.addClass(editor.getBody(), 'dark-mode');
      } else {
        editor.dom.removeClass(editor.getBody(), 'dark-mode');
      }
    }
  }, [isDarkMode]);

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey="ps177gd33i7g87wh3l6n3a64aod6wv57agjoo8c5xch2x629" // Get a free API key from TinyMCE website
        onInit={(evt, editor) => {
          editorRef.current = editor;
          // Apply dark mode class on init if needed
          if (isDarkMode) {
            editor.dom.addClass(editor.getBody(), 'dark-mode');
          }
        }}
        value={value || ""}
        onEditorChange={onChange}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: `
            body { 
              font-family: Helvetica, Arial, sans-serif; 
              font-size: 14px;
            }
            body.dark-mode { 
              background-color: #1f2937; 
              color: #e5e7eb;
            }
            body.dark-mode p, body.dark-mode h1, body.dark-mode h2, body.dark-mode h3, 
            body.dark-mode h4, body.dark-mode h5, body.dark-mode h6, 
            body.dark-mode li, body.dark-mode td {
              color: #e5e7eb;
            }
            body.dark-mode a {
              color: #60a5fa;
            }
          `,
          skin: isDarkMode ? 'oxide-dark' : 'oxide',
          content_css: isDarkMode ? 'dark' : 'default',
        }}
      />
    </div>
  )
}

export default RichTextEditor